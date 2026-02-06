'use client';

/**
 * Share Profile Card Client Component
 * Allows nannies to share their profile link
 */

import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { PiShareNetwork } from 'react-icons/pi';
import { toast } from 'sonner';

interface ShareProfileCardProps {
  slug: string;
  city: string | null;
}

function generateCitySlug(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ShareProfileCard({ slug, city }: ShareProfileCardProps) {
  const getProfileUrl = () => {
    const citySlug = city ? generateCitySlug(city) : 'brasil';
    return `${window.location.origin}/baba/${citySlug}/${slug}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getProfileUrl());
      toast.success('Link copiado para a área de transferência!');
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const handleViewProfile = () => {
    window.open(getProfileUrl(), '_blank');
  };

  return (
    <Card className="mb-6 border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-purple-50 p-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-fuchsia-500 p-3">
            <PiShareNetwork size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Compartilhe seu perfil
            </h3>
            <p className="text-sm text-gray-600">
              Aumente sua visibilidade compartilhando nas redes sociais
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            Copiar Link
          </Button>
          <Button
            size="sm"
            className="bg-fuchsia-600 hover:bg-fuchsia-700"
            onClick={handleViewProfile}
          >
            Ver Perfil
          </Button>
        </div>
      </div>
    </Card>
  );
}
