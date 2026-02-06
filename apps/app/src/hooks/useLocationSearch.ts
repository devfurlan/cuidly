'use client';

import { geocodeByCEP } from '@/lib/geocoding';
import { getCities, searchCities } from '@/lib/api-clients/ibge';
import type {
  BrazilianCity,
  CitySuggestion,
  InputDetection,
  LocationSearchResult,
} from '@/types/location';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseLocationSearchReturn {
  suggestions: CitySuggestion[];
  cepResult: LocationSearchResult | null;
  isLoading: boolean;
  isLoadingCities: boolean;
  inputMode: 'city' | 'cep' | 'unknown';
  error: string | null;
  handleInputChange: (value: string) => void;
  selectCity: (suggestion: CitySuggestion) => LocationSearchResult;
  clearResults: () => void;
  clearError: () => void;
}

/**
 * Detect input mode based on user input
 */
function detectInputMode(input: string): InputDetection {
  const cleanValue = input.trim();
  const digitsOnly = cleanValue.replace(/\D/g, '');

  // CEP detection: 5+ digits or CEP format (XXXXX-XXX)
  if (/^\d{5}-?\d{0,3}$/.test(cleanValue) || digitsOnly.length >= 5) {
    return {
      mode: 'cep',
      cleanValue: digitsOnly,
      isCepComplete: digitsOnly.length === 8,
    };
  }

  // City mode: any text >= 2 chars
  if (cleanValue.length >= 2) {
    return {
      mode: 'city',
      cleanValue,
      isCepComplete: false,
    };
  }

  return {
    mode: 'unknown',
    cleanValue,
    isCepComplete: false,
  };
}

/**
 * Hook for unified location search (city autocomplete + CEP lookup)
 */
export function useLocationSearch(): UseLocationSearchReturn {
  const [cities, setCities] = useState<BrazilianCity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [cepResult, setCepResult] = useState<LocationSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMode, setInputMode] = useState<'city' | 'cep' | 'unknown'>(
    'unknown'
  );
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastCepSearchRef = useRef<string>('');

  // Load cities on mount
  useEffect(() => {
    async function loadCities() {
      try {
        const data = await getCities();
        setCities(data);
      } catch (error) {
        console.error('Failed to load cities:', error);
      } finally {
        setIsLoadingCities(false);
      }
    }

    loadCities();
  }, []);

  // Search CEP
  const searchCEP = useCallback(async (cep: string) => {
    // Avoid duplicate searches
    if (lastCepSearchRef.current === cep) {
      return;
    }

    lastCepSearchRef.current = cep;
    setIsLoading(true);
    setError(null);

    try {
      const result = await geocodeByCEP(cep);
      setCepResult(result);

      if (!result) {
        setError('CEP não encontrado');
      }
    } catch (err) {
      console.error('CEP search error:', err);
      setCepResult(null);
      setError('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change
  const handleInputChange = useCallback(
    (value: string) => {
      const detection = detectInputMode(value);
      setInputMode(detection.mode);

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (detection.mode === 'cep') {
        // Clear city suggestions in CEP mode
        setSuggestions([]);

        if (detection.isCepComplete) {
          // Debounce CEP search
          debounceRef.current = setTimeout(() => {
            searchCEP(detection.cleanValue);
          }, 300);
        } else {
          // Clear CEP result while typing
          setCepResult(null);
          lastCepSearchRef.current = '';
        }
      } else if (detection.mode === 'city') {
        // Clear CEP result in city mode
        setCepResult(null);
        lastCepSearchRef.current = '';

        // Debounce city search
        debounceRef.current = setTimeout(() => {
          const results = searchCities(cities, detection.cleanValue);
          setSuggestions(results);
        }, 150);
      } else {
        // Clear all results
        setSuggestions([]);
        setCepResult(null);
        lastCepSearchRef.current = '';
      }
    },
    [cities, searchCEP]
  );

  // Convert city suggestion to LocationSearchResult
  const selectCity = useCallback(
    (suggestion: CitySuggestion): LocationSearchResult => {
      return {
        type: 'city',
        city: suggestion.city,
        state: suggestion.state,
        formattedAddress: suggestion.displayText,
      };
    },
    []
  );

  // Clear all results
  const clearResults = useCallback(() => {
    setSuggestions([]);
    setCepResult(null);
    setInputMode('unknown');
    setError(null);
    lastCepSearchRef.current = '';
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    cepResult,
    isLoading,
    isLoadingCities,
    inputMode,
    error,
    handleInputChange,
    selectCity,
    clearResults,
    clearError,
  };
}
