/**
 * IBGE API client for Brazilian cities
 */

import type { BrazilianCity, CitySuggestion } from '@/types/location';
import staticCitiesData from '@/constants/brazilianCities.json';

/**
 * Normalize string for search comparison (remove accents, lowercase)
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Get all Brazilian cities from static JSON (5,571 cities)
 * Using static import for reliability - no network requests needed
 */
export async function getCities(): Promise<BrazilianCity[]> {
  return staticCitiesData as BrazilianCity[];
}

/**
 * Search cities by query string
 */
export function searchCities(
  cities: BrazilianCity[],
  query: string,
  limit: number = 10
): CitySuggestion[] {
  const normalizedQuery = normalizeString(query.trim());

  if (normalizedQuery.length < 2) {
    return [];
  }

  const results = cities
    .filter((city) => normalizeString(city.nome).includes(normalizedQuery))
    .sort((a, b) => {
      const aNormalized = normalizeString(a.nome);
      const bNormalized = normalizeString(b.nome);

      // Prioritize exact start match
      const aStarts = aNormalized.startsWith(normalizedQuery);
      const bStarts = bNormalized.startsWith(normalizedQuery);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Then by string length (shorter names first)
      if (a.nome.length !== b.nome.length) {
        return a.nome.length - b.nome.length;
      }

      // Then alphabetically
      return a.nome.localeCompare(b.nome, 'pt-BR');
    })
    .slice(0, limit);

  return results.map((city) => ({
    id: city.id,
    city: city.nome,
    state: city.uf,
    displayText: `${city.nome} - ${city.uf}`,
  }));
}
