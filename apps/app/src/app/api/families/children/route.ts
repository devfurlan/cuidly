import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

/**
 * GET /api/families/children - Get all children for the current family
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json(
        { error: 'Usuário não é uma família' },
        { status: 400 }
      );
    }

    const familyId = currentUser.family.id;

    const childFamilies = await prisma.childFamily.findMany({
      where: { familyId },
      include: {
        child: true,
      },
      orderBy: {
        child: {
          createdAt: 'asc',
        },
      },
    });

    const children = childFamilies.map((cf) => ({
      id: cf.child.id,
      name: cf.child.name,
      birthDate: cf.child.birthDate,
      gender: cf.child.gender,
      carePriorities: cf.child.carePriorities,
      hasSpecialNeeds: cf.child.hasSpecialNeeds,
      specialNeedsTypes: cf.child.specialNeedsTypes,
      specialNeedsDescription: cf.child.specialNeedsDescription,
      allergies: cf.child.allergies,
      routine: cf.child.routine,
      notes: cf.child.notes,
      isMain: cf.isMain,
      relationshipType: cf.relationshipType,
    }));

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/families/children - Create a new child for the current family
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (currentUser.type !== 'family') {
      return NextResponse.json(
        { error: 'Usuário não é uma família' },
        { status: 400 }
      );
    }

    const familyId = currentUser.family.id;
    const body = await request.json();
    const {
      name,
      birthDate,
      gender,
      carePriorities,
      hasSpecialNeeds,
      specialNeedsTypes,
      specialNeedsDescription,
      allergies,
      routine,
      notes,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

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

    // Check if this is the first child (will be main)
    const existingChildren = await prisma.childFamily.count({
      where: { familyId },
    });

    // Create the child
    const child = await prisma.child.create({
      data: {
        name,
        birthDate: birthDate ? new Date(birthDate) : null,
        gender: gender || null,
        carePriorities: carePriorities || [],
        hasSpecialNeeds: hasSpecialNeeds || false,
        specialNeedsTypes: specialNeedsTypes || [],
        specialNeedsDescription: specialNeedsDescription || null,
        allergies: allergies || null,
        routine: routine || null,
        notes: notes || null,
      },
    });

    // Create the family-child relationship
    await prisma.childFamily.create({
      data: {
        childId: child.id,
        familyId,
        isMain: existingChildren === 0, // First child is main
      },
    });

    // Update family numberOfChildren
    await prisma.family.update({
      where: { id: familyId },
      data: {
        numberOfChildren: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      child: {
        id: child.id,
        name: child.name,
        birthDate: child.birthDate,
        gender: child.gender,
        carePriorities: child.carePriorities,
        hasSpecialNeeds: child.hasSpecialNeeds,
        specialNeedsTypes: child.specialNeedsTypes,
        specialNeedsDescription: child.specialNeedsDescription,
        allergies: child.allergies,
        routine: child.routine,
        notes: child.notes,
      },
    });
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
