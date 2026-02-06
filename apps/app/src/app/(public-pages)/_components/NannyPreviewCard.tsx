'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  PiMapPin,
  PiStarFill,
} from 'react-icons/pi';
import { getExperienceYearsLabel } from '@/helpers/label-getters';
import type { NannySeal } from '@/lib/seals';
import { SealBadge } from '@/components/seals';

interface NannyPreviewCardProps {
  nanny: {
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
  };
  userLocation?: { lat: number; lng: number } | null;
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  if (km < 10) {
    return `${km.toFixed(1)}km`;
  }
  return `${Math.round(km)}km`;
}

function slugifyCity(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start/end
}

export default function NannyPreviewCard({ nanny, userLocation }: NannyPreviewCardProps) {
  const citySlug = nanny.city ? slugifyCity(nanny.city) : 'brasil';
  const profileUrl = `/baba/${citySlug}/${nanny.slug}`;
  const firstName = nanny.name.split(' ')[0];

  const distance =
    userLocation && nanny.latitude && nanny.longitude
      ? calculateDistance(
          userLocation.lat,
          userLocation.lng,
          nanny.latitude,
          nanny.longitude
        )
      : null;

  return (
    <Link
      href={profileUrl}
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-lg"
    >
      {/* Photo */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {nanny.photoUrl ? (
          <Image
            src={nanny.photoUrl}
            alt={firstName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-fuchsia-400 to-purple-500">
            <span className="text-6xl font-bold text-white">
              {firstName.charAt(0)}
            </span>
          </div>
        )}

        {/* Seal Badge */}
        {nanny.seal && (
          <div className="absolute top-3 left-3">
            <SealBadge seal={nanny.seal} variant="card" />
          </div>
        )}

        {/* Distance Badge */}
        {distance !== null && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-md backdrop-blur-sm">
            <PiMapPin className="h-3.5 w-3.5 text-fuchsia-600" />
            {formatDistance(distance)}
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Info overlay on photo */}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="text-lg font-semibold">
            {firstName}
            {nanny.age && <span className="font-normal">, {nanny.age}</span>}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/90">
            {nanny.experienceYears !== null && nanny.experienceYears > 0 && (
              <span>
                {getExperienceYearsLabel(nanny.experienceYears)}
              </span>
            )}

            {nanny.averageRating !== null && (
              <span className="flex items-center gap-1">
                <PiStarFill className="h-4 w-4 text-yellow-400" />
                {nanny.averageRating.toFixed(1)}/5
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
