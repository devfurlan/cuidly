'use client';

import { PiCamera, PiSpinner, PiStar, PiStarFill, PiX } from 'react-icons/pi';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Label } from '@/components/ui/shadcn/label';

interface Category {
  key: string;
  label: string;
  description: string;
}

interface ReviewData {
  id: number;
  punctuality?: number | null;
  care?: number | null;
  communication?: number | null;
  reliability?: number | null;
  respect?: number | null;
  environment?: number | null;
  payment?: number | null;
  comment?: string | null;
  photos?: string[];
}

interface PhotoUpload {
  url: string;
  path: string;
}

const MAX_PHOTOS = 3;

interface ReviewFormProps {
  targetId: number;
  targetName: string;
  type: 'NANNY_TO_FAMILY' | 'FAMILY_TO_NANNY';
  jobId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  /** For editing existing reviews */
  editMode?: boolean;
  reviewData?: ReviewData;
}

const NANNY_CATEGORIES: Category[] = [
  { key: 'punctuality', label: 'Pontualidade', description: 'Chegou no horário combinado?' },
  { key: 'care', label: 'Cuidado', description: 'Foi atenciosa e carinhosa com as crianças?' },
  { key: 'communication', label: 'Comunicação', description: 'Se comunicou bem e respondeu rápido?' },
  { key: 'reliability', label: 'Confiabilidade', description: 'Cumpriu tudo que foi combinado?' },
];

const FAMILY_CATEGORIES: Category[] = [
  { key: 'communication', label: 'Comunicação', description: 'A família se comunicou bem?' },
  { key: 'respect', label: 'Respeito', description: 'A família foi respeitosa?' },
  { key: 'environment', label: 'Ambiente', description: 'O ambiente de trabalho foi adequado?' },
  { key: 'payment', label: 'Pagamento', description: 'O pagamento foi feito em dia?' },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
};

export default function ReviewForm({
  targetId,
  targetName,
  type,
  jobId,
  onSuccess,
  onCancel,
  editMode = false,
  reviewData,
}: ReviewFormProps) {
  const categories = type === 'FAMILY_TO_NANNY' ? NANNY_CATEGORIES : FAMILY_CATEGORIES;

  // Initialize ratings from reviewData if editing
  const getInitialRatings = () => {
    if (!editMode || !reviewData) return {};
    const initial: Record<string, number> = {};
    categories.forEach(cat => {
      const value = reviewData[cat.key as keyof ReviewData];
      if (typeof value === 'number') {
        initial[cat.key] = value;
      }
    });
    return initial;
  };

  const [ratings, setRatings] = useState<Record<string, number>>(getInitialRatings);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(editMode && reviewData?.comment ? reviewData.comment : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoUpload[]>(
    editMode && reviewData?.photos
      ? reviewData.photos.map(url => ({ url, path: '' }))
      : []
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRatingClick = (category: string, rating: number) => {
    setRatings({ ...ratings, [category]: rating });
  };

  const allCategoriesRated = categories.every(cat => ratings[cat.key] > 0);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      setError(`Máximo de ${MAX_PHOTOS} fotos permitidas`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);
    setError(null);

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/reviews/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setPhotos(prev => [...prev, { url: data.url, path: data.path }]);
        } else {
          setError(data.error || 'Erro ao fazer upload');
          break;
        }
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const photo = photos[index];

    // If photo has a path (newly uploaded), delete from storage
    if (photo.path) {
      try {
        await fetch(`/api/reviews/upload?path=${encodeURIComponent(photo.path)}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Error deleting photo:', err);
      }
    }

    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allCategoriesRated) {
      setError('Por favor, avalie todas as categorias');
      return;
    }

    setSubmitting(true);

    try {
      const url = editMode && reviewData ? `/api/reviews/${reviewData.id}` : '/api/reviews';
      const method = editMode ? 'PUT' : 'POST';

      const photoUrls = photos.map(p => p.url);

      const body = editMode
        ? {
            categories: ratings,
            comment: comment.trim() || null,
            photos: photoUrls,
          }
        : {
            targetId,
            type,
            categories: ratings,
            comment: comment.trim() || null,
            jobId,
            photos: photoUrls,
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess?.();
      } else {
        setError(data.error || 'Erro ao enviar avaliação');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editMode ? 'Editar Avaliação' : `Avaliar ${targetName}`}</CardTitle>
        <CardDescription>
          {editMode
            ? 'Você pode editar sua avaliação até que ela seja publicada.'
            : `Sua avaliação ficará privada até que ${targetName} também avalie você, ou após 14 dias.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {categories.map((category) => (
            <div key={category.key} className="border-b pb-6 last:border-b-0">
              <Label className="mb-2 block font-semibold">{category.label}</Label>
              <p className="text-sm text-muted-foreground mb-3">{category.description}</p>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(category.key, star)}
                    onMouseEnter={() => {
                      setHoveredCategory(category.key);
                      setHoveredRating(star);
                    }}
                    onMouseLeave={() => {
                      setHoveredCategory(null);
                      setHoveredRating(0);
                    }}
                    className="transition-transform hover:scale-110"
                  >
{(() => {
                      const isFilled = star <= (hoveredCategory === category.key ? hoveredRating : ratings[category.key] || 0);
                      const Icon = isFilled ? PiStarFill : PiStar;
                      return (
                        <Icon className={`w-8 h-8 ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`} />
                      );
                    })()}
                  </button>
                ))}
              </div>

              {ratings[category.key] > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {RATING_LABELS[ratings[category.key]]}
                </p>
              )}
            </div>
          ))}

          <div>
            <Label htmlFor="comment" className="mb-3 block">
              Comentário (opcional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Conte como foi sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
            />
          </div>

          {/* Photo Upload Section */}
          <div>
            <Label className="mb-3 block">
              Fotos (opcional - máximo {MAX_PHOTOS})
            </Label>

            {/* Photo Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <Image
                      src={photo.url}
                      alt={`Foto ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <PiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {photos.length < MAX_PHOTOS && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  multiple
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <PiSpinner className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <PiCamera className="w-4 h-4 mr-2" />
                      Adicionar foto
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG ou WebP. Máximo 5MB por foto.
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting || !allCategoriesRated}
              className="flex-1"
            >
              {submitting ? 'Enviando...' : editMode ? 'Salvar Alterações' : 'Enviar Avaliação'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
