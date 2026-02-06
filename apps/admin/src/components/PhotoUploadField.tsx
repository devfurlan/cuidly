'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadSimpleIcon } from '@phosphor-icons/react';
import { validateImageType } from '@/utils/validateFileType';
import getInitials from '@/utils/getInitials';
import PhotoCropModal from '@/components/PhotoCropModal';
import { toast } from '@/hooks/useToast';
import { publicPhotoUrl } from '@/constants/publicFilesUrl';

type PhotoUploadFieldProps = {
  imageUrl: string;
  onImageChange: (imageUrl: string) => void;
  name: string;
  disabled?: boolean;
};

export function PhotoUploadField({
  imageUrl,
  onImageChange,
  name,
  disabled = false,
}: PhotoUploadFieldProps) {
  const [isCropping, setIsCropping] = useState(false);
  const [rawImage, setRawImage] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!validateImageType(file)) {
        toast({
          variant: 'destructive',
          title: 'Arquivo inválido',
          description: 'Por favor, envie uma imagem válida (JPEG, PNG ou GIF).',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setRawImage(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDelete() {
    onImageChange('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }

  // Convert relative path to full URL for display, keep blob/data URLs as-is
  const displayUrl = imageUrl && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')
    ? publicPhotoUrl(imageUrl, 64, 64)
    : imageUrl;

  return (
    <>
      <div className="flex gap-4">
        <Avatar className="size-16 rounded-lg">
          <AvatarImage
            src={displayUrl}
            alt={`Foto de ${name}`}
          />
          <AvatarFallback className="rounded-full bg-fuchsia-200 text-base text-fuchsia-600">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleImageChange}
            className="hidden"
            hidden
            disabled={disabled}
          />
          <Button
            type="button"
            variant={'secondary'}
            size={'sm'}
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
          >
            <UploadSimpleIcon className="size-3!" />
            Selecionar foto
          </Button>
          <Button
            type="button"
            variant={'destructive'}
            size={'sm'}
            onClick={handleDelete}
            disabled={!imageUrl || disabled}
          >
            Deletar
          </Button>
        </div>
      </div>

      <PhotoCropModal
        image={rawImage}
        isOpen={isCropping}
        onClose={() => setIsCropping(false)}
        onCrop={(croppedImage: string) => {
          onImageChange(croppedImage);
          setIsCropping(false);
        }}
      />
    </>
  );
}
