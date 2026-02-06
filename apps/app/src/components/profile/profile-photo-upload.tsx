'use client';

import { useRef, useState } from 'react';
import { PiCamera, PiCircleNotch, PiTrash, PiUser, PiXCircle } from 'react-icons/pi';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/shadcn/avatar';
import { Button } from '@/components/ui/shadcn/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/shadcn/alert-dialog';
import { ImageCropDialog } from './image-crop-dialog';

interface ValidationResult {
  isValid: boolean;
  issues: Array<{ type: string; severity: 'warning' | 'error'; message: string }>;
  suggestions: string[];
  faceDetected: boolean;
  qualityScore: number;
  summary: {
    status: 'approved' | 'rejected';
    message: string;
  };
}

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  userName?: string;
  onPhotoChange: (photoDataUrl: string | null) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  enableValidation?: boolean;
  /** Layout horizontal: avatar à esquerda, botão e texto à direita */
  horizontal?: boolean;
}

const sizeClasses = {
  sm: 'size-16',
  md: 'size-24',
  lg: 'size-32',
};

export function ProfilePhotoUpload({
  currentPhotoUrl,
  userName,
  onPhotoChange,
  size = 'lg',
  disabled = false,
  enableValidation = true,
  horizontal = false,
}: ProfilePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const getUserInitials = (name: string | undefined | null): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida (JPEG, PNG ou WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 10MB');
      return;
    }

    // Read file and open crop dialog
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);
      setIsCropDialogOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const validatePhoto = async (photoDataUrl: string): Promise<ValidationResult | null> => {
    try {
      const response = await fetch('/api/profile/photo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoDataUrl }),
      });

      if (!response.ok) {
        console.error('Validation API error');
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Error validating photo:', error);
      return null;
    }
  };

  const handleCrop = async (croppedImage: string) => {
    if (enableValidation) {
      // Validate before uploading
      setIsValidating(true);

      const result = await validatePhoto(croppedImage);
      setValidationResult(result);
      setIsValidating(false);

      // Only proceed if approved
      if (result && result.summary.status !== 'approved') {
        // Don't proceed with upload, show rejection
        return;
      }
      // If validation failed (null result), proceed anyway
    }

    // Proceed with upload
    await uploadPhoto(croppedImage);
  };

  const uploadPhoto = async (croppedImage: string) => {
    setIsUploading(true);
    try {
      await onPhotoChange(croppedImage);
      setPreviewUrl(croppedImage);
      setValidationResult(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao atualizar foto. Tente novamente.');
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
    }
  };

  const handleRetryPhoto = () => {
    setValidationResult(null);
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async () => {
    setShowRemoveDialog(false);
    setIsUploading(true);
    try {
      await onPhotoChange(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Erro ao remover foto. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseCropDialog = () => {
    setIsCropDialogOpen(false);
    setSelectedImage(null);
  };

  // Layout horizontal (avatar à esquerda, botões e texto à direita)
  if (horizontal) {
    return (
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar className={`${sizeClasses[size]} border-2 border-gray-200`}>
            <AvatarImage src={previewUrl || undefined} alt={userName || 'Foto de perfil'} />
            <AvatarFallback className="bg-fuchsia-100 text-fuchsia-700 text-2xl">
              {userName ? getUserInitials(userName) : <PiUser className="size-8" />}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Botões e texto */}
        <div className="flex flex-col gap-2">
          {/* Validation in progress */}
          {isValidating && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <PiCircleNotch className="size-4 animate-spin" />
              <span>Verificando foto...</span>
            </div>
          )}

          {/* Validation result feedback - show rejection message */}
          {validationResult && !isValidating && validationResult.summary.status === 'rejected' && (
            <div className="max-w-xs">
              <div className="flex items-start gap-2 text-sm text-red-600">
                <PiXCircle className="mt-0.5 size-4 shrink-0" />
                <span>{validationResult.summary.message}</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRetryPhoto}
                className="mt-2"
              >
                Escolher outra foto
              </Button>
            </div>
          )}

          {/* Action buttons */}
          {!disabled && !isValidating && !validationResult && (
            <>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <PiCircleNotch className="mr-2 size-4 animate-spin" />
                  ) : null}
                  {previewUrl ? 'Alterar foto' : 'Adicionar foto'}
                </Button>

                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRemoveDialog(true)}
                    disabled={isUploading}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <PiTrash className="size-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">JPG, PNG ou GIF. Máximo 5MB.</p>
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Crop dialog */}
        {selectedImage && (
          <ImageCropDialog
            image={selectedImage}
            isOpen={isCropDialogOpen}
            onClose={handleCloseCropDialog}
            onCrop={handleCrop}
            aspectRatio={1}
            cropShape="round"
            title="Ajustar foto de perfil"
          />
        )}

        {/* Remove confirmation dialog */}
        <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover foto de perfil</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover sua foto de perfil? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemovePhoto}
                className="bg-red-600 hover:bg-red-700"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Layout vertical (padrão)
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar with photo */}
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-4 border-white shadow-lg`}>
          <AvatarImage src={previewUrl || undefined} alt={userName || 'Foto de perfil'} />
          <AvatarFallback className="bg-fuchsia-100 text-fuchsia-700 text-2xl">
            {userName ? getUserInitials(userName) : <PiUser className="size-8" />}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay button */}
        {!disabled && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute bottom-0 right-0 rounded-full bg-fuchsia-500 p-2 text-white shadow-lg transition-colors hover:bg-fuchsia-600 disabled:opacity-50"
            title="Alterar foto"
          >
            {isUploading ? (
              <PiCircleNotch className="size-4 animate-spin" />
            ) : (
              <PiCamera className="size-4" />
            )}
          </button>
        )}
      </div>

      {/* Validation in progress */}
      {isValidating && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <PiCircleNotch className="size-4 animate-spin" />
          <span>Verificando foto...</span>
        </div>
      )}

      {/* Validation result feedback - show rejection message */}
      {validationResult && !isValidating && validationResult.summary.status === 'rejected' && (
        <div className="max-w-sm rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <PiXCircle className="mt-0.5 size-4 shrink-0" />
            <span>{validationResult.summary.message}</span>
          </div>

          <div className="mt-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleRetryPhoto}
              className="w-full"
            >
              Escolher outra foto
            </Button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!disabled && !isValidating && !validationResult && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <PiCamera className="mr-2 size-4" />
            {previewUrl ? 'Alterar foto' : 'Adicionar foto'}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRemoveDialog(true)}
              disabled={isUploading}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <PiTrash className="mr-2 size-4" />
              Remover
            </Button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Crop dialog */}
      {selectedImage && (
        <ImageCropDialog
          image={selectedImage}
          isOpen={isCropDialogOpen}
          onClose={handleCloseCropDialog}
          onCrop={handleCrop}
          aspectRatio={1}
          cropShape="round"
          title="Ajustar foto de perfil"
        />
      )}

      {/* Remove confirmation dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover foto de perfil</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover sua foto de perfil? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemovePhoto}
              className="bg-red-600 hover:bg-red-700"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
