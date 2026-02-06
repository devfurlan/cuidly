import { z } from 'zod';

// Schema for Reference model
export const ReferenceSchema = z.object({
  id: z.number(),
  nannyId: z.number(),
  name: z.string(),
  phone: z.string(),
  relationship: z.string(),
  verified: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Reference = z.infer<typeof ReferenceSchema>;

// Form schema for creating/editing references
export const FormReferenceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z
    .string()
    .nonempty('Telefone é obrigatório')
    .refine(
      (val) => {
        const cleaned = val.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 11;
      },
      { message: 'Telefone inválido' }
    ),
  relationship: z.string().min(2, 'Relacionamento é obrigatório'),
  verified: z.boolean().default(false),
});

export type FormReference = z.infer<typeof FormReferenceSchema>;

// Relationship options
export const REFERENCE_RELATIONSHIP_OPTIONS = [
  { value: 'former_employer', label: 'Ex-empregador(a)' },
  { value: 'coworker', label: 'Colega de trabalho' },
  { value: 'neighbor', label: 'Vizinho(a)' },
  { value: 'friend', label: 'Amigo(a)' },
  { value: 'family', label: 'Familiar' },
  { value: 'professional', label: 'Referência profissional' },
  { value: 'other', label: 'Outro' },
] as const;
