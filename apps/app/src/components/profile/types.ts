/**
 * Shared types for profile tab components
 */

export interface NannyAddress {
  streetName?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface NannyReference {
  id: number;
  name: string;
  phone: string;
  relationship: string;
  verified: boolean;
}

export interface NannyCertificate {
  id: number;
  identifier: string;
  institutionName: string;
  certificateType: string;
  issueDate?: string;
  fileUrl?: string;
}

export interface NannyData {
  id: number;
  name: string | null;
  slug: string | null;
  cpf: string | null;
  motherName: string | null;
  phoneNumber: string | null;
  emailAddress: string | null;
  gender: string | null;
  birthDate: string;
  photoUrl: string | null;
  status: string;
  experienceYears: number | null;
  aboutMe: string | null;
  hourlyRate: number | null;
  dailyRate: number | null;
  monthlyRate: number | null;
  maxTravelDistance: string | null;
  ageRangesExperience: string[];
  hasSpecialNeedsExperience: boolean;
  specialNeedsExperienceDescription: string | null;
  specialNeedsSpecialties: string[];
  certifications: string[];
  languages: string[];
  childTypePreference: string[];
  strengths: string[];
  maxChildrenCare: number | null;
  careMethodology: string | null;
  comfortableWithPets: string | null;
  petsDescription: string | null;
  acceptedActivities: string[];
  activitiesNotAccepted: string[];
  parentPresencePreference: string | null;
  hasReferences: boolean;
  referencesVerified: boolean;
  isSmoker: boolean;
  maritalStatus: string | null;
  hasChildren: boolean | null;
  hasCnh: boolean | null;
  nannyTypes: string[];
  contractRegimes: string[];
  hourlyRateRange: string | null;
  acceptsHolidayWork: string | null;
  emailVerified: boolean;
  documentValidated: boolean;
  documentExpirationDate: string | null;
  personalDataValidated: boolean;
  criminalBackgroundValidated: boolean;
  address: NannyAddress | null;
  references: NannyReference[];
  availabilityJson: unknown;
}

export interface MissingFields {
  basic: string[];
  experience: string[];
  workPreferences: string[];
  activities: string[];
  availability: boolean;
}

export interface NannyTabProps {
  nannyData: NannyData;
  hasActiveSubscription: boolean;
  onEditClick: (section: string, data: Record<string, unknown>) => void;
  onRefresh: () => void;
  missingFields: MissingFields;
}

export interface BasicDataTabProps extends NannyTabProps {
  onPhotoChange: (photoDataUrl: string | null) => Promise<void>;
}

export interface TrustTabProps extends NannyTabProps {
  certificates: NannyCertificate[];
  isDocumentExpired: boolean;
  isDocumentValid: boolean;
  isResendingEmail: boolean;
  onResendEmailVerification: () => void;
  onOpenDocumentValidation: () => void;
  onOpenSelfieValidation: () => void;
  onOpenBackgroundCheck: () => void;
  onCertificatesUpdate?: () => void;
}

export interface AvailabilityTabProps extends NannyTabProps {
  isEditing: boolean;
  onSetEditing: (editing: boolean) => void;
  onSaveAvailability: (slots: string[]) => Promise<void>;
  isSavingAvailability: boolean;
}

export interface WorkPreferencesTabProps extends NannyTabProps {
  onSetEditingAvailability: (editing: boolean) => void;
}
