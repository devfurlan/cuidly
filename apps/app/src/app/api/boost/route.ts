import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { getPlanFeatures } from '@/services/subscription/subscription-service';

// GET /api/boost - Listar boosts ativos do usuário
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar boosts ativos baseado no tipo de usuário
    const now = new Date();
    let boosts: Awaited<ReturnType<typeof prisma.boost.findMany>> = [];

    if (currentUser.type === 'nanny') {
      boosts = await prisma.boost.findMany({
        where: {
          nannyId: currentUser.nanny.id,
          type: 'NANNY_PROFILE',
          isActive: true,
          endDate: { gte: now },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (currentUser.type === 'family') {
      // Buscar boosts das vagas da família
      const familyJobs = await prisma.job.findMany({
        where: { familyId: currentUser.family.id },
        select: { id: true },
      });
      const jobIds = familyJobs.map((j) => j.id);

      boosts = await prisma.boost.findMany({
        where: {
          jobId: { in: jobIds },
          type: 'JOB',
          isActive: true,
          endDate: { gte: now },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ boosts });
  } catch (error) {
    console.error('Erro ao buscar boosts:', error);
    return NextResponse.json({ error: 'Erro ao buscar boosts' }, { status: 500 });
  }
}

// POST /api/boost - Ativar boost
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { type, targetId } = await req.json();

    if (!type || !targetId) {
      return NextResponse.json(
        { error: 'type e targetId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar permissões baseado no tipo
    if (type === 'NANNY_PROFILE') {
      if (currentUser.type !== 'nanny') {
        return NextResponse.json(
          { error: 'Apenas babás podem ativar boost de perfil' },
          { status: 403 }
        );
      }

      const nannyId = currentUser.nanny.id;

      // Get plan features using subscription service
      const features = await getPlanFeatures({ nannyId });
      const weeklyBoost = features?.weeklyBoost || 0;

      if (weeklyBoost === 0) {
        return NextResponse.json(
          { error: 'Funcionalidade disponível apenas no Plano Pro' },
          { status: 403 }
        );
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
      });

      if (recentBoost) {
        return NextResponse.json(
          { error: 'Você já usou seu boost semanal. Aguarde 7 dias.' },
          { status: 403 }
        );
      }

      // Criar boost (24 horas)
      const endDate = new Date();
      endDate.setHours(endDate.getHours() + 24);

      const boost = await prisma.boost.create({
        data: {
          nannyId,
          type: 'NANNY_PROFILE',
          startDate: new Date(),
          endDate,
          source: 'PLAN_INCLUDED',
        },
      });

      return NextResponse.json({
        boost,
        message: 'Boost ativado! Seu perfil ficará no topo por 24 horas.',
      });
    } else if (type === 'JOB') {
      if (currentUser.type !== 'family') {
        return NextResponse.json(
          { error: 'Apenas famílias podem ativar boost de vaga' },
          { status: 403 }
        );
      }

      const familyId = currentUser.family.id;

      // Get plan features using subscription service
      const features = await getPlanFeatures({ familyId });
      const boostPerCycle = features?.boostPerCycle || 0;

      if (boostPerCycle === 0) {
        return NextResponse.json(
          { error: 'Funcionalidade disponível apenas no Plano Plus' },
          { status: 403 }
        );
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
      });

      if (recentBoost) {
        return NextResponse.json(
          { error: 'Você já usou seu boost deste ciclo. Aguarde o próximo período.' },
          { status: 403 }
        );
      }

      // Verificar se a vaga existe e pertence à família
      const jobId = parseInt(targetId, 10);
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job || job.familyId !== familyId) {
        return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
      }

      // Criar boost (7 dias)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const boost = await prisma.boost.create({
        data: {
          jobId: job.id,
          type: 'JOB',
          startDate: new Date(),
          endDate,
          source: 'PLAN_INCLUDED',
        },
      });

      return NextResponse.json({
        boost,
        message: 'Boost ativado! Sua vaga ficará no topo por 7 dias.',
      });
    } else {
      return NextResponse.json({ error: 'Tipo de boost inválido' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro ao ativar boost:', error);
    return NextResponse.json({ error: 'Erro ao ativar boost' }, { status: 500 });
  }
}
