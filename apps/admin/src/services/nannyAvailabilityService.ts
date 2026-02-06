'use server';

import prisma from '@/lib/prisma';
import { FormNannyAvailability } from '@/schemas/nannyAvailabilitySchemas';
import { logAuditMany } from '@/utils/auditLog';

export async function getAvailabilityByNannyId(nannyId: number) {
  return await prisma.nannyAvailability.findUnique({
    where: { nannyId },
    include: {
      nanny: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function createOrUpdateAvailability(
  nannyId: number,
  data: FormNannyAvailability,
) {
  const existingAvailability = await prisma.nannyAvailability.findUnique({
    where: { nannyId },
  });

  const availabilityData = {
    nannyId,
    jobTypes: data.jobTypes || [],
    schedule: data.schedule || {},
    schedulePreference: data.schedulePreference || null,
    acceptsOvernight: data.acceptsOvernight || null,
    availableFrom: new Date(data.availableFrom),
    monthlyRate: data.monthlyRate
      ? parseFloat(String(data.monthlyRate))
      : null,
    hourlyRate: data.hourlyRate ? parseFloat(String(data.hourlyRate)) : null,
    dailyRate: data.dailyRate ? parseFloat(String(data.dailyRate)) : null,
    preferredContractTypes: data.preferredContractTypes || [],
    allowsMultipleJobs: data.allowsMultipleJobs || null,
    lastUpdated: new Date(),
  };

  if (existingAvailability) {
    const result = await prisma.nannyAvailability.update({
      where: { nannyId },
      data: availabilityData,
    });

    await logAuditMany([
      {
        action: 'UPDATE',
        table: 'nanny_availabilities',
        recordId: result.id.toString(),
        data: availabilityData,
      },
    ]);

    return result;
  }

  const result = await prisma.nannyAvailability.create({
    data: availabilityData,
  });

  await logAuditMany([
    {
      action: 'CREATE',
      table: 'nanny_availabilities',
      recordId: result.id.toString(),
      data: availabilityData,
    },
  ]);

  return result;
}

export async function deleteAvailability(nannyId: number) {
  const availability = await prisma.nannyAvailability.findUnique({
    where: { nannyId },
  });

  if (!availability) {
    throw new Error('Availability not found');
  }

  await prisma.nannyAvailability.delete({
    where: { nannyId },
  });

  await logAuditMany([
    {
      action: 'DELETE',
      table: 'nanny_availabilities',
      recordId: availability.id.toString(),
      data: {},
    },
  ]);
}
