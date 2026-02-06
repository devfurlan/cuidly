import { withAuth } from '@/proxy';
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/reports/users/export
 * Exporta uma lista de nannies e families em formato CSV
 *
 * Query params:
 * - role: 'FAMILY' | 'NANNY' | 'all' (default: 'all')
 * - status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'all' (default: 'all')
 * - startDate: string (ISO date) - inicio do periodo de cadastro
 * - endDate: string (ISO date) - fim do periodo de cadastro
 */
async function handleGet(request: NextRequest) {
  try {
    await requirePermission('SUBSCRIPTIONS');

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Construir filtro base
    const baseWhere: Prisma.NannyWhereInput | Prisma.FamilyWhereInput = {
      deletedAt: null,
    };

    if (status !== 'all') {
      (baseWhere as { status?: string }).status = status;
    }

    if (startDateParam || endDateParam) {
      (baseWhere as { createdAt?: { gte?: Date; lte?: Date } }).createdAt = {};
      if (startDateParam) {
        (baseWhere.createdAt as { gte?: Date }).gte = new Date(startDateParam);
      }
      if (endDateParam) {
        (baseWhere.createdAt as { lte?: Date }).lte = new Date(endDateParam);
      }
    }

    // Buscar nannies e families separadamente
    const [nannies, families] = await Promise.all([
      role === 'all' || role === 'NANNY'
        ? prisma.nanny.findMany({
            where: baseWhere as Prisma.NannyWhereInput,
            select: {
              id: true,
              name: true,
              emailAddress: true,
              status: true,
              createdAt: true,
              emailVerified: true,
              onboardingCompleted: true,
              subscription: {
                select: {
                  plan: true,
                  status: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        : [],
      role === 'all' || role === 'FAMILY'
        ? prisma.family.findMany({
            where: baseWhere as Prisma.FamilyWhereInput,
            select: {
              id: true,
              name: true,
              emailAddress: true,
              status: true,
              createdAt: true,
              emailVerified: true,
              onboardingCompleted: true,
              subscription: {
                select: {
                  plan: true,
                  status: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        : [],
    ]);

    // Gerar CSV
    const headers = [
      'ID',
      'Nome',
      'Email',
      'Tipo',
      'Status',
      'Email Verificado',
      'Onboarding Completo',
      'Plano',
      'Status Assinatura',
      'Data de Cadastro',
    ];

    const nannyRows = nannies.map((nanny) => [
      nanny.id,
      nanny.name || '',
      nanny.emailAddress || '',
      'Baba',
      nanny.status,
      nanny.emailVerified ? 'Sim' : 'Nao',
      nanny.onboardingCompleted ? 'Sim' : 'Nao',
      nanny.subscription?.plan || 'Sem plano',
      nanny.subscription?.status || '-',
      new Date(nanny.createdAt).toLocaleDateString('pt-BR'),
    ]);

    const familyRows = families.map((family) => [
      family.id,
      family.name || '',
      family.emailAddress || '',
      'Familia',
      family.status,
      family.emailVerified ? 'Sim' : 'Nao',
      family.onboardingCompleted ? 'Sim' : 'Nao',
      family.subscription?.plan || 'Sem plano',
      family.subscription?.status || '-',
      new Date(family.createdAt).toLocaleDateString('pt-BR'),
    ]);

    const allRows = [...nannyRows, ...familyRows];

    const csvContent = [
      headers.join(','),
      ...allRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    // Adicionar BOM para UTF-8
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="usuarios_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao exportar usuarios';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
