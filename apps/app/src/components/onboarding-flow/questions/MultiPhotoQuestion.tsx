'use client';

import { useRef, useState } from 'react';
import { PiCamera, PiCircleNotch, PiImages, PiPlus, PiTrash, PiX } from 'react-icons/pi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/shadcn/button';
import type { FlowQuestion } from '../FlowProvider';

interface MultiPhotoQuestionProps {
  question: FlowQuestion;
  value?: string[] | null;
  onChange: (value: string[] | null) => void;
}

const MAX_PHOTOS = 5;

export function MultiPhotoQuestion({ question, value, onChange }: MultiPhotoQuestionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const photos = value || [];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    try {
      const newPhotoUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error('Algumas fotos excedem o limite de 10MB');
          continue;
        }

        // Check max photos limit
        if (photos.length + newPhotoUrls.length >= MAX_PHOTOS) {
          break;
        }

        // Upload photo to server and get URL back
        try {
          const photoUrl = await uploadPhoto(file);
          newPhotoUrls.push(photoUrl);
        } catch (error) {
          console.error('Error uploading photo:', error);
          const errorMsg = error instanceof Error ? error.message : 'Erro ao enviar foto';
          toast.error(errorMsg);
          // Continue trying other photos
        }
      }

      if (newPhotoUrls.length > 0) {
        onChange([...photos, ...newPhotoUrls]);
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro ao enviar fotos';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
      // Reset input so same file can be selected again
      event.target.value = '';
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    // Read file as data URL for upload
    const dataUrl = await readFileAsDataURL(file);

    // Upload to job photos endpoint
    const response = await fetch('/api/families/job-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoDataUrl: dataUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload');
    }

    const result = await response.json();
    return result.url;
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos.length > 0 ? newPhotos : null);
  };

  const handleRemoveAll = () => {
    onChange(null);
    setShowRemoveConfirm(false);
  };

  const canAddMore = photos.length < MAX_PHOTOS;

  return (
    <div className="flex flex-col gap-6">
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-lg">
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                title="Remover foto"
              >
                <PiX className="size-4" />
              </button>
            </div>
          ))}

          {/* Add more button in grid */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-fuchsia-300 hover:text-fuchsia-500"
            >
              {isProcessing ? (
                <PiCircleNotch className="size-8 animate-spin" />
              ) : (
                <PiPlus className="size-8" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 text-gray-500 transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600"
        >
          {isProcessing ? (
            <PiCircleNotch className="size-12 animate-spin" />
          ) : (
            <>
              <PiImages className="size-12" />
              <span className="text-center">
                Clique para adicionar fotos
                <br />
                <span className="text-sm text-gray-400">Máximo {MAX_PHOTOS} fotos</span>
              </span>
            </>
          )}
        </button>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {canAddMore && photos.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <PiCamera className="mr-2 size-4" />
            Adicionar mais
          </Button>
        )}

        {photos.length > 0 && !showRemoveConfirm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowRemoveConfirm(true)}
            disabled={isProcessing}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <PiTrash className="mr-2 size-4" />
            Remover todas
          </Button>
        )}

        {showRemoveConfirm && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Remover todas as fotos?</span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveAll}
            >
              Sim, remover
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRemoveConfirm(false)}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Counter */}
      {photos.length > 0 && (
        <p className="text-center text-sm text-gray-500">
          {photos.length} de {MAX_PHOTOS} fotos
        </p>
      )}

      {/* Skip hint for optional */}
      {!question.required && photos.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          Você pode pular esta etapa e adicionar as fotos depois
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isProcessing}
      />
    </div>
  );
}
