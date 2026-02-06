import { z } from 'zod';

export const ChildSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  birthDate: z.string().datetime().nullable().optional(),
  gender: z.string().nullable().optional(),
  status: z
    .enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
    .default('ACTIVE'),
  allergies: z.string().nullable().optional(),
  specialNeeds: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  carePriorities: z.array(z.string()).optional(),
  hasSpecialNeeds: z.boolean().optional(),
  specialNeedsDescription: z.string().nullable().optional(),
  routine: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Child = z.infer<typeof ChildSchema>;

export const FormChildSchema = z.object({
  name: z.string().optional(),
  birthDate: z.string().optional().refine(
    (date) => {
      if (!date) return true; // Optional field
      const birthDate = new Date(date);
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      eighteenYearsAgo.setHours(0, 0, 0, 0);
      return birthDate > eighteenYearsAgo;
    },
    { message: 'A criança deve ter menos de 18 anos' }
  ),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', '']).optional().nullable(),
  status: z
    .enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
    .default('ACTIVE'),
  allergies: z.string().optional(),
  specialNeeds: z.string().optional(),
  notes: z.string().optional(),
  carePriorities: z
    .array(z.string())
    .max(3, 'Máximo 3 prioridades de cuidado')
    .optional(),
  hasSpecialNeeds: z.boolean().optional(),
  specialNeedsDescription: z.string().optional(),
  routine: z.string().max(1000, 'Rotina muito longa').optional(),
});

export type FormChild = z.infer<typeof FormChildSchema>;
