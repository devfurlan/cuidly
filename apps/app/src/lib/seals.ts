/**
 * Nanny Seals System
 *
 * Calculates which seal (badge) a nanny is eligible for based on:
 * - Profile completeness (all required fields filled)
 * - Document validation (RG/CNH via Documentoscopia)
 * - Email verification
 * - Facial validation
 * - Criminal background check
 * - Review count
 * - Active premium subscription
 *
 * Seals:
 * - IDENTIFICADA: Complete profile + document validated (RG/CNH) + verified email [FREE]
 * - VERIFICADA: Identificada + facial validation + background check (requires NANNY_PRO)
 * - CONFIAVEL: Verificada + 3+ published reviews (requires NANNY_PRO)
 *
 * Profile completeness requirements:
 * - Informações: nome, CPF, data nascimento, gênero, foto, localização (bairro, cidade, estado), sobre mim
 * - Experiência: anos de experiência, faixas etárias, pontos fortes, atividades aceitas
 * - Trabalho: tipo de babá, regime de contratação, faixa de valor, máximo de crianças, raio de deslocamento
 * - Disponibilidade: grade de disponibilidade semanal
 */

export type NannySeal = 'IDENTIFICADA' | 'VERIFICADA' | 'CONFIAVEL' | null;

export interface NannySealInput {
  // Profile completeness - Informações
  name: string | null;
  cpf: string | null;
  birthDate: Date | null;
  gender: string | null;
  photoUrl: string | null;
  address: {
    city?: string | null;
    state?: string | null;
    neighborhood?: string | null;
    streetName?: string | null;
    zipCode?: string | null;
  } | null;
  aboutMe: string | null;

  // Profile completeness - Experiência
  experienceYears: number | null;
  ageRangesExperience: string[] | null;
  strengths: string[] | null;
  acceptedActivities: string[] | null;

  // Profile completeness - Trabalho
  nannyTypes: string[] | null;
  contractRegimes: string[] | null;
  hourlyRateRange: string | null;
  maxChildrenCare: number | null;
  maxTravelDistance: string | null;

  // Profile completeness - Disponibilidade
  availabilityJson: unknown;

  // Email verification
  emailVerified: boolean;

  // Document validations
  documentValidated: boolean;
  documentExpirationDate?: Date | null;
  personalDataValidated: boolean;
  criminalBackgroundValidated: boolean;
}

export interface NannySealResult {
  seal: NannySeal;
  requirements: {
    identificada: { met: boolean; missing: string[] };
    verificada: { met: boolean; missing: string[] };
    confiavel: { met: boolean; missing: string[] };
  };
}

/**
 * Checks if a nanny profile has all required fields for Selo Identificada
 */
function isProfileComplete(nanny: NannySealInput): { complete: boolean; missing: string[] } {
  const missing: string[] = [];

  // Informações
  if (!nanny.name) missing.push('Nome');
  if (!nanny.cpf) missing.push('CPF');
  if (!nanny.birthDate) missing.push('Data de nascimento');
  if (!nanny.gender) missing.push('Gênero');
  if (!nanny.photoUrl) missing.push('Foto de perfil');
  if (!nanny.address?.city || !nanny.address?.state || !nanny.address?.neighborhood) {
    missing.push('Localização (bairro, cidade, estado)');
  }
  if (!nanny.aboutMe) missing.push('Sobre mim');

  // Experiência
  if (nanny.experienceYears === null) missing.push('Anos de experiência');
  if (!nanny.ageRangesExperience?.length) missing.push('Faixas etárias');
  if (!nanny.strengths?.length) missing.push('Pontos fortes');
  if (!nanny.acceptedActivities?.length) missing.push('Atividades aceitas');

  // Trabalho
  if (!nanny.nannyTypes?.length) missing.push('Tipo de babá');
  if (!nanny.contractRegimes?.length) missing.push('Regime de contratação');
  if (!nanny.hourlyRateRange) missing.push('Faixa de valor');
  if (!nanny.maxChildrenCare) missing.push('Máximo de crianças');
  if (!nanny.maxTravelDistance) missing.push('Raio de deslocamento');

  // Disponibilidade
  if (!nanny.availabilityJson) missing.push('Disponibilidade semanal');

  return {
    complete: missing.length === 0,
    missing,
  };
}

/**
 * Calculate the nanny's current seal based on their profile and subscription status
 *
 * @param nanny - Nanny profile data
 * @param hasProSubscription - Whether the nanny has an active NANNY_PRO subscription
 * @param publishedReviewCount - Number of published reviews the nanny has received
 * @returns The seal result with requirements breakdown
 */
export function calculateNannySeal(
  nanny: NannySealInput,
  hasProSubscription: boolean,
  publishedReviewCount: number
): NannySealResult {
  const result: NannySealResult = {
    seal: null,
    requirements: {
      identificada: { met: false, missing: [] },
      verificada: { met: false, missing: [] },
      confiavel: { met: false, missing: [] },
    },
  };

  // Check IDENTIFICADA requirements: complete profile + document validated + verified email
  const profileCheck = isProfileComplete(nanny);
  const identificadaMissing: string[] = [...profileCheck.missing];

  // Check document validation (must be validated and not expired) - required for IDENTIFICADA
  const isDocumentExpired = nanny.documentExpirationDate
    ? new Date(nanny.documentExpirationDate) < new Date()
    : false;
  const isDocumentValid = nanny.documentValidated && !isDocumentExpired;

  if (!isDocumentValid) {
    if (isDocumentExpired) {
      identificadaMissing.push('Documento de identidade expirado');
    } else {
      identificadaMissing.push('Documento de identidade (RG ou CNH)');
    }
  }

  if (!nanny.emailVerified) {
    identificadaMissing.push('E-mail verificado');
  }

  result.requirements.identificada = {
    met: identificadaMissing.length === 0,
    missing: identificadaMissing,
  };

  // If IDENTIFICADA not met, no seal
  if (!result.requirements.identificada.met) {
    return result;
  }

  // IDENTIFICADA is met
  result.seal = 'IDENTIFICADA';

  // Check VERIFICADA requirements: Identificada + facial validation + background check (requires Pro subscription)
  const verificadaMissing: string[] = [];

  if (!hasProSubscription) {
    verificadaMissing.push('Assinatura Pro ativa');
  }

  if (!nanny.personalDataValidated) {
    verificadaMissing.push('Validação facial');
  }
  if (!nanny.criminalBackgroundValidated) {
    verificadaMissing.push('Verificação de segurança');
  }

  result.requirements.verificada = {
    met: verificadaMissing.length === 0,
    missing: verificadaMissing,
  };

  // If VERIFICADA not met, stay at IDENTIFICADA
  if (!result.requirements.verificada.met) {
    return result;
  }

  // VERIFICADA is met
  result.seal = 'VERIFICADA';

  // Check CONFIAVEL requirements: Verificada + 3+ reviews
  const confiavelMissing: string[] = [];

  if (publishedReviewCount < 3) {
    confiavelMissing.push(`${3 - publishedReviewCount} avaliações restantes (${publishedReviewCount}/3)`);
  }

  result.requirements.confiavel = {
    met: confiavelMissing.length === 0,
    missing: confiavelMissing,
  };

  // If CONFIAVEL is met, upgrade seal
  if (result.requirements.confiavel.met) {
    result.seal = 'CONFIAVEL';
  }

  return result;
}

/**
 * Get the display name for a seal
 */
export function getSealDisplayName(seal: NannySeal): string {
  switch (seal) {
    case 'IDENTIFICADA':
      return 'Selo Identificada';
    case 'VERIFICADA':
      return 'Selo Verificada';
    case 'CONFIAVEL':
      return 'Selo Confiável';
    default:
      return '';
  }
}

/**
 * Get the badge color class for a seal
 */
export function getSealColorClass(seal: NannySeal): string {
  switch (seal) {
    case 'IDENTIFICADA':
      return 'bg-blue-500';
    case 'VERIFICADA':
      return 'bg-fuchsia-500';
    case 'CONFIAVEL':
      return 'bg-violet-500';
    default:
      return 'bg-gray-400';
  }
}

/**
 * Get a short description for each seal
 */
export function getSealDescription(seal: NannySeal): string {
  switch (seal) {
    case 'IDENTIFICADA':
      return 'Perfil completo com documento e e-mail verificados pela Cuidly.';
    case 'VERIFICADA':
      return 'Identidade confirmada com validação facial e verificação de antecedentes.';
    case 'CONFIAVEL':
      return 'Babá verificada com avaliações positivas de famílias na Cuidly.';
    default:
      return '';
  }
}
