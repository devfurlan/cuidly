import { z } from 'zod';

export const AdminPermissionEnum = z.enum([
  'NANNIES',
  'FAMILIES',
  'CHILDREN',
  'SUBSCRIPTIONS',
  'ADMIN_USERS',
  'REVIEWS',
  'COUPONS',
  'JOBS',
  'VALIDATIONS',
  'CHAT_MODERATION',
]);

const BaseAdminUserSchema = z.object({
  name: z.string().nonempty('Nome é obrigatório').min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z
    .string()
    .nonempty('E-mail é obrigatório')
    .email('E-mail inválido')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .optional()
    .or(z.literal('')),
  photoUrl: z.string().optional(),
  permissions: z
    .array(AdminPermissionEnum)
    .default([]),
  isSuperAdmin: z.boolean().default(false),
  notifyFailedPayments: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
});

export const FormAdminUserSchema = BaseAdminUserSchema.refine(
  (data) => {
    // Se não é superadmin, deve ter pelo menos uma permissão
    if (!data.isSuperAdmin && data.permissions.length === 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Selecione pelo menos uma permissão ou marque como superadmin',
    path: ['permissions'],
  }
);

export const CreateAdminUserSchema = BaseAdminUserSchema.extend({
  password: z
    .string()
    .nonempty('Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
}).refine(
  (data) => {
    // Se não é superadmin, deve ter pelo menos uma permissão
    if (!data.isSuperAdmin && data.permissions.length === 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Selecione pelo menos uma permissão ou marque como superadmin',
    path: ['permissions'],
  }
);

export const UpdateAdminUserSchema = BaseAdminUserSchema.extend({
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Se não é superadmin, deve ter pelo menos uma permissão
    if (!data.isSuperAdmin && data.permissions.length === 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Selecione pelo menos uma permissão ou marque como superadmin',
    path: ['permissions'],
  }
);

export type FormAdminUser = z.infer<typeof FormAdminUserSchema>;
export type CreateAdminUser = z.infer<typeof CreateAdminUserSchema>;
export type UpdateAdminUser = z.infer<typeof UpdateAdminUserSchema>;
