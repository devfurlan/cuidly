/**
 * Availability slot utilities
 * Functions for converting between slot formats
 */

/**
 * Convert availability slots to separate days and shifts arrays
 * E.g., ['MONDAY_MORNING', 'MONDAY_AFTERNOON', 'TUESDAY_MORNING']
 * => { neededDays: ['MONDAY', 'TUESDAY'], neededShifts: ['MORNING', 'AFTERNOON'] }
 */
export function slotsToArrays(
  slots: string[]
): { neededDays: string[]; neededShifts: string[] } {
  const daysSet = new Set<string>();
  const shiftsSet = new Set<string>();

  for (const slot of slots) {
    const lastUnderscore = slot.lastIndexOf('_');
    if (lastUnderscore > 0) {
      const day = slot.substring(0, lastUnderscore);
      const shift = slot.substring(lastUnderscore + 1);
      daysSet.add(day);
      shiftsSet.add(shift);
    }
  }

  return {
    neededDays: Array.from(daysSet),
    neededShifts: Array.from(shiftsSet),
  };
}

/**
 * Convert separate days and shifts arrays to availability slots
 * E.g., { neededDays: ['MONDAY', 'TUESDAY'], neededShifts: ['MORNING', 'AFTERNOON'] }
 * => ['MONDAY_MORNING', 'MONDAY_AFTERNOON', 'TUESDAY_MORNING', 'TUESDAY_AFTERNOON']
 */
export function arraysToSlots(
  neededDays: string[],
  neededShifts: string[]
): string[] {
  const slots: string[] = [];
  for (const day of neededDays) {
    for (const shift of neededShifts) {
      slots.push(`${day}_${shift}`);
    }
  }
  return slots;
}

/**
 * Check if two availability slot arrays have any overlap
 */
export function hasAvailabilityOverlap(
  slots1: string[] | null | undefined,
  slots2: string[] | null | undefined
): boolean {
  if (!slots1?.length || !slots2?.length) return true; // No data = compatible
  return slots1.some((slot) => slots2.includes(slot));
}

/**
 * Get the intersection of two availability slot arrays
 */
export function getAvailabilityIntersection(
  slots1: string[] | null | undefined,
  slots2: string[] | null | undefined
): string[] {
  if (!slots1?.length) return slots2 || [];
  if (!slots2?.length) return slots1;
  return slots1.filter((slot) => slots2.includes(slot));
}

/**
 * Calculate overlap percentage between two availability slot arrays
 */
export function calculateAvailabilityOverlapPercentage(
  familySlots: string[] | null | undefined,
  nannySlots: string[] | null | undefined
): number {
  if (!familySlots?.length || !nannySlots?.length) return 1; // No data = 100% compatible

  const intersection = familySlots.filter((slot) => nannySlots.includes(slot));
  return intersection.length / familySlots.length;
}

/**
 * Days of the week constants (for availability slots)
 */
export const SLOT_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

/**
 * Shifts constants (for availability slots)
 */
export const SLOT_SHIFTS = ['MORNING', 'AFTERNOON', 'NIGHT', 'OVERNIGHT'] as const;

/**
 * Generate all possible availability slots
 */
export function getAllPossibleSlots(): string[] {
  const slots: string[] = [];
  for (const day of SLOT_DAYS) {
    for (const shift of SLOT_SHIFTS) {
      slots.push(`${day}_${shift}`);
    }
  }
  return slots;
}
