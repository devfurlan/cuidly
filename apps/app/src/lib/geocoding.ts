/**
 * Geocoding utilities using internal API routes (proxy to avoid CORS)
 */

import type { LocationSearchResult } from '@/types/location';

interface CEPResponse {
  source: string;
  cep: string;
  city: string;
  state: string;
  neighborhood: string | null;
  street: string | null;
  lat: number | null;
  lng: number | null;
  error?: string;
}

interface GeocodeResponse {
  lat: number;
  lng: number;
  displayName: string;
  error?: string;
}

interface ReverseGeocodeResponse {
  city: string;
  state: string;
  neighborhood: string | null;
  street: string | null;
  displayName: string;
  lat: number;
  lng: number;
  error?: string;
}

/**
 * Geocode an address using internal API (Nominatim proxy)
 */
export async function geocodeWithNominatim(
  city: string,
  state: string,
  street?: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const params = new URLSearchParams({ city, state });
    if (street) {
      params.set('street', street);
    }

    const response = await fetch(`/api/location/geocode?${params}`);

    if (!response.ok) {
      return null;
    }

    const data: GeocodeResponse = await response.json();

    if (data.error) {
      return null;
    }

    return {
      lat: data.lat,
      lng: data.lng,
    };
  } catch (error) {
    console.error('Geocode error:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get city/state
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<LocationSearchResult | null> {
  try {
    const response = await fetch('/api/location/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });

    if (!response.ok) {
      return null;
    }

    const data: ReverseGeocodeResponse = await response.json();

    if (data.error) {
      return null;
    }

    return {
      type: 'geolocation',
      city: data.city,
      state: data.state,
      neighborhood: data.neighborhood || undefined,
      street: data.street || undefined,
      lat,
      lng,
      formattedAddress: formatReverseGeocodeAddress(data),
    };
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
}

/**
 * Format address from reverse geocode response
 */
function formatReverseGeocodeAddress(data: ReverseGeocodeResponse): string {
  const parts: string[] = [];

  if (data.street) {
    parts.push(data.street);
  }

  if (data.neighborhood) {
    parts.push(data.neighborhood);
  }

  parts.push(`${data.city} - ${data.state}`);

  return parts.join(', ');
}

/**
 * Geocode a CEP and return location data with coordinates
 */
export async function geocodeByCEP(
  cep: string
): Promise<LocationSearchResult | null> {
  const cleanCEP = cep.replace(/\D/g, '');

  if (cleanCEP.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`/api/location/cep/${cleanCEP}`);

    if (!response.ok) {
      return null;
    }

    const data: CEPResponse = await response.json();

    if (data.error) {
      return null;
    }

    const result: LocationSearchResult = {
      type: 'cep',
      city: data.city,
      state: data.state,
      neighborhood: data.neighborhood || undefined,
      street: data.street || undefined,
      formattedAddress: formatCEPAddress(data),
    };

    // Use coordinates if available from BrasilAPI
    if (data.lat !== null && data.lng !== null) {
      result.lat = data.lat;
      result.lng = data.lng;
    } else {
      // Try to get coordinates via geocoding
      const coords = await geocodeWithNominatim(
        data.city,
        data.state,
        data.street || undefined
      );

      if (coords) {
        result.lat = coords.lat;
        result.lng = coords.lng;
      }
    }

    return result;
  } catch (error) {
    console.error('CEP lookup error:', error);
    return null;
  }
}

/**
 * Format address from CEP response
 */
function formatCEPAddress(data: CEPResponse): string {
  const parts: string[] = [];

  if (data.street) {
    parts.push(data.street);
  }

  if (data.neighborhood) {
    parts.push(data.neighborhood);
  }

  parts.push(`${data.city} - ${data.state}`);

  return parts.join(', ');
}
