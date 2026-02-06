import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { Prisma } from '@prisma/client';

interface DaySchedule {
  enabled: boolean;
  startTime?: string;
  endTime?: string;
}

interface AvailabilityInput {
  jobTypes: ('FIXED' | 'SUBSTITUTE' | 'OCCASIONAL')[];
  schedule: Record<string, DaySchedule>;
  monthlyRate?: number;
  hourlyRate?: number;
  dailyRate?: number;
  preferredContractTypes: ('CLT' | 'DAILY_WORKER' | 'MEI' | 'TO_BE_DISCUSSED')[];
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'User is not a nanny' }, { status: 400 });
    }

    const body = await request.json() as AvailabilityInput;
    const {
      jobTypes,
      schedule,
      monthlyRate,
      hourlyRate,
      dailyRate,
      preferredContractTypes,
    } = body;

    // Prepare availability data
    const availabilityData = {
      nannyId: currentUser.nanny.id,
      jobTypes: jobTypes,
      schedule: schedule as unknown as Prisma.InputJsonValue,
      monthlyRate: monthlyRate ? new Prisma.Decimal(monthlyRate) : null,
      hourlyRate: hourlyRate ? new Prisma.Decimal(hourlyRate) : null,
      dailyRate: dailyRate ? new Prisma.Decimal(dailyRate) : null,
      preferredContractTypes: preferredContractTypes,
      availableFrom: new Date(),
      lastUpdated: new Date(),
    };

    // Upsert availability (create or update)
    const availability = await prisma.nannyAvailability.upsert({
      where: { nannyId: currentUser.nanny.id },
      update: {
        jobTypes: availabilityData.jobTypes,
        schedule: availabilityData.schedule,
        monthlyRate: availabilityData.monthlyRate,
        hourlyRate: availabilityData.hourlyRate,
        dailyRate: availabilityData.dailyRate,
        preferredContractTypes: availabilityData.preferredContractTypes,
        lastUpdated: availabilityData.lastUpdated,
      },
      create: availabilityData,
    });

    // Also update the nanny's rate fields for quick access
    await prisma.nanny.update({
      where: { id: currentUser.nanny.id },
      data: {
        hourlyRate: availabilityData.hourlyRate,
        dailyRate: availabilityData.dailyRate,
        monthlyRate: availabilityData.monthlyRate,
      },
    });

    return NextResponse.json({
      success: true,
      availabilityId: availability.id,
    });
  } catch (error) {
    console.error('Error saving availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
