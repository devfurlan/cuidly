/**
 * Profile Schemas
 * Validation schemas for user profile updates
 */

import { z } from 'zod';

/**
 * Schema for updating user profile
 * Allows updating name and photo only
 */
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  photoUrl: z.string().optional(),
});

/**
 * Schema for changing password
 * Requires new password with confirmation
 */
export const ChangePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'Nova senha é obrigatória')
      .min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
