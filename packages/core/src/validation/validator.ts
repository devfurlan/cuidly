/**
 * Document Validation Logic
 * Pure functions for validation checks (no external dependencies)
 */

import type { ValidationCheckParams, DocumentOCRData } from './types';
import { FACEMATCH_MIN_SCORE, LIVENESS_MIN_SCORE } from './constants';

/**
 * Checks if the validation passed based on defined criteria
 *
 * Approval criteria:
 * - OCR extracted data successfully (at least CPF and name)
 * - Document validated as authentic
 * - Facematch score >= threshold (default 80%)
 * - Liveness score >= threshold (default 80%)
 */
export function isValidationPassed(
  data: ValidationCheckParams,
  options?: {
    facematchMinScore?: number;
    livenessMinScore?: number;
  }
): boolean {
  const facematchThreshold = options?.facematchMinScore ?? FACEMATCH_MIN_SCORE;
  const livenessThreshold = options?.livenessMinScore ?? LIVENESS_MIN_SCORE;

  const hasRequiredData = !!(data.ocrData.cpf && data.ocrData.name);
  const facematchValid = data.facematchScore >= facematchThreshold;
  const livenessValid = data.livenessScore >= livenessThreshold;

  return data.ocrValid && hasRequiredData && facematchValid && livenessValid;
}

/**
 * Checks if facematch score meets the threshold
 */
export function isFacematchValid(
  score: number,
  minScore: number = FACEMATCH_MIN_SCORE
): boolean {
  return score >= minScore;
}

/**
 * Checks if liveness score meets the threshold
 */
export function isLivenessValid(
  score: number,
  minScore: number = LIVENESS_MIN_SCORE
): boolean {
  return score >= minScore;
}

/**
 * Checks if OCR extracted the required data
 */
export function hasRequiredOCRData(ocrData: DocumentOCRData): boolean {
  return !!(ocrData.cpf && ocrData.name);
}

/**
 * Validates CPF match between document and provided value
 */
export function isCpfMatch(documentCpf?: string, providedCpf?: string): boolean {
  if (!documentCpf || !providedCpf) {
    return true; // No cross-validation needed if either is missing
  }
  // Normalize CPFs (remove formatting)
  const normalizedDoc = documentCpf.replace(/\D/g, '');
  const normalizedProvided = providedCpf.replace(/\D/g, '');
  return normalizedDoc === normalizedProvided;
}

/**
 * Gets validation failure reasons
 */
export function getValidationFailureReasons(
  data: ValidationCheckParams,
  options?: {
    facematchMinScore?: number;
    livenessMinScore?: number;
  }
): string[] {
  const facematchThreshold = options?.facematchMinScore ?? FACEMATCH_MIN_SCORE;
  const livenessThreshold = options?.livenessMinScore ?? LIVENESS_MIN_SCORE;
  const reasons: string[] = [];

  if (!data.ocrValid) {
    reasons.push('Documento não pôde ser validado como autêntico');
  }

  if (!data.ocrData.cpf) {
    reasons.push('CPF não encontrado no documento');
  }

  if (!data.ocrData.name) {
    reasons.push('Nome não encontrado no documento');
  }

  if (data.facematchScore < facematchThreshold) {
    reasons.push(
      `Score de correspondência facial insuficiente (${data.facematchScore}% < ${facematchThreshold}%)`
    );
  }

  if (data.livenessScore < livenessThreshold) {
    reasons.push(
      `Score de prova de vida insuficiente (${data.livenessScore}% < ${livenessThreshold}%)`
    );
  }

  return reasons;
}
