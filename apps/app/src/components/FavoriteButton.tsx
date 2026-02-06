'use client';

import { PiHeart, PiHeartFill } from 'react-icons/pi';

import { useState } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { useApiError } from '@/hooks/useApiError';
import { cn } from '@cuidly/shared';

interface FavoriteButtonProps {
  nannyId: number;
  initialIsFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function FavoriteButton({
  nannyId,
  initialIsFavorite = false,
  onToggle,
  size = 'default',
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError, showWarning } = useApiError();

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      if (isFavorite) {
        // Remover dos favoritos
        const response = await fetch(`/api/favorites/${nannyId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao remover favorito');
        }

        setIsFavorite(false);
        showSuccess('Babá removida dos favoritos');
        onToggle?.(false);
      } else {
        // Adicionar aos favoritos
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nannyId }),
        });

        if (!response.ok) {
          const data = await response.json();

          if (response.status === 403) {
            showWarning('Assine um plano para favoritar babás');
            return;
          }

          throw new Error(data.error || 'Erro ao adicionar favorito');
        }

        setIsFavorite(true);
        showSuccess('Babá adicionada aos favoritos');
        onToggle?.(true);
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClass =
    size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : 'icon';

  return (
    <Button
      variant={isFavorite ? 'default' : 'outline'}
      size={sizeClass}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        isFavorite && 'bg-red-500 hover:bg-red-600 border-red-500',
        className
      )}
      title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
{isFavorite ? (
        <PiHeartFill size={iconSize} className="text-white" />
      ) : (
        <PiHeart size={iconSize} />
      )}
    </Button>
  );
}
