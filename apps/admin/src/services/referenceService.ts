'use server';

import prisma from '@/lib/prisma';
import { FormReference } from '@/schemas/referenceSchemas';
import { logAuditMany } from '@/utils/auditLog';
import { removeNonNumericCharacters } from '@/utils/removeNonNumericCharacters';

export async function getReferencesByNannyId(nannyId: number) {
  const references = await prisma.reference.findMany({
    where: { nannyId },
    orderBy: { createdAt: 'desc' },
  });

  return references;
}

export async function getReferenceById(id: number) {
  return await prisma.reference.findUnique({
    where: { id },
    include: {
      nanny: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function createReference(nannyId: number, data: FormReference) {
  const referenceData = {
    nannyId,
    name: data.name,
    phone: removeNonNumericCharacters(data.phone),
    relationship: data.relationship,
    verified: data.verified || false,
  };

  const result = await prisma.reference.create({
    data: referenceData,
  });

  // Update nanny hasReferences flag
  await prisma.nanny.update({
    where: { id: nannyId },
    data: { hasReferences: true },
  });

  await logAuditMany([
    {
      action: 'CREATE',
      table: 'references',
      recordId: result.id.toString(),
      data: referenceData,
    },
  ]);

  return result;
}

export async function updateReference(id: number, data: FormReference) {
  const referenceData = {
    name: data.name,
    phone: removeNonNumericCharacters(data.phone),
    relationship: data.relationship,
    verified: data.verified,
  };

  const result = await prisma.reference.update({
    where: { id },
    data: referenceData,
  });

  await logAuditMany([
    {
      action: 'UPDATE',
      table: 'references',
      recordId: id.toString(),
      data: referenceData,
    },
  ]);

  return result;
}

export async function deleteReference(id: number) {
  const reference = await prisma.reference.findUnique({
    where: { id },
    select: { nannyId: true },
  });

  if (!reference) {
    throw new Error('Reference not found');
  }

  await prisma.reference.delete({
    where: { id },
  });

  // Check if nanny still has references
  const remainingReferences = await prisma.reference.count({
    where: { nannyId: reference.nannyId },
  });

  if (remainingReferences === 0) {
    await prisma.nanny.update({
      where: { id: reference.nannyId },
      data: { hasReferences: false, referencesVerified: false },
    });
  }

  await logAuditMany([
    {
      action: 'DELETE',
      table: 'references',
      recordId: id.toString(),
      data: {},
    },
  ]);
}

export async function verifyReference(id: number, verified: boolean) {
  const result = await prisma.reference.update({
    where: { id },
    data: { verified },
  });

  // Check if all references are verified
  const reference = await prisma.reference.findUnique({
    where: { id },
    select: { nannyId: true },
  });

  if (reference) {
    const allReferences = await prisma.reference.findMany({
      where: { nannyId: reference.nannyId },
    });

    const allVerified = allReferences.every((r) => r.verified);

    await prisma.nanny.update({
      where: { id: reference.nannyId },
      data: { referencesVerified: allVerified },
    });
  }

  await logAuditMany([
    {
      action: 'UPDATE',
      table: 'references',
      recordId: id.toString(),
      data: { verified },
    },
  ]);

  return result;
}
