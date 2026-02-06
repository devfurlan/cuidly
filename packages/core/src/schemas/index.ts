/**
 * Schemas Index
 * Barrel export for all validation schemas
 */

// Common schemas
export {
  dayScheduleSchema,
  weeklyScheduleSchema,
  EntityStatusEnum,
  GenderEnum,
  AddressSchema,
  FormAddressSchema,
  type DaySchedule,
  type WeeklySchedule,
  type Address,
  type FormAddress,
} from './common';

// Child schemas
export {
  ChildStatusEnum,
  ChildSchema,
  FormChildSchema,
  type Child,
  type FormChild,
} from './child';

// Reference schemas
export {
  REFERENCE_RELATIONSHIP_OPTIONS,
  ADMIN_REFERENCE_RELATIONSHIP_OPTIONS,
  ReferenceSchema,
  FormReferenceSchema,
  OnboardingReferenceSchema,
  type Reference,
  type FormReference,
  type OnboardingReference,
} from './reference';

// Profile schemas
export {
  UpdateProfileSchema,
  ChangePasswordSchema,
  type UpdateProfile,
  type ChangePassword,
} from './profile';

// Nanny schemas
export {
  // Enums
  MaxTravelDistanceEnum,
  ComfortWithPetsEnum,
  ParentPresencePreferenceEnum,
  SchedulePreferenceEnum,
  AcceptsOvernightEnum,
  AcceptsHolidayWorkEnum,
  MaritalStatusEnum,
  AllowsMultipleJobsEnum,
  JobTypeEnum as NannyJobTypeEnum,
  ContractTypeEnum as NannyContractTypeEnum,
  // Onboarding step schemas
  nannyStep1Schema,
  nannyStep2Schema,
  nannyStep3Schema,
  nannyStep4Schema,
  nannyStep5Schema,
  nannyStep6Schema,
  nannyStep7Schema,
  nannyStep8Schema,
  nannyStep9Schema,
  nannyStep10Schema,
  nannyStep11Schema,
  onboardingReferenceSchema,
  // Combined onboarding schema
  nannyOnboardingSchema,
  // Admin/Full entity schemas
  NannySchema,
  FormNannySchema,
  FormNannyEditSchema,
  // Types
  type NannyStep1Data,
  type NannyStep2Data,
  type NannyStep3Data,
  type NannyStep4Data,
  type NannyStep5Data,
  type NannyStep6Data,
  type NannyStep7Data,
  type NannyStep8Data,
  type NannyStep9Data,
  type NannyStep10Data,
  type NannyStep11Data,
  type NannyOnboardingData,
  type Nanny,
  type FormNanny,
  type FormNannyEdit,
} from './nanny';

// Family schemas
export {
  // Enums
  HousingTypeEnum,
  ParentPresenceEnum,
  GenderPreferenceEnum,
  AgePreferenceEnum,
  FamilyNannyTypeEnum,
  FamilyContractRegimeEnum,
  // Onboarding step schemas
  familyStep1Schema,
  familyStep2Schema,
  familyStep3Schema,
  familyStep4Schema,
  familyStep6Schema,
  familyStep7Schema,
  familyStep8Schema,
  familyStep9Schema,
  familyStep10Schema,
  // Child schemas
  childBasicInfoSchema,
  childCarePrioritiesSchema,
  childSpecialNeedsSchema,
  childDataSchema,
  onboardingChildSchema,
  childrenListSchema,
  // Availability schema
  availabilitySchema,
  // Helper functions
  slotsToArrays,
  arraysToSlots,
  // Combined onboarding schema
  familyOnboardingSchema,
  // Admin/Full entity schemas
  FAMILY_STATUS_OPTIONS,
  FormFamilySchema,
  FamilySchema,
  FamilyListItemSchema,
  // Types
  type FamilyStep1Data,
  type FamilyStep2Data,
  type FamilyStep3Data,
  type FamilyStep4Data,
  type FamilyStep6Data,
  type FamilyStep7Data,
  type FamilyStep8Data,
  type FamilyStep9Data,
  type FamilyStep10Data,
  type ChildBasicInfoData,
  type ChildCarePrioritiesData,
  type ChildSpecialNeedsData,
  type ChildData,
  type OnboardingChildData,
  type AvailabilityData,
  type FamilyOnboardingData,
  type FormFamily,
  type Family,
  type FamilyListItem,
} from './family';

// Job schemas
export {
  // Enums
  JobTypeEnum,
  ContractTypeEnum,
  PaymentTypeEnum,
  RequiresOvernightEnum,
  JobStatusEnum,
  JobApplicationStatusEnum,
  // Schemas
  createJobSchema,
  JobSchema,
  FormJobSchema,
  JobApplicationSchema,
  FormJobApplicationSchema,
  // Re-export types from common
  type DaySchedule as JobDaySchedule,
  type WeeklySchedule as JobWeeklySchedule,
  // Types
  type CreateJobData,
  type Job,
  type FormJob,
  type JobApplication,
  type FormJobApplication,
} from './job';

// Admin-specific schemas (will be added in Phase 5)
export * from './coupon';
export * from './admin-user';
export * from './plan';
export * from './availability';
