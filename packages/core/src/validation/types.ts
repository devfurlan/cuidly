/**
 * Document Validation Types
 * Types and interfaces for identity document validation (BigID, etc.)
 */

// ===============================================
// Document Types
// ===============================================

export type DocumentType = 'RG' | 'CNH';

// ===============================================
// Validation Input/Output Types
// ===============================================

export interface DocumentValidationParams {
  documentFrontImage: string; // Base64 or URL
  documentBackImage?: string; // Base64 or URL (optional for CNH)
  selfieImage: string; // Base64 or URL
  documentType: DocumentType;
  cpf?: string; // For cross-validation
}

export interface DocumentOCRData {
  cpf?: string;
  rg?: string;
  name?: string;
  birthDate?: string;
  motherName?: string;
  fatherName?: string;
  issuingState?: string;
  issueDate?: string;
  expirationDate?: string;
  gender?: string;
}

export interface DocumentValidationResult {
  success: boolean;
  transactionId?: string;
  documentData: DocumentOCRData;
  facematchScore: number; // 0-100
  livenessScore: number; // 0-100
  isDocumentValid: boolean;
  isFacematchValid: boolean;
  isLivenessValid: boolean;
  isValid: boolean;
  errors: string[];
  rawResponse?: unknown;
}

// ===============================================
// Validation Check Input
// ===============================================

export interface ValidationCheckParams {
  ocrValid: boolean;
  ocrData: DocumentOCRData;
  facematchScore: number;
  livenessScore: number;
}
