import axios from 'axios';
import { unstable_cache } from 'next/cache';

const apiBigDataCorp = axios.create({
  baseURL: 'https://plataforma.bigdatacorp.com.br',
  headers: {
    'content-type': 'application/json',
    accept: 'application/json',
    AccessToken: (process.env.BIGDATACORP_ACCESS_TOKEN || '').toString(),
    TokenId: (process.env.BIGDATACORP_TOKEN_ID || '').toString(),
  },
});

export async function getBasicData(document: string) {
  try {
    const data = await unstable_cache(
      async () => {
        const { data } = await apiBigDataCorp.post('/pessoas', {
          q: `doc{${document}}`,
          Datasets: 'basic_data',
        });
        return data;
      },
      [`bigdatacorp-basic-data-${document}`],
      {
        revalidate: 60 * 60 * 24,
        tags: ['bigdatacorp-basic-data', `doc-${document}`],
      },
    )();
    return data;
  } catch (error) {
    console.error('Error fetching basic data:', error);
    throw new Error('Failed to fetch basic data.');
  }
}

export async function validateCriminalFederalPolice(document: string) {
  try {
    const response = await apiBigDataCorp.post('/ondemand', {
      Datasets: 'ondemand_pf_antecedente_person',
      q: `doc{${document}}`,
    });
    return response.data;
  } catch (error) {
    console.error('Error validating criminal records:', error);
    throw new Error('Failed to validate criminal records.');
  }
}

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

export async function validateCriminalCivilPolice({
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
  issueDate: string;
}): Promise<ValidationCriminalCivilPoliceResponse[]> {
  try {
    const response = await apiBigDataCorp.post('/ondemand', {
      Datasets: 'ondemand_pc_antecedente_by_state_person',
      q: `doc{${cpf}},uf{${uf}},rg{${rg}},mothername{${motherName}},fathername{${fatherName}},rgexpeditiondate{${issueDate}},dateformat{yyyy-MM-dd}`,
    });
    return response.data;
  } catch (error) {
    console.error('Error validating civil police records:', error);
    throw new Error('Failed to validate civil police records.');
  }
}

export default apiBigDataCorp;
