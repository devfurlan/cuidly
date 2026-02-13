/**
 * Auth helpers for Playwright E2E tests.
 *
 * Strategy: POST to Supabase /auth/v1/token to get a full session, then set
 * the cookie that @supabase/ssr (createBrowserClient) expects.
 *
 * The cookie name is `sb-<projectRef>-auth-token` and the value is
 * base64url-encoded JSON containing the full session response.
 */

import { type Page, type BrowserContext } from '@playwright/test';
import { TEST_USERS, type TestUserKey } from '../../seed/test-seed';

function getEnvOrThrow(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env var: ${name}. Check .env.test`);
  return val;
}

function extractProjectRef(supabaseUrl: string): string {
  // Extract project ref from URL like https://abcdef.supabase.co
  const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase/);
  if (!match) throw new Error(`Cannot extract project ref from ${supabaseUrl}`);
  return match[1];
}

function toBase64Url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function login(
  context: BrowserContext,
  page: Page,
  userKey: TestUserKey,
) {
  const user = TEST_USERS[userKey];
  const supabaseUrl = getEnvOrThrow('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = getEnvOrThrow('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const projectRef = process.env.SUPABASE_PROJECT_REF || extractProjectRef(supabaseUrl);

  // 1. Authenticate via Supabase Auth REST API (with retry for rate limits)
  let session: Record<string, unknown>;
  const MAX_RETRIES = 5;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      },
    );

    if (response.ok) {
      session = await response.json();
      break;
    }

    if (response.status === 429 && attempt < MAX_RETRIES - 1) {
      // Rate limited — wait with exponential backoff before retrying
      const delay = 3000 * Math.pow(2, attempt); // 3s, 6s, 12s, 24s
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    const body = await response.text();
    throw new Error(`Supabase auth failed for ${userKey}: ${response.status} ${body}`);
  }

  // 2. Encode the session in the format @supabase/ssr v0.6.1 expects.
  //
  // The SDK stores session data as JSON in a cookie. The cookie value format is:
  //   "base64-" + base64url(JSON string of session)
  //
  // The session JSON is what Supabase GoTrue stores internally — it's the raw
  // token response from /auth/v1/token.
  //
  // If the encoded value exceeds 3180 chars, it gets chunked into
  // sb-<ref>-auth-token.0, .1, etc. We handle that here too.
  const cookieName = `sb-${projectRef}-auth-token`;
  const sessionJson = JSON.stringify(session);
  const encoded = 'base64-' + toBase64Url(sessionJson);

  // 3. Chunk if needed (Supabase SSR MAX_CHUNK_SIZE = 3180 for URI-encoded value)
  const MAX_CHUNK_SIZE = 3180;
  const uriEncoded = encodeURIComponent(encoded);
  const cookies: { name: string; value: string }[] = [];

  if (uriEncoded.length <= MAX_CHUNK_SIZE) {
    cookies.push({ name: cookieName, value: encoded });
  } else {
    // Split by URI-encoded size
    let remaining = encoded;
    let chunkIndex = 0;
    while (remaining.length > 0) {
      let chunk = remaining;
      // Find max substring that fits within MAX_CHUNK_SIZE when URI-encoded
      while (encodeURIComponent(chunk).length > MAX_CHUNK_SIZE) {
        chunk = chunk.slice(0, chunk.length - 100);
      }
      cookies.push({ name: `${cookieName}.${chunkIndex}`, value: chunk });
      remaining = remaining.slice(chunk.length);
      chunkIndex++;
    }
  }

  // 4. Set cookies in the browser context
  await context.addCookies(
    cookies.map(({ name, value }) => ({
      name,
      value,
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax' as const,
    })),
  );

  // 5. Visit app — the middleware reads the cookie and establishes the session
  await page.goto('/app');
  await page.waitForURL(/\/app/);
}

export async function loginAsFamily(context: BrowserContext, page: Page) {
  return login(context, page, 'family');
}

export async function loginAsFamilyPaid(context: BrowserContext, page: Page) {
  return login(context, page, 'familyPaid');
}

export async function loginAsNanny(context: BrowserContext, page: Page) {
  return login(context, page, 'nanny');
}

export async function loginAsNannyPro(context: BrowserContext, page: Page) {
  return login(context, page, 'nannyPro');
}
