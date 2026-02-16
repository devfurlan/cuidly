'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PiArrowRight,
  PiShieldCheck,
  PiStarFill,
  PiUsers,
} from 'react-icons/pi';
import { getExperienceYearsLabel } from '@/helpers/label-getters';

interface RelatedNanny {
  id: number;
  name: string;
  slug: string;
  photoUrl: string | null;
  age: number | null;
  experienceYears: number | null;
  city: string | null;
  isVerified: boolean;
  averageRating: number | null;
}

function generateCitySlug(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function RelatedNannyCard({ nanny }: { nanny: RelatedNanny }) {
  const citySlug = nanny.city ? generateCitySlug(nanny.city) : 'brasil';
  const profileUrl = `/baba/${citySlug}/${nanny.slug}`;
  const firstName = nanny.name.split(' ')[0];

  return (
    <Link
      href={profileUrl}
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {nanny.photoUrl ? (
          <Image
            src={nanny.photoUrl}
            alt={firstName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-fuchsia-400 to-purple-500">
            <span className="text-5xl font-bold text-white">
              {firstName.charAt(0)}
            </span>
          </div>
        )}

        {nanny.isVerified && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white shadow-md">
            <PiShieldCheck className="h-3 w-3" />
            Verificada
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <h3 className="text-base font-semibold">
            {firstName}
            {nanny.age && <span className="font-normal">, {nanny.age}</span>}
          </h3>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-white/90">
            {nanny.experienceYears !== null && nanny.experienceYears > 0 && (
              <span>{getExperienceYearsLabel(nanny.experienceYears)}</span>
            )}
            {nanny.averageRating !== null && (
              <span className="flex items-center gap-0.5">
                <PiStarFill className="h-3 w-3 text-yellow-400" />
                {nanny.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface RelatedNanniesSectionProps {
  currentNannyId: number;
  city: string | null;
}

export function RelatedNanniesSection({
  currentNannyId,
  city,
}: RelatedNanniesSectionProps) {
  const [nannies, setNannies] = useState<RelatedNanny[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedNannies() {
      try {
        const response = await fetch('/api/nannies/preview');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const filtered = data.nannies
              .filter((n: { id: number }) => n.id !== currentNannyId)
              .slice(0, 4);
            setNannies(filtered);
          }
        }
      } catch (error) {
        console.error('Error fetching related nannies:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRelatedNannies();
  }, [currentNannyId]);

  if (isLoading || nannies.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center gap-2 rounded-full border border-fuchsia-100 bg-fuchsia-50 px-4 py-2">
            <PiUsers className="h-5 w-5 text-fuchsia-600" />
            <span className="text-sm font-medium text-fuchsia-700">
              Outras Profissionais
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Outras Babás {city ? `em ${city}` : 'Disponíveis'}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Conheça outras babás verificadas que podem atender suas necessidades
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {nannies.map((nanny) => (
            <RelatedNannyCard key={nanny.id} nanny={nanny} />
          ))}
        </div>

        <div className="mt-10 text-center">
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
      </div>
    </section>
  );
}
