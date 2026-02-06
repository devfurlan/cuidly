/**
 * Availability Data Fetching Functions
 * Server-side data fetching for availability page
 */

import prisma from '@/lib/prisma';

export interface AvailabilityData {
  nannyTypes: string[];
  contractRegimes: string[];
  hourlyRateRange: string | null;
  // Slots format from onboarding: { slots: ["MONDAY_MORNING", "TUESDAY_AFTERNOON", ...] }
  availabilitySlots: string[];
}

export async function getNannyAvailability(
  nannyId: number
): Promise<AvailabilityData | null> {
  const nanny = await prisma.nanny.findUnique({
    where: { id: nannyId },
    select: {
      nannyTypes: true,
      contractRegimes: true,
      hourlyRateRange: true,
      availabilityJson: true,
    },
  });

  if (!nanny) return null;

  // Extract slots from availabilityJson (onboarding format: { slots: [...] })
  const availabilityJson = nanny.availabilityJson as { slots?: string[] } | null;
  const availabilitySlots = availabilityJson?.slots || [];

  return {
    nannyTypes: nanny.nannyTypes || [],
    contractRegimes: nanny.contractRegimes || [],
    hourlyRateRange: nanny.hourlyRateRange,
    availabilitySlots,
  };
}
