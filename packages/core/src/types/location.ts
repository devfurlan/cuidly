/**
 * Location types for Brazilian city/address search
 */

/**
 * Brazilian city from IBGE data
 */
export interface BrazilianCity {
  id: number;
  nome: string;
  uf: string;
}

/**
 * City suggestion for autocomplete dropdown
 */
export interface CitySuggestion {
  id: number;
  city: string;
  state: string;
  displayText: string;
}

/**
 * Search result types to distinguish input modes
 */
export type SearchResultType = 'city' | 'cep' | 'geolocation';

/**
 * Unified search result interface
 */
export interface LocationSearchResult {
  type: SearchResultType;
  city: string;
  state: string;
  neighborhood?: string;
  street?: string;
  lat?: number;
  lng?: number;
  formattedAddress: string;
}

/**
 * Input detection result
 */
export interface InputDetection {
  mode: 'city' | 'cep' | 'unknown';
  cleanValue: string;
  isCepComplete: boolean;
}

/**
 * BrasilAPI CEP response
 */
export interface BrasilAPICEPResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  location?: {
    type: string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
  };
}

/**
 * Nominatim reverse geocode response
 */
export interface NominatimReverseResponse {
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    municipality?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

/**
 * Nominatim search response item
 */
export interface NominatimSearchResponse {
  lat: string;
  lon: string;
  display_name: string;
}
