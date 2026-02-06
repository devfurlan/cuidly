/**
 * API Route: Nanny Availability
 * GET /api/nannies/availability - Get current user's nanny availability
 *
 * This endpoint tries to load from NannyAvailability first,
 * but also falls back to data stored directly on the Nanny model (from onboarding).
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

// Map nanny types from onboarding to job types used in availability
function mapNannyTypesToJobTypes(nannyTypes: string[]): string[] {
  const mapping: Record<string, string> = {
    'MENSALISTA': 'FIXED',
    'FOLGUISTA': 'SUBSTITUTE',
    'DIARISTA': 'OCCASIONAL',
  };
  return nannyTypes.map(t => mapping[t] || t).filter(Boolean);
}

// Map contract regimes from onboarding to availability contract types
function mapContractRegimes(contractRegimes: string[]): string[] {
  const mapping: Record<string, string> = {
    'CLT': 'CLT',
    'PJ': 'MEI',
    'AUTONOMA': 'DAILY_WORKER',
  };
  return contractRegimes.map(r => mapping[r] || r).filter(Boolean);
}

// Convert slots format to schedule format for backwards compatibility
// Slots format: { slots: ["MONDAY_MORNING", "TUESDAY_AFTERNOON"] }
// Schedule format: { monday: { enabled: true, periods: ["MORNING"] }, ... }
function slotsToSchedule(availabilityJson: unknown): Record<string, { enabled: boolean; periods: string[] }> | null {
  if (!availabilityJson || typeof availabilityJson !== 'object') {
    return null;
  }

  const data = availabilityJson as Record<string, unknown>;

  // Check if it's already in the old schedule format (has day keys like 'monday')
  if ('monday' in data || 'tuesday' in data) {
    return data as Record<string, { enabled: boolean; periods: string[] }>;
  }

  // Check if it's in slots format
  if ('slots' in data && Array.isArray(data.slots)) {
    const slots = data.slots as string[];
    const schedule: Record<string, { enabled: boolean; periods: string[] }> = {
      monday: { enabled: false, periods: [] },
      tuesday: { enabled: false, periods: [] },
      wednesday: { enabled: false, periods: [] },
      thursday: { enabled: false, periods: [] },
      friday: { enabled: false, periods: [] },
      saturday: { enabled: false, periods: [] },
      sunday: { enabled: false, periods: [] },
    };

    const dayMapping: Record<string, string> = {
      'MONDAY': 'monday',
      'TUESDAY': 'tuesday',
      'WEDNESDAY': 'wednesday',
      'THURSDAY': 'thursday',
      'FRIDAY': 'friday',
      'SATURDAY': 'saturday',
      'SUNDAY': 'sunday',
    };

    for (const slot of slots) {
      const [dayUpper, shift] = slot.split('_');
      const dayLower = dayMapping[dayUpper];
      if (dayLower && shift && schedule[dayLower]) {
        schedule[dayLower].enabled = true;
        if (!schedule[dayLower].periods.includes(shift)) {
          schedule[dayLower].periods.push(shift);
        }
      }
    }

    return schedule;
  }

  return null;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'User is not a nanny' }, { status: 400 });
    }

    // Get availability data from NannyAvailability table
    const availability = await prisma.nannyAvailability.findUnique({
      where: { nannyId: currentUser.nanny.id },
    });

    // Also get data from Nanny model (from onboarding)
    const nanny = await prisma.nanny.findUnique({
      where: { id: currentUser.nanny.id },
      select: {
        nannyTypes: true,
        contractRegimes: true,
        hourlyRateRange: true,
        availabilityJson: true,
        hourlyRate: true,
        dailyRate: true,
        monthlyRate: true,
      },
    });

    // If we have NannyAvailability data, use it
    if (availability) {
      return NextResponse.json({
        availability: {
          id: availability.id,
          jobTypes: availability.jobTypes,
          schedule: availability.schedule,
          monthlyRate: availability.monthlyRate ? Number(availability.monthlyRate) : null,
          hourlyRate: availability.hourlyRate ? Number(availability.hourlyRate) : null,
          dailyRate: availability.dailyRate ? Number(availability.dailyRate) : null,
          preferredContractTypes: availability.preferredContractTypes,
          schedulePreference: availability.schedulePreference,
          acceptsOvernight: availability.acceptsOvernight,
          allowsMultipleJobs: availability.allowsMultipleJobs,
          availableFrom: availability.availableFrom,
        },
      });
    }

    // Fall back to data from Nanny model (onboarding data)
    if (nanny && (nanny.nannyTypes?.length || nanny.availabilityJson || nanny.hourlyRateRange)) {
      // Convert availabilityJson to schedule format (handles both old and new formats)
      const schedule = slotsToSchedule(nanny.availabilityJson);

      return NextResponse.json({
        availability: {
          id: currentUser.nanny.id,
          jobTypes: mapNannyTypesToJobTypes(nanny.nannyTypes || []),
          schedule: schedule || {},
          monthlyRate: nanny.monthlyRate ? Number(nanny.monthlyRate) : null,
          hourlyRate: nanny.hourlyRate ? Number(nanny.hourlyRate) : null,
          dailyRate: nanny.dailyRate ? Number(nanny.dailyRate) : null,
          hourlyRateRange: nanny.hourlyRateRange || null,
          preferredContractTypes: mapContractRegimes(nanny.contractRegimes || []),
        },
      });
    }

    return NextResponse.json({ availability: null });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
