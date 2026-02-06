import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

interface RouteParams {
  params: Promise<{ childId: string }>;
}

/**
 * GET /api/families/children/[childId] - Get a specific child
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { childId } = await params;
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
    const childIdNum = parseInt(childId, 10);

    // Verify the child belongs to this family
    const childFamily = await prisma.childFamily.findFirst({
      where: {
        childId: childIdNum,
        familyId,
      },
      include: {
        child: true,
      },
    });

    if (!childFamily) {
      return NextResponse.json(
        { error: 'Criança não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      child: {
        id: childFamily.child.id,
        name: childFamily.child.name,
        birthDate: childFamily.child.birthDate,
        gender: childFamily.child.gender,
        carePriorities: childFamily.child.carePriorities,
        hasSpecialNeeds: childFamily.child.hasSpecialNeeds,
        specialNeedsDescription: childFamily.child.specialNeedsDescription,
        allergies: childFamily.child.allergies,
        routine: childFamily.child.routine,
        notes: childFamily.child.notes,
        isMain: childFamily.isMain,
        relationshipType: childFamily.relationshipType,
      },
    });
  } catch (error) {
    console.error('Error fetching child:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/families/children/[childId] - Update a specific child
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { childId } = await params;
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
    const childIdNum = parseInt(childId, 10);

    // Verify the child belongs to this family
    const childFamily = await prisma.childFamily.findFirst({
      where: {
        childId: childIdNum,
        familyId,
      },
    });

    if (!childFamily) {
      return NextResponse.json(
        { error: 'Criança não encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      birthDate,
      gender,
      carePriorities,
      hasSpecialNeeds,
      specialNeedsDescription,
      allergies,
      routine,
      notes,
    } = body;

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

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (birthDate !== undefined)
      updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (carePriorities !== undefined) updateData.carePriorities = carePriorities || [];
    if (hasSpecialNeeds !== undefined)
      updateData.hasSpecialNeeds = hasSpecialNeeds || false;
    if (specialNeedsDescription !== undefined)
      updateData.specialNeedsDescription = specialNeedsDescription || null;
    if (allergies !== undefined) updateData.allergies = allergies || null;
    if (routine !== undefined) updateData.routine = routine || null;
    if (notes !== undefined) updateData.notes = notes || null;

    const child = await prisma.child.update({
      where: { id: childIdNum },
      data: updateData,
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
        specialNeedsDescription: child.specialNeedsDescription,
        allergies: child.allergies,
        routine: child.routine,
        notes: child.notes,
      },
    });
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/families/children/[childId] - Delete a specific child
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { childId } = await params;
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
    const childIdNum = parseInt(childId, 10);

    // Verify the child belongs to this family
    const childFamily = await prisma.childFamily.findFirst({
      where: {
        childId: childIdNum,
        familyId,
      },
    });

    if (!childFamily) {
      return NextResponse.json(
        { error: 'Criança não encontrada' },
        { status: 404 }
      );
    }

    // Delete the relationship first
    await prisma.childFamily.delete({
      where: {
        childId_familyId: {
          childId: childIdNum,
          familyId,
        },
      },
    });

    // Check if the child has other family relationships
    const otherRelationships = await prisma.childFamily.count({
      where: { childId: childIdNum },
    });

    // If no other relationships, soft delete the child
    if (otherRelationships === 0) {
      await prisma.child.update({
        where: { id: childIdNum },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
        },
      });
    }

    // Update family numberOfChildren
    await prisma.family.update({
      where: { id: familyId },
      data: {
        numberOfChildren: {
          decrement: 1,
        },
      },
    });

    // If the deleted child was main, set a new main
    if (childFamily.isMain) {
      const remainingChild = await prisma.childFamily.findFirst({
        where: { familyId },
        orderBy: { child: { createdAt: 'asc' } },
      });

      if (remainingChild) {
        await prisma.childFamily.update({
          where: {
            childId_familyId: {
              childId: remainingChild.childId,
              familyId,
            },
          },
          data: { isMain: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
