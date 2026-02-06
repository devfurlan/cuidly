import { withAuth } from '@/proxy';
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/checkPermission';

interface FeatureUsageData {
  date: string;
  jobsPublished: number;
  applicationsSubmitted: number;
  conversationsStarted: number;
  profilesFavorited: number;
  messagesExchanged: number;
}

interface FeatureTotal {
  name: string;
  total: number;
  change: number; // percentual de mudanca em relacao ao periodo anterior
}

/**
 * GET /api/admin/analytics/feature-usage
 * Retorna dados sobre o uso das principais funcionalidades
 *
 * Query params:
 * - startDate: string (ISO date)
 * - endDate: string (ISO date)
 * - granularity: 'daily' | 'weekly' | 'monthly' (default: 'daily')
 */
async function handleGet(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const granularity = searchParams.get('granularity') || 'daily';

    // Definir periodo padrao (ultimos 30 dias)
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Periodo anterior para comparacao
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(startDate.getTime());

    // Buscar totais do periodo atual
    const [
      jobsPublished,
      applicationsSubmitted,
      conversationsStarted,
      profilesFavorited,
      messagesExchanged,
    ] = await Promise.all([
      prisma.job.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          deletedAt: null,
        },
      }),
      prisma.jobApplication.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.conversation.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.favorite.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.message.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    // Buscar totais do periodo anterior para calcular mudanca
    const [
      prevJobsPublished,
      prevApplicationsSubmitted,
      prevConversationsStarted,
      prevProfilesFavorited,
      prevMessagesExchanged,
    ] = await Promise.all([
      prisma.job.count({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate },
          deletedAt: null,
        },
      }),
      prisma.jobApplication.count({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate },
        },
      }),
      prisma.conversation.count({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate },
        },
      }),
      prisma.favorite.count({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate },
        },
      }),
      prisma.message.count({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate },
        },
      }),
    ]);

    // Calcular mudanca percentual
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const totals: FeatureTotal[] = [
      {
        name: 'Vagas Publicadas',
        total: jobsPublished,
        change: calculateChange(jobsPublished, prevJobsPublished),
      },
      {
        name: 'Candidaturas',
        total: applicationsSubmitted,
        change: calculateChange(applicationsSubmitted, prevApplicationsSubmitted),
      },
      {
        name: 'Conversas Iniciadas',
        total: conversationsStarted,
        change: calculateChange(conversationsStarted, prevConversationsStarted),
      },
      {
        name: 'Perfis Favoritados',
        total: profilesFavorited,
        change: calculateChange(profilesFavorited, prevProfilesFavorited),
      },
      {
        name: 'Mensagens Trocadas',
        total: messagesExchanged,
        change: calculateChange(messagesExchanged, prevMessagesExchanged),
      },
    ];

    // Buscar dados granulares para o grafico
    const timeline: FeatureUsageData[] = [];

    // Determinar o intervalo baseado na granularidade
    let intervalMs: number;
    switch (granularity) {
      case 'monthly':
        intervalMs = 30 * 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        intervalMs = 24 * 60 * 60 * 1000;
    }

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const periodStart = new Date(currentDate);
      const periodEnd = new Date(currentDate.getTime() + intervalMs);

      const [jobs, apps, convs, favs, msgs] = await Promise.all([
        prisma.job.count({
          where: {
            createdAt: { gte: periodStart, lt: periodEnd },
            deletedAt: null,
          },
        }),
        prisma.jobApplication.count({
          where: {
            createdAt: { gte: periodStart, lt: periodEnd },
          },
        }),
        prisma.conversation.count({
          where: {
            createdAt: { gte: periodStart, lt: periodEnd },
          },
        }),
        prisma.favorite.count({
          where: {
            createdAt: { gte: periodStart, lt: periodEnd },
          },
        }),
        prisma.message.count({
          where: {
            createdAt: { gte: periodStart, lt: periodEnd },
          },
        }),
      ]);

      let dateLabel: string;
      switch (granularity) {
        case 'monthly':
          dateLabel = periodStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
          break;
        case 'weekly':
          dateLabel = `${periodStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
          break;
        default:
          dateLabel = periodStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      }

      timeline.push({
        date: dateLabel,
        jobsPublished: jobs,
        applicationsSubmitted: apps,
        conversationsStarted: convs,
        profilesFavorited: favs,
        messagesExchanged: msgs,
      });

      currentDate.setTime(currentDate.getTime() + intervalMs);
    }

    return NextResponse.json({
      totals,
      timeline,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      granularity,
    });
  } catch (error) {
    console.error('Error fetching feature usage data:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar dados de uso de funcionalidades';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
