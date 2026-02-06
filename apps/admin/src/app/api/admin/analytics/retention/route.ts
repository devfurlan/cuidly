import { withAuth } from '@/proxy';
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/checkPermission';

interface CohortData {
  cohort: string;
  cohortSize: number;
  retention: number[];
}

/**
 * GET /api/admin/analytics/retention
 * Retorna dados para analise de coorte (retencao de usuarios)
 *
 * Query params:
 * - period: 'weekly' | 'monthly' (default: 'weekly')
 * - cohorts: number (default: 8) - quantidade de coortes a retornar
 * - userType: 'all' | 'FAMILY' | 'NANNY' (default: 'all')
 */
async function handleGet(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'weekly';
    const cohortsCount = parseInt(searchParams.get('cohorts') || '8', 10);
    const userType = searchParams.get('userType') || 'all';

    const now = new Date();
    const cohorts: CohortData[] = [];

    // Calcular intervalo baseado no periodo
    const intervalDays = period === 'monthly' ? 30 : 7;
    const totalPeriods = cohortsCount;

    // Para cada coorte (semana/mes de cadastro)
    for (let i = totalPeriods - 1; i >= 0; i--) {
      const cohortStart = new Date(now);
      cohortStart.setDate(now.getDate() - (i + 1) * intervalDays);
      cohortStart.setHours(0, 0, 0, 0);

      const cohortEnd = new Date(cohortStart);
      cohortEnd.setDate(cohortStart.getDate() + intervalDays);

      const dateFilter = {
        createdAt: {
          gte: cohortStart,
          lt: cohortEnd,
        },
        deletedAt: null,
      };

      // Buscar nannies e families que se cadastraram neste periodo
      const [nanniesInCohort, familiesInCohort] = await Promise.all([
        userType === 'all' || userType === 'NANNY'
          ? prisma.nanny.findMany({
              where: dateFilter,
              select: { id: true, createdAt: true },
            })
          : [],
        userType === 'all' || userType === 'FAMILY'
          ? prisma.family.findMany({
              where: dateFilter,
              select: { id: true, createdAt: true },
            })
          : [],
      ]);

      const nannyIds = nanniesInCohort.map((n) => n.id);
      const familyIds = familiesInCohort.map((f) => f.id);
      const cohortSize = nannyIds.length + familyIds.length;

      // Calcular retencao para cada periodo subsequente
      const retention: number[] = [];
      const periodsToCheck = Math.min(totalPeriods - i, 6); // Máximo de 6 periodos de retencao

      for (let p = 0; p < periodsToCheck; p++) {
        if (cohortSize === 0) {
          retention.push(0);
          continue;
        }

        const periodStart = new Date(cohortEnd);
        periodStart.setDate(cohortEnd.getDate() + p * intervalDays);

        const periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + intervalDays);

        // Se o periodo esta no futuro, pular
        if (periodStart > now) {
          break;
        }

        // Verificar atividade atraves de diferentes indicadores
        const [nannyActivity, familyActivity, profileViews, messagesNanny, messagesFamily] = await Promise.all([
          // Nannies com atualizacao no periodo
          prisma.nanny.count({
            where: {
              id: { in: nannyIds },
              updatedAt: {
                gte: periodStart,
                lt: periodEnd,
              },
            },
          }),
          // Families com atualizacao no periodo
          prisma.family.count({
            where: {
              id: { in: familyIds },
              updatedAt: {
                gte: periodStart,
                lt: periodEnd,
              },
            },
          }),
          // Perfis visualizados
          prisma.userProfileView.count({
            where: {
              viewedAt: {
                gte: periodStart,
                lt: periodEnd,
              },
            },
          }),
          // Mensagens de nannies
          prisma.message.count({
            where: {
              senderNannyId: { in: nannyIds },
              createdAt: {
                gte: periodStart,
                lt: periodEnd,
              },
            },
          }),
          // Mensagens de families
          prisma.message.count({
            where: {
              senderFamilyId: { in: familyIds },
              createdAt: {
                gte: periodStart,
                lt: periodEnd,
              },
            },
          }),
        ]);

        // Estimar usuarios retidos (usando uma heuristica simples)
        const estimatedRetained = Math.min(
          cohortSize,
          nannyActivity + familyActivity + Math.ceil((profileViews + messagesNanny + messagesFamily) / 3)
        );

        const retentionRate = Math.round((estimatedRetained / cohortSize) * 100);
        retention.push(Math.min(retentionRate, 100));
      }

      // Formatar label da coorte
      const cohortLabel = period === 'monthly'
        ? cohortStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        : `${cohortStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;

      cohorts.push({
        cohort: cohortLabel,
        cohortSize,
        retention,
      });
    }

    // Gerar labels dos periodos
    const periodLabels = period === 'monthly'
      ? ['M0', 'M1', 'M2', 'M3', 'M4', 'M5']
      : ['S0', 'S1', 'S2', 'S3', 'S4', 'S5'];

    return NextResponse.json({
      cohorts,
      periodLabels,
      period,
    });
  } catch (error) {
    console.error('Error fetching retention data:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar dados de retencao';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
