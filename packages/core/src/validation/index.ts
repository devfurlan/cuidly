/**
 * Validation Module Index
 * Re-exports all validation-related types, constants, and utilities
 */

// Types
export type {
  DocumentType,
  DocumentValidationParams,
  DocumentOCRData,
  DocumentValidationResult,
  ValidationCheckParams,
} from './types';

// Constants
export {
  FACEMATCH_MIN_SCORE,
  LIVENESS_MIN_SCORE,
  OCR_MIN_CONFIDENCE,
  VALIDATION_STATUS,
  VALIDATION_ERROR_CODES,
  type ValidationStatus,
  type ValidationErrorCode,
} from './constants';

// Validator functions
export {
  isValidationPassed,
  isFacematchValid,
  isLivenessValid,
  hasRequiredOCRData,
  isCpfMatch,
  getValidationFailureReasons,
} from './validator';
