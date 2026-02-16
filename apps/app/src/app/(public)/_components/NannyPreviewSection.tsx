'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PiArrowRight, PiSpinner, PiUsers } from 'react-icons/pi';
import { useGeolocationContext } from '@/contexts/GeolocationContext';
import NannyPreviewCard from './NannyPreviewCard';

import type { NannySeal } from '@/lib/seals';

interface NannyPreview {
  id: number;
  name: string;
  slug: string;
  photoUrl: string | null;
  age: number | null;
  experienceYears: number | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  seal: NannySeal;
  averageRating: number | null;
  reviewCount: number;
  specialties: string[] | null;
  availability: {
    jobTypes: string[];
    schedulePreference: string | null;
  } | null;
}

export default function NannyPreviewSection() {
  const [nannies, setNannies] = useState<NannyPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userLocation } = useGeolocationContext();

  useEffect(() => {
    async function fetchNannies() {
      try {
        const response = await fetch('/api/nannies/preview');

        if (!response.ok) {
          console.error('API response not ok:', response.status, response.statusText);
          setError('Erro ao carregar babás');
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Invalid content type:', contentType);
          setError('Erro ao carregar babás');
          return;
        }

        const data = await response.json();

        if (data.success) {
          setNannies(data.nannies);
        } else {
          setError('Erro ao carregar babás');
        }
      } catch (err) {
        console.error('Error fetching nannies:', err);
        setError('Erro ao carregar babás');
      } finally {
        setIsLoading(false);
      }
    }

    fetchNannies();
  }, []);

  // Don't render section if no nannies are available
  if (!isLoading && nannies.length === 0) {
    return null;
  }

  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center gap-2 rounded-full border border-fuchsia-100 bg-fuchsia-50 px-4 py-2">
            <PiUsers className="h-5 w-5 text-fuchsia-600" />
            <span className="text-sm font-medium text-fuchsia-700">
              Profissionais Verificadas
            </span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Conheça Algumas de Nossas{' '}
            <span className="text-fuchsia-600">Babás Verificadas</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Centenas de babás qualificadas esperando por você. Todas passam por
            processo de verificação de identidade e antecedentes.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <PiSpinner className="h-8 w-8 animate-spin text-fuchsia-600" />
              <p className="text-sm text-gray-500">Carregando babás...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Nannies Grid */}
        {!isLoading && !error && nannies.length > 0 && (
          <>
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {nannies.slice(0, 6).map((nanny) => (
                <NannyPreviewCard
                  key={nanny.id}
                  nanny={nanny}
                  userLocation={userLocation}
                />
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-12 text-center">
              <Link
                href="/cadastro?callbackUrl=/app/babas"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-fuchsia-700 hover:shadow-xl"
              >
                Ver Todas as Babás
                <PiArrowRight className="h-5 w-5" />
              </Link>
              <p className="mt-3 text-sm text-gray-500">
                Cadastre-se gratuitamente para ver perfis completos
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
