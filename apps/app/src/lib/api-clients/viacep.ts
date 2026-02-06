/**
 * ViaCEP API integration for Brazilian address validation and autocomplete
 */

import axios from 'axios';

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

const viaCEPClient = axios.create({
  baseURL: 'https://viacep.com.br/ws',
  timeout: 10000,
});

/**
 * Fetch address data from CEP
 * @param cep - Brazilian postal code (8 digits)
 * @returns Address data or null if not found
 */
export async function fetchAddressByCEP(
  cep: string
): Promise<ViaCEPResponse | null> {
  try {
    const cleanCEP = cep.replace(/\D/g, '');

    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    const response = await viaCEPClient.get<ViaCEPResponse>(
      `/${cleanCEP}/json/`
    );

    if (response.data.erro) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching CEP data:', error);
    return null;
  }
}

/**
 * Validate if CEP exists
 * @param cep - Brazilian postal code
 * @returns true if CEP is valid and exists
 */
export async function validateCEP(cep: string): Promise<boolean> {
  const data = await fetchAddressByCEP(cep);
  return data !== null;
}
