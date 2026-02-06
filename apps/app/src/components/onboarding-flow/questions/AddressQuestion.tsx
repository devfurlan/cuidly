'use client';

import { useState } from 'react';
import { PiShieldCheckDuotone } from 'react-icons/pi';

import AddressSearchModal from '@/components/AddressSearchModal';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { Card } from '@/components/ui/shadcn/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/shadcn/field';
import { Input } from '@/components/ui/shadcn/input';
import { maskCEP } from '@/helpers/formatters';

interface PlaceDetails {
  streetName: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface AddressData {
  zipCode: string;
  streetName: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface AddressQuestionProps {
  value: AddressData | undefined;
  onChange: (value: AddressData) => void;
  errors?: Record<string, string>;
  userType?: 'family' | 'nanny';
}

export function AddressQuestion({
  value,
  onChange,
  errors,
  userType = 'family',
}: AddressQuestionProps) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [isAddressFromGoogle, setIsAddressFromGoogle] = useState(false);

  const data: AddressData = value || {
    zipCode: '',
    streetName: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  };

  function updateField(field: keyof AddressData, fieldValue: string) {
    onChange({ ...data, [field]: fieldValue });
  }

  async function handleCepChange(cep: string) {
    const masked = maskCEP(cep);
    updateField('zipCode', masked);

    // Desbloqueia os campos se estava preenchido pelo Google
    if (isAddressFromGoogle) {
      setIsAddressFromGoogle(false);
    }

    const cleanCep = masked.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsFetchingCep(true);
      try {
        const response = await fetch(`/api/location/cep/${cleanCep}`);
        if (response.ok) {
          const address = await response.json();
          onChange({
            ...data,
            zipCode: masked,
            streetName: address.street || '',
            neighborhood: address.neighborhood || '',
            city: address.city || '',
            state: address.state || '',
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setIsFetchingCep(false);
      }
    }
  }

  function handlePlaceSelected(place: PlaceDetails) {
    onChange({
      zipCode: place.zipCode ? maskCEP(place.zipCode) : '',
      streetName: place.streetName,
      number: place.number,
      complement: data.complement,
      neighborhood: place.neighborhood,
      city: place.city,
      state: place.state,
    });
    setIsAddressFromGoogle(true);
  }

  return (
    <div className="space-y-4">
      {/* Aviso de privacidade */}
      <Alert variant="success">
        <PiShieldCheckDuotone />
        <AlertDescription>
          Seu endereço nunca será compartilhado publicamente. Usamos apenas para
          calcular distâncias e{' '}
          {userType === 'nanny'
            ? 'mostrar sua localização aproximada para as famílias.'
            : 'encontrar babás próximas.'}
        </AlertDescription>
      </Alert>

      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* CEP */}
          <Field data-invalid={!!errors?.zipCode}>
            <div className="flex justify-between gap-4">
              <FieldLabel htmlFor="zipCode">CEP</FieldLabel>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="text-sm text-fuchsia-600 hover:text-fuchsia-700 hover:underline"
              >
                Não sei o CEP
              </button>
            </div>
            <div className="relative">
              <Input
                id="zipCode"
                value={data.zipCode}
                onChange={(e) => handleCepChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                className={isFetchingCep ? 'pr-10' : ''}
                aria-invalid={!!errors?.zipCode}
              />
              {isFetchingCep && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-500 border-t-transparent" />
                </div>
              )}
            </div>
            {errors?.zipCode && <FieldError>{errors.zipCode}</FieldError>}
          </Field>

          {/* Logradouro */}
          <Field data-invalid={!!errors?.streetName}>
            <FieldLabel htmlFor="streetName">Logradouro</FieldLabel>
            <Input
              id="streetName"
              value={data.streetName}
              onChange={(e) => updateField('streetName', e.target.value)}
              placeholder="Rua, Avenida, etc"
              className={isAddressFromGoogle ? 'bg-gray-50' : ''}
              readOnly={isAddressFromGoogle}
              aria-invalid={!!errors?.streetName}
            />
            {errors?.streetName && <FieldError>{errors.streetName}</FieldError>}
          </Field>

          {/* Número e Complemento */}
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="number" optional>
                Número
              </FieldLabel>
              <Input
                id="number"
                value={data.number}
                onChange={(e) => updateField('number', e.target.value)}
                placeholder="123"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="complement" optional>
                Complemento
              </FieldLabel>
              <Input
                id="complement"
                value={data.complement}
                onChange={(e) => updateField('complement', e.target.value)}
                placeholder="Apto 101, Bloco A"
              />
            </Field>
          </div>

          {/* Bairro */}
          <Field data-invalid={!!errors?.neighborhood}>
            <FieldLabel htmlFor="neighborhood">Bairro</FieldLabel>
            <Input
              id="neighborhood"
              value={data.neighborhood}
              onChange={(e) => updateField('neighborhood', e.target.value)}
              placeholder="Centro"
              className={isAddressFromGoogle ? 'bg-gray-50' : ''}
              readOnly={isAddressFromGoogle}
              aria-invalid={!!errors?.neighborhood}
            />
            {errors?.neighborhood && <FieldError>{errors.neighborhood}</FieldError>}
          </Field>

          {/* Cidade e Estado */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors?.city}>
              <FieldLabel htmlFor="city">Cidade</FieldLabel>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="São Paulo"
                className={isAddressFromGoogle ? 'bg-gray-50' : ''}
                readOnly={isAddressFromGoogle}
                aria-invalid={!!errors?.city}
              />
              {errors?.city && <FieldError>{errors.city}</FieldError>}
            </Field>
            <Field data-invalid={!!errors?.state}>
              <FieldLabel htmlFor="state">Estado</FieldLabel>
              <Input
                id="state"
                value={data.state}
                onChange={(e) => updateField('state', e.target.value)}
                placeholder="SP"
                maxLength={2}
                className={isAddressFromGoogle ? 'bg-gray-50' : ''}
                readOnly={isAddressFromGoogle}
                aria-invalid={!!errors?.state}
              />
              {errors?.state && <FieldError>{errors.state}</FieldError>}
            </Field>
          </div>
        </div>
      </Card>

      <AddressSearchModal
        open={isSearchModalOpen}
        onOpenChange={setIsSearchModalOpen}
        onPlaceSelected={handlePlaceSelected}
      />
    </div>
  );
}
