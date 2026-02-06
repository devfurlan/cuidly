/**
 * Children Data Fetching Functions
 * Server-side data fetching for children page
 */

import prisma from '@/lib/prisma';

export interface ChildData {
  id: number;
  name: string | null;
  nickname: string | null;
  birthDate: Date | null;
  expectedBirthDate: Date | null;
  unborn: boolean;
  gender: string | null;
  hasSpecialNeeds: boolean;
  specialNeedsDescription: string | null;
  photoUrl: string | null;
  notes: string | null;
}

export async function getFamilyChildren(familyId: number): Promise<ChildData[]> {
  const familyChildren = await prisma.childFamily.findMany({
    where: { familyId },
    include: {
      child: true,
    },
    orderBy: {
      child: {
        createdAt: 'desc',
      },
    },
  });

  return familyChildren.map((cf) => ({
    id: cf.child.id,
    name: cf.child.name,
    nickname: cf.child.nickname,
    birthDate: cf.child.birthDate,
    expectedBirthDate: cf.child.expectedBirthDate,
    unborn: cf.child.unborn,
    gender: cf.child.gender,
    hasSpecialNeeds: cf.child.hasSpecialNeeds,
    specialNeedsDescription: cf.child.specialNeedsDescription,
    photoUrl: cf.child.photoUrl,
    notes: cf.child.notes,
  }));
}
