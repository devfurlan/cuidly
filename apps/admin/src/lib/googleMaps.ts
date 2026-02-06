import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(
  address: string,
): Promise<Coordinates | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address, key: GOOGLE_MAPS_API_KEY },
    });
    const result = response.data.results?.[0];
    if (!result) return null;
    return {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}
