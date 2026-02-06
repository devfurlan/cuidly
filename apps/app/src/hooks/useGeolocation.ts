'use client';

import { reverseGeocode } from '@/lib/geocoding';
import type { LocationSearchResult } from '@/types/location';
import { useCallback, useState } from 'react';

interface UseGeolocationReturn {
  getCurrentLocation: () => Promise<LocationSearchResult | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Get user-friendly error message for geolocation errors
 */
function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Permissão de localização negada. Por favor, permita o acesso à localização nas configurações do navegador.';
    case error.POSITION_UNAVAILABLE:
      return 'Localização indisponível. Verifique se o GPS está ativado.';
    case error.TIMEOUT:
      return 'Tempo limite excedido ao obter localização. Tente novamente.';
    default:
      return 'Erro ao obter localização. Tente novamente.';
  }
}

/**
 * Hook for getting user's current location via browser geolocation API
 */
export function useGeolocation(): UseGeolocationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getCurrentLocation =
    useCallback(async (): Promise<LocationSearchResult | null> => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setError('Geolocalização não é suportada pelo seu navegador.');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Get position from browser
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false, // Faster, less accurate
              timeout: 15000, // 15 seconds timeout
              maximumAge: 300000, // Cache position for 5 minutes
            });
          }
        );

        const { latitude, longitude } = position.coords;

        // Reverse geocode to get city/state
        const result = await reverseGeocode(latitude, longitude);

        if (!result) {
          setError('Não foi possível identificar sua localização.');
          return null;
        }

        return result;
      } catch (err) {
        if (err instanceof GeolocationPositionError) {
          setError(getGeolocationErrorMessage(err));
        } else {
          setError('Erro ao obter localização. Tente novamente.');
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    }, []);

  return {
    getCurrentLocation,
    isLoading,
    error,
    clearError,
  };
}
