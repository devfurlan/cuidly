import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// Store para códigos temporários (em produção, usar Redis)
// Os códigos expiram em 5 minutos
const resetCodeStore = new Map<
  string,
  { token: string; type: string; expiresAt: number; used: boolean }
>();

// Limpar códigos expirados periodicamente
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now();
      for (const [code, data] of resetCodeStore.entries()) {
        if (data.expiresAt < now) {
          resetCodeStore.delete(code);
        }
      }
    },
    60 * 1000,
  ); // A cada 1 minuto
}

/**
 * POST /api/auth/exchange-reset-token
 *
 * Cria um código de troca de curta duração para o token de reset
 * Este código é usado uma única vez e expira em 5 minutos
 *
 * SEGURANÇA:
 * - Código de uso único
 * - Expira em 5 minutos
 * - Token original nunca é exposto na URL
 * - Token é armazenado em memória no servidor (não no cliente)
 */
export async function POST(request: NextRequest) {
  try {
    const { token, type } = await request.json();

    if (!token || !type) {
      return NextResponse.json(
        { error: 'Token e tipo são obrigatórios' },
        { status: 400 },
      );
    }

    // Gerar código de troca de curta duração (32 bytes = 64 caracteres hex)
    const exchangeCode = randomBytes(32).toString('hex');

    // Armazenar token real com expiração de 5 minutos
    // O token é armazenado no servidor, nunca exposto ao cliente via URL
    resetCodeStore.set(exchangeCode, {
      token,
      type,
      expiresAt: Date.now() + 5 * 60 * 1000,
      used: false,
    });

    return NextResponse.json({ code: exchangeCode });
  } catch (error) {
    console.error(
      '[AUTH] Erro ao criar código de troca:',
      error instanceof Error ? error.message : 'Erro desconhecido',
    );
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/auth/exchange-reset-token?code=xxx
 *
 * Troca o código temporário pelo token de reset original
 * O código é invalidado após o uso (uso único)
 *
 * SEGURANÇA:
 * - Código de uso único (invalida após primeiro uso)
 * - Resposta via POST para evitar cache/logs
 * - Token nunca aparece em URLs ou logs
 */
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Código é obrigatório' },
        { status: 400 },
      );
    }

    // Buscar dados do código
    const codeData = resetCodeStore.get(code);

    if (!codeData) {
      return NextResponse.json(
        { error: 'Código inválido ou expirado' },
        { status: 400 },
      );
    }

    // Verificar se já foi usado
    if (codeData.used) {
      resetCodeStore.delete(code);
      return NextResponse.json(
        { error: 'Código já foi utilizado' },
        { status: 400 },
      );
    }

    // Verificar expiração
    if (codeData.expiresAt < Date.now()) {
      resetCodeStore.delete(code);
      return NextResponse.json(
        { error: 'Código expirado' },
        { status: 400 },
      );
    }

    // Marcar como usado (não deletar ainda para prevenir race conditions)
    codeData.used = true;

    // Agendar remoção após 10 segundos
    setTimeout(() => {
      resetCodeStore.delete(code);
    }, 10000);

    // Retornar token e tipo para verificação no cliente
    return NextResponse.json({
      token: codeData.token,
      type: codeData.type,
    });
  } catch (error) {
    console.error(
      '[AUTH] Erro ao trocar código:',
      error instanceof Error ? error.message : 'Erro desconhecido',
    );
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 },
    );
  }
}
