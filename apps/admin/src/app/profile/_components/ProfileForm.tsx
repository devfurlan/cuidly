'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { UpdateProfileSchema, type UpdateProfile } from '@/schemas/profileSchemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/useToast';
import { PhotoUploadField } from '@/components/PhotoUploadField';
import { publicFilesUrl } from '@/constants/publicFilesUrl';
import { convertBlobUrlToFile } from '@/utils/convertBlobUrlToFile';
import { uploadPublicImage, deleteFile } from '@/lib/supabase/storage/client';

type ProfileFormProps = {
  defaultValues: UpdateProfile & { email: string };
};

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Keep photoUrl as relative path for consistency
  const [photoUrl, setPhotoUrl] = useState(defaultValues.photoUrl || '');
  const [oldPhotoUrl] = useState(defaultValues.photoUrl);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfile>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: defaultValues.name,
      photoUrl: defaultValues.photoUrl,
    },
  });

  const onSubmit = async (data: UpdateProfile) => {
    try {
      setIsSubmitting(true);

      let finalPhotoUrl = defaultValues.photoUrl;

      // Se a foto foi alterada e é uma blob/data URL, fazer upload
      if (photoUrl && (photoUrl.startsWith('blob:') || photoUrl.startsWith('data:'))) {
        // Deletar foto antiga se existir
        if (oldPhotoUrl) {
          await deleteFile(publicFilesUrl(oldPhotoUrl));
        }

        // Fazer upload da nova foto
        const { file } = await convertBlobUrlToFile(photoUrl);
        const { imageUrl, error } = await uploadPublicImage({
          file,
          folder: 'profiles',
        });

        if (error) {
          throw new Error('Erro ao fazer upload da imagem');
        }

        finalPhotoUrl = imageUrl;
      } else if (!photoUrl && oldPhotoUrl) {
        // Se a foto foi removida
        await deleteFile(publicFilesUrl(oldPhotoUrl));
        finalPhotoUrl = undefined;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          photoUrl: finalPhotoUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar perfil');
      }

      toast({
        variant: 'success',
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso',
      });

      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar perfil',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Perfil</CardTitle>
        <CardDescription>
          Atualize suas informações pessoais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label>Foto de Perfil</Label>
            <PhotoUploadField
              imageUrl={photoUrl}
              onImageChange={setPhotoUrl}
              name={defaultValues.name}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              {...register('name')}
              disabled={isSubmitting}
              placeholder="Digite seu nome completo"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={defaultValues.email}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              O e-mail não pode ser alterado
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
