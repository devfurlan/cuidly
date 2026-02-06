'use client';

import { reverseGeocode } from '@/lib/geocoding';
import type { LocationSearchResult } from '@/types/location';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

interface GeolocationContextType {
  userLocation: { lat: number; lng: number } | null;
  locationResult: LocationSearchResult | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(
  undefined
);

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationResult, setLocationResult] =
    useState<LocationSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false);

  const requestLocation = useCallback(async () => {
    if (
      typeof window === 'undefined' ||
      !('geolocation' in navigator) ||
      isLoading
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000, // Cache for 5 minutes
          });
        }
      );

      const { latitude, longitude } = position.coords;

      setUserLocation({ lat: latitude, lng: longitude });

      // Reverse geocode to get city/state
      const result = await reverseGeocode(latitude, longitude);

      if (result) {
        setLocationResult(result);
      }
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Permissão negada');
        } else {
          setError('Erro ao obter localização');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Request location on mount
  useEffect(() => {
    if (!hasRequested) {
      setHasRequested(true);
      requestLocation();
    }
  }, [hasRequested, requestLocation]);

  return (
    <GeolocationContext.Provider
      value={{
        userLocation,
        locationResult,
        isLoading,
        error,
        requestLocation,
      }}
    >
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocationContext() {
  const context = useContext(GeolocationContext);
  if (context === undefined) {
    throw new Error(
      'useGeolocationContext must be used within a GeolocationProvider'
    );
  }
  return context;
}
