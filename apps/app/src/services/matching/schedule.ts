/**
 * Schedule overlap calculation utilities for matching nannies with jobs
 */

/**
 * Represents a time slot for a specific day
 */
export interface DaySchedule {
  enabled: boolean;
  startTime?: string; // Format: "HH:MM"
  endTime?: string;   // Format: "HH:MM"
}

/**
 * Represents a weekly schedule
 */
export interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

/**
 * Days of the week in order
 */
const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

/**
 * Result of schedule overlap calculation
 */
export interface ScheduleOverlapResult {
  /** Overall overlap percentage (0-100) */
  overlapPercentage: number;
  /** Total minutes of overlap across all days */
  totalOverlapMinutes: number;
  /** Total minutes required by the job */
  totalJobMinutes: number;
  /** Breakdown by day */
  dayBreakdown: Record<DayOfWeek, DayOverlapInfo>;
  /** Days where there's any overlap */
  matchingDays: DayOfWeek[];
  /** Days where job needs coverage but nanny is unavailable */
  missingDays: DayOfWeek[];
}

/**
 * Overlap information for a single day
 */
export interface DayOverlapInfo {
  jobEnabled: boolean;
  nannyEnabled: boolean;
  overlapMinutes: number;
  jobMinutes: number;
  overlapPercentage: number;
  jobStart?: string;
  jobEnd?: string;
  nannyStart?: string;
  nannyEnd?: string;
  overlapStart?: string;
  overlapEnd?: string;
}

/**
 * Converts a time string (HH:MM) to minutes since midnight
 * @param time - Time string in HH:MM format
 * @returns Minutes since midnight
 */
function timeToMinutes(time: string | undefined): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts minutes since midnight to time string (HH:MM)
 * @param minutes - Minutes since midnight
 * @returns Time string in HH:MM format
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculates the overlap between two time ranges in minutes
 * @param start1 - Start time of first range (minutes)
 * @param end1 - End time of first range (minutes)
 * @param start2 - Start time of second range (minutes)
 * @param end2 - End time of second range (minutes)
 * @returns Object with overlap minutes, start, and end
 */
function calculateTimeRangeOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): { minutes: number; start: number; end: number } {
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  const overlapMinutes = Math.max(0, overlapEnd - overlapStart);

  return {
    minutes: overlapMinutes,
    start: overlapStart,
    end: overlapEnd,
  };
}

/**
 * Calculates the overlap for a single day
 * @param jobDay - Job's schedule for the day
 * @param nannyDay - Nanny's schedule for the day
 * @returns Day overlap information
 */
function calculateDayOverlap(
  jobDay: DaySchedule | undefined,
  nannyDay: DaySchedule | undefined
): DayOverlapInfo {
  const jobEnabled = jobDay?.enabled ?? false;
  const nannyEnabled = nannyDay?.enabled ?? false;

  // If job doesn't need this day, no overlap needed
  if (!jobEnabled) {
    return {
      jobEnabled: false,
      nannyEnabled,
      overlapMinutes: 0,
      jobMinutes: 0,
      overlapPercentage: 100, // Not needed, so 100% match
    };
  }

  // If job needs this day but nanny is not available
  if (!nannyEnabled) {
    const jobStart = timeToMinutes(jobDay?.startTime);
    const jobEnd = timeToMinutes(jobDay?.endTime);
    const jobMinutes = Math.max(0, jobEnd - jobStart);

    return {
      jobEnabled: true,
      nannyEnabled: false,
      overlapMinutes: 0,
      jobMinutes,
      overlapPercentage: 0,
      jobStart: jobDay?.startTime,
      jobEnd: jobDay?.endTime,
    };
  }

  // Both have this day enabled - calculate overlap
  const jobStart = timeToMinutes(jobDay?.startTime);
  const jobEnd = timeToMinutes(jobDay?.endTime);
  const nannyStart = timeToMinutes(nannyDay?.startTime);
  const nannyEnd = timeToMinutes(nannyDay?.endTime);

  const jobMinutes = Math.max(0, jobEnd - jobStart);
  const overlap = calculateTimeRangeOverlap(jobStart, jobEnd, nannyStart, nannyEnd);

  const overlapPercentage = jobMinutes > 0
    ? Math.round((overlap.minutes / jobMinutes) * 100)
    : 100;

  return {
    jobEnabled: true,
    nannyEnabled: true,
    overlapMinutes: overlap.minutes,
    jobMinutes,
    overlapPercentage,
    jobStart: jobDay?.startTime,
    jobEnd: jobDay?.endTime,
    nannyStart: nannyDay?.startTime,
    nannyEnd: nannyDay?.endTime,
    overlapStart: overlap.minutes > 0 ? minutesToTime(overlap.start) : undefined,
    overlapEnd: overlap.minutes > 0 ? minutesToTime(overlap.end) : undefined,
  };
}

/**
 * Calculates the schedule overlap between a job's requirements and a nanny's availability.
 *
 * The overlap percentage represents how much of the job's required hours
 * the nanny can cover. 100% means the nanny can cover all required hours.
 *
 * @param jobSchedule - The job's required schedule (JSON from database)
 * @param nannySchedule - The nanny's available schedule (JSON from database)
 * @returns Detailed overlap analysis including percentage and breakdown by day
 *
 * @example
 * ```ts
 * const result = calculateScheduleOverlap(
 *   {
 *     monday: { enabled: true, startTime: '08:00', endTime: '18:00' },
 *     tuesday: { enabled: true, startTime: '08:00', endTime: '18:00' },
 *   },
 *   {
 *     monday: { enabled: true, startTime: '07:00', endTime: '17:00' },
 *     tuesday: { enabled: true, startTime: '09:00', endTime: '19:00' },
 *   }
 * );
 * // result.overlapPercentage = 90 (9 hours overlap out of 10 hours required per day)
 * ```
 */
export function calculateScheduleOverlap(
  jobSchedule: WeeklySchedule | null | undefined,
  nannySchedule: WeeklySchedule | null | undefined
): ScheduleOverlapResult {
  // Handle null/undefined schedules
  if (!jobSchedule) {
    return {
      overlapPercentage: 100, // No job requirements means any nanny matches
      totalOverlapMinutes: 0,
      totalJobMinutes: 0,
      dayBreakdown: {} as Record<DayOfWeek, DayOverlapInfo>,
      matchingDays: [],
      missingDays: [],
    };
  }

  const dayBreakdown = {} as Record<DayOfWeek, DayOverlapInfo>;
  let totalOverlapMinutes = 0;
  let totalJobMinutes = 0;
  const matchingDays: DayOfWeek[] = [];
  const missingDays: DayOfWeek[] = [];

  for (const day of DAYS_OF_WEEK) {
    const jobDay = jobSchedule[day];
    const nannyDay = nannySchedule?.[day];
    const dayOverlap = calculateDayOverlap(jobDay, nannyDay);

    dayBreakdown[day] = dayOverlap;
    totalOverlapMinutes += dayOverlap.overlapMinutes;
    totalJobMinutes += dayOverlap.jobMinutes;

    if (dayOverlap.jobEnabled) {
      if (dayOverlap.overlapMinutes > 0) {
        matchingDays.push(day);
      } else {
        missingDays.push(day);
      }
    }
  }

  const overlapPercentage = totalJobMinutes > 0
    ? Math.round((totalOverlapMinutes / totalJobMinutes) * 100)
    : 100;

  return {
    overlapPercentage,
    totalOverlapMinutes,
    totalJobMinutes,
    dayBreakdown,
    matchingDays,
    missingDays,
  };
}

/**
 * Checks if a nanny's schedule meets a minimum overlap requirement.
 *
 * @param jobSchedule - The job's required schedule
 * @param nannySchedule - The nanny's available schedule
 * @param minimumOverlapPercentage - Minimum required overlap (default: 80%)
 * @returns True if the nanny meets the minimum overlap requirement
 */
export function meetsScheduleRequirement(
  jobSchedule: WeeklySchedule | null | undefined,
  nannySchedule: WeeklySchedule | null | undefined,
  minimumOverlapPercentage: number = 80
): boolean {
  const result = calculateScheduleOverlap(jobSchedule, nannySchedule);
  return result.overlapPercentage >= minimumOverlapPercentage;
}

/**
 * Checks if the nanny is available on all required days (regardless of time overlap).
 *
 * @param jobSchedule - The job's required schedule
 * @param nannySchedule - The nanny's available schedule
 * @returns True if the nanny is available on all days the job requires
 */
export function isAvailableOnAllRequiredDays(
  jobSchedule: WeeklySchedule | null | undefined,
  nannySchedule: WeeklySchedule | null | undefined
): boolean {
  if (!jobSchedule) return true;

  for (const day of DAYS_OF_WEEK) {
    const jobDay = jobSchedule[day];
    const nannyDay = nannySchedule?.[day];

    if (jobDay?.enabled && !nannyDay?.enabled) {
      return false;
    }
  }

  return true;
}

/**
 * Gets the number of matching days between job requirements and nanny availability.
 *
 * @param jobSchedule - The job's required schedule
 * @param nannySchedule - The nanny's available schedule
 * @returns Number of days where both job needs coverage and nanny is available
 */
export function countMatchingDays(
  jobSchedule: WeeklySchedule | null | undefined,
  nannySchedule: WeeklySchedule | null | undefined
): number {
  const result = calculateScheduleOverlap(jobSchedule, nannySchedule);
  return result.matchingDays.length;
}

/**
 * Formats a schedule overlap result into a human-readable summary.
 *
 * @param result - The schedule overlap result
 * @returns Human-readable summary string
 */
export function formatScheduleOverlapSummary(result: ScheduleOverlapResult): string {
  const hours = Math.round(result.totalOverlapMinutes / 60 * 10) / 10;
  const totalHours = Math.round(result.totalJobMinutes / 60 * 10) / 10;

  if (result.totalJobMinutes === 0) {
    return 'Sem requisitos de horário específicos';
  }

  if (result.overlapPercentage === 100) {
    return `Disponibilidade total (${totalHours}h/semana)`;
  }

  if (result.overlapPercentage === 0) {
    return 'Sem disponibilidade nos horários necessários';
  }

  const missingDaysText = result.missingDays.length > 0
    ? ` - Indisponível: ${result.missingDays.map(d => formatDayName(d)).join(', ')}`
    : '';

  return `${result.overlapPercentage}% de disponibilidade (${hours}h de ${totalHours}h/semana)${missingDaysText}`;
}

/**
 * Formats a day name to Portuguese
 */
function formatDayName(day: DayOfWeek): string {
  const dayNames: Record<DayOfWeek, string> = {
    monday: 'Seg',
    tuesday: 'Ter',
    wednesday: 'Qua',
    thursday: 'Qui',
    friday: 'Sex',
    saturday: 'Sáb',
    sunday: 'Dom',
  };
  return dayNames[day];
}
