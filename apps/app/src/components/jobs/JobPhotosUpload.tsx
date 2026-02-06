'use client';

import { useRef, useState } from 'react';
import { PiCamera, PiCircleNotch, PiImages, PiPlus, PiTrash, PiX } from 'react-icons/pi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/shadcn/button';

interface JobPhotosUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxPhotos?: number;
}

export function JobPhotosUpload({ value, onChange, maxPhotos = 5 }: JobPhotosUploadProps) {
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
        if (photos.length + newPhotoUrls.length >= maxPhotos) {
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
      event.target.value = '';
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const dataUrl = await readFileAsDataURL(file);

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
    onChange(newPhotos);
  };

  const handleRemoveAll = () => {
    onChange([]);
    setShowRemoveConfirm(false);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="flex flex-col gap-4">
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
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-6 text-gray-500 transition-colors hover:border-fuchsia-300 hover:text-fuchsia-600"
        >
          {isProcessing ? (
            <PiCircleNotch className="size-10 animate-spin" />
          ) : (
            <>
              <PiImages className="size-10" />
              <span className="text-center text-sm">
                Clique para adicionar fotos
                <br />
                <span className="text-xs text-gray-400">Máximo {maxPhotos} fotos</span>
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
            <span className="text-sm text-gray-600">Remover todas?</span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveAll}
            >
              Sim
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRemoveConfirm(false)}
            >
              Não
            </Button>
          </div>
        )}
      </div>

      {/* Counter */}
      {photos.length > 0 && (
        <p className="text-center text-xs text-gray-500">
          {photos.length} de {maxPhotos} fotos
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
