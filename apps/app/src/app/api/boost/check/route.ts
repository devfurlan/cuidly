import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getPlanFeatures } from '@/services/subscription/subscription-service';

// GET /api/boost/check - Verificar se pode usar boost
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'type é obrigatório' }, { status: 400 });
    }

    if (type === 'NANNY_PROFILE') {
      if (currentUser.type !== 'nanny') {
        return NextResponse.json({
          canBoost: false,
          hasFeature: false,
          message: 'Apenas babás podem usar boost de perfil.',
        });
      }

      const nannyId = currentUser.nanny.id;

      // Get plan features using subscription service
      const features = await getPlanFeatures({ nannyId });
      const weeklyBoost = features?.weeklyBoost || 0;

      if (weeklyBoost === 0) {
        return NextResponse.json({
          canBoost: false,
          hasFeature: false,
          message: 'Funcionalidade disponível apenas no plano pago.',
        });
      }

      // Verificar se já usou boost esta semana
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const recentBoost = await prisma.boost.findFirst({
        where: {
          nannyId,
          type: 'NANNY_PROFILE',
          createdAt: { gte: oneWeekAgo },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentBoost) {
        const daysRemaining = Math.ceil(
          (7 - (Date.now() - recentBoost.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        );

        // Verificar se ainda está ativo
        const isActive = recentBoost.isActive && new Date(recentBoost.endDate) > new Date();

        return NextResponse.json({
          canBoost: false,
          hasFeature: true,
          daysRemaining: Math.max(0, daysRemaining),
          isActive,
          activeBoost: isActive ? recentBoost : null,
          message: `Você já usou seu boost semanal. Aguarde ${Math.max(0, daysRemaining)} dia(s).`,
        });
      }

      return NextResponse.json({
        canBoost: true,
        hasFeature: true,
        message: 'Você pode ativar seu boost semanal!',
      });
    } else if (type === 'JOB') {
      if (currentUser.type !== 'family') {
        return NextResponse.json({
          canBoost: false,
          hasFeature: false,
          message: 'Apenas famílias podem usar boost de vaga.',
        });
      }

      const familyId = currentUser.family.id;

      // Get plan features using subscription service
      const features = await getPlanFeatures({ familyId });
      const boostPerCycle = features?.boostPerCycle || 0;

      if (boostPerCycle === 0) {
        return NextResponse.json({
          canBoost: false,
          hasFeature: false,
          message: 'Funcionalidade disponível apenas no Plano Plus.',
        });
      }

      // Verificar se já usou boost este mês
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Buscar boosts de qualquer vaga da família no último mês
      const familyJobs = await prisma.job.findMany({
        where: { familyId },
        select: { id: true },
      });
      const jobIds = familyJobs.map((j) => j.id);

      const recentBoost = await prisma.boost.findFirst({
        where: {
          jobId: { in: jobIds },
          type: 'JOB',
          createdAt: { gte: oneMonthAgo },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentBoost) {
        const daysRemaining = Math.ceil(
          (30 - (Date.now() - recentBoost.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        );

        // Verificar se ainda está ativo
        const isActive = recentBoost.isActive && new Date(recentBoost.endDate) > new Date();

        return NextResponse.json({
          canBoost: false,
          hasFeature: true,
          daysRemaining: Math.max(0, daysRemaining),
          isActive,
          activeBoost: isActive ? recentBoost : null,
          message: `Você já usou seu boost deste ciclo. Aguarde ${Math.max(0, daysRemaining)} dia(s).`,
        });
      }

      return NextResponse.json({
        canBoost: true,
        hasFeature: true,
        message: 'Você pode ativar seu boost!',
      });
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao verificar boost:', error);
    return NextResponse.json({ error: 'Erro ao verificar boost' }, { status: 500 });
  }
}
