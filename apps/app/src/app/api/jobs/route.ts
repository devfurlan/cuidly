import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createJobSchema } from '@/schemas/job';
import { getSubscription, getJobLimit, getJobExpirationDays } from '@/services/subscription';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * POST /api/jobs - Create a new job
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'Usuario nao e uma familia' }, { status: 400 });
    }

    const familyId = currentUser.family.id;

    // Check subscription status using new tier-based model
    let subscription = await getSubscription({ familyId });

    // Auto-create FAMILY_FREE subscription if user doesn't have one
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          familyId,
          plan: 'FAMILY_FREE',
          status: 'ACTIVE',
          billingInterval: 'MONTH',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json({
        error: 'Assinatura inativa',
        code: 'SUBSCRIPTION_INACTIVE',
        message: 'Sua assinatura esta inativa',
      }, { status: 403 });
    }

    // Get job limit based on plan tier
    const maxJobs = getJobLimit(subscription.plan);

    if (maxJobs === 0) {
      return NextResponse.json({
        error: 'Funcionalidade Premium',
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Assine um plano para criar vagas',
      }, { status: 403 });
    }

    // Check current active jobs count
    const activeJobsCount = await prisma.job.count({
      where: {
        familyId,
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    if (activeJobsCount >= maxJobs) {
      const upgradeMessage = subscription.plan === 'FAMILY_FREE'
        ? 'Assine o plano Plus para criar até 3 vagas.'
        : 'Feche uma vaga existente para criar uma nova.';

      return NextResponse.json({
        error: 'Limite atingido',
        code: 'JOB_LIMIT_REACHED',
        message: `Você já tem ${activeJobsCount} vaga(s) ativa(s). ${upgradeMessage}`,
        currentJobs: activeJobsCount,
        maxJobs,
      }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createJobSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Dados inválidos',
        details: validation.error.errors,
      }, { status: 400 });
    }

    const data = validation.data;

    // Verify that children belong to this family
    const familyChildren = await prisma.childFamily.findMany({
      where: { familyId },
      select: { childId: true },
    });
    const familyChildIds = familyChildren.map(c => c.childId);

    const invalidChildren = data.childrenIds.filter(id => !familyChildIds.includes(id));
    if (invalidChildren.length > 0) {
      return NextResponse.json({
        error: 'Crianças inválidas',
        message: 'Uma ou mais crianças selecionadas não pertencem a esta família',
      }, { status: 400 });
    }

    // Create the job
    const job = await prisma.job.create({
      data: {
        familyId,
        title: data.title,
        description: data.description || null,
        jobType: data.jobType,
        schedule: data.schedule,
        requiresOvernight: data.requiresOvernight,
        contractType: data.contractType,
        benefits: data.benefits || [],
        paymentType: data.paymentType,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        childrenIds: data.childrenIds,
        mandatoryRequirements: data.mandatoryRequirements || [],
        photos: data.photos || [],
        startDate: new Date(data.startDate),
        status: 'ACTIVE',
      },
    });

    // Calculate expiration date for free plan
    const expirationDays = getJobExpirationDays(subscription.plan);
    let expiresAt: Date | null = null;
    if (expirationDays > 0) {
      expiresAt = new Date(job.createdAt);
      expiresAt.setDate(expiresAt.getDate() + expirationDays);
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        status: job.status,
        expiresAt,
        expirationDays: expirationDays > 0 ? expirationDays : null,
      },
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jobs - List jobs for the current family
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'Usuário não é uma família' }, { status: 400 });
    }

    const familyId = currentUser.family.id;

    // Get subscription to determine expiration days
    const subscription = await getSubscription({ familyId });
    const expirationDays = subscription ? getJobExpirationDays(subscription.plan) : -1;

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Fetch jobs
    const jobs = await prisma.job.findMany({
      where: {
        familyId,
        deletedAt: null,
        ...(status ? { status: status as 'ACTIVE' | 'PAUSED' | 'CLOSED' } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true, conversations: true },
        },
      },
    });

    const now = new Date();

    return NextResponse.json({
      success: true,
      jobs: jobs.map(job => {
        // Calculate expiration
        let expiresAt: Date | null = null;
        let isExpired = false;
        let daysRemaining: number | null = null;

        if (expirationDays > 0) {
          expiresAt = new Date(job.createdAt);
          expiresAt.setDate(expiresAt.getDate() + expirationDays);
          isExpired = now >= expiresAt;
          daysRemaining = isExpired ? 0 : Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        return {
          id: job.id,
          title: job.title,
          jobType: job.jobType,
          status: isExpired ? 'EXPIRED' : job.status,
          createdAt: job.createdAt,
          applicationsCount: job._count.applications,
          conversationsCount: job._count.conversations,
          expiration: expirationDays > 0 ? {
            expiresAt,
            isExpired,
            daysRemaining,
          } : null,
        };
      }),
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
