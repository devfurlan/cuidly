/**
 * Matching Algorithm Constants
 */

export const MAX_SCORES = {
  // Fit da Vaga (80 pts)
  ageRange: 25,
  nannyType: 15,
  activities: 15,
  contractRegime: 10,
  availability: 10,
  childrenCount: 5,
  // Confiança (20 pts)
  seal: 8,
  reviews: 12,
  // Bônus
  distanceBonus: 5,
  budgetBonus: 5,
} as const;

/**
 * Maps family hourly rate range to numeric values
 */
export const FAMILY_HOURLY_RATE_MAP: Record<string, { min: number; max: number }> = {
  // Current values
  'UP_TO_25': { min: 0, max: 25 },
  'FROM_26_TO_35': { min: 26, max: 35 },
  'FROM_36_TO_45': { min: 36, max: 45 },
  'FROM_46_TO_60': { min: 46, max: 60 },
  'FROM_61_TO_80': { min: 61, max: 80 },
  'OVER_80': { min: 80, max: 999 },
  // Legacy values
  'UP_TO_20': { min: 0, max: 20 },
  '20_TO_30': { min: 20, max: 30 },
  '30_TO_40': { min: 30, max: 40 },
  '40_TO_50': { min: 40, max: 50 },
  'ABOVE_50': { min: 50, max: 999 },
};

/**
 * Maps nanny hourly rate range to numeric values
 */
export const NANNY_HOURLY_RATE_MAP: Record<string, { min: number; max: number }> = {
  // Current values
  'UP_TO_25': { min: 0, max: 25 },
  'FROM_26_TO_35': { min: 26, max: 35 },
  'FROM_36_TO_45': { min: 36, max: 45 },
  'FROM_46_TO_60': { min: 46, max: 60 },
  'FROM_61_TO_80': { min: 61, max: 80 },
  'OVER_80': { min: 80, max: 999 },
  // Legacy values
  'UP_TO_20': { min: 0, max: 20 },
  'FROM_21_TO_30': { min: 21, max: 30 },
  'FROM_31_TO_40': { min: 31, max: 40 },
  'FROM_41_TO_50': { min: 41, max: 50 },
  'FROM_51_TO_70': { min: 51, max: 70 },
  'FROM_71_TO_100': { min: 71, max: 100 },
  'OVER_100': { min: 100, max: 999 },
};
