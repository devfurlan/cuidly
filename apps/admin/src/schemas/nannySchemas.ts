import { z } from 'zod';

// Enums from Prisma schema
export const MaxTravelDistanceEnum = z.enum([
  'UP_TO_5KM',
  'UP_TO_10KM',
  'UP_TO_15KM',
  'UP_TO_20KM',
  'UP_TO_30KM',
  'ENTIRE_CITY',
]);

export const ComfortWithPetsEnum = z.enum(['YES_ANY', 'ONLY_SOME', 'NO']);

export const ParentPresencePreferenceEnum = z.enum([
  'PRESENT',
  'ABSENT',
  'NO_PREFERENCE',
]);

export const SchedulePreferenceEnum = z.enum([
  'FIXED',
  'FLEXIBLE',
  'NO_PREFERENCE',
]);

export const AcceptsOvernightEnum = z.enum(['YES', 'OCCASIONALLY', 'NO']);

export const AcceptsHolidayWorkEnum = z.enum(['YES', 'NO', 'SOMETIMES']);

export const MaritalStatusEnum = z.enum([
  'SINGLE',
  'MARRIED',
  'DIVORCED',
  'WIDOWED',
  'SEPARATED',
  'STABLE_UNION',
]);

export const AllowsMultipleJobsEnum = z.enum(['YES', 'NO', 'DEPENDS']);

export const JobTypeEnum = z.enum(['FIXED', 'SUBSTITUTE', 'OCCASIONAL']);

export const ContractTypeEnum = z.enum([
  'CLT',
  'DAILY_WORKER',
  'MEI',
  'TO_BE_DISCUSSED',
]);

export const NannySchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  addressId: z.number().nullable().optional().default(0),
  neighborhood: z.string().nullable().optional(),
  city: z.string().nullable().optional().default(''),
  state: z.string().nullable().optional().default(''),
  status: z
    .enum(['pending', 'active', 'inactive', 'suspended', 'deleted', 'PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
    .default('pending'),
  birthDate: z.string().datetime().nullable().optional(),
  gender: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  emailAddress: z.string().nullable().optional(),
  createdAt: z.string().datetime().nullable().optional(),
  updatedAt: z.string().datetime().nullable().optional(),
  experienceYears: z.number().nullable().optional(),
  hourlyRate: z.number().nullable().optional(),
  dailyRate: z.number().nullable().optional(),
  monthlyRate: z.number().nullable().optional(),
  viewsCount: z.number().nullable().optional().default(0),
  sharesCount: z.number().nullable().optional().default(0),
  favoritesCount: z.number().nullable().optional().default(0),
  // New fields from V2.0
  aboutMe: z.string().nullable().optional(),
  maxTravelDistance: MaxTravelDistanceEnum.nullable().optional(),
  ageRangesExperience: z.array(z.string()).optional(),
  hasSpecialNeedsExperience: z.boolean().optional(),
  specialNeedsExperienceDescription: z.string().nullable().optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.any().nullable().optional(), // JSON field
  childTypePreference: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  careMethodology: z.string().nullable().optional(),
  hasVehicle: z.boolean().optional(),
  comfortableWithPets: ComfortWithPetsEnum.nullable().optional(),
  petsDescription: z.string().nullable().optional(),
  acceptedActivities: z.array(z.string()).optional(),
  environmentPreference: z.string().nullable().optional(),
  parentPresencePreference: ParentPresencePreferenceEnum.nullable().optional(),
  hasReferences: z.boolean().optional(),
  referencesVerified: z.boolean().optional(),
});

export type Nanny = z.infer<typeof NannySchema>;

export const FormNannySchema = z.object({
  name: z
    .string()
    .nonempty('Nome é obrigatório')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Digite o nome completo (nome e sobrenome)',
    }),
  birthDate: z
    .string()
    .nonempty('Data de nascimento é obrigatória')
    .refine((val) => {
      const cleanDate = val.replace(/\D/g, '');
      if (cleanDate.length !== 8) return false;

      const day = parseInt(cleanDate.substring(0, 2));
      const month = parseInt(cleanDate.substring(2, 4));
      const year = parseInt(cleanDate.substring(4, 8));

      if (day < 1 || day > 31) return false;
      if (month < 1 || month > 12) return false;
      if (year < 1900 || year > new Date().getFullYear()) return false;

      return true;
    }, {
      message: 'Data de nascimento inválida',
    }),
  cpf: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const cleanCpf = val.replace(/\D/g, '');
      return cleanCpf.length === 11;
    }, {
      message: 'CPF inválido',
    }),
  phoneNumber: z
    .string()
    .nonempty('Número de telefone é obrigatório')
    .refine((val) => {
      const cleaned = val.replace(/\D/g, '');

      if (cleaned.length !== 10 && cleaned.length !== 11) {
        return false;
      }

      const ddd = parseInt(cleaned.substring(0, 2));
      if (ddd < 11 || ddd > 99) {
        return false;
      }

      if (cleaned.length === 11 && cleaned[2] !== '9') {
        return false;
      }

      if (cleaned.length === 10 && cleaned[2] === '9') {
        return false;
      }

      return true;
    }, {
      message: 'Telefone inválido. Use formato (XX) XXXXX-XXXX',
    }),
  emailAddress: z
    .string()
    .email('E-mail inválido')
    .nonempty('E-mail é obrigatório'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', '']).optional().nullable(),
  photoUrl: z.string().optional(),
  isSmoker: z.boolean().default(false),
  pixKey: z.string().optional(),
  pixType: z.enum(['CNPJ', 'CPF', 'EMAIL', 'PHONE', 'EVP', 'null']).optional(),
  status: z
    .enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
    .default('PENDING'),

  // Personal data
  motherName: z.string().optional(),
  birthCity: z.string().optional(),
  birthState: z.string().optional(),

  // Professional fields
  experienceYears: z.number().min(-1).optional(),
  hourlyRate: z.number().min(0).optional(),
  minChildAge: z.number().min(0).max(18).optional(),
  maxChildAge: z.number().min(0).max(18).optional(),
  specialties: z.array(z.string()).optional(),
  availabilitySchedules: z.array(z.string()).optional(),
  serviceTypes: z.array(z.string()).optional(),
  attendanceModes: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),

  // Bio
  aboutMe: z
    .string()
    .max(2000, 'Texto muito longo (máximo 2000 caracteres)')
    .optional(),

  // Rates
  dailyRate: z.number().min(0).optional(),
  monthlyRate: z.number().min(0).optional(),

  // New V2.0 fields
  maxTravelDistance: MaxTravelDistanceEnum.optional().nullable(),
  ageRangesExperience: z.array(z.string()).optional(),
  hasSpecialNeedsExperience: z.boolean().optional(),
  specialNeedsExperienceDescription: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.any().optional(), // JSON object with language levels
  childTypePreference: z
    .array(z.string())
    .max(2, 'Máximo 2 tipos de criança')
    .optional(),
  strengths: z.array(z.string()).max(3, 'Máximo 3 pontos fortes').optional(),
  careMethodology: z.string().optional(),
  hasVehicle: z.boolean().optional(),
  comfortableWithPets: ComfortWithPetsEnum.optional().nullable(),
  petsDescription: z.string().optional(),
  acceptedActivities: z.array(z.string()).optional(),
  environmentPreference: z.string().optional(),
  parentPresencePreference: ParentPresencePreferenceEnum.optional().nullable(),
  hasReferences: z.boolean().optional(),
  referencesVerified: z.boolean().optional(),

  // New fields
  acceptsHolidayWork: AcceptsHolidayWorkEnum.optional().nullable(),
  hourlyRateReference: z.number().min(0).optional(),

  // Personal/lifestyle fields
  maritalStatus: MaritalStatusEnum.optional().nullable(),
  hasChildren: z.boolean().optional(),
  hasCnh: z.boolean().optional(),

  // New onboarding fields
  nannyTypes: z.array(z.string()).optional(),
  contractRegimes: z.array(z.string()).optional(),
  hourlyRateRange: z.string().optional().nullable(),
  activitiesNotAccepted: z.array(z.string()).optional(),
  maxChildrenCare: z.number().min(1).max(10).optional(),

  address: z.object({
    zipCode: z.string().nonempty('CEP é obrigatório'),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().nonempty('Bairro é obrigatório'),
    city: z.string().nonempty('Cidade é obrigatória'),
    state: z.string().nonempty('Estado é obrigatório'),
  }),
});

export type FormNanny = z.infer<typeof FormNannySchema>;

// Schema for editing nannies - email is optional
export const FormNannyEditSchema = FormNannySchema.extend({
  emailAddress: z
    .string()
    .email('E-mail inválido')
    .optional()
    .or(z.literal('')),
});

export type FormNannyEdit = z.infer<typeof FormNannyEditSchema>;
