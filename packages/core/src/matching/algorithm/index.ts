/**
 * Main matching algorithm for Cuidly - MVP Version
 *
 * Calculates compatibility scores between jobs/families and nannies
 * based on the new MVP questionnaire structure.
 *
 * Score Structure:
 * - Fit da Vaga (structural): 80 points
 * - Confiança (trust): 20 points
 * - Bônus: up to 10 points (distance + budget)
 */

import { calculateDistance, maxTravelDistanceToKm } from '../distance';
import {
  MAX_SCORES,
  FAMILY_HOURLY_RATE_MAP,
  NANNY_HOURLY_RATE_MAP,
} from './constants';
import type {
  NannyProfile,
  JobData,
  FamilyData,
  ChildData,
  MatchResult,
  MatchBreakdown,
  ScoreComponent,
} from './types';

// Re-export types
export type {
  NannyProfile,
  JobData,
  FamilyData,
  ChildData,
  MatchResult,
  MatchBreakdown,
  ScoreComponent,
} from './types';

// Re-export constants
export { MAX_SCORES } from './constants';

// ============================================================================
// Age Range Utilities
// ============================================================================

function getAgeRange(age: number | null | undefined): string | null {
  if (age == null) return null;
  if (age < 0.25) return 'NEWBORN';
  if (age < 1) return 'BABY';
  if (age < 3) return 'TODDLER';
  if (age < 6) return 'PRESCHOOL';
  if (age < 13) return 'SCHOOL_AGE';
  return 'TEENAGER';
}

function calculateAge(birthDate: Date | null | undefined): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  if (age === 0) {
    const months =
      today.getMonth() -
      birth.getMonth() +
      (today.getFullYear() - birth.getFullYear()) * 12;
    return months / 12;
  }
  return age;
}

function getChildrenAgeRanges(children: ChildData[]): string[] {
  const ranges = children
    .filter((c) => !c.unborn)
    .map((c) => {
      const age = calculateAge(c.birthDate);
      return { age, range: getAgeRange(age) };
    })
    .filter((r): r is { age: number; range: string } => r.range !== null)
    .sort((a, b) => a.age - b.age)
    .map((r) => r.range);

  const unbornCount = children.filter((c) => c.unborn).length;
  for (let i = 0; i < unbornCount; i++) {
    ranges.unshift('NEWBORN');
  }

  return ranges;
}

// ============================================================================
// Eliminatory Filters
// ============================================================================

function checkEliminatoryFilters(
  nanny: NannyProfile,
  job: JobData,
  family: FamilyData,
  children: ChildData[]
): string[] {
  const reasons: string[] = [];

  // 1. Age Range Filter
  const childRanges = getChildrenAgeRanges(children);
  if (childRanges.length > 0) {
    const youngestRange = childRanges[0];
    if (!nanny.ageRangesExperience.includes(youngestRange)) {
      reasons.push(
        `Babá não tem experiência com a faixa etária da criança mais nova (${youngestRange})`
      );
    }
  }

  // 2. Number of Children Filter
  const numberOfChildren = family.numberOfChildren ?? children.length;
  if (nanny.maxChildrenCare != null && numberOfChildren > nanny.maxChildrenCare) {
    reasons.push(
      `Família tem ${numberOfChildren} crianças, babá aceita até ${nanny.maxChildrenCare}`
    );
  }

  // 3. Special Needs Filter
  const childrenWithSpecialNeeds = children.filter((c) => c.hasSpecialNeeds);
  if (
    childrenWithSpecialNeeds.length > 0 &&
    job.mandatoryRequirements.includes('SPECIAL_NEEDS_EXPERIENCE')
  ) {
    if (!nanny.hasSpecialNeedsExperience) {
      reasons.push('Família requer experiência com necessidades especiais');
    } else {
      const requiredCategories = new Set<string>();
      for (const child of childrenWithSpecialNeeds) {
        for (const type of child.specialNeedsTypes || []) {
          requiredCategories.add(type);
        }
      }

      const nannySpecialties = new Set(nanny.specialNeedsSpecialties || []);
      const unmatchedCategories: string[] = [];

      for (const category of requiredCategories) {
        if (category === 'OTHER') continue;
        if (!nannySpecialties.has(category) && !nannySpecialties.has('OTHER')) {
          unmatchedCategories.push(category);
        }
      }

      if (unmatchedCategories.length > 0) {
        reasons.push(
          `Babá não tem experiência com: ${unmatchedCategories.join(', ')}`
        );
      }
    }
  }

  // 4. Distance Filter
  if (
    nanny.address?.latitude &&
    nanny.address?.longitude &&
    family.address?.latitude &&
    family.address?.longitude
  ) {
    const distance = calculateDistance(
      { latitude: nanny.address.latitude, longitude: nanny.address.longitude },
      { latitude: family.address.latitude, longitude: family.address.longitude }
    );
    const maxDistance = maxTravelDistanceToKm(nanny.maxTravelDistance);
    if (distance > maxDistance * 1.2) {
      reasons.push(
        `Distância (${distance.toFixed(1)} km) excede o raio máximo da babá (${maxDistance} km)`
      );
    }
  }

  // 5. Pet Comfort Filter
  if (family.hasPets && nanny.comfortableWithPets === 'NO') {
    reasons.push('Família tem animais e babá não se sente confortável');
  }

  // 6. Non-Smoker Filter
  if (job.mandatoryRequirements.includes('NON_SMOKER') && nanny.isSmoker) {
    reasons.push('Família requer babá não fumante');
  }

  // 7. Driver License Filter
  if (job.mandatoryRequirements.includes('DRIVER_LICENSE') && !nanny.hasCnh) {
    reasons.push('Família requer babá com CNH');
  }

  // 8. Budget Filter
  if (family.hourlyRateRange && nanny.hourlyRateRange) {
    const familyRange = FAMILY_HOURLY_RATE_MAP[family.hourlyRateRange];
    const nannyRange = NANNY_HOURLY_RATE_MAP[nanny.hourlyRateRange];

    if (familyRange && nannyRange) {
      const hasOverlap =
        familyRange.max >= nannyRange.min && nannyRange.max >= familyRange.min;
      if (!hasOverlap) {
        reasons.push(
          `Orçamento incompatível: família paga ${family.hourlyRateRange}, babá quer ${nanny.hourlyRateRange}`
        );
      }
    }
  }

  // 9. Availability Filter
  if (
    family.availabilitySlots &&
    family.availabilitySlots.length > 0 &&
    nanny.availabilitySlots &&
    nanny.availabilitySlots.length > 0
  ) {
    const intersection = family.availabilitySlots.filter((slot) =>
      nanny.availabilitySlots!.includes(slot)
    );
    if (intersection.length === 0) {
      reasons.push('Nenhuma disponibilidade em comum entre família e babá');
    }
  }

  return reasons;
}

// ============================================================================
// Score Calculation Functions - Fit da Vaga (80 pts)
// ============================================================================

function calculateAgeRangeScore(
  nanny: NannyProfile,
  children: ChildData[]
): ScoreComponent {
  const childRanges = getChildrenAgeRanges(children);

  if (childRanges.length === 0) {
    return {
      score: MAX_SCORES.ageRange,
      maxScore: MAX_SCORES.ageRange,
      details: 'Sem crianças cadastradas',
    };
  }

  const matchedRanges = childRanges.filter((r) =>
    nanny.ageRangesExperience.includes(r)
  );
  const matchPercentage = matchedRanges.length / childRanges.length;
  const youngestCompatible =
    matchedRanges.length > 0 && matchedRanges[0] === childRanges[0];

  let score: number;
  let details: string;

  if (matchPercentage === 1) {
    score = 25;
    details = 'Todas as faixas etárias compatíveis';
  } else if (youngestCompatible) {
    score = 18;
    details = `Criança mais nova compatível (${matchedRanges.length}/${childRanges.length} faixas)`;
  } else if (matchedRanges.length > 0) {
    score = 8;
    details = `Compatibilidade parcial (${matchedRanges.length}/${childRanges.length} faixas)`;
  } else {
    score = 0;
    details = 'Nenhuma faixa etária compatível';
  }

  return { score, maxScore: MAX_SCORES.ageRange, details };
}

function calculateNannyTypeScore(
  nanny: NannyProfile,
  family: FamilyData
): ScoreComponent {
  if (!family.nannyType) {
    return {
      score: MAX_SCORES.nannyType,
      maxScore: MAX_SCORES.nannyType,
      details: 'Família não especificou tipo de babá',
    };
  }

  const hasMatch = nanny.nannyTypes.includes(family.nannyType);

  return {
    score: hasMatch ? 15 : 0,
    maxScore: MAX_SCORES.nannyType,
    details: hasMatch
      ? `Match: babá atua como ${family.nannyType}`
      : `Babá não atua como ${family.nannyType}`,
  };
}

function calculateActivitiesScore(
  nanny: NannyProfile,
  family: FamilyData
): ScoreComponent {
  if (family.domesticHelpExpected.length === 0) {
    return {
      score: MAX_SCORES.activities,
      maxScore: MAX_SCORES.activities,
      details: 'Família não especificou atividades',
    };
  }

  const intersection = family.domesticHelpExpected.filter((a) =>
    nanny.acceptedActivities.includes(a)
  );
  const count = intersection.length;

  let score: number;
  if (count >= 5) {
    score = 15;
  } else if (count >= 3) {
    score = 10;
  } else if (count >= 1) {
    score = 5;
  } else {
    score = 0;
  }

  return {
    score,
    maxScore: MAX_SCORES.activities,
    details: `${count} atividades em comum`,
  };
}

function calculateContractRegimeScore(
  nanny: NannyProfile,
  family: FamilyData
): ScoreComponent {
  if (!family.contractRegime) {
    return {
      score: MAX_SCORES.contractRegime,
      maxScore: MAX_SCORES.contractRegime,
      details: 'Família não especificou regime',
    };
  }

  const hasExactMatch = nanny.contractRegimes.includes(family.contractRegime);

  const compatiblePairs: [string, string][] = [
    ['AUTONOMA', 'PJ'],
    ['PJ', 'AUTONOMA'],
  ];
  const hasCompatibleMatch =
    !hasExactMatch &&
    compatiblePairs.some(
      ([a, b]) =>
        family.contractRegime === a && nanny.contractRegimes.includes(b)
    );

  let score: number;
  let details: string;

  if (hasExactMatch) {
    score = 10;
    details = `Match exato: ${family.contractRegime}`;
  } else if (hasCompatibleMatch) {
    score = 5;
    details = 'Regime compatível com ressalva';
  } else {
    score = 0;
    details = `Babá não aceita ${family.contractRegime}`;
  }

  return { score, maxScore: MAX_SCORES.contractRegime, details };
}

function calculateAvailabilityScore(
  nanny: NannyProfile,
  family: FamilyData
): ScoreComponent {
  if (!nanny.availabilitySlots || nanny.availabilitySlots.length === 0) {
    return {
      score: MAX_SCORES.availability,
      maxScore: MAX_SCORES.availability,
      details: 'Babá não informou disponibilidade',
    };
  }

  if (!family.availabilitySlots || family.availabilitySlots.length === 0) {
    return {
      score: MAX_SCORES.availability,
      maxScore: MAX_SCORES.availability,
      details: 'Família não informou disponibilidade',
    };
  }

  const intersection = family.availabilitySlots.filter((slot) =>
    nanny.availabilitySlots!.includes(slot)
  );
  const overlapPercentage = intersection.length / family.availabilitySlots.length;

  let score: number;
  let details: string;

  if (overlapPercentage >= 0.7) {
    score = 10;
    details = `Boa sobreposição (${Math.round(overlapPercentage * 100)}%)`;
  } else if (intersection.length > 0) {
    score = 5;
    details = `Interseção mínima (${intersection.length} slots)`;
  } else {
    score = 0;
    details = 'Sem disponibilidade em comum';
  }

  return { score, maxScore: MAX_SCORES.availability, details };
}

function calculateChildrenCountScore(
  nanny: NannyProfile,
  family: FamilyData,
  children: ChildData[]
): ScoreComponent {
  const numberOfChildren = family.numberOfChildren ?? children.length;

  if (nanny.maxChildrenCare == null) {
    return {
      score: MAX_SCORES.childrenCount,
      maxScore: MAX_SCORES.childrenCount,
      details: 'Babá não informou limite de crianças',
    };
  }

  let score: number;
  let details: string;

  if (nanny.maxChildrenCare > numberOfChildren) {
    score = 5;
    details = `Totalmente compatível (${numberOfChildren} crianças, limite ${nanny.maxChildrenCare})`;
  } else if (nanny.maxChildrenCare === numberOfChildren) {
    score = 3;
    details = `No limite (${numberOfChildren} crianças)`;
  } else {
    score = 0;
    details = `Excede limite da babá (${numberOfChildren} > ${nanny.maxChildrenCare})`;
  }

  return { score, maxScore: MAX_SCORES.childrenCount, details };
}

// ============================================================================
// Score Calculation Functions - Confiança (20 pts)
// ============================================================================

function calculateSealScore(nanny: NannyProfile): ScoreComponent {
  const hasDocument = nanny.documentValidated;
  const hasPersonalData = nanny.personalDataValidated;
  const hasCriminalCheck = nanny.criminalBackgroundValidated;

  let score: number;
  let details: string;

  if (hasDocument && hasPersonalData && hasCriminalCheck) {
    score = 8;
    details = 'Selo Confiável (Identificada + facial + antecedentes)';
  } else if (hasDocument && hasPersonalData) {
    score = 4;
    details = 'Selo Verificada (Identificada + facial)';
  } else {
    score = 0;
    details = 'Selo Identificada';
  }

  return { score, maxScore: MAX_SCORES.seal, details };
}

function calculateReviewsScore(nanny: NannyProfile): ScoreComponent {
  if (
    nanny.reviewCount == null ||
    nanny.reviewCount === 0 ||
    nanny.averageRating == null
  ) {
    return {
      score: 6,
      maxScore: MAX_SCORES.reviews,
      details: 'Sem avaliações',
    };
  }

  const avg = nanny.averageRating;
  let score: number;
  let details: string;

  if (avg >= 4.8) {
    score = 12;
    details = `Excelente (${avg.toFixed(1)}★, ${nanny.reviewCount} avaliações)`;
  } else if (avg >= 4.5) {
    score = 9;
    details = `Muito bom (${avg.toFixed(1)}★, ${nanny.reviewCount} avaliações)`;
  } else if (avg >= 4.0) {
    score = 5;
    details = `Bom (${avg.toFixed(1)}★, ${nanny.reviewCount} avaliações)`;
  } else {
    score = 2;
    details = `Regular (${avg.toFixed(1)}★, ${nanny.reviewCount} avaliações)`;
  }

  return { score, maxScore: MAX_SCORES.reviews, details };
}

// ============================================================================
// Score Calculation Functions - Bônus (10 pts max)
// ============================================================================

function calculateDistanceBonus(
  nanny: NannyProfile,
  family: FamilyData
): ScoreComponent {
  if (
    !nanny.address?.latitude ||
    !nanny.address?.longitude ||
    !family.address?.latitude ||
    !family.address?.longitude
  ) {
    return {
      score: 0,
      maxScore: MAX_SCORES.distanceBonus,
      details: 'Coordenadas não disponíveis',
    };
  }

  const distance = calculateDistance(
    { latitude: nanny.address.latitude, longitude: nanny.address.longitude },
    { latitude: family.address.latitude, longitude: family.address.longitude }
  );
  const maxDistance = maxTravelDistanceToKm(nanny.maxTravelDistance);
  const ratio = distance / maxDistance;

  let score: number;
  let details: string;

  if (ratio <= 0.5) {
    score = 5;
    details = `Muito próxima (${distance.toFixed(1)} km, ${Math.round(ratio * 100)}% do raio)`;
  } else if (ratio <= 1.0) {
    score = 3;
    details = `Dentro do raio (${distance.toFixed(1)} km)`;
  } else if (ratio <= 1.2) {
    score = 1;
    details = `No limite (${distance.toFixed(1)} km)`;
  } else {
    score = 0;
    details = `Fora do raio (${distance.toFixed(1)} km)`;
  }

  return { score, maxScore: MAX_SCORES.distanceBonus, details };
}

function calculateBudgetBonus(
  nanny: NannyProfile,
  family: FamilyData
): ScoreComponent {
  if (!family.hourlyRateRange || !nanny.hourlyRateRange) {
    return {
      score: 0,
      maxScore: MAX_SCORES.budgetBonus,
      details: 'Faixa salarial não informada',
    };
  }

  const familyRange = FAMILY_HOURLY_RATE_MAP[family.hourlyRateRange];
  const nannyRange = NANNY_HOURLY_RATE_MAP[nanny.hourlyRateRange];

  if (!familyRange || !nannyRange) {
    return {
      score: 0,
      maxScore: MAX_SCORES.budgetBonus,
      details: 'Faixa salarial inválida',
    };
  }

  let score: number;
  let details: string;

  if (nannyRange.min <= familyRange.max) {
    if (nannyRange.min <= familyRange.min) {
      score = 5;
      details = 'Valor da babá dentro do orçamento';
    } else {
      score = 5;
      details = 'Overlap de valores';
    }
  } else {
    const difference = nannyRange.min - familyRange.max;
    if (difference <= 10) {
      score = 2;
      details = 'Valor ligeiramente acima (negociável)';
    } else {
      score = 0;
      details = 'Valores muito diferentes';
    }
  }

  return { score, maxScore: MAX_SCORES.budgetBonus, details };
}

// ============================================================================
// Helper Functions
// ============================================================================

function createEmptyBreakdown(): MatchBreakdown {
  const emptyComponent = (maxScore: number): ScoreComponent => ({
    score: 0,
    maxScore,
    details: 'Eliminado',
  });

  return {
    ageRange: emptyComponent(MAX_SCORES.ageRange),
    nannyType: emptyComponent(MAX_SCORES.nannyType),
    activities: emptyComponent(MAX_SCORES.activities),
    contractRegime: emptyComponent(MAX_SCORES.contractRegime),
    availability: emptyComponent(MAX_SCORES.availability),
    childrenCount: emptyComponent(MAX_SCORES.childrenCount),
    seal: emptyComponent(MAX_SCORES.seal),
    reviews: emptyComponent(MAX_SCORES.reviews),
    distanceBonus: emptyComponent(MAX_SCORES.distanceBonus),
    budgetBonus: emptyComponent(MAX_SCORES.budgetBonus),
  };
}

// ============================================================================
// Main Matching Functions
// ============================================================================

/**
 * Calculates the match score between a job/family and a nanny.
 *
 * Score Structure:
 * - Fit da Vaga (80 pts): ageRange(25) + nannyType(15) + activities(15) +
 *                         contractRegime(10) + availability(10) + childrenCount(5)
 * - Confiança (20 pts): seal(8) + reviews(12)
 * - Bônus (10 pts max): distanceBonus(5) + budgetBonus(5)
 */
export function calculateMatchScore(
  job: JobData,
  family: FamilyData,
  children: ChildData[],
  nanny: NannyProfile
): MatchResult {
  const eliminationReasons = checkEliminatoryFilters(nanny, job, family, children);

  if (eliminationReasons.length > 0) {
    return {
      score: 0,
      fitScore: 0,
      trustScore: 0,
      bonusScore: 0,
      isEligible: false,
      eliminationReasons,
      breakdown: createEmptyBreakdown(),
    };
  }

  // Calculate Fit da Vaga scores (80 pts max)
  const ageRangeScore = calculateAgeRangeScore(nanny, children);
  const nannyTypeScore = calculateNannyTypeScore(nanny, family);
  const activitiesScore = calculateActivitiesScore(nanny, family);
  const contractRegimeScore = calculateContractRegimeScore(nanny, family);
  const availabilityScore = calculateAvailabilityScore(nanny, family);
  const childrenCountScore = calculateChildrenCountScore(nanny, family, children);

  const fitScore =
    ageRangeScore.score +
    nannyTypeScore.score +
    activitiesScore.score +
    contractRegimeScore.score +
    availabilityScore.score +
    childrenCountScore.score;

  // Calculate Confiança scores (20 pts max)
  const sealScore = calculateSealScore(nanny);
  const reviewsScore = calculateReviewsScore(nanny);

  const trustScore = sealScore.score + reviewsScore.score;

  // Calculate Bônus (10 pts max)
  const distanceBonusScore = calculateDistanceBonus(nanny, family);
  const budgetBonusScore = calculateBudgetBonus(nanny, family);

  const bonusScore = distanceBonusScore.score + budgetBonusScore.score;

  const totalScore = fitScore + trustScore + bonusScore;

  return {
    score: totalScore,
    fitScore,
    trustScore,
    bonusScore,
    isEligible: true,
    eliminationReasons: [],
    breakdown: {
      ageRange: ageRangeScore,
      nannyType: nannyTypeScore,
      activities: activitiesScore,
      contractRegime: contractRegimeScore,
      availability: availabilityScore,
      childrenCount: childrenCountScore,
      seal: sealScore,
      reviews: reviewsScore,
      distanceBonus: distanceBonusScore,
      budgetBonus: budgetBonusScore,
    },
  };
}

/**
 * Finds the best matching nannies for a job, sorted by score.
 */
export function findBestMatches(
  job: JobData,
  family: FamilyData,
  children: ChildData[],
  nannies: NannyProfile[],
  limit: number = 20,
  minScore: number = 0
): Array<{ nanny: NannyProfile; result: MatchResult }> {
  const results = nannies
    .map((nanny) => ({
      nanny,
      result: calculateMatchScore(job, family, children, nanny),
    }))
    .filter(({ result }) => result.isEligible && result.score >= minScore)
    .sort((a, b) => {
      if (b.result.score !== a.result.score) {
        return b.result.score - a.result.score;
      }
      if (b.result.fitScore !== a.result.fitScore) {
        return b.result.fitScore - a.result.fitScore;
      }
      if (b.result.breakdown.reviews.score !== a.result.breakdown.reviews.score) {
        return b.result.breakdown.reviews.score - a.result.breakdown.reviews.score;
      }
      if (b.result.breakdown.seal.score !== a.result.breakdown.seal.score) {
        return b.result.breakdown.seal.score - a.result.breakdown.seal.score;
      }
      const aActive = a.nanny.lastActiveAt?.getTime() ?? 0;
      const bActive = b.nanny.lastActiveAt?.getTime() ?? 0;
      return bActive - aActive;
    })
    .slice(0, limit);

  return results;
}
