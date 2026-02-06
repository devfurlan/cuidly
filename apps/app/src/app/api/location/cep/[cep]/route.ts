import { NextResponse } from 'next/server';

const BRASIL_API_CEP = 'https://brasilapi.com.br/api/cep/v2';
const VIACEP_API = 'https://viacep.com.br/ws';

interface BrasilAPICEPResponse {
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

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cep: string }> }
) {
  const { cep } = await params;
  const cleanCEP = cep.replace(/\D/g, '');

  if (cleanCEP.length !== 8) {
    return NextResponse.json(
      { error: 'CEP deve ter 8 dígitos' },
      { status: 400 }
    );
  }

  // Try BrasilAPI first (may include coordinates)
  try {
    const brasilResponse = await fetch(`${BRASIL_API_CEP}/${cleanCEP}`, {
      headers: { Accept: 'application/json' },
    });

    if (brasilResponse.ok) {
      const data: BrasilAPICEPResponse = await brasilResponse.json();

      return NextResponse.json({
        source: 'brasilapi',
        cep: data.cep,
        city: data.city,
        state: data.state,
        neighborhood: data.neighborhood || null,
        street: data.street || null,
        lat: data.location?.coordinates?.latitude
          ? parseFloat(data.location.coordinates.latitude)
          : null,
        lng: data.location?.coordinates?.longitude
          ? parseFloat(data.location.coordinates.longitude)
          : null,
      });
    }
  } catch (error) {
    console.error('BrasilAPI error:', error);
  }

  // Fallback to ViaCEP
  try {
    const viacepResponse = await fetch(`${VIACEP_API}/${cleanCEP}/json/`, {
      headers: { Accept: 'application/json' },
    });

    if (viacepResponse.ok) {
      const data: ViaCEPResponse = await viacepResponse.json();

      if (data.erro) {
        return NextResponse.json(
          { error: 'CEP não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        source: 'viacep',
        cep: data.cep,
        city: data.localidade,
        state: data.uf,
        neighborhood: data.bairro || null,
        street: data.logradouro || null,
        lat: null,
        lng: null,
      });
    }
  } catch (error) {
    console.error('ViaCEP error:', error);
  }

  return NextResponse.json(
    { error: 'Não foi possível buscar o CEP' },
    { status: 500 }
  );
}
