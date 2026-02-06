/**
 * Common Schemas
 * Shared schemas used across multiple domains
 */

import { z } from 'zod';

// Day schedule schema (used in nanny availability and jobs)
export const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  periods: z.array(z.enum(['MORNING', 'AFTERNOON', 'NIGHT', 'OVERNIGHT'])).optional(),
});

export type DaySchedule = z.infer<typeof dayScheduleSchema>;

// Weekly schedule schema
export const weeklyScheduleSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
});

export type WeeklySchedule = z.infer<typeof weeklyScheduleSchema>;

// Status enums
export const EntityStatusEnum = z.enum([
  'PENDING',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'DELETED',
]);

// Gender enum
export const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);

// Address schema
export const AddressSchema = z.object({
  id: z.number().optional(),
  zipCode: z.string().min(8, 'CEP inválido'),
  street: z.string().optional(),
  streetName: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().min(1, 'Bairro obrigatório'),
  city: z.string().min(1, 'Cidade obrigatória'),
  state: z.string().min(2, 'Estado obrigatório'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type Address = z.infer<typeof AddressSchema>;

// Form address schema (for forms)
export const FormAddressSchema = z.object({
  zipCode: z.string().min(8, 'CEP inválido'),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 letras'),
});

export type FormAddress = z.infer<typeof FormAddressSchema>;
