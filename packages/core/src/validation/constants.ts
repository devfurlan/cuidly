/**
 * Document Validation Constants
 * Thresholds and configuration for identity validation
 */

// ===============================================
// Validation Thresholds
// ===============================================

/**
 * Minimum facematch score required for validation to pass (0-100)
 * Facematch compares the document photo with the selfie
 */
export const FACEMATCH_MIN_SCORE = 80;

/**
 * Minimum liveness score required for validation to pass (0-100)
 * Liveness ensures the person is present at the moment of validation
 */
export const LIVENESS_MIN_SCORE = 80;

/**
 * Minimum document OCR confidence for validation to pass (0-100)
 */
export const OCR_MIN_CONFIDENCE = 70;

// ===============================================
// Validation Status
// ===============================================

export const VALIDATION_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  EXPIRED: 'EXPIRED',
} as const;

export type ValidationStatus =
  (typeof VALIDATION_STATUS)[keyof typeof VALIDATION_STATUS];

// ===============================================
// Error Codes
// ===============================================

export const VALIDATION_ERROR_CODES = {
  DOCUMENT_NOT_READABLE: 'DOCUMENT_NOT_READABLE',
  DOCUMENT_EXPIRED: 'DOCUMENT_EXPIRED',
  DOCUMENT_TAMPERED: 'DOCUMENT_TAMPERED',
  FACEMATCH_FAILED: 'FACEMATCH_FAILED',
  LIVENESS_FAILED: 'LIVENESS_FAILED',
  CPF_MISMATCH: 'CPF_MISMATCH',
  OCR_FAILED: 'OCR_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ValidationErrorCode =
  (typeof VALIDATION_ERROR_CODES)[keyof typeof VALIDATION_ERROR_CODES];
