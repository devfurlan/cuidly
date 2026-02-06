/**
 * Profile Data Fetching Functions
 * Server-side data fetching for profile pages
 */

import prisma from '@/lib/prisma';

export async function getNannyProfile(nannyId: number) {
  return prisma.nanny.findUnique({
    where: { id: nannyId },
    include: {
      address: true,
      references: true,
      subscription: true,
      availability: true,
      validationRequest: true,
    },
  });
}

export async function getFamilyProfile(familyId: number) {
  return prisma.family.findUnique({
    where: { id: familyId },
    include: {
      address: true,
      children: {
        include: {
          child: true,
        },
      },
      subscription: true,
    },
  });
}

export type NannyProfileData = NonNullable<
  Awaited<ReturnType<typeof getNannyProfile>>
>;

export type FamilyProfileData = NonNullable<
  Awaited<ReturnType<typeof getFamilyProfile>>
>;
