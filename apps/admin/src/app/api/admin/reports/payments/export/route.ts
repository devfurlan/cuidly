import { withAuth } from '@/proxy';
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { PaymentStatus } from '@prisma/client';

/**
 * GET /api/admin/reports/payments/export
 * Exporta uma lista de pagamentos em formato CSV
 *
 * Query params:
 * - status: PaymentStatus | 'all' (default: 'all')
 * - startDate: string (ISO date) - inicio do periodo
 * - endDate: string (ISO date) - fim do periodo
 */
async function handleGet(request: NextRequest) {
  try {
    await requirePermission('SUBSCRIPTIONS');

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Construir filtro
    const where: Record<string, unknown> = {};

    if (status !== 'all') {
      where.status = status as PaymentStatus;
    }

    if (startDateParam || endDateParam) {
      where.createdAt = {};
      if (startDateParam) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDateParam);
      }
      if (endDateParam) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDateParam);
      }
    }

    const statusLabels: Record<string, string> = {
      PENDING: 'Pendente',
      PROCESSING: 'Processando',
      CONFIRMED: 'Confirmado',
      PAID: 'Pago',
      FAILED: 'Falhou',
      CANCELED: 'Cancelado',
      REFUNDED: 'Reembolsado',
      PARTIALLY_REFUNDED: 'Reembolso Parcial',
      OVERDUE: 'Vencido',
      CHARGEBACK: 'Chargeback',
      AWAITING_RISK_ANALYSIS: 'Aguardando Analise',
    };

    const typeLabels: Record<string, string> = {
      SUBSCRIPTION: 'Assinatura',
      ONE_TIME: 'Único',
      REFUND: 'Reembolso',
      ADJUSTMENT: 'Ajuste',
    };

    const methodLabels: Record<string, string> = {
      CREDIT_CARD: 'Cartao de Credito',
      DEBIT_CARD: 'Cartao de Debito',
      PIX: 'PIX',
      BOLETO: 'Boleto',
      BANK_TRANSFER: 'Transferencia',
      PAYPAL: 'PayPal',
      WALLET: 'Carteira',
      MANUAL: 'Manual',
    };

    // Buscar pagamentos
    const payments = await prisma.payment.findMany({
      where,
      include: {
        nanny: {
          select: {
            name: true,
            emailAddress: true,
          },
        },
        family: {
          select: {
            name: true,
            emailAddress: true,
          },
        },
        subscription: {
          select: {
            plan: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Gerar CSV
    const headers = [
      'ID',
      'Nome do Usuario',
      'Email',
      'Valor',
      'Moeda',
      'Status',
      'Tipo',
      'Metodo',
      'Plano',
      'Gateway',
      'ID Externo',
      'Descrição',
      'Data de Pagamento',
      'Data de Criacao',
    ];

    const rows = payments.map((payment) => {
      const userName = payment.nanny?.name || payment.family?.name || '';
      const userEmail = payment.nanny?.emailAddress || payment.family?.emailAddress || '';
      return [
        payment.id,
        userName,
        userEmail,
        `R$ ${payment.amount.toFixed(2)}`,
        payment.currency,
        statusLabels[payment.status] || payment.status,
        typeLabels[payment.type] || payment.type,
        payment.paymentMethod ? methodLabels[payment.paymentMethod] || payment.paymentMethod : '-',
        payment.subscription?.plan || '-',
        payment.paymentGateway,
        payment.externalPaymentId || '-',
        payment.description || '-',
        payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('pt-BR') : '-',
        new Date(payment.createdAt).toLocaleDateString('pt-BR'),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    // Adicionar BOM para UTF-8
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pagamentos_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting payments:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao exportar pagamentos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
