/**
 * Utilitário de autenticação para Cron Jobs
 *
 * Implementa comparação timing-safe para prevenir timing attacks
 * na verificação de secrets de autenticação.
 */

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Compara dois strings de forma segura contra timing attacks
 */
function timingSafeCompare(a: string, b: string): boolean {
  try {
    // Usar buffers de tamanho fixo para prevenir vazamento de informação
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');

    // Se os tamanhos forem diferentes, ainda precisamos comparar
    // para não vazar informação sobre o tamanho
    if (bufA.length !== bufB.length) {
      // Comparar bufA consigo mesmo para manter tempo constante
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Resultado da verificação de autenticação do cron
 */
interface CronAuthResult {
  isAuthorized: boolean;
  errorResponse?: NextResponse;
}

/**
 * Verifica a autenticação de um cron job
 *
 * @param request - NextRequest do cron job
 * @returns Objeto com status de autorização e possível resposta de erro
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const auth = verifyCronAuth(request);
 *   if (!auth.isAuthorized) {
 *     return auth.errorResponse;
 *   }
 *   // ... resto do cron job
 * }
 * ```
 */
export function verifyCronAuth(request: NextRequest): CronAuthResult {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Se não há secret configurado, log de aviso mas permite em desenvolvimento
  if (!cronSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[CRON] CRON_SECRET não configurado em produção');
      return {
        isAuthorized: false,
        errorResponse: NextResponse.json(
          { error: 'Configuração de segurança ausente' },
          { status: 500 }
        ),
      };
    }
    console.warn('[CRON] AVISO: CRON_SECRET não configurado - cron jobs sem autenticação');
    return { isAuthorized: true };
  }

  // Verificar se o header de autorização está presente
  if (!authHeader) {
    return {
      isAuthorized: false,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  // Verificar formato Bearer
  if (!authHeader.startsWith('Bearer ')) {
    return {
      isAuthorized: false,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  const providedToken = authHeader.slice(7); // Remove 'Bearer '
  const expectedToken = cronSecret;

  // Usar comparação timing-safe
  const isValid = timingSafeCompare(providedToken, expectedToken);

  if (!isValid) {
    return {
      isAuthorized: false,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return { isAuthorized: true };
}

export default verifyCronAuth;
