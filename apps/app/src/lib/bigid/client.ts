import axios, { AxiosInstance } from 'axios';

// Import types and utilities from core
import {
  type DocumentValidationParams,
  type DocumentValidationResult,
  type DocumentOCRData,
  isValidationPassed,
  FACEMATCH_MIN_SCORE,
  LIVENESS_MIN_SCORE,
} from '@cuidly/core/validation';

// Re-export types from core for convenience
export type { DocumentValidationParams, DocumentValidationResult, DocumentOCRData };

// ============================================
// INTERNAL TYPES (BigID API specific)
// ============================================

interface BigIDConfig {
  accessToken: string;
  tokenId: string;
  baseUrl: string;
}

// Tipagem baseada na documentação BigDataCorp/BigID
interface BigIDDocumentoscopyResponse {
  Status?: {
    bigid_documentoscopy?: Array<{
      Code: number;
      Message: string;
    }>;
  };
  Result?: Array<{
    DocumentoscopyResult?: {
      OCR?: {
        CPF?: string;
        RG?: string;
        Name?: string;
        BirthDate?: string;
        MotherName?: string;
        FatherName?: string;
        IssuingState?: string;
        IssueDate?: string;
        ExpirationDate?: string;
        Gender?: string;
      };
      DocumentValidation?: {
        IsValid?: boolean;
        Confidence?: number;
        Errors?: string[];
      };
    };
  }>;
  QueryId?: string;
}

interface BigIDFacematchResponse {
  Status?: {
    bigid_facematch?: Array<{
      Code: number;
      Message: string;
    }>;
  };
  Result?: Array<{
    FacematchResult?: {
      IsMatch?: boolean;
      Score?: number;
      Confidence?: number;
    };
  }>;
  QueryId?: string;
}

interface BigIDLivenessResponse {
  Status?: {
    bigid_liveness?: Array<{
      Code: number;
      Message: string;
    }>;
  };
  Result?: Array<{
    LivenessResult?: {
      IsAlive?: boolean;
      Score?: number;
      Confidence?: number;
    };
  }>;
  QueryId?: string;
}

// ============================================
// CLIENT CLASS
// ============================================

export class BigIDClient {
  private config: BigIDConfig;
  private api: AxiosInstance;

  constructor() {
    this.config = {
      accessToken: process.env.BIGID_ACCESS_TOKEN || process.env.BIGDATACORP_ACCESS_TOKEN || '',
      tokenId: process.env.BIGID_TOKEN_ID || process.env.BIGDATACORP_TOKEN_ID || '',
      baseUrl: process.env.BIGID_BASE_URL || 'https://plataforma.bigdatacorp.com.br',
    };

    if (!this.config.accessToken || !this.config.tokenId) {
      console.warn('BigID API credentials not fully configured');
    }

    this.api = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        AccessToken: this.config.accessToken,
        TokenId: this.config.tokenId,
      },
    });
  }

  /**
   * Valida documento usando BigID Documentoscopy (OCR)
   * Extrai dados do documento e valida autenticidade
   */
  async validateDocumentOCR(
    documentFrontImage: string,
    documentBackImage?: string,
    documentType: 'RG' | 'CNH' = 'RG'
  ): Promise<{ data: DocumentOCRData; isValid: boolean; errors: string[] }> {
    try {
      // Nota: Endpoint e estrutura baseados na documentação BigDataCorp
      // https://docs.bigdatacorp.com.br/app/reference/consultando-o-bigid
      const response = await this.api.post<BigIDDocumentoscopyResponse>('/bigid-documentoscopy', {
        Datasets: 'bigid_documentoscopy',
        q: `document_front{${documentFrontImage}}${documentBackImage ? `,document_back{${documentBackImage}}` : ''},document_type{${documentType}}`,
      });

      const result = response.data?.Result?.[0]?.DocumentoscopyResult;
      const ocr = result?.OCR;
      const validation = result?.DocumentValidation;

      return {
        data: {
          cpf: ocr?.CPF,
          rg: ocr?.RG,
          name: ocr?.Name,
          birthDate: ocr?.BirthDate,
          motherName: ocr?.MotherName,
          fatherName: ocr?.FatherName,
          issuingState: ocr?.IssuingState,
          issueDate: ocr?.IssueDate,
          expirationDate: ocr?.ExpirationDate,
          gender: ocr?.Gender,
        },
        isValid: validation?.IsValid ?? false,
        errors: validation?.Errors || [],
      };
    } catch (error: unknown) {
      console.error('BigID Documentoscopy error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        data: {},
        isValid: false,
        errors: [`Erro na validação de documento: ${errorMessage}`],
      };
    }
  }

  /**
   * Valida biometria facial (Facematch)
   * Compara foto do documento com selfie
   */
  async validateFacematch(
    documentImage: string,
    selfieImage: string
  ): Promise<{ score: number; isValid: boolean; error?: string }> {
    try {
      const response = await this.api.post<BigIDFacematchResponse>('/bigid-facematch', {
        Datasets: 'bigid_facematch',
        q: `document_photo{${documentImage}},selfie{${selfieImage}}`,
      });

      const result = response.data?.Result?.[0]?.FacematchResult;
      const score = result?.Score ?? 0;

      return {
        score,
        isValid: score >= FACEMATCH_MIN_SCORE,
      };
    } catch (error: unknown) {
      console.error('BigID Facematch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        score: 0,
        isValid: false,
        error: `Erro na validação facial: ${errorMessage}`,
      };
    }
  }

  /**
   * Valida prova de vida (Proof of Liveness)
   * Garante que a pessoa esta presente no momento da validação
   */
  async validateLiveness(
    selfieImage: string
  ): Promise<{ score: number; isValid: boolean; error?: string }> {
    try {
      const response = await this.api.post<BigIDLivenessResponse>('/bigid-liveness', {
        Datasets: 'bigid_liveness',
        q: `selfie{${selfieImage}}`,
      });

      const result = response.data?.Result?.[0]?.LivenessResult;
      const score = result?.Score ?? 0;

      return {
        score,
        isValid: score >= LIVENESS_MIN_SCORE,
      };
    } catch (error: unknown) {
      console.error('BigID Liveness error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        score: 0,
        isValid: false,
        error: `Erro na prova de vida: ${errorMessage}`,
      };
    }
  }

  /**
   * Validação completa de documento
   * Executa OCR + Facematch + Liveness em sequência
   */
  async validateDocument(params: DocumentValidationParams): Promise<DocumentValidationResult> {
    const errors: string[] = [];
    let transactionId: string | undefined;

    try {
      // 1. Validar documento com OCR
      const ocrResult = await this.validateDocumentOCR(
        params.documentFrontImage,
        params.documentBackImage,
        params.documentType
      );

      if (ocrResult.errors.length > 0) {
        errors.push(...ocrResult.errors);
      }

      // Verificar se CPF do documento bate com o informado (se fornecido)
      if (params.cpf && ocrResult.data.cpf && params.cpf !== ocrResult.data.cpf) {
        errors.push('CPF do documento nao corresponde ao CPF informado');
      }

      // 2. Validar Facematch (comparar foto do documento com selfie)
      const facematchResult = await this.validateFacematch(
        params.documentFrontImage, // Foto do documento
        params.selfieImage
      );

      if (facematchResult.error) {
        errors.push(facematchResult.error);
      }

      // 3. Validar Liveness (prova de vida)
      const livenessResult = await this.validateLiveness(params.selfieImage);

      if (livenessResult.error) {
        errors.push(livenessResult.error);
      }

      // Determinar se a validação passou usando função do core
      const isValid = isValidationPassed({
        ocrValid: ocrResult.isValid,
        ocrData: ocrResult.data,
        facematchScore: facematchResult.score,
        livenessScore: livenessResult.score,
      });

      return {
        success: errors.length === 0,
        transactionId,
        documentData: ocrResult.data,
        facematchScore: facematchResult.score,
        livenessScore: livenessResult.score,
        isDocumentValid: ocrResult.isValid,
        isFacematchValid: facematchResult.isValid,
        isLivenessValid: livenessResult.isValid,
        isValid,
        errors,
      };
    } catch (error: unknown) {
      console.error('BigID validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        success: false,
        documentData: {},
        facematchScore: 0,
        livenessScore: 0,
        isDocumentValid: false,
        isFacematchValid: false,
        isLivenessValid: false,
        isValid: false,
        errors: [`Erro na validação: ${errorMessage}`],
      };
    }
  }

  // Note: isValidationPassed is now imported from @cuidly/core/validation
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let clientInstance: BigIDClient | null = null;

export function getBigIDClient(): BigIDClient {
  if (!clientInstance) {
    clientInstance = new BigIDClient();
  }
  return clientInstance;
}

export default BigIDClient;
