import { withAuth } from '@/proxy';
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/checkPermission';
import { Prisma } from '@prisma/client';

interface FunnelStep {
  name: string;
  value: number;
  percentage: number;
}

/**
 * GET /api/admin/analytics/conversion-funnel
 * Retorna dados para o funil de conversao
 *
 * Query params:
 * - startDate: string (ISO date)
 * - endDate: string (ISO date)
 * - userType: 'all' | 'FAMILY' | 'NANNY' (default: 'all')
 */
async function handleGet(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const userType = searchParams.get('userType') || 'all';

    // Definir periodo padrao (ultimos 30 dias)
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filtros base
    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
    };

    // Buscar dados do funil - agora separado por Nanny e Family
    let registeredCount = 0;
    let emailVerifiedCount = 0;
    let onboardingCompletedCount = 0;
    let subscribedCount = 0;

    if (userType === 'all' || userType === 'NANNY') {
      const [nanniesRegistered, nanniesVerified, nanniesOnboarded, nanniesSubscribed] = await Promise.all([
        prisma.nanny.count({
          where: dateFilter as Prisma.NannyWhereInput,
        }),
        prisma.nanny.count({
          where: {
            ...dateFilter,
            emailVerified: true,
          } as Prisma.NannyWhereInput,
        }),
        prisma.nanny.count({
          where: {
            ...dateFilter,
            onboardingCompleted: true,
          } as Prisma.NannyWhereInput,
        }),
        prisma.nanny.count({
          where: {
            ...dateFilter,
            subscription: {
              status: 'ACTIVE',
              plan: { not: 'NANNY_FREE' },
            },
          } as Prisma.NannyWhereInput,
        }),
      ]);

      registeredCount += nanniesRegistered;
      emailVerifiedCount += nanniesVerified;
      onboardingCompletedCount += nanniesOnboarded;
      subscribedCount += nanniesSubscribed;
    }

    if (userType === 'all' || userType === 'FAMILY') {
      const [familiesRegistered, familiesVerified, familiesOnboarded, familiesSubscribed] = await Promise.all([
        prisma.family.count({
          where: dateFilter as Prisma.FamilyWhereInput,
        }),
        prisma.family.count({
          where: {
            ...dateFilter,
            emailVerified: true,
          } as Prisma.FamilyWhereInput,
        }),
        prisma.family.count({
          where: {
            ...dateFilter,
            onboardingCompleted: true,
          } as Prisma.FamilyWhereInput,
        }),
        prisma.family.count({
          where: {
            ...dateFilter,
            subscription: {
              status: 'ACTIVE',
              plan: { not: 'FAMILY_FREE' },
            },
          } as Prisma.FamilyWhereInput,
        }),
      ]);

      registeredCount += familiesRegistered;
      emailVerifiedCount += familiesVerified;
      onboardingCompletedCount += familiesOnboarded;
      subscribedCount += familiesSubscribed;
    }

    // Calcular percentuais (em relacao ao passo anterior)
    const funnel: FunnelStep[] = [
      {
        name: 'Cadastrados',
        value: registeredCount,
        percentage: 100,
      },
      {
        name: 'Email Verificado',
        value: emailVerifiedCount,
        percentage: registeredCount > 0
          ? Math.round((emailVerifiedCount / registeredCount) * 100)
          : 0,
      },
      {
        name: 'Onboarding Completo',
        value: onboardingCompletedCount,
        percentage: registeredCount > 0
          ? Math.round((onboardingCompletedCount / registeredCount) * 100)
          : 0,
      },
      {
        name: 'Assinantes',
        value: subscribedCount,
        percentage: registeredCount > 0
          ? Math.round((subscribedCount / registeredCount) * 100)
          : 0,
      },
    ];

    // Calcular taxas de conversao entre etapas
    const conversionRates = {
      cadastroToEmail: registeredCount > 0
        ? Math.round((emailVerifiedCount / registeredCount) * 100)
        : 0,
      emailToOnboarding: emailVerifiedCount > 0
        ? Math.round((onboardingCompletedCount / emailVerifiedCount) * 100)
        : 0,
      onboardingToSubscription: onboardingCompletedCount > 0
        ? Math.round((subscribedCount / onboardingCompletedCount) * 100)
        : 0,
      overallConversion: registeredCount > 0
        ? Math.round((subscribedCount / registeredCount) * 100)
        : 0,
    };

    return NextResponse.json({
      funnel,
      conversionRates,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      userType,
    });
  } catch (error) {
    console.error('Error fetching conversion funnel data:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar dados do funil de conversao';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
