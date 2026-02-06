'use client';

import {
  PiBriefcase,
  PiCurrencyCircleDollar,
  PiHeart,
  PiMapPin,
} from 'react-icons/pi';

import { FavoriteButton } from '@/components/FavoriteButton';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/shadcn/avatar';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { getExperienceYearsLabel } from '@/helpers/label-getters';
import { useApiError } from '@/hooks/useApiError';
import { getNannyProfileUrl } from '@/utils/slug';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Favorite {
  id: number;
  nannyId: number;
  createdAt: string;
  nanny: {
    id: number;
    name: string;
    slug: string;
    photoUrl: string | null;
    experienceYears: number | null;
    hourlyRate: string | null;
    address: {
      city: string;
      state: string;
    } | null;
  };
}

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPaidPlan, setHasPaidPlan] = useState(true);
  const { showError } = useApiError();

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');

      if (response.status === 403) {
        setHasPaidPlan(false);
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (nannyId: number, isFavorite: boolean) => {
    if (!isFavorite) {
      setFavorites((prev) => prev.filter((f) => f.nanny.id !== nannyId));
    }
  };

  if (!hasPaidPlan) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <PiHeart className="mb-4 h-16 w-16 text-gray-300" />
        <h1 className="mb-2 text-2xl font-bold">Funcionalidade Plus</h1>
        <p className="mb-6 max-w-md text-muted-foreground">
          Assine um plano para favoritar babás e acessá-las rapidamente.
        </p>
        <Button asChild>
          <Link href="/app/assinatura">Ver Planos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Minhas Favoritas</h1>
        <p className="text-muted-foreground">
          {loading
            ? 'Carregando...'
            : `${favorites.length} ${favorites.length === 1 ? 'baba favoritada' : 'babas favoritadas'}`}
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      ) : favorites.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <PiHeart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h2 className="mb-2 text-xl font-semibold">
              Nenhuma babá favoritada
            </h2>
            <p className="mb-6 text-muted-foreground">
              Favorite babás para acessá-las rapidamente aqui.
            </p>
            <Button asChild>
              <Link href="/app/babas">Buscar Babás</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => {
            const nanny = favorite.nanny;

            return (
              <Card
                key={favorite.id}
                className="overflow-hidden transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={nanny.photoUrl || undefined} />
                        <AvatarFallback>
                          {nanny.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{nanny.name}</h3>
                        {nanny.address && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <PiMapPin className="h-4 w-4" />
                            {nanny.address.city}, {nanny.address.state}
                          </div>
                        )}
                      </div>
                    </div>
                    <FavoriteButton
                      nannyId={nanny.id}
                      initialIsFavorite={true}
                      onToggle={(isFavorite) =>
                        handleFavoriteToggle(nanny.id, isFavorite)
                      }
                      size="sm"
                    />
                  </div>

                  <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                    {nanny.experienceYears && (
                      <div className="flex items-center gap-1">
                        <PiBriefcase className="h-4 w-4" />
                        {getExperienceYearsLabel(nanny.experienceYears)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      {nanny.hourlyRate && (
                        <>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <PiCurrencyCircleDollar className="h-4 w-4" />A
                            partir de
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            R$ {parseFloat(nanny.hourlyRate).toFixed(2)}/hora
                          </div>
                        </>
                      )}
                    </div>
                    <Button asChild size="sm">
                      <Link
                        href={getNannyProfileUrl(
                          nanny.slug,
                          nanny.address?.city,
                        )}
                      >
                        Ver Perfil
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
