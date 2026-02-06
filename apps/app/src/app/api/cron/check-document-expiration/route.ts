import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/cron/check-document-expiration
 *
 * Cron job para verificar e invalidar documentos expirados
 * Deve ser executado diariamente via Vercel Cron ou similar
 *
 * Para configurar no Vercel, adicione ao vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-document-expiration",
 *     "schedule": "0 6 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma chamada do Vercel Cron ou chamada autorizada
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Em produção, validar o secret
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar babás com documentos expirados que ainda estão marcadas como validadas
    const expiredNannies = await prisma.nanny.findMany({
      where: {
        documentValidated: true,
        documentExpirationDate: {
          lt: today,
        },
      },
      select: {
        id: true,
        name: true,
        emailAddress: true,
        documentExpirationDate: true,
      },
    });

    if (expiredNannies.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum documento expirado encontrado',
        processed: 0,
      });
    }

    // Invalidar documentos expirados
    const updateResult = await prisma.nanny.updateMany({
      where: {
        id: {
          in: expiredNannies.map((n) => n.id),
        },
      },
      data: {
        documentValidated: false,
        documentValidationMessage:
          'Documento expirado. Por favor, valide um novo documento.',
      },
    });

    // TODO: Enviar notificação por email para as babás afetadas
    // Isso pode ser feito aqui ou em um job separado

    console.log(
      `[Cron] Documentos expirados invalidados: ${updateResult.count} babás`
    );

    return NextResponse.json({
      success: true,
      message: `${updateResult.count} documento(s) expirado(s) invalidado(s)`,
      processed: updateResult.count,
      nannies: expiredNannies.map((n) => ({
        id: n.id,
        name: n.name,
        expirationDate: n.documentExpirationDate,
      })),
    });
  } catch (error) {
    console.error('[Cron] Erro ao verificar documentos expirados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST - Também suporta POST para flexibilidade
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
