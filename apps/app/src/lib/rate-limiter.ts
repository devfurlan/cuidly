/**
 * Rate limiter for API endpoints using Upstash Redis
 *
 * Uses @upstash/ratelimit with sliding window algorithm for distributed
 * rate limiting across serverless instances. Falls back to in-memory
 * when Redis is not configured (local development).
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// --- Types ---

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  blocked: boolean;
}

// --- Redis client (singleton) ---

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      '[RateLimiter] UPSTASH_REDIS_REST_URL ou UPSTASH_REDIS_REST_TOKEN não configurados. ' +
        'Usando fallback in-memory. NÃO adequado para produção.',
    );
    return null;
  }

  return new Redis({ url, token });
}

const redis = createRedisClient();

// --- Duration helper ---

function msToUpstashDuration(ms: number): `${number} ms` | `${number} s` | `${number} m` | `${number} h` {
  if (ms >= 3600000 && ms % 3600000 === 0) return `${ms / 3600000} h`;
  if (ms >= 60000 && ms % 60000 === 0) return `${ms / 60000} m`;
  if (ms >= 1000 && ms % 1000 === 0) return `${ms / 1000} s`;
  return `${ms} ms`;
}

// --- Rate Limiter class ---

class UpstashRateLimiter {
  private limiter: Ratelimit | null = null;
  private readonly maxRequests: number;
  private readonly windowMs: number;

  // In-memory fallback for local development
  private memoryRecords: Map<string, RateLimitRecord> = new Map();

  constructor(maxRequests: number, windowMs: number, _blockDurationMs?: number, prefix?: string) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    if (redis) {
      this.limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxRequests, msToUpstashDuration(windowMs)),
        prefix: `@cuidly/app:${prefix || 'rl'}`,
      });
    }

    // Cleanup in-memory fallback every minute
    if (!redis && typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanupMemory(), 60000);
    }
  }

  async check(identifier: string): Promise<RateLimitResult> {
    if (!this.limiter) {
      return this.checkInMemory(identifier);
    }

    try {
      const result = await this.limiter.limit(identifier);

      const now = Date.now();
      const resetIn = Math.max(0, result.reset - now);

      return {
        allowed: result.success,
        remaining: result.remaining,
        resetIn,
        blocked: !result.success,
      };
    } catch (error) {
      console.error('[RateLimiter] Erro no Upstash Redis, fail-open:', error);
      return {
        allowed: true,
        remaining: 1,
        resetIn: 0,
        blocked: false,
      };
    }
  }

  async isAllowed(identifier: string): Promise<boolean> {
    const result = await this.check(identifier);
    return result.allowed;
  }

  async reset(identifier: string): Promise<void> {
    if (this.limiter) {
      try {
        await this.limiter.resetUsedTokens(identifier);
      } catch (error) {
        console.error('[RateLimiter] Erro ao resetar tokens:', error);
      }
    } else {
      this.memoryRecords.delete(identifier);
    }
  }

  // --- In-memory fallback (local development only) ---

  private checkInMemory(identifier: string): RateLimitResult {
    const now = Date.now();
    const record = this.memoryRecords.get(identifier);

    if (!record || now > record.resetAt) {
      this.memoryRecords.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetIn: this.windowMs,
        blocked: false,
      };
    }

    if (record.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: record.resetAt - now,
        blocked: true,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetIn: record.resetAt - now,
      blocked: false,
    };
  }

  private cleanupMemory(): void {
    const now = Date.now();
    for (const [identifier, record] of this.memoryRecords.entries()) {
      if (now > record.resetAt) {
        this.memoryRecords.delete(identifier);
      }
    }
  }
}

// --- Limiter instances ---

// Auth: 5 attempts per 15 minutes
export const authLimiter = new UpstashRateLimiter(5, 15 * 60 * 1000, undefined, 'auth');

// Password reset: 3 attempts per hour
export const passwordResetLimiter = new UpstashRateLimiter(3, 60 * 60 * 1000, undefined, 'pwd-reset');

// Nanny registration: 5 requests per 15 minutes
export const nannyRegistrationLimiter = new UpstashRateLimiter(5, 15 * 60 * 1000, undefined, 'nanny-reg');

// Email check: 10 requests per minute
export const emailCheckLimiter = new UpstashRateLimiter(10, 60 * 1000, undefined, 'email-check');

// BigID validation: 3 attempts per hour (expensive API)
export const validationLimiter = new UpstashRateLimiter(3, 60 * 60 * 1000, undefined, 'validation');

// Generic API: 100 requests per 15 minutes
export const apiLimiter = new UpstashRateLimiter(100, 15 * 60 * 1000, undefined, 'api');

// Webhook: 1000 requests per minute (high frequency expected)
export const webhookLimiter = new UpstashRateLimiter(1000, 60 * 1000, undefined, 'webhook');

// --- IP helpers (unchanged) ---

const TRUSTED_IPS = new Set([
  '127.0.0.1',
  '::1',
  'localhost',
]);

function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === 'localhost';
}

export function getClientIP(headers: Headers): string {
  // Vercel specific
  const vercelIP = headers.get('x-vercel-forwarded-for');
  if (vercelIP) {
    const ip = vercelIP.split(',')[0].trim();
    if (isValidIP(ip)) return ip;
  }

  // Cloudflare specific
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP && isValidIP(cfIP)) return cfIP;

  // Standard forwarded header
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    if (isValidIP(ip)) return ip;
  }

  const realIP = headers.get('x-real-ip');
  if (realIP && isValidIP(realIP)) return realIP;

  return 'unknown';
}

export function isTrustedIP(ip: string): boolean {
  return TRUSTED_IPS.has(ip);
}

export function createRateLimitIdentifier(headers: Headers, userId?: string): string {
  const ip = getClientIP(headers);
  if (userId) return `user:${userId}`;
  return `ip:${ip}`;
}

export { UpstashRateLimiter as RateLimiter };
export default UpstashRateLimiter;
