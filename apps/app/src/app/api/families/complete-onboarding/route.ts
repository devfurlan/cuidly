import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'User is not a family' }, { status: 400 });
    }

    const familyId = currentUser.family.id;

    // Mark onboarding as complete for the family
    await prisma.family.update({
      where: { id: familyId },
      data: {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    });

    // Get the active job for this family (created during onboarding)
    let jobId: number | null = null;
    let childName: string | null = null;

    // Get active job
    const activeJob = await prisma.job.findFirst({
      where: {
        familyId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (activeJob) {
      jobId = activeJob.id;
    }

    // Get first child name for personalization
    const firstChild = await prisma.childFamily.findFirst({
      where: { familyId },
      include: { child: { select: { name: true } } },
      orderBy: { childId: 'asc' },
    });

    if (firstChild?.child?.name) {
      childName = firstChild.child.name;
    }

    return NextResponse.json({
      success: true,
      familyId,
      jobId,
      childName,
    });
  } catch (error) {
    console.error('Error completing family onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
