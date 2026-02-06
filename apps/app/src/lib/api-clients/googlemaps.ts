/**
 * Google Maps API integration for geocoding
 */

import axios from 'axios';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

const googleMapsClient = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api',
  timeout: 10000,
});

/**
 * Geocode an address to get latitude and longitude
 * @param address - Full address string
 * @returns Geocode result with coordinates
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodeResult | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return null;
    }

    const response = await googleMapsClient.get('/geocode/json', {
      params: {
        address,
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK' || !response.data.results.length) {
      console.warn('Geocoding failed:', response.data.status);
      return null;
    }

    const result = response.data.results[0];
    const location = result.geometry.location;

    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Geocode a Brazilian address using structured data
 * @param address - Address components
 * @returns Geocode result with coordinates
 */
export async function geocodeBrazilianAddress({
  streetName,
  number,
  neighborhood,
  city,
  state,
  zipCode,
}: {
  streetName?: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
}): Promise<GeocodeResult | null> {
  const addressParts = [
    streetName && number ? `${streetName}, ${number}` : streetName,
    neighborhood,
    city,
    state,
    zipCode,
    'Brazil',
  ].filter(Boolean);

  const fullAddress = addressParts.join(', ');
  return geocodeAddress(fullAddress);
}
