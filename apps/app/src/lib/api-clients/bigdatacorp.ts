import axios from 'axios';
import { unstable_cache } from 'next/cache';

const apiBigDataCorp = axios.create({
  baseURL: 'https://plataforma.bigdatacorp.com.br/',
  headers: {
    'content-type': 'application/json',
    accept: 'application/json',
    AccessToken: (process.env.BIGDATACORP_ACCESS_TOKEN || '').toString(),
    TokenId: (process.env.BIGDATACORP_TOKEN_ID || '').toString(),
  },
});

/**
 * Internal function to fetch basic data from BigDataCorp (uncached)
 */
async function fetchBasicDataFromAPI(document: string) {
  try {
    const response = await apiBigDataCorp.post('/pessoas', {
      Datasets: 'basic_data',
      q: `doc{${document}}`,
    });

    // Check if response has data and valid status
    if (response.data && response.data.Status) {
      return response.data;
    }

    // If no Status field, might be an error
    console.warn('BigDataCorp response missing Status field:', response.data);
    return null;
  } catch (error: any) {
    // Log detailed error for debugging
    if (error.response) {
      console.error('BigDataCorp API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else {
      console.error('Error fetching basic data:', error.message);
    }
    throw new Error('Failed to fetch basic data from BigDataCorp.');
  }
}

/**
 * Validates CPF using BigDataCorp Basic Data API (with cache)
 * Endpoint: POST /pessoas
 * Docs: https://docs.bigdatacorp.com.br/plataforma/reference/pessoas_basic_data
 *
 * Cache: 7 days - Basic identity data rarely changes
 */
export const getBasicData = unstable_cache(
  async (document: string) => fetchBasicDataFromAPI(document),
  ['bigdatacorp-basic-data'],
  {
    revalidate: 60 * 60 * 24 * 7, // 7 days in seconds
    tags: ['bigdatacorp', 'basic-data'],
  }
);

/**
 * Internal function to fetch federal police records from BigDataCorp (uncached)
 */
async function fetchCriminalFederalPoliceFromAPI(document: string) {
  try {
    const response = await apiBigDataCorp.post(
      '/ondemand-pf-antecedente-person',
      {
        Datasets: 'ondemand_pf_antecedente_person',
        q: `doc{${document}}`,
      },
    );

    if (response.data && response.data.Status) {
      return response.data;
    }

    console.warn(
      'BigDataCorp PF response missing Status field:',
      response.data,
    );
    return null;
  } catch (error: any) {
    if (error.response) {
      console.error('BigDataCorp PF API Error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error('Error validating federal police records:', error.message);
    }
    throw new Error('Failed to validate federal police criminal records.');
  }
}

/**
 * Validates Criminal Background - Federal Police (with cache)
 * Endpoint: POST /ondemand-pf-antecedente-person
 * Docs: https://docs.bigdatacorp.com.br/plataforma/reference/ondemand_pf_antecedente_person
 *
 * Cache: 30 days - Criminal records are relatively stable
 */
export const validateCriminalFederalPolice = unstable_cache(
  async (document: string) => fetchCriminalFederalPoliceFromAPI(document),
  ['bigdatacorp-federal-police'],
  {
    revalidate: 60 * 60 * 24 * 30, // 30 days in seconds
    tags: ['bigdatacorp', 'federal-police'],
  }
);

export interface ValidationCriminalCivilPoliceResponse {
  Result: {
    MatchKeys: string;
    OnlineCertificates: {
      Origin: string;
      InputParameters: string;
      ProtocolNumber: string;
      BaseStatus: string;
      AdditionalOutputData: {
        IdNumber: string;
        Status: string;
        CertificateNumber: string;
        QueriedUF: string;
        CertificateText: string;
        EmissionDate: string;
      };
      QueryDate: string;
    }[];
  }[];
  QueryId: string;
  ElapsedMilliseconds: number;
  QueryDate: string;
  Status: {
    ondemand_pc_antecedente_by_state_person: {
      Code: number;
      Message: string;
    }[];
  };
  Evidences: Record<string, unknown>;
}

/**
 * Internal function to fetch civil police records from BigDataCorp (uncached)
 */
async function fetchCriminalCivilPoliceFromAPI({
  cpf,
  uf,
  rg,
  motherName,
  fatherName,
  issueDate,
}: {
  cpf: string;
  uf: string;
  rg: string;
  motherName: string;
  fatherName: string;
  issueDate: string; // Format: yyyy-MM-dd
}): Promise<ValidationCriminalCivilPoliceResponse | null> {
  try {
    const response = await apiBigDataCorp.post(
      '/ondemand-pc-antecedente-by-state-person',
      {
        Datasets: 'ondemand_pc_antecedente_by_state_person',
        q: `doc{${cpf}},uf{${uf}},rg{${rg}},mothername{${motherName}},fathername{${fatherName}},rgexpeditiondate{${issueDate}},dateformat{yyyy-MM-dd}`,
      },
    );

    if (response.data && response.data.Status) {
      return response.data;
    }

    console.warn(
      'BigDataCorp PC response missing Status field:',
      response.data,
    );
    return null;
  } catch (error: any) {
    if (error.response) {
      console.error('BigDataCorp PC API Error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error('Error validating civil police records:', error.message);
    }
    throw new Error('Failed to validate civil police criminal records.');
  }
}

/**
 * Validates Criminal Background - Civil Police by State (with cache)
 * Endpoint: POST /ondemand-pc-antecedente-by-state-person
 * Docs: https://docs.bigdatacorp.com.br/plataforma/reference/ondemand_pc_antecedente_by_state_person
 *
 * Cache: 30 days - Criminal records are relatively stable
 */
export const validateCriminalCivilPolice = unstable_cache(
  async (params: {
    cpf: string;
    uf: string;
    rg: string;
    motherName: string;
    fatherName: string;
    issueDate: string;
  }) => fetchCriminalCivilPoliceFromAPI(params),
  ['bigdatacorp-civil-police'],
  {
    revalidate: 60 * 60 * 24 * 30, // 30 days in seconds
    tags: ['bigdatacorp', 'civil-police'],
  }
);

// ============================================
// Background Check API
// ============================================

/**
 * Cliente axios para Background Check (endpoint diferente)
 */
const apiBackgroundCheck = axios.create({
  baseURL: 'https://app.bigdatacorp.com.br',
  headers: {
    'content-type': 'application/json',
    accept: 'application/json',
    AccessToken: (process.env.BIGDATACORP_ACCESS_TOKEN || '').toString(),
    TokenId: (process.env.BIGDATACORP_TOKEN_ID || '').toString(),
  },
});

/**
 * Interface para resposta do Background Check
 */
export interface BackgroundCheckResponse {
  Result?: {
    Decision?: string; // 'APPROVED', 'DENIED', 'REVIEW'
    Score?: number;
    RiskLevel?: string;
    Details?: Record<string, unknown>;
  };
  Status?: {
    Code: number;
    Message: string;
  };
  QueryId?: string;
  ElapsedMilliseconds?: number;
}

/**
 * Internal function to validate background check (uncached)
 */
async function fetchBackgroundCheckFromAPI(
  cpf: string
): Promise<BackgroundCheckResponse | null> {
  try {
    const response = await apiBackgroundCheck.post('/bigid/bigdecision/checar', {
      Group: 'baba',
      parameters: {
        CPF: cpf,
      },
    });

    if (response.data) {
      return response.data;
    }

    console.warn('BigDataCorp Background Check response empty:', response.data);
    return null;
  } catch (error: any) {
    if (error.response) {
      console.error('BigDataCorp Background Check API Error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error('Error validating background check:', error.message);
    }
    throw new Error('Failed to validate background check.');
  }
}

/**
 * Validates Background Check using BigDataCorp BigDecision API (with cache)
 * Endpoint: POST /bigid/bigdecision/checar
 * Docs: https://docs.bigdatacorp.com.br/app/reference/backgroundcheck
 *
 * Cache: 30 days - Background check data is relatively stable
 */
export const validateBackgroundCheck = unstable_cache(
  async (cpf: string) => fetchBackgroundCheckFromAPI(cpf),
  ['bigdatacorp-background-check'],
  {
    revalidate: 60 * 60 * 24 * 30, // 30 days in seconds
    tags: ['bigdatacorp', 'background-check'],
  }
);

// ============================================
// Documentoscopia API
// ============================================

/**
 * Interface para dados extraídos de um documento (formato real da API)
 */
export interface DocumentoscopiaDocInfo {
  // Campos comuns
  DOCTYPE?: string; // "CNHV2", "RG", "CIN", etc.
  NAME?: string;
  CPF?: string;
  BIRTHDATE?: string; // "05/11/1990"
  FATHERNAME?: string;
  MOTHERNAME?: string;
  PLACEOFBIRTH?: string;
  PLACEOFEMISSION?: string;
  ORGEMISSION?: string;
  DOCEMISSIONPLACE?: string;
  EXPEDITIONDATE?: string; // Data de emissão "26/12/2023"
  VALIDDATE?: string; // Data de validade "23/12/2033"
  SIDE?: string; // "A", "B", "C" (frente, verso, completo)
  // CNH specific
  CNHNUMBER?: string;
  CATEGORY?: string;
  FIRSTQUALIFICATIONDATE?: string;
  PAIDACTIVITY?: string;
  // RG specific
  IDENTIFICATIONNUMBER?: string;
  IDENTIFICATIONUF?: string;
}

/**
 * Interface para resposta da Documentoscopia (formato real da API)
 */
export interface DocumentoscopiaResponse {
  DocInfo?: DocumentoscopiaDocInfo;
  EstimatedInfo?: {
    ESTIMATE_STATUS?: string;
  };
  TicketId?: string;
  ResultCode?: number; // 70 = sucesso, -701 = erro OCR, -704 = nenhuma info, -702 = sem imagem
  ResultMessage?: string;
  // Formato alternativo (caso mude)
  Result?: DocumentoscopiaDocInfo[];
  Status?: {
    documentoscopia?: Array<{
      Code: number;
      Message: string;
    }>;
  };
}

/**
 * Parâmetros para validação de documento
 */
export interface DocumentoscopiaParams {
  docImgFrontUrl: string;
  docImgBackUrl?: string;
}

/**
 * Internal function to validate document via Documentoscopia (uncached)
 * Endpoint: POST /bigid/documentoscopia/checar
 * Docs: https://docs.bigdatacorp.com.br/app/reference/documentoscopia-de-documentos-de-identificação
 */
async function fetchDocumentoscopiaFromAPI(
  params: DocumentoscopiaParams
): Promise<DocumentoscopiaResponse | null> {
  try {
    // A API espera um array "Parameters" com strings no formato "KEY=value"
    const parameters: string[] = [];

    if (params.docImgBackUrl) {
      // Se temos frente e verso, usamos DOC_IMG_URL_A e DOC_IMG_URL_B
      parameters.push(`DOC_IMG_URL_A=${params.docImgFrontUrl}`);
      parameters.push(`DOC_IMG_URL_B=${params.docImgBackUrl}`);
    } else {
      // Se só temos a frente, usamos DOC_IMG_URL
      parameters.push(`DOC_IMG_URL=${params.docImgFrontUrl}`);
    }

    const requestBody = { Parameters: parameters };

    console.log('Enviando para BigDataCorp Documentoscopia:', {
      endpoint: '/bigid/documentoscopia/checar',
      body: requestBody,
    });

    const response = await apiBackgroundCheck.post(
      '/bigid/documentoscopia/checar',
      requestBody
    );

    console.log('BigDataCorp Documentoscopia response:', JSON.stringify(response.data, null, 2));

    if (response.data) {
      return response.data;
    }

    console.warn('BigDataCorp Documentoscopia response empty:', response.data);
    return null;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('BigDataCorp Documentoscopia API Error:', {
        status: error.response.status,
        data: JSON.stringify(error.response.data, null, 2),
      });
      // Retornar os dados do erro para que possamos processar os códigos de status
      if (error.response.data) {
        return error.response.data as DocumentoscopiaResponse;
      }
    } else if (error instanceof Error) {
      console.error('Error validating document:', error.message);
    }
    throw new Error('Failed to validate document via Documentoscopia.');
  }
}

/**
 * Validates document using BigDataCorp Documentoscopia API
 * Endpoint: POST /bigid/documentoscopia/checar
 * Docs: https://docs.bigdatacorp.com.br/app/reference/documentoscopia-de-documentos-de-identificação
 *
 * Note: No cache - each document validation should be fresh
 */
export async function validateDocumentoscopia(
  params: DocumentoscopiaParams
): Promise<DocumentoscopiaResponse | null> {
  return fetchDocumentoscopiaFromAPI(params);
}

/**
 * Converte data no formato DD/MM/YYYY para Date
 */
function parseBrazilianDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Helper function to calculate document expiration date
 * - CNH: uses VALIDDATE from response
 * - RG: EXPEDITIONDATE + 10 years
 */
export function calculateDocumentExpirationDate(
  docInfo: DocumentoscopiaDocInfo
): Date | null {
  const docType = docInfo.DOCTYPE?.toUpperCase() || '';

  // CNH - usar data de validade (VALIDDATE)
  if (docType.includes('CNH')) {
    if (docInfo.VALIDDATE) {
      return parseBrazilianDate(docInfo.VALIDDATE);
    }
  }

  // RG/CIN - calcular validade = data de emissão + 10 anos
  if (docType.includes('RG') || docType.includes('CIN')) {
    if (docInfo.EXPEDITIONDATE) {
      const issueDate = parseBrazilianDate(docInfo.EXPEDITIONDATE);
      if (issueDate) {
        issueDate.setFullYear(issueDate.getFullYear() + 10);
        return issueDate;
      }
    }
  }

  return null;
}

/**
 * Helper function to determine document type from response
 */
export function getDocumentType(
  docInfo: DocumentoscopiaDocInfo
): 'CNH' | 'RG' | 'CIN' | 'OTHER' {
  const docType = docInfo.DOCTYPE?.toUpperCase() || '';

  if (docType.includes('CNH')) return 'CNH';
  if (docType.includes('CIN')) return 'CIN';
  if (docType.includes('RG')) return 'RG';

  return 'OTHER';
}

export default apiBigDataCorp;
