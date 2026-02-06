import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  calculateMatchScore,
  toNannyProfile,
  toFamilyData,
  toJobData,
  toChildData,
} from '@/services/matching';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { notifyJobClosed } from '@/lib/notifications/job-notifications';

/**
 * GET /api/jobs/[jobId] - Get job details
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const jobIdNum = parseInt(jobId, 10);

    if (isNaN(jobIdNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Authenticate user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Fetch job with all related data
    const job = await prisma.job.findUnique({
      where: { id: jobIdNum },
      include: {
        family: {
          include: {
            address: true,
            children: {
              include: {
                child: true,
              },
            },
          },
        },
        applications: {
          include: {
            nanny: {
              include: {
                address: true,
              },
            },
          },
          orderBy: [
            { matchScore: 'desc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    const isOwner = currentUser.type === 'family' && currentUser.family.id === job.familyId;
    const isNanny = currentUser.type === 'nanny';

    // Get children included in job
    const jobChildren = job.family.children
      .filter(cf => job.childrenIds.includes(cf.childId))
      .map(cf => cf.child);

    // Base job response
    const jobResponse = {
      id: job.id,
      title: job.title,
      description: job.description,
      jobType: job.jobType,
      schedule: job.schedule,
      requiresOvernight: job.requiresOvernight,
      contractType: job.contractType,
      benefits: job.benefits,
      paymentType: job.paymentType,
      budgetMin: Number(job.budgetMin),
      budgetMax: Number(job.budgetMax),
      mandatoryRequirements: job.mandatoryRequirements,
      photos: job.photos,
      startDate: job.startDate,
      status: job.status,
      createdAt: job.createdAt,
      children: jobChildren.map(c => ({
        id: c.id,
        name: c.name,
        birthDate: c.birthDate,
        hasSpecialNeeds: c.hasSpecialNeeds,
        gender: c.gender,
        carePriorities: c.carePriorities,
        routine: c.routine,
        specialNeedsTypes: c.specialNeedsTypes,
        specialNeedsDescription: c.specialNeedsDescription,
        unborn: c.unborn,
        expectedBirthDate: c.expectedBirthDate,
      })),
      family: {
        id: job.family.id,
        name: job.family.name,
        photoUrl: job.family.photoUrl,
        familyPresentation: job.family.familyPresentation,
        city: job.family.address?.city,
        state: job.family.address?.state,
        neighborhood: job.family.address?.neighborhood,
        // Campos adicionais para exibição na página de detalhes
        neededShifts: job.family.neededShifts,
        neededDays: job.family.neededDays,
        hasPets: job.family.hasPets,
        petTypes: job.family.petTypes,
        petsDescription: job.family.petsDescription,
        housingType: job.family.housingType,
        parentPresence: job.family.parentPresence,
        domesticHelpExpected: job.family.domesticHelpExpected,
        houseRules: job.family.houseRules,
      },
    };

    // If user is the family owner
    if (isOwner) {
      // Check if family has active PAID subscription (not FREE plan)
      const subscription = currentUser.family.subscription;
      const hasActiveSubscription = subscription?.status === 'ACTIVE' &&
        subscription?.plan !== 'FAMILY_FREE' &&
        subscription?.plan !== 'NANNY_FREE' &&
        subscription?.currentPeriodEnd &&
        subscription.currentPeriodEnd > new Date();

      const applications = job.applications.map(app => ({
        id: app.id,
        status: app.status,
        // Only show matchScore for families with active paid subscription
        matchScore: hasActiveSubscription && app.matchScore ? Number(app.matchScore) : null,
        message: app.message,
        createdAt: app.createdAt,
        nanny: {
          id: app.nanny.id,
          name: app.nanny.name,
          slug: app.nanny.slug,
          photoUrl: app.nanny.photoUrl,
          experienceYears: app.nanny.experienceYears,
          certifications: app.nanny.certifications,
          hasSpecialNeedsExperience: app.nanny.hasSpecialNeedsExperience,
          city: app.nanny.address?.city,
          state: app.nanny.address?.state,
          // Contact info for family to reach out to candidates
          phone: app.nanny.phoneNumber,
          email: app.nanny.emailAddress,
        },
      }));

      return NextResponse.json({
        success: true,
        job: jobResponse,
        isOwner: true,
        hasActiveSubscription,
        applications,
        stats: {
          total: applications.length,
          pending: applications.filter(a => a.status === 'PENDING').length,
          accepted: applications.filter(a => a.status === 'ACCEPTED').length,
          rejected: applications.filter(a => a.status === 'REJECTED').length,
        },
      });
    }

    // If user is a nanny
    if (isNanny) {
      // Check if already applied
      const existingApplication = job.applications.find(a => a.nanny.id === currentUser.nanny.id);

      // Calculate match score for this nanny
      const nanny = await prisma.nanny.findUnique({
        where: { id: currentUser.nanny.id },
        include: {
          address: true,
        },
      });

      let matchResult = null;

      if (nanny) {
        // Get aggregated review data for the nanny
        const reviewStats = await prisma.review.aggregate({
          where: {
            nannyId: nanny.id,
            isPublished: true,
          },
          _avg: { overallRating: true },
          _count: { id: true },
        });

        // Convert using helper functions
        const jobData = toJobData({
          id: job.id,
          mandatoryRequirements: job.mandatoryRequirements,
          childrenIds: job.childrenIds,
        });

        const familyData = toFamilyData({
          id: job.family.id,
          hasPets: job.family.hasPets,
          numberOfChildren: job.family.numberOfChildren,
          nannyType: job.family.nannyType,
          contractRegime: job.family.contractRegime,
          hourlyRateRange: job.family.hourlyRateRange,
          domesticHelpExpected: job.family.domesticHelpExpected,
          neededDays: job.family.neededDays as string[] || [],
          neededShifts: job.family.neededShifts as string[] || [],
          address: job.family.address ? {
            latitude: job.family.address.latitude,
            longitude: job.family.address.longitude,
          } : null,
        });

        const childrenData = jobChildren.map(c => toChildData({
          id: c.id,
          birthDate: c.birthDate,
          expectedBirthDate: c.expectedBirthDate,
          unborn: c.unborn,
          hasSpecialNeeds: c.hasSpecialNeeds,
          specialNeedsTypes: c.specialNeedsTypes || [],
          specialNeedsDescription: c.specialNeedsDescription,
        }));

        const nannyProfile = toNannyProfile(
          {
            id: nanny.id,
            name: nanny.name,
            gender: nanny.gender,
            birthDate: nanny.birthDate,
            isSmoker: nanny.isSmoker,
            hasCnh: nanny.hasCnh ?? false,
            experienceYears: nanny.experienceYears,
            hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience,
            specialNeedsSpecialties: nanny.specialNeedsSpecialties || [],
            specialNeedsExperienceDescription: nanny.specialNeedsExperienceDescription,
            certifications: nanny.certifications,
            ageRangesExperience: nanny.ageRangesExperience,
            maxTravelDistance: nanny.maxTravelDistance,
            maxChildrenCare: nanny.maxChildrenCare,
            comfortableWithPets: nanny.comfortableWithPets,
            acceptedActivities: nanny.acceptedActivities,
            nannyTypes: nanny.nannyTypes || [],
            contractRegimes: nanny.contractRegimes || [],
            hourlyRateRange: nanny.hourlyRateRange,
            documentValidated: nanny.documentValidated,
            documentExpirationDate: nanny.documentExpirationDate,
            personalDataValidated: nanny.personalDataValidated,
            criminalBackgroundValidated: nanny.criminalBackgroundValidated,
            lastActiveAt: (nanny as { lastActiveAt?: Date | null }).lastActiveAt ?? null,
            address: nanny.address ? {
              latitude: nanny.address.latitude,
              longitude: nanny.address.longitude,
            } : null,
          },
          {
            averageRating: reviewStats._avg.overallRating,
            reviewCount: reviewStats._count.id,
          }
        );

        const result = calculateMatchScore(
          jobData,
          familyData,
          childrenData,
          nannyProfile
        );

        matchResult = {
          score: result.score,
          isEligible: result.isEligible,
          eliminationReasons: result.eliminationReasons,
          breakdown: result.breakdown,
        };
      }

      return NextResponse.json({
        success: true,
        job: jobResponse,
        isOwner: false,
        application: existingApplication ? {
          id: existingApplication.id,
          status: existingApplication.status,
          matchScore: existingApplication.matchScore ? Number(existingApplication.matchScore) : null,
          message: existingApplication.message,
          createdAt: existingApplication.createdAt,
        } : null,
        matchResult,
      });
    }

    // Public view (minimal info)
    return NextResponse.json({
      success: true,
      job: jobResponse,
      isOwner: false,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/jobs/[jobId] - Update job (full update)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const jobIdNum = parseInt(jobId, 10);

    if (isNaN(jobIdNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Authenticate user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Check job ownership
    const job = await prisma.job.findUnique({
      where: { id: jobIdNum },
      select: { familyId: true },
    });

    if (!job || job.familyId !== currentUser.family.id) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    const body = await request.json();

    // Verify children belong to family
    if (body.childrenIds && body.childrenIds.length > 0) {
      const familyChildren = await prisma.childFamily.findMany({
        where: { familyId: currentUser.family.id },
        select: { childId: true },
      });
      const familyChildIds = familyChildren.map(c => c.childId);
      const invalidChildren = body.childrenIds.filter((id: number) => !familyChildIds.includes(id));
      if (invalidChildren.length > 0) {
        return NextResponse.json({
          error: 'Crianças inválidas',
          message: 'Uma ou mais crianças selecionadas não pertencem a esta família',
        }, { status: 400 });
      }
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobIdNum },
      data: {
        title: body.title,
        description: body.description || null,
        jobType: body.jobType,
        schedule: body.schedule,
        requiresOvernight: body.requiresOvernight,
        contractType: body.contractType,
        benefits: body.benefits || [],
        paymentType: body.paymentType,
        budgetMin: body.budgetMin,
        budgetMax: body.budgetMax,
        childrenIds: body.childrenIds,
        mandatoryRequirements: body.mandatoryRequirements || [],
        photos: body.photos || [],
        startDate: body.startDate ? new Date(body.startDate) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      job: {
        id: updatedJob.id,
        title: updatedJob.title,
        status: updatedJob.status,
      },
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/jobs/[jobId] - Update job status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const jobIdNum = parseInt(jobId, 10);

    if (isNaN(jobIdNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Authenticate user
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Check job ownership
    const job = await prisma.job.findUnique({
      where: { id: jobIdNum },
      select: { familyId: true },
    });

    if (!job || job.familyId !== currentUser.family.id) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    if (!['ACTIVE', 'PAUSED', 'CLOSED'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobIdNum },
      data: { status },
    });

    // Notify applicants when job is closed
    if (status === 'CLOSED') {
      notifyJobClosed(jobIdNum).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      job: {
        id: updatedJob.id,
        status: updatedJob.status,
      },
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
