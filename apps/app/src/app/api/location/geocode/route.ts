import { NextRequest, NextResponse } from 'next/server';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'Cuidly/1.0 (https://cuidly.com)';

interface NominatimSearchResponse {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReverseResponse {
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
 * GET /api/location/geocode?city=X&state=Y&street=Z
 * Forward geocoding: address -> coordinates
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const street = searchParams.get('street');

  if (!city || !state) {
    return NextResponse.json(
      { error: 'city and state are required' },
      { status: 400 }
    );
  }

  const query = street
    ? `${street}, ${city}, ${state}, Brazil`
    : `${city}, ${state}, Brazil`;

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      countrycodes: 'br',
    });

    const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Geocoding failed' },
        { status: 500 }
      );
    }

    const results: NominatimSearchResponse[] = await response.json();

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
      displayName: results[0].display_name,
    });
  } catch (error) {
    console.error('Nominatim geocode error:', error);
    return NextResponse.json(
      { error: 'Geocoding service unavailable' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/location/geocode
 * Reverse geocoding: coordinates -> address
 * Body: { lat: number, lng: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'lat and lng are required as numbers' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1',
    });

    const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Reverse geocoding failed' },
        { status: 500 }
      );
    }

    const data: NominatimReverseResponse = await response.json();

    const city =
      data.address.city ||
      data.address.town ||
      data.address.municipality ||
      null;

    const state = data.address.state || null;

    if (!city || !state) {
      return NextResponse.json(
        { error: 'Could not determine city/state from coordinates' },
        { status: 404 }
      );
    }

    // Extract UF from full state name
    const uf = extractUF(state);

    return NextResponse.json({
      city,
      state: uf,
      neighborhood: data.address.suburb || data.address.neighbourhood || null,
      street: data.address.road || null,
      displayName: data.display_name,
      lat,
      lng,
    });
  } catch (error) {
    console.error('Nominatim reverse geocode error:', error);
    return NextResponse.json(
      { error: 'Reverse geocoding service unavailable' },
      { status: 500 }
    );
  }
}

/**
 * Extract UF (2 letter state code) from full state name
 */
function extractUF(stateName: string): string {
  const stateMap: Record<string, string> = {
    acre: 'AC',
    alagoas: 'AL',
    amapa: 'AP',
    amapá: 'AP',
    amazonas: 'AM',
    bahia: 'BA',
    ceara: 'CE',
    ceará: 'CE',
    'distrito federal': 'DF',
    'espirito santo': 'ES',
    'espírito santo': 'ES',
    goias: 'GO',
    goiás: 'GO',
    maranhao: 'MA',
    maranhão: 'MA',
    'mato grosso': 'MT',
    'mato grosso do sul': 'MS',
    'minas gerais': 'MG',
    para: 'PA',
    pará: 'PA',
    paraiba: 'PB',
    paraíba: 'PB',
    parana: 'PR',
    paraná: 'PR',
    pernambuco: 'PE',
    piaui: 'PI',
    piauí: 'PI',
    'rio de janeiro': 'RJ',
    'rio grande do norte': 'RN',
    'rio grande do sul': 'RS',
    rondonia: 'RO',
    rondônia: 'RO',
    roraima: 'RR',
    'santa catarina': 'SC',
    'sao paulo': 'SP',
    'são paulo': 'SP',
    sergipe: 'SE',
    tocantins: 'TO',
  };

  const normalized = stateName.toLowerCase().trim();

  // If already a 2-letter code
  if (normalized.length === 2) {
    return normalized.toUpperCase();
  }

  return stateMap[normalized] || stateName.substring(0, 2).toUpperCase();
}
