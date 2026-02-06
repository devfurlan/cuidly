import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json({ error: 'User is not a family' }, { status: 400 });
    }

    const body = await request.json();
    const { childNumber, ...childData } = body;

    const {
      name,
      birthDate,
      gender,
      carePriorities,
      routine,
      hasSpecialNeeds,
      specialNeedsDescription,
      allergies,
      notes,
    } = childData;

    // Validate age: child must be under 18 years old
    if (birthDate) {
      const childBirthDate = new Date(birthDate);
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      eighteenYearsAgo.setHours(0, 0, 0, 0);
      if (childBirthDate <= eighteenYearsAgo) {
        return NextResponse.json(
          { error: 'A criança deve ter menos de 18 anos' },
          { status: 400 }
        );
      }
    }

    // Get existing children for this family to check if we should update or create
    const existingChildFamilies = await prisma.childFamily.findMany({
      where: { familyId: currentUser.family.id },
      include: { child: true },
      orderBy: { child: { createdAt: 'asc' } },
    });

    // Child index is 0-based, childNumber is 1-based
    const childIndex = (childNumber || 1) - 1;
    const existingChildFamily = existingChildFamilies[childIndex];

    // Prepare child data
    const childDataToSave: Record<string, unknown> = {};

    if (name !== undefined) childDataToSave.name = name;
    if (birthDate !== undefined) childDataToSave.birthDate = new Date(birthDate);
    if (gender !== undefined) childDataToSave.gender = gender;
    if (carePriorities !== undefined) childDataToSave.carePriorities = carePriorities;
    if (routine !== undefined) childDataToSave.routine = routine;
    if (hasSpecialNeeds !== undefined) childDataToSave.hasSpecialNeeds = hasSpecialNeeds;
    if (specialNeedsDescription !== undefined) childDataToSave.specialNeedsDescription = specialNeedsDescription;
    if (allergies !== undefined) childDataToSave.allergies = allergies;
    if (notes !== undefined) childDataToSave.notes = notes;

    let child;

    if (existingChildFamily) {
      // Update existing child
      child = await prisma.child.update({
        where: { id: existingChildFamily.childId },
        data: childDataToSave,
      });
    } else {
      // Create new child and link to family
      child = await prisma.child.create({
        data: {
          ...childDataToSave,
          name: name || `Filho ${childNumber}`,
        } as { name: string } & Record<string, unknown>,
      });

      // Create the family-child relationship
      await prisma.childFamily.create({
        data: {
          childId: child.id,
          familyId: currentUser.family.id,
          isMain: childIndex === 0,
        },
      });
    }

    return NextResponse.json({ success: true, childId: child.id });
  } catch (error) {
    console.error('Error saving child partial data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
