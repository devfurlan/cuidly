import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUser, getSubscriptionParams } from '@/lib/auth/getCurrentUser';
import { phoneToE164 } from '@/helpers/validators';
import { getSubscription, createFreeSubscription, getJobLimit } from '@/services/subscription/subscription-service';
import { encryptCpf, hashCpf } from '@/lib/crypto';

/**
 * GET /api/families/me - Get current family data with children and subscription
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'Usuário não é uma família' }, { status: 400 });
    }

    const familyId = currentUser.family.id;

    // Get family with children
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        address: true,
        children: {
          include: {
            child: true,
          },
        },
      },
    });

    if (!family) {
      return NextResponse.json({ error: 'Família não encontrada' }, { status: 404 });
    }

    // Get subscription
    const subscriptionParams = getSubscriptionParams(currentUser);
    let subscription = await getSubscription(subscriptionParams);

    // Auto-create FAMILY_FREE subscription if family doesn't have one
    if (!subscription) {
      await createFreeSubscription(subscriptionParams);
      subscription = await getSubscription(subscriptionParams);
    }

    // Check if subscription is active
    const hasActiveSubscription = subscription &&
      subscription.status === 'ACTIVE' &&
      (!subscription.currentPeriodEnd || new Date(subscription.currentPeriodEnd) > new Date());

    // Get job limits and active jobs count
    const maxJobs = subscription ? getJobLimit(subscription.plan) : 1;
    const activeJobsCount = await prisma.job.count({
      where: {
        familyId,
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      family: {
        id: family.id,
        name: family.name,
        phoneNumber: family.phoneNumber,
        photoUrl: family.photoUrl,
        // New fields
        cpf: family.cpf,
        birthDate: family.birthDate,
        gender: family.gender,
        nannyType: family.nannyType,
        contractRegime: family.contractRegime,
        familyPresentation: family.familyPresentation,
        jobDescription: family.jobDescription,
        jobPhotos: family.jobPhotos,
        // Existing fields
        hasPets: family.hasPets,
        petsDescription: family.petsDescription,
        parentPresence: family.parentPresence,
        valuesInNanny: family.valuesInNanny,
        careMethodology: family.careMethodology,
        languages: family.languages,
        domesticHelpExpected: family.domesticHelpExpected,
        nannyGenderPreference: family.nannyGenderPreference,
        nannyAgePreference: family.nannyAgePreference,
      },
      address: family.address,
      children: family.children.map(cf => ({
        childId: cf.childId,
        relationshipType: cf.relationshipType,
        isMain: cf.isMain,
        child: {
          id: cf.child.id,
          name: cf.child.name,
          birthDate: cf.child.birthDate,
          gender: cf.child.gender,
          carePriorities: cf.child.carePriorities,
          hasSpecialNeeds: cf.child.hasSpecialNeeds,
          specialNeedsDescription: cf.child.specialNeedsDescription,
        },
      })),
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        startDate: subscription.currentPeriodStart,
        endDate: subscription.currentPeriodEnd,
        plan: subscription.plan,
        maxJobs,
      } : null,
      hasActiveSubscription,
      activeJobsCount,
      maxJobs,
    });
  } catch (error) {
    console.error('Error fetching family data:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/families/me - Update current family data
 */
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'Usuário não é uma família' }, { status: 400 });
    }

    const familyId = currentUser.family.id;
    const body = await request.json();

    // Convert phone to E.164 format if provided
    if (body.phoneNumber) {
      body.phoneNumber = phoneToE164(body.phoneNumber);
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Basic fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;

    // New fields
    if (body.cpf !== undefined) {
      const cleanCpf = body.cpf.replace(/\D/g, '');
      const cpfHashValue = hashCpf(cleanCpf);

      // Check if CPF is already registered by another family (using hash for fast lookup)
      const existingFamilyWithCpf = await prisma.family.findFirst({
        where: {
          cpfHash: cpfHashValue,
          NOT: { id: familyId },
        },
      });

      if (existingFamilyWithCpf) {
        return NextResponse.json(
          { error: 'Este CPF já está cadastrado em outra conta' },
          { status: 400 }
        );
      }

      // Check if CPF is already registered by a nanny (using hash for fast lookup)
      const existingNannyWithCpf = await prisma.nanny.findFirst({
        where: { cpfHash: cpfHashValue },
      });

      if (existingNannyWithCpf) {
        return NextResponse.json(
          { error: 'Este CPF já está cadastrado em outra conta' },
          { status: 400 }
        );
      }

      // Store encrypted CPF and hash
      updateData.cpf = encryptCpf(cleanCpf);
      updateData.cpfHash = cpfHashValue;
    }
    if (body.birthDate !== undefined) updateData.birthDate = body.birthDate;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.nannyType !== undefined) updateData.nannyType = body.nannyType;
    if (body.contractRegime !== undefined) updateData.contractRegime = body.contractRegime;
    if (body.familyPresentation !== undefined) updateData.familyPresentation = body.familyPresentation;
    if (body.jobDescription !== undefined) updateData.jobDescription = body.jobDescription;
    if (body.jobPhotos !== undefined) updateData.jobPhotos = body.jobPhotos;

    // Existing fields
    if (body.hasPets !== undefined) updateData.hasPets = body.hasPets;
    if (body.petsDescription !== undefined) updateData.petsDescription = body.petsDescription;
    if (body.parentPresence !== undefined) updateData.parentPresence = body.parentPresence;
    if (body.valuesInNanny !== undefined) updateData.valuesInNanny = body.valuesInNanny;
    if (body.careMethodology !== undefined) updateData.careMethodology = body.careMethodology;
    if (body.languages !== undefined) updateData.languages = body.languages;
    if (body.domesticHelpExpected !== undefined) updateData.domesticHelpExpected = body.domesticHelpExpected;

    // Update family
    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      family: updatedFamily,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      (error.meta?.target as string[])?.includes('cpf_hash')
    ) {
      return NextResponse.json(
        { error: 'Este CPF já está cadastrado em outra conta' },
        { status: 400 }
      );
    }
    console.error('Error updating family data:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
