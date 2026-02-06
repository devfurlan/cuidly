import { z } from 'zod';

/**
 * Schema para atualização de perfil do usuário logado
 * Permite atualizar apenas nome e foto
 */
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .nonempty('Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  photoUrl: z.string().optional(),
});

/**
 * Schema para alteração de senha
 * Requer nova senha com confirmação
 */
export const ChangePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .nonempty('Nova senha é obrigatória')
      .min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z
      .string()
      .nonempty('Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
