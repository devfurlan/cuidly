'use server';

import prisma from '@/lib/prisma';
import { FormChild } from '@/schemas/childSchemas';
import { logAuditMany } from '@/utils/auditLog';

export async function getChildren() {
  const children = await prisma.child.findMany({
    where: {
      status: { not: 'DELETED' },
    },
    select: {
      id: true,
      name: true,
      birthDate: true,
      gender: true,
      status: true,
      carePriorities: true,
      hasSpecialNeeds: true,
      specialNeedsDescription: true,
      routine: true,
      families: {
        select: {
          isMain: true,
          relationshipType: true,
          family: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return children.map((c) => ({
    id: c.id,
    name: c.name,
    birthDate: c.birthDate,
    gender: c.gender,
    status: c.status,
    carePriorities: c.carePriorities,
    hasSpecialNeeds: c.hasSpecialNeeds,
    specialNeedsDescription: c.specialNeedsDescription,
    routine: c.routine,
    families: c.families.map((f) => ({
      id: f.family.id,
      name: f.family.name,
      isMain: f.isMain,
      relationshipType: f.relationshipType,
    })),
  }));
}

export async function getChildById(id: number) {
  const child = await prisma.child.findUnique({
    where: { id },
    include: {
      families: {
        include: {
          family: {
            include: { address: true },
          },
        },
      },
    },
  });

  if (!child) return null;

  return {
    ...child,
    families: child.families.map((f) => ({
      ...f.family,
      relationshipType: f.relationshipType,
      isMain: f.isMain,
    })),
  };
}

export async function createChild(data: FormChild) {
  // Validate age: child must be under 18 years old
  if (data.birthDate) {
    const birthDate = new Date(data.birthDate.split('/').reverse().join('-'));
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    eighteenYearsAgo.setHours(0, 0, 0, 0);
    if (birthDate <= eighteenYearsAgo) {
      throw new Error('A criança deve ter menos de 18 anos');
    }
  }

  const childData = {
    name: data.name || null,
    birthDate: data.birthDate
      ? new Date(data.birthDate.split('/').reverse().join('-'))
      : null,
    gender: data.gender === '' ? null : data.gender,
    allergies: data.allergies || null,
    specialNeeds: data.specialNeeds || null,
    notes: data.notes || null,
    status: data.status || 'ACTIVE',
    carePriorities: data.carePriorities || [],
    hasSpecialNeeds: data.hasSpecialNeeds || false,
    specialNeedsDescription: data.specialNeedsDescription || null,
    routine: data.routine || null,
  };

  const result = await prisma.child.create({
    data: childData,
  });

  await logAuditMany([
    {
      action: 'CREATE',
      table: 'children',
      recordId: result.id.toString(),
      data: childData,
    },
  ]);

  return result;
}

export async function updateChild(id: number, data: FormChild) {
  // Validate age: child must be under 18 years old
  if (data.birthDate) {
    const birthDate = new Date(data.birthDate.split('/').reverse().join('-'));
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    eighteenYearsAgo.setHours(0, 0, 0, 0);
    if (birthDate <= eighteenYearsAgo) {
      throw new Error('A criança deve ter menos de 18 anos');
    }
  }

  const childData = {
    name: data.name || null,
    birthDate: data.birthDate
      ? new Date(data.birthDate.split('/').reverse().join('-'))
      : null,
    gender: data.gender === '' ? null : data.gender,
    allergies: data.allergies || null,
    specialNeeds: data.specialNeeds || null,
    notes: data.notes || null,
    status: data.status,
    carePriorities: data.carePriorities || [],
    hasSpecialNeeds: data.hasSpecialNeeds || false,
    specialNeedsDescription: data.specialNeedsDescription || null,
    routine: data.routine || null,
  };

  const result = await prisma.child.update({
    where: { id },
    data: childData,
  });

  await logAuditMany([
    {
      action: 'UPDATE',
      table: 'children',
      recordId: id.toString(),
      data: childData,
    },
  ]);

  return result;
}

export async function deleteChild(id: number) {
  await prisma.child.update({
    where: { id },
    data: {
      status: 'DELETED',
      deletedAt: new Date(),
    },
  });

  await logAuditMany([
    {
      action: 'DELETE',
      table: 'children',
      recordId: id.toString(),
      data: { status: 'DELETED' },
    },
  ]);
}

export async function linkChildToFamily(
  childId: number,
  familyId: number,
  relationshipType: string,
  isMain: boolean = false,
) {
  await prisma.childFamily.create({
    data: {
      childId,
      familyId,
      relationshipType: relationshipType as any,
      isMain,
    },
  });

  await logAuditMany([
    {
      action: 'CREATE',
      table: 'children_families',
      recordId: `${childId}-${familyId}`,
      data: { childId, familyId, relationshipType, isMain },
    },
  ]);
}

export async function unlinkChildFromFamily(childId: number, familyId: number) {
  await prisma.childFamily.delete({
    where: {
      childId_familyId: { childId, familyId },
    },
  });

  await logAuditMany([
    {
      action: 'DELETE',
      table: 'children_families',
      recordId: `${childId}-${familyId}`,
      data: {},
    },
  ]);
}
