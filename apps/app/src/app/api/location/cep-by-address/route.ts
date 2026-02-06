import { NextRequest, NextResponse } from 'next/server';

const VIACEP_API = 'https://viacep.com.br/ws';

interface ViaCEPSearchResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

// Normalize string for ViaCEP search (remove accents, special chars)
function normalizeForViaCep(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get('state');
  const city = searchParams.get('city');
  const street = searchParams.get('street');

  if (!state || !city || !street) {
    return NextResponse.json(
      { error: 'state, city e street são obrigatórios' },
      { status: 400 }
    );
  }

  if (state.length !== 2) {
    return NextResponse.json(
      { error: 'state deve ter 2 caracteres' },
      { status: 400 }
    );
  }

  try {
    const normalizedCity = normalizeForViaCep(city);
    const normalizedStreet = normalizeForViaCep(street);

    const url = `${VIACEP_API}/${state}/${encodeURIComponent(normalizedCity)}/${encodeURIComponent(normalizedStreet)}/json/`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Não foi possível buscar o CEP' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const result: ViaCEPSearchResult = data[0];
      return NextResponse.json({
        cep: result.cep?.replace('-', '') || null,
        street: result.logradouro || null,
        neighborhood: result.bairro || null,
        city: result.localidade || null,
        state: result.uf || null,
      });
    }

    return NextResponse.json({ cep: null });
  } catch (error) {
    console.error('ViaCEP search error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar CEP' },
      { status: 500 }
    );
  }
}
