'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  ChangePasswordSchema,
  type ChangePassword,
} from '@/schemas/profileSchemas';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/useToast';

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePassword>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePassword) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao alterar senha');
      }

      toast({
        variant: 'success',
        title: 'Sucesso',
        description: 'Senha alterada com sucesso',
      });

      reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description:
          error instanceof Error ? error.message : 'Erro ao alterar senha',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card id="change-password">
      <CardHeader>
        <CardTitle>Alterar Senha</CardTitle>
        <CardDescription>Altere sua senha de acesso ao sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <PasswordInput
              id="newPassword"
              {...register('newPassword')}
              disabled={isSubmitting}
              placeholder="Digite sua nova senha"
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <PasswordInput
              id="confirmPassword"
              {...register('confirmPassword')}
              disabled={isSubmitting}
              placeholder="Confirme sua nova senha"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Alterando...' : 'Alterar senha'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
