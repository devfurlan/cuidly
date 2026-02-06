import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  calculateMatchScore,
  type NannyProfile,
  type JobData,
  type FamilyData,
  type ChildData,
} from '@/services/matching';
import { canApplyToJobs, getJobExpirationDays, getSubscription } from '@/services/subscription';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { sendEmail } from '@/lib/email/sendEmail';
import { getNewApplicationEmailTemplate } from '@/lib/email/react-templates';
import { getNannySeals } from '@/lib/email/helpers';
import { config } from '@/config';

/**
 * POST /api/jobs/[jobId]/apply - Apply to a job (nanny only)
 */
export async function POST(
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

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'Apenas babás podem se candidatar' }, { status: 403 });
    }

    const nannyId = currentUser.nanny.id;

    // Check if nanny can apply to jobs
    const canApply = await canApplyToJobs({ nannyId });
    if (!canApply) {
      return NextResponse.json({
        error: 'Candidatura não permitida',
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Complete seu cadastro para candidatar-se a vagas',
      }, { status: 403 });
    }

    // Check if job exists and is active
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
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    if (job.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Esta vaga não está mais disponível' }, { status: 400 });
    }

    // Check if job is expired (for free plan families)
    const familySubscription = await getSubscription({ familyId: job.familyId });
    if (familySubscription) {
      const expirationDays = getJobExpirationDays(familySubscription.plan);
      if (expirationDays > 0) {
        const expiresAt = new Date(job.createdAt);
        expiresAt.setDate(expiresAt.getDate() + expirationDays);

        if (new Date() >= expiresAt) {
          return NextResponse.json({
            error: 'Vaga expirada',
            code: 'JOB_EXPIRED',
            message: 'Esta vaga não está mais aceitando candidaturas',
          }, { status: 400 });
        }
      }
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobId_nannyId: {
          jobId: jobIdNum,
          nannyId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json({ error: 'Você já se candidatou a esta vaga' }, { status: 400 });
    }

    // Get nanny data
    const nanny = await prisma.nanny.findUnique({
      where: { id: nannyId },
      include: {
        address: true,
        availability: true,
      },
    });

    if (!nanny) {
      return NextResponse.json({ error: 'Perfil de babá não encontrado' }, { status: 404 });
    }

    // Calculate match score
    const jobChildren = job.family.children
      .filter(cf => job.childrenIds.includes(cf.childId))
      .map(cf => cf.child);

    // Get aggregated review data for the nanny
    const reviewStats = await prisma.review.aggregate({
      where: {
        nannyId: nanny.id,
        isPublished: true,
      },
      _avg: { overallRating: true },
      _count: { id: true },
    });

    const jobData: JobData = {
      id: job.id,
      mandatoryRequirements: job.mandatoryRequirements,
      childrenIds: job.childrenIds,
    };

    const familyData: FamilyData = {
      id: job.family.id,
      hasPets: job.family.hasPets,
      numberOfChildren: job.family.numberOfChildren,
      nannyType: job.family.nannyType,
      contractRegime: job.family.contractRegime,
      hourlyRateRange: job.family.hourlyRateRange,
      domesticHelpExpected: job.family.domesticHelpExpected,
      availabilitySlots: job.family.neededDays && job.family.neededShifts
        ? job.family.neededDays.flatMap((day: string) =>
            job.family.neededShifts.map((shift: string) => `${day}_${shift}`)
          )
        : null,
      address: job.family.address ? {
        latitude: job.family.address.latitude,
        longitude: job.family.address.longitude,
      } : null,
    };

    const childrenData: ChildData[] = jobChildren.map(c => ({
      id: c.id,
      birthDate: c.birthDate,
      expectedBirthDate: c.expectedBirthDate,
      unborn: c.unborn,
      hasSpecialNeeds: c.hasSpecialNeeds,
      specialNeedsDescription: c.specialNeedsDescription,
    }));

    const nannyProfile: NannyProfile = {
      id: nanny.id,
      name: nanny.name || '',
      gender: nanny.gender,
      birthDate: nanny.birthDate,
      isSmoker: nanny.isSmoker,
      hasCnh: nanny.hasCnh,
      experienceYears: nanny.experienceYears,
      hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience,
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
      averageRating: reviewStats._avg.overallRating,
      reviewCount: reviewStats._count.id,
      lastActiveAt: (nanny as { lastActiveAt?: Date | null }).lastActiveAt ?? null,
      address: nanny.address ? {
        latitude: nanny.address.latitude,
        longitude: nanny.address.longitude,
      } : null,
      availabilitySlots: null,
    };

    const matchResult = calculateMatchScore(
      jobData,
      familyData,
      childrenData,
      nannyProfile
    );

    // Get message from request body
    const body = await request.json().catch(() => ({}));
    const message = body.message || null;

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId: jobIdNum,
        nannyId,
        matchScore: matchResult.score,
        message,
        status: 'PENDING',
      },
    });

    // Send email notification to family
    try {
      const family = await prisma.family.findUnique({
        where: { id: job.familyId },
        select: {
          name: true,
          emailAddress: true,
          emailVerified: true,
        },
      });

      if (family?.emailVerified && family.emailAddress) {
        const seals = getNannySeals({
          documentValidated: nanny.documentValidated,
          validationApproved: nanny.validationApproved,
          reviewCount: reviewStats._count.id,
        });

        const template = await getNewApplicationEmailTemplate({
          name: family.name?.split(' ')[0] || 'Família',
          nannyName: nanny.name?.split(' ')[0] || 'Babá',
          nannyPhotoUrl: nanny.photoUrl,
          jobTitle: job.title || 'Vaga de babá',
          experienceYears: nanny.experienceYears || 0,
          neighborhood: nanny.address?.neighborhood || '',
          city: nanny.address?.city || '',
          seals,
          presentationMessage: message?.slice(0, 200) || '',
          viewApplicationUrl: `${config.site.url}/app/vagas/${job.id}`,
        });

        await sendEmail({
          to: family.emailAddress,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      }
    } catch (emailError) {
      // Log error but don't fail the application
      console.error('Error sending application email to family:', emailError);
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        matchScore: matchResult.score,
        createdAt: application.createdAt,
      },
      matchResult: {
        score: matchResult.score,
        isEligible: matchResult.isEligible,
        breakdown: matchResult.breakdown,
      },
      // Return current user phone for confirmation message
      currentUserPhone: nanny.phoneNumber,
    });
  } catch (error) {
    console.error('Error applying to job:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: errorMessage },
      { status: 500 }
    );
  }
}
