/**
 * In-memory rate limiter for API endpoints
 * Tracks requests per identifier within a time window
 *
 * NOTA: Este rate limiter é in-memory e não persiste entre restarts.
 * Para produção em ambiente serverless, considere usar Redis ou
 * um serviço como Upstash Rate Limit.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blocked: boolean; // Flag para bloqueio temporário após exceder limite
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  blocked: boolean;
}

class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  /**
   * @param maxRequests - Número máximo de requisições permitidas
   * @param windowMs - Janela de tempo em milissegundos
   * @param blockDurationMs - Duração do bloqueio após exceder limite (opcional)
   */
  constructor(maxRequests: number, windowMs: number, blockDurationMs?: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs || windowMs * 2;

    // Clean up old records every minute
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60000);
    }
  }

  /**
   * Check if a request from an identifier is allowed
   * @param identifier - Unique identifier (e.g., IP address or user ID)
   * @returns RateLimitResult com status e informações
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const record = this.records.get(identifier);

    // Verificar se está bloqueado
    if (record?.blocked && now < record.resetAt) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: record.resetAt - now,
        blocked: true,
      };
    }

    if (!record || now > record.resetAt) {
      // No record or window expired - allow and create new record
      this.records.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
        blocked: false,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetIn: this.windowMs,
        blocked: false,
      };
    }

    if (record.count >= this.maxRequests) {
      // Rate limit exceeded - block for longer duration
      record.blocked = true;
      record.resetAt = now + this.blockDurationMs;
      return {
        allowed: false,
        remaining: 0,
        resetIn: this.blockDurationMs,
        blocked: true,
      };
    }

    // Increment count
    record.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetIn: record.resetAt - now,
      blocked: false,
    };
  }

  /**
   * Método simplificado para compatibilidade - retorna boolean
   */
  isAllowed(identifier: string): boolean {
    return this.check(identifier).allowed;
  }

  /**
   * Get remaining requests for an identifier
   * @param identifier - Unique identifier
   * @returns Number of remaining requests
   */
  getRemaining(identifier: string): number {
    const record = this.records.get(identifier);
    const now = Date.now();

    if (!record || now > record.resetAt) {
      return this.maxRequests;
    }

    if (record.blocked) {
      return 0;
    }

    return Math.max(0, this.maxRequests - record.count);
  }

  /**
   * Get time until rate limit resets
   * @param identifier - Unique identifier
   * @returns Milliseconds until reset, or 0 if no active limit
   */
  getResetTime(identifier: string): number {
    const record = this.records.get(identifier);
    const now = Date.now();

    if (!record || now > record.resetAt) {
      return 0;
    }

    return record.resetAt - now;
  }

  /**
   * Remove expired records
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, record] of this.records.entries()) {
      if (now > record.resetAt) {
        this.records.delete(identifier);
      }
    }
  }

  /**
   * Reset rate limit for an identifier
   * @param identifier - Unique identifier
   */
  reset(identifier: string): void {
    this.records.delete(identifier);
  }
}

// Export rate limiter instances for different endpoints

// Autenticação: 5 tentativas por 15 minutos, bloqueio de 30 min após exceder
export const authLimiter = new RateLimiter(5, 15 * 60 * 1000, 30 * 60 * 1000);

// Password reset: 3 tentativas por hora
export const passwordResetLimiter = new RateLimiter(3, 60 * 60 * 1000);

// Nanny registration: 5 requests per 15 minutes
export const nannyRegistrationLimiter = new RateLimiter(5, 15 * 60 * 1000);

// Email check: 10 requests per minute
export const emailCheckLimiter = new RateLimiter(10, 60 * 1000);

// Validação BigID: 3 tentativas por hora (API cara)
export const validationLimiter = new RateLimiter(3, 60 * 60 * 1000);

// Generic API limiter: 100 requests per 15 minutes
export const apiLimiter = new RateLimiter(100, 15 * 60 * 1000);

// Webhook limiter: 1000 requests per minute (alta frequência esperada)
export const webhookLimiter = new RateLimiter(1000, 60 * 1000);

/**
 * Lista de IPs confiáveis que ignoram rate limiting
 * Inclui IPs de serviços internos como Vercel Cron
 */
const TRUSTED_IPS = new Set([
  '127.0.0.1',
  '::1',
  'localhost',
]);

/**
 * Valida se um IP é válido (IPv4 ou IPv6)
 */
function isValidIP(ip: string): boolean {
  // IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // IPv6 simplificado
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === 'localhost';
}

/**
 * Get client IP from request headers with validation
 * @param headers - Request headers
 * @returns Client IP address or 'unknown'
 *
 * SEGURANÇA: Valida o formato do IP para prevenir spoofing
 * Em ambiente de produção com proxy reverso confiável (Vercel, Cloudflare),
 * o x-forwarded-for é seguro para usar.
 */
export function getClientIP(headers: Headers): string {
  // Check various headers for the real IP
  // Ordem de prioridade: headers específicos do provedor > x-forwarded-for > x-real-ip

  // Vercel specific
  const vercelIP = headers.get('x-vercel-forwarded-for');
  if (vercelIP) {
    const ip = vercelIP.split(',')[0].trim();
    if (isValidIP(ip)) {
      return ip;
    }
  }

  // Cloudflare specific
  const cfIP = headers.get('cf-connecting-ip');
  if (cfIP && isValidIP(cfIP)) {
    return cfIP;
  }

  // Standard forwarded header
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // Pegar o primeiro IP (cliente original)
    const ip = forwarded.split(',')[0].trim();
    if (isValidIP(ip)) {
      return ip;
    }
  }

  const realIP = headers.get('x-real-ip');
  if (realIP && isValidIP(realIP)) {
    return realIP;
  }

  // Fallback - usar hash do user-agent como identificador parcial
  return 'unknown';
}

/**
 * Verifica se um IP é confiável (interno/permitido)
 */
export function isTrustedIP(ip: string): boolean {
  return TRUSTED_IPS.has(ip);
}

/**
 * Cria um identificador combinado para rate limiting mais preciso
 * Combina IP + fingerprint parcial para melhor identificação
 */
export function createRateLimitIdentifier(headers: Headers, userId?: string): string {
  const ip = getClientIP(headers);

  // Se há userId autenticado, usar como identificador principal
  if (userId) {
    return `user:${userId}`;
  }

  // Para usuários não autenticados, usar IP
  return `ip:${ip}`;
}

export { RateLimiter };
export default RateLimiter;
