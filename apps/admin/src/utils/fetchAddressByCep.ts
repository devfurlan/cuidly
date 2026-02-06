export interface CepAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export async function fetchAddressByCep(cep: string): Promise<CepAddress | null> {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return {
      street: data.street,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
    };
  } catch (error) {
    console.error('Error fetching address data:', error);
    return null;
  }
}
