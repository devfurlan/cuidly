'use client';

/**
 * Profile Client Component
 * Renderiza o conteúdo do perfil baseado no role do usuário
 */

import {
  PiBaby,
  PiCheckCircle,
  PiEnvelope,
  PiGear,
  PiMapPin,
  PiPhone,
  PiShieldCheckDuotone,
  PiSpinner,
  PiUser,
  PiWarningCircle,
} from 'react-icons/pi';

import AddressSearchModal from '@/components/AddressSearchModal';
import { AvailabilityGridEditor } from '@/components/availability/availability-grid-editor';
import { PageTitle } from '@/components/PageTitle';
import { BackgroundCheckModal } from '@/components/profile/background-check-modal';
import { DocumentValidationModal } from '@/components/profile/document-validation-modal';
import { ProfilePhotoUpload } from '@/components/profile/profile-photo-upload';
import { SelfieValidationModal } from '@/components/profile/selfie-validation-modal';
import {
  ActivitiesTab,
  BasicDataTab,
  ExperienceTab,
  TrustTab,
  WorkPreferencesTab,
} from '@/components/profile/tabs';
import { ValidationModal } from '@/components/profile/validation-modal';
import { SealUpgradeBanner } from '@/components/seals';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/shadcn/tabs';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { BRAZILIAN_STATES } from '@/constants/brazilian-states';
import {
  ACCEPTED_ACTIVITIES_OPTIONS,
  ACCEPTS_HOLIDAY_WORK_OPTIONS,
  ACTIVITIES_NOT_ACCEPTED_OPTIONS,
  CARE_METHODOLOGY_OPTIONS,
  CHILD_AGE_EXPERIENCE_OPTIONS,
  CHILD_TYPE_OPTIONS,
  COMFORT_WITH_PETS_OPTIONS,
  CONTRACT_REGIME_OPTIONS,
  EXPERIENCE_YEARS_OPTIONS,
  HOURLY_RATE_OPTIONS,
  LANGUAGE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  MAX_CHILDREN_CARE_OPTIONS,
  NANNY_GENDER_OPTIONS,
  NANNY_TYPE_OPTIONS,
  PARENT_PRESENCE_OPTIONS,
  STRENGTH_OPTIONS,
  TRAVEL_RADIUS_OPTIONS,
} from '@/constants/options/nanny-options';
import {
  formatPhoneDisplay,
  maskCEP,
  maskCPF,
  maskDate,
  maskPhone,
  phoneToE164,
} from '@/helpers/formatters';
import {
  getCarePriorityLabel,
  getFamilyCareMethodologyLabel,
  getFamilyContractRegimeLabel,
  getFamilyLanguageLabel,
  getFamilyNannyTypeLabel,
  getValuesInNannyLabel,
} from '@/helpers/label-getters';
import { useApiError } from '@/hooks/useApiError';
import type { FamilyProfileData, NannyProfileData } from '@/lib/data/profile';
import { calculateNannySeal } from '@/lib/seals';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '../ui/shadcn/alert';

// Types
interface Certificate {
  id: number;
  identifier: string;
  institutionName: string;
  certificateType: string;
  issueDate?: string;
  fileUrl?: string;
}

// Labels
const genderLabels: Record<string, string> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
  OTHER: 'Outro',
};

const sectionTitles: Record<string, string> = {
  // Dados Básicos
  basic: 'Dados Básicos',
  info: 'Informações Básicas',
  personal: 'Informações Pessoais',
  contact: 'Contato',
  about: 'Sobre Mim',
  // Experiência
  experience: 'Experiência',
  'age-ranges': 'Faixas Etárias',
  strengths: 'Pontos Fortes',
  // Preferências de Trabalho
  'work-preferences': 'Preferências de Trabalho',
  'work-model': 'Modelo de Trabalho',
  'work-values': 'Valores e Limites',
  'work-logistics': 'Logística',
  work: 'Trabalho',
  // Atividades
  activities: 'Atividades',
  'activities-accepted': 'Atividades que Aceita',
  'activities-not-accepted': 'Atividades que Não Aceita',
  'activities-environment': 'Preferências de Ambiente',
  preferences: 'Preferências',
  // Outros
  availability: 'Disponibilidade',
  address: 'Endereço',
  job: 'Vaga',
};

function getSectionTitle(section: string): string {
  return sectionTitles[section] || section;
}

function calculateAge(birthDate: Date | string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Missing fields helper for basic profile completion
interface MissingFields {
  basic: string[];
  experience: string[];
  workPreferences: string[];
  activities: string[];
  availability: boolean;
}

function getMissingBasicProfileFields(nannyData: {
  name: string | null;
  cpf: string | null;
  birthDate: string | null;
  gender: string | null;
  photoUrl: string | null;
  address: {
    city?: string;
    state?: string;
    neighborhood?: string;
    streetName?: string;
    zipCode?: string;
  } | null;
  aboutMe: string | null;
  experienceYears: number | null;
  ageRangesExperience: string[];
  strengths: string[];
  acceptedActivities: string[];
  nannyTypes: string[];
  contractRegimes: string[];
  hourlyRateRange: string | null;
  maxChildrenCare: number | null;
  maxTravelDistance: string | null;
  availabilityJson: unknown;
}): MissingFields {
  const missing: MissingFields = {
    basic: [],
    experience: [],
    workPreferences: [],
    activities: [],
    availability: false,
  };

  // Tab: basic (Dados Basicos)
  if (!nannyData.name) missing.basic.push('Nome');
  if (!nannyData.cpf) missing.basic.push('CPF');
  if (!nannyData.birthDate) missing.basic.push('Data de nascimento');
  if (!nannyData.gender) missing.basic.push('Gênero');
  if (!nannyData.photoUrl) missing.basic.push('Foto de perfil');
  if (
    !nannyData.address?.city ||
    !nannyData.address?.state ||
    !nannyData.address?.neighborhood ||
    !nannyData.address?.streetName ||
    !nannyData.address?.zipCode
  ) {
    missing.basic.push('Endereço completo');
  }
  if (!nannyData.aboutMe) missing.basic.push('Sobre mim');

  // Tab: experience
  if (nannyData.experienceYears === null)
    missing.experience.push('Anos de experiência');
  if (!nannyData.ageRangesExperience?.length)
    missing.experience.push('Faixas etárias');
  if (!nannyData.strengths?.length) missing.experience.push('Pontos fortes');

  // Tab: workPreferences (Preferencias de Trabalho)
  if (!nannyData.nannyTypes?.length)
    missing.workPreferences.push('Tipo de babá');
  if (!nannyData.contractRegimes?.length)
    missing.workPreferences.push('Regime de contratação');
  if (!nannyData.hourlyRateRange)
    missing.workPreferences.push('Faixa de valor');
  if (!nannyData.maxChildrenCare)
    missing.workPreferences.push('Máximo de crianças');
  if (!nannyData.maxTravelDistance)
    missing.workPreferences.push('Raio de deslocamento');

  // Tab: activities (Atividades)
  if (!nannyData.acceptedActivities?.length)
    missing.activities.push('Atividades aceitas');

  // Availability
  if (!nannyData.availabilityJson) missing.availability = true;

  return missing;
}

interface ProfileClientProps {
  userRole: 'NANNY' | 'FAMILY';
  nannyProfile?: NannyProfileData | null;
  familyProfile?: FamilyProfileData | null;
  hasActiveSubscription: boolean;
}

export function ProfileClient({
  userRole,
  nannyProfile,
  familyProfile,
  hasActiveSubscription,
}: ProfileClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const { showError, showSuccess, showWarning } = useApiError();

  // Handle tab change and update URL
  const handleTabChange = useCallback(
    (newTab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', newTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Convert Prisma types to component-compatible types
  const nannyData = nannyProfile
    ? {
        id: nannyProfile.id,
        name: nannyProfile.name,
        slug: nannyProfile.slug,
        cpf: nannyProfile.cpf,
        motherName: nannyProfile.motherName,
        phoneNumber: nannyProfile.phoneNumber,
        emailAddress: nannyProfile.emailAddress,
        gender: nannyProfile.gender,
        birthDate: nannyProfile.birthDate?.toISOString() || '',
        photoUrl: nannyProfile.photoUrl,
        status: nannyProfile.status,
        experienceYears: nannyProfile.experienceYears,
        aboutMe: nannyProfile.aboutMe,
        hourlyRate: nannyProfile.hourlyRate
          ? Number(nannyProfile.hourlyRate)
          : null,
        dailyRate: nannyProfile.dailyRate
          ? Number(nannyProfile.dailyRate)
          : null,
        monthlyRate: nannyProfile.monthlyRate
          ? Number(nannyProfile.monthlyRate)
          : null,
        maxTravelDistance: nannyProfile.maxTravelDistance,
        ageRangesExperience: nannyProfile.ageRangesExperience || [],
        hasSpecialNeedsExperience: nannyProfile.hasSpecialNeedsExperience,
        specialNeedsExperienceDescription:
          nannyProfile.specialNeedsExperienceDescription,
        specialNeedsSpecialties: nannyProfile.specialNeedsSpecialties || [],
        certifications: nannyProfile.certifications || [],
        languages: nannyProfile.languages || [],
        childTypePreference: nannyProfile.childTypePreference || [],
        strengths: nannyProfile.strengths || [],
        maxChildrenCare: nannyProfile.maxChildrenCare,
        careMethodology: nannyProfile.careMethodology,
        comfortableWithPets: nannyProfile.comfortableWithPets,
        petsDescription: nannyProfile.petsDescription,
        acceptedActivities: nannyProfile.acceptedActivities || [],
        activitiesNotAccepted: nannyProfile.activitiesNotAccepted || [],
        parentPresencePreference: nannyProfile.parentPresencePreference,
        hasReferences: (nannyProfile.references?.length || 0) > 0,
        referencesVerified:
          nannyProfile.references?.some((r) => r.verified) || false,
        isSmoker: nannyProfile.isSmoker,
        maritalStatus: nannyProfile.maritalStatus,
        hasChildren: nannyProfile.hasChildren,
        hasCnh: nannyProfile.hasCnh,
        nannyTypes: nannyProfile.nannyTypes || [],
        contractRegimes: nannyProfile.contractRegimes || [],
        hourlyRateRange: nannyProfile.hourlyRateRange as string | null,
        acceptsHolidayWork: nannyProfile.acceptsHolidayWork,
        emailVerified: nannyProfile.emailVerified,
        documentValidated: nannyProfile.documentValidated,
        documentExpirationDate:
          nannyProfile.documentExpirationDate?.toISOString() || null,
        personalDataValidated: nannyProfile.personalDataValidated,
        criminalBackgroundValidated: nannyProfile.criminalBackgroundValidated,
        address: nannyProfile.address
          ? {
              streetName: nannyProfile.address.streetName || undefined,
              number: nannyProfile.address.number || undefined,
              complement: nannyProfile.address.complement || undefined,
              neighborhood: nannyProfile.address.neighborhood || undefined,
              city: nannyProfile.address.city || undefined,
              state: nannyProfile.address.state || undefined,
              zipCode: nannyProfile.address.zipCode || undefined,
            }
          : null,
        references:
          nannyProfile.references?.map((r) => ({
            id: r.id,
            name: r.name,
            phone: r.phone,
            relationship: r.relationship,
            verified: r.verified,
          })) || [],
        availabilityJson: nannyProfile.availabilityJson,
      }
    : null;

  const familyData = familyProfile
    ? {
        family: {
          id: familyProfile.id,
          name: familyProfile.name,
          phoneNumber: familyProfile.phoneNumber,
          photoUrl: familyProfile.photoUrl,
          cpf: familyProfile.cpf,
          birthDate: familyProfile.birthDate?.toISOString() || null,
          gender: familyProfile.gender,
          nannyType: familyProfile.nannyType,
          contractRegime: familyProfile.contractRegime,
          familyPresentation: familyProfile.familyPresentation,
          jobDescription: familyProfile.jobDescription,
          jobPhotos: familyProfile.jobPhotos || [],
          hasPets: familyProfile.hasPets,
          petsDescription: familyProfile.petsDescription,
          parentPresence: familyProfile.parentPresence,
          valuesInNanny: familyProfile.valuesInNanny || [],
          careMethodology: familyProfile.careMethodology,
          languages: familyProfile.languages || [],
          domesticHelpExpected: familyProfile.domesticHelpExpected || [],
          nannyGenderPreference: familyProfile.nannyGenderPreference,
          nannyAgePreference: familyProfile.nannyAgePreference,
        },
        address: familyProfile.address
          ? {
              streetName: familyProfile.address.streetName || undefined,
              number: familyProfile.address.number || undefined,
              complement: familyProfile.address.complement || undefined,
              neighborhood: familyProfile.address.neighborhood || undefined,
              city: familyProfile.address.city || undefined,
              state: familyProfile.address.state || undefined,
              zipCode: familyProfile.address.zipCode || undefined,
            }
          : null,
        children:
          familyProfile.children?.map((cf) => ({
            childId: cf.childId,
            relationshipType: cf.relationshipType,
            isMain: cf.isMain,
            child: {
              id: cf.child.id,
              name: cf.child.name || '',
              age: cf.child.birthDate ? calculateAge(cf.child.birthDate) : 0,
              birthDate: cf.child.birthDate?.toISOString() || '',
              gender: cf.child.gender || '',
              carePriorities: cf.child.carePriorities || [],
              hasSpecialNeeds: cf.child.hasSpecialNeeds,
              specialNeedsDescription: cf.child.specialNeedsDescription,
            },
          })) || [],
        hasActiveSubscription,
      }
    : null;

  // State for certificates (fetched client-side since it's separate API)
  const [nannyCertificates, setNannyCertificates] = useState<Certificate[]>([]);

  // Fetch certificates function - reusable for initial load and after mutations
  const fetchCertificates = useCallback(async () => {
    if (userRole !== 'NANNY') return;

    try {
      const res = await fetch('/api/nannies/documents');
      const data = await res.json();
      if (data.documents) {
        setNannyCertificates(
          data.documents.map(
            (doc: {
              id: number;
              identifier: string;
              institutionName: string | null;
              certificateType: string | null;
              issueDate: string | null;
              fileUrl: string | null;
            }) => ({
              id: doc.id,
              identifier: doc.identifier,
              institutionName: doc.institutionName || '',
              certificateType: doc.certificateType || '',
              issueDate: doc.issueDate,
              fileUrl: doc.fileUrl,
            }),
          ),
        );
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
    }
  }, [userRole]);

  // Fetch certificates on mount
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    section: string;
    data: Record<string, unknown>;
  }>({ open: false, section: '', data: {} });
  const [isSaving, setIsSaving] = useState(false);

  // Validation state
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [selfieModalOpen, setSelfieModalOpen] = useState(false);
  const [backgroundCheckModalOpen, setBackgroundCheckModalOpen] =
    useState(false);
  const [documentValidationModalOpen, setDocumentValidationModalOpen] =
    useState(false);
  const [emailVerificationModalOpen, setEmailVerificationModalOpen] =
    useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [addressSearchModalOpen, setAddressSearchModalOpen] = useState(false);

  const refreshData = () => {
    router.refresh();
  };

  const handleResendEmailVerification = async () => {
    setIsResendingEmail(true);
    try {
      const response = await fetch('/api/email/resend-verification', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        showSuccess('Código de verificação enviado! Verifique seu e-mail.');
        setEmailVerificationModalOpen(true);
      } else {
        showError(null, data.message || 'Erro ao enviar código de verificação');
      }
    } catch (error) {
      console.error('Error resending email verification:', error);
      showError(error, 'Erro ao enviar código de verificação');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!emailVerificationCode || emailVerificationCode.trim().length !== 6) {
      showWarning('Digite um código válido de 6 dígitos');
      return;
    }

    setIsVerifyingEmail(true);
    try {
      const response = await fetch('/api/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: emailVerificationCode.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        showSuccess('E-mail verificado com sucesso!');
        setEmailVerificationModalOpen(false);
        setEmailVerificationCode('');
        refreshData();
      } else {
        showError(null, data.message || 'Código inválido');
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      showError(error, 'Erro ao verificar e-mail');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleEditClick = (section: string, data: Record<string, unknown>) => {
    setEditDialog({ open: true, section, data });
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const dataToSave = { ...editDialog.data };
      if (dataToSave.phoneNumber) {
        dataToSave.phoneNumber = phoneToE164(dataToSave.phoneNumber as string);
      }
      // Convert DD/MM/YYYY to ISO date format for birthDate
      if (dataToSave.birthDate && typeof dataToSave.birthDate === 'string') {
        const dateStr = dataToSave.birthDate as string;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          dataToSave.birthDate = new Date(
            `${year}-${month}-${day}`,
          ).toISOString();
        }
      }

      if (userRole === 'NANNY' && nannyData) {
        const response = await fetch(`/api/nannies/by-id/${nannyData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar');
        }

        showSuccess('Perfil atualizado com sucesso!');
        refreshData();
      } else if (userRole === 'FAMILY' && familyData) {
        const response = await fetch('/api/families/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar');
        }

        showSuccess('Perfil atualizado com sucesso!');
        refreshData();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showError(error, 'Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
      setEditDialog({ open: false, section: '', data: {} });
    }
  };

  const updateEditData = (field: string, value: unknown) => {
    setEditDialog((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
    }));
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/cep/v2/${cleanCep}`,
      );
      if (response.ok) {
        const data = await response.json();
        setEditDialog((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            streetName: data.street || prev.data.streetName || '',
            neighborhood: data.neighborhood || prev.data.neighborhood || '',
            city: data.city || prev.data.city || '',
            state: data.state || prev.data.state || '',
          },
        }));
      }
    } catch (err) {
      console.error('Error fetching address:', err);
    }
  };

  const handleAddressSelected = (place: {
    streetName: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    setEditDialog((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        zipCode: place.zipCode ? maskCEP(place.zipCode) : '',
        streetName: place.streetName || '',
        number: place.number || '',
        neighborhood: place.neighborhood || '',
        city: place.city || '',
        state: place.state || '',
      },
    }));
    setAddressSearchModalOpen(false);
  };

  const handlePhotoChange = async (photoDataUrl: string | null) => {
    if (photoDataUrl === null) {
      const response = await fetch('/api/profile/photo', {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erro ao remover foto');
      }
    } else {
      const response = await fetch('/api/profile/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoDataUrl }),
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar foto');
      }
    }
    refreshData();
  };

  // Render Family Profile
  if (userRole === 'FAMILY' && familyData && familyData.family) {
    return (
      <>
        <PageTitle title="Perfil da Família - Cuidly" />

        {/* Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <ProfilePhotoUpload
                currentPhotoUrl={familyData.family.photoUrl}
                userName={familyData.family.name}
                onPhotoChange={handlePhotoChange}
                size="lg"
              />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  {familyData.family.name}
                </h1>
                {familyData.address && (
                  <p className="mt-1 flex items-center justify-center gap-1 text-gray-600 sm:justify-start">
                    <PiMapPin className="size-4" />
                    {familyData.address.city}, {familyData.address.state}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  {familyData.hasActiveSubscription ? (
                    <Badge variant="success">
                      <PiCheckCircle className="size-3" />
                      Assinatura Ativa
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <PiWarningCircle className="size-3" />
                      Sem Assinatura
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {familyData.children.length} criança
                    {familyData.children.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={tabParam || 'info'}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList variant="underline" className="mb-6">
            <TabsTrigger variant="underline" value="info">
              Informações
            </TabsTrigger>
            <TabsTrigger variant="underline" value="children">
              Crianças
            </TabsTrigger>
            <TabsTrigger variant="underline" value="job">
              Vaga
            </TabsTrigger>
            <TabsTrigger variant="underline" value="preferences">
              Preferências
            </TabsTrigger>
            <TabsTrigger variant="underline" value="address">
              Endereço
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent variant="underline" value="info">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>Dados de contato da família</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleEditClick('info', {
                      name: familyData.family.name,
                      phoneNumber: formatPhoneDisplay(
                        familyData.family.phoneNumber ?? '',
                      ),
                    })
                  }
                >
                  <PiGear className="mr-2 size-4" />
                  Editar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <PiUser className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nome da Família</p>
                    <p className="font-medium">{familyData.family.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <PiPhone className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium">
                      {formatPhoneDisplay(familyData.family.phoneNumber ?? '')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Children Tab */}
          <TabsContent variant="underline" value="children">
            <Card>
              <CardHeader>
                <CardTitle>Crianças</CardTitle>
                <CardDescription>
                  Informações sobre as crianças da família
                </CardDescription>
              </CardHeader>
              <CardContent>
                {familyData.children.length > 0 ? (
                  <div className="space-y-4">
                    {familyData.children.map((cf) => (
                      <div key={cf.childId} className="rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-fuchsia-100 p-2">
                            <PiBaby className="size-5 text-fuchsia-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{cf.child.name}</h4>
                            <p className="text-sm text-gray-500">
                              {cf.child.birthDate ? (
                                <>
                                  {calculateAge(cf.child.birthDate)} ano
                                  {calculateAge(cf.child.birthDate) !== 1
                                    ? 's'
                                    : ''}{' '}
                                  •{' '}
                                </>
                              ) : null}
                              {genderLabels[cf.child.gender] || cf.child.gender}
                            </p>
                          </div>
                          {cf.child.hasSpecialNeeds && (
                            <Badge
                              variant="outline"
                              className="border-purple-200 text-purple-700"
                            >
                              Necessidades especiais
                            </Badge>
                          )}
                        </div>
                        {cf.child.carePriorities?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-500">
                              Prioridades de Cuidado
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {cf.child.carePriorities.map((priority) => (
                                <Badge
                                  key={priority}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {getCarePriorityLabel(priority)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-gray-500">
                    Nenhuma criança cadastrada
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Tab */}
          <TabsContent variant="underline" value="job">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Informações da Vaga</CardTitle>
                  <CardDescription>
                    Detalhes sobre a vaga que você está buscando
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleEditClick('job', {
                      nannyType: familyData.family.nannyType,
                      contractRegime: familyData.family.contractRegime,
                      jobDescription: familyData.family.jobDescription,
                    })
                  }
                >
                  <PiGear className="mr-2 size-4" />
                  Editar
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {familyData.family.nannyType && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Tipo de Babá
                    </p>
                    <Badge variant="secondary">
                      {getFamilyNannyTypeLabel(familyData.family.nannyType)}
                    </Badge>
                  </div>
                )}

                {familyData.family.contractRegime && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Regime de Contratação
                    </p>
                    <Badge variant="secondary">
                      {getFamilyContractRegimeLabel(
                        familyData.family.contractRegime,
                      )}
                    </Badge>
                  </div>
                )}

                {familyData.family.familyPresentation && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Apresentação da Família
                    </p>
                    <p className="whitespace-pre-wrap text-gray-600">
                      {familyData.family.familyPresentation}
                    </p>
                  </div>
                )}

                {familyData.family.jobDescription && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Descrição da Vaga
                    </p>
                    <p className="whitespace-pre-wrap text-gray-600">
                      {familyData.family.jobDescription}
                    </p>
                  </div>
                )}

                {familyData.family.jobPhotos &&
                  familyData.family.jobPhotos.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">
                        Fotos do Ambiente
                      </p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {familyData.family.jobPhotos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Foto ${index + 1}`}
                            className="aspect-square w-full rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                {!familyData.family.nannyType &&
                  !familyData.family.contractRegime &&
                  !familyData.family.jobDescription && (
                    <p className="py-8 text-center text-gray-500">
                      Nenhuma informação de vaga cadastrada
                    </p>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent variant="underline" value="preferences">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Preferências</CardTitle>
                  <CardDescription>
                    O que você valoriza em uma babá
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleEditClick('preferences', {
                      hasPets: familyData.family.hasPets,
                      petsDescription: familyData.family.petsDescription,
                      parentPresence: familyData.family.parentPresence,
                      careMethodology: familyData.family.careMethodology,
                    })
                  }
                >
                  <PiGear className="mr-2 size-4" />
                  Editar
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Animais de Estimação
                  </p>
                  <p className="text-gray-600">
                    {familyData.family.hasPets
                      ? familyData.family.petsDescription || 'Sim, temos pets'
                      : 'Não temos pets'}
                  </p>
                </div>

                {familyData.family.valuesInNanny?.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      O que Valoriza em uma Babá
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {familyData.family.valuesInNanny.map((value) => (
                        <Badge key={value} variant="secondary">
                          {getValuesInNannyLabel(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {familyData.family.careMethodology && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Metodologia de Cuidado
                    </p>
                    <p className="text-gray-600">
                      {getFamilyCareMethodologyLabel(
                        familyData.family.careMethodology,
                      )}
                    </p>
                  </div>
                )}

                {familyData.family.languages?.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Idiomas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {familyData.family.languages.map((lang) => (
                        <Badge key={lang} variant="outline">
                          {getFamilyLanguageLabel(lang)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent variant="underline" value="address">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Endereço</CardTitle>
                  <CardDescription>Localização da família</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleEditClick('address', {
                      ...(familyData.address || {}),
                    })
                  }
                >
                  <PiGear className="mr-2 size-4" />
                  Editar
                </Button>
              </CardHeader>
              <CardContent>
                {familyData.address ? (
                  <div className="space-y-2">
                    <p className="font-medium">
                      {familyData.address.streetName},{' '}
                      {familyData.address.number}
                      {familyData.address.complement &&
                        ` - ${familyData.address.complement}`}
                    </p>
                    <p className="text-gray-600">
                      {familyData.address.neighborhood}
                    </p>
                    <p className="text-gray-600">
                      {familyData.address.city}, {familyData.address.state} -{' '}
                      {familyData.address.zipCode}
                    </p>
                  </div>
                ) : (
                  <p className="py-8 text-center text-gray-500">
                    Endereço não cadastrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </>
    );
  }

  // Render Nanny Profile
  if (userRole === 'NANNY' && nannyData) {
    // Verificar se documento está expirado
    const isDocumentExpired = nannyData.documentExpirationDate
      ? new Date(nannyData.documentExpirationDate) < new Date()
      : false;
    const isDocumentValid = nannyData.documentValidated && !isDocumentExpired;

    // Calculate missing fields for basic profile
    const missingFields = getMissingBasicProfileFields(nannyData);

    // URL tab backwards compatibility
    const effectiveTab =
      tabParam === 'info'
        ? 'basic'
        : tabParam === 'work' || tabParam === 'availability'
          ? 'work-preferences'
          : tabParam || 'basic';

    // Calculate seal for upgrade banner
    const sealResult = calculateNannySeal(
      {
        name: nannyData.name,
        cpf: nannyData.cpf,
        birthDate: nannyData.birthDate ? new Date(nannyData.birthDate) : null,
        gender: nannyData.gender,
        photoUrl: nannyData.photoUrl,
        address: nannyData.address,
        aboutMe: nannyData.aboutMe,
        experienceYears: nannyData.experienceYears,
        ageRangesExperience: nannyData.ageRangesExperience,
        strengths: nannyData.strengths,
        acceptedActivities: nannyData.acceptedActivities,
        nannyTypes: nannyData.nannyTypes,
        contractRegimes: nannyData.contractRegimes,
        hourlyRateRange: nannyData.hourlyRateRange as string | null,
        maxChildrenCare: nannyData.maxChildrenCare,
        maxTravelDistance: nannyData.maxTravelDistance,
        availabilityJson: nannyData.availabilityJson,
        emailVerified: nannyData.emailVerified ?? false,
        documentValidated: nannyData.documentValidated,
        documentExpirationDate: nannyData.documentExpirationDate
          ? new Date(nannyData.documentExpirationDate)
          : null,
        personalDataValidated: nannyData.personalDataValidated,
        criminalBackgroundValidated: nannyData.criminalBackgroundValidated,
      },
      hasActiveSubscription,
      0, // We don't have review count here, but it's only needed for CONFIAVEL
    );
    const hasIdentificada = sealResult.seal !== null;
    const hasVerificadaRequirements =
      nannyData.personalDataValidated && nannyData.criminalBackgroundValidated;

    return (
      <>
        <PageTitle title="Meu Perfil - Cuidly" />

        {/* Tabs */}
        <Tabs
          value={effectiveTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList variant="underline" className="mb-6">
            <TabsTrigger variant="underline" value="basic">
              Dados Básicos
            </TabsTrigger>
            <TabsTrigger variant="underline" value="experience">
              Experiência
            </TabsTrigger>
            <TabsTrigger variant="underline" value="work-preferences">
              Preferências
            </TabsTrigger>
            <TabsTrigger variant="underline" value="activities">
              Atividades
            </TabsTrigger>
            <TabsTrigger variant="underline" value="trust">
              Confiança
            </TabsTrigger>
          </TabsList>

          {/* Dados Basicos Tab */}
          <TabsContent variant="underline" value="basic">
            <BasicDataTab
              nannyData={nannyData}
              hasActiveSubscription={hasActiveSubscription}
              onEditClick={handleEditClick}
              onRefresh={refreshData}
              missingFields={missingFields}
              onPhotoChange={handlePhotoChange}
            />
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent variant="underline" value="experience">
            <ExperienceTab
              nannyData={nannyData}
              hasActiveSubscription={hasActiveSubscription}
              onEditClick={handleEditClick}
              onRefresh={refreshData}
              missingFields={missingFields}
            />
          </TabsContent>

          {/* Work Preferences Tab */}
          <TabsContent variant="underline" value="work-preferences">
            <WorkPreferencesTab
              nannyData={nannyData}
              hasActiveSubscription={hasActiveSubscription}
              onEditClick={handleEditClick}
              onRefresh={refreshData}
              missingFields={missingFields}
              onSetEditingAvailability={setIsEditingAvailability}
            />
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent variant="underline" value="activities">
            <ActivitiesTab
              nannyData={nannyData}
              hasActiveSubscription={hasActiveSubscription}
              onEditClick={handleEditClick}
              onRefresh={refreshData}
              missingFields={missingFields}
            />
          </TabsContent>

          {/* Trust Tab */}
          <TabsContent variant="underline" value="trust">
            <TrustTab
              nannyData={nannyData}
              hasActiveSubscription={hasActiveSubscription}
              onEditClick={handleEditClick}
              onRefresh={refreshData}
              missingFields={missingFields}
              certificates={nannyCertificates}
              isDocumentExpired={isDocumentExpired}
              isDocumentValid={isDocumentValid}
              isResendingEmail={isResendingEmail}
              onResendEmailVerification={handleResendEmailVerification}
              onOpenDocumentValidation={() =>
                setDocumentValidationModalOpen(true)
              }
              onOpenSelfieValidation={() => setSelfieModalOpen(true)}
              onOpenBackgroundCheck={() => setBackgroundCheckModalOpen(true)}
              onCertificatesUpdate={fetchCertificates}
            />
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        {/* NOTE: The old TabsContent blocks for info, experience, work, availability have been
            replaced by the new tab components above. The dialog sections below still need to
            support the new section names: 'basic', 'work-preferences', 'activities' */}
        <Dialog
          open={editDialog.open}
          onOpenChange={(open: boolean) =>
            !open && setEditDialog({ open: false, section: '', data: {} })
          }
        >
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>
                Editar {getSectionTitle(editDialog.section)}
              </DialogTitle>
              <DialogDescription>
                Faça as alterações necessárias e clique em salvar.
              </DialogDescription>
            </DialogHeader>

            <div className="-mx-1 max-h-[70vh] space-y-4 overflow-y-auto px-1 py-4">
              {/* Personal Section - Informações Pessoais */}
              {editDialog.section === 'personal' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={(editDialog.data.name as string) || ''}
                      onChange={(e) => updateEditData('name', e.target.value)}
                      disabled={nannyData.documentValidated}
                    />
                    {nannyData.documentValidated && (
                      <p className="text-xs text-gray-500">
                        Este campo não pode ser alterado após validação do
                        documento.
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        maxLength={14}
                        value={(editDialog.data.cpf as string) || ''}
                        onChange={(e) =>
                          updateEditData('cpf', maskCPF(e.target.value))
                        }
                        disabled={nannyData.documentValidated}
                      />
                      {nannyData.documentValidated && (
                        <p className="text-xs text-gray-500">
                          Não pode ser alterado após validação.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        placeholder="DD/MM/AAAA"
                        maxLength={10}
                        value={(editDialog.data.birthDate as string) || ''}
                        onChange={(e) =>
                          updateEditData('birthDate', maskDate(e.target.value))
                        }
                        disabled={nannyData.documentValidated}
                      />
                      {nannyData.documentValidated && (
                        <p className="text-xs text-gray-500">
                          Não pode ser alterado após validação.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gênero</Label>
                      <Select
                        value={(editDialog.data.gender as string) || ''}
                        onValueChange={(value) =>
                          updateEditData('gender', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {NANNY_GENDER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherName" optional>
                        Nome da Mãe
                      </Label>
                      <Input
                        id="motherName"
                        placeholder="Nome completo da mãe"
                        value={(editDialog.data.motherName as string) || ''}
                        onChange={(e) =>
                          updateEditData('motherName', e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Estado Civil</Label>
                    <Select
                      value={(editDialog.data.maritalStatus as string) || ''}
                      onValueChange={(value) =>
                        updateEditData('maritalStatus', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARITAL_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={(editDialog.data.isSmoker as boolean) || false}
                        onCheckedChange={(checked) =>
                          updateEditData('isSmoker', checked)
                        }
                      />
                      <span className="text-sm">Fumante</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={
                          (editDialog.data.hasChildren as boolean) || false
                        }
                        onCheckedChange={(checked) =>
                          updateEditData('hasChildren', checked)
                        }
                      />
                      <span className="text-sm">Tem Filhos</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={(editDialog.data.hasCnh as boolean) || false}
                        onCheckedChange={(checked) =>
                          updateEditData('hasCnh', checked)
                        }
                      />
                      <span className="text-sm">Tem CNH</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Contact Section - E-mail e Telefone */}
              {editDialog.section === 'contact' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailAddress">E-mail</Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      placeholder="seu@email.com"
                      value={(editDialog.data.emailAddress as string) || ''}
                      onChange={(e) =>
                        updateEditData('emailAddress', e.target.value)
                      }
                      disabled={nannyData.emailVerified}
                    />
                    {nannyData.emailVerified && (
                      <p className="text-xs text-gray-500">
                        O e-mail não pode ser alterado após verificação.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Telefone</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      value={(editDialog.data.phoneNumber as string) || ''}
                      onChange={(e) =>
                        updateEditData('phoneNumber', maskPhone(e.target.value))
                      }
                    />
                  </div>
                </div>
              )}

              {/* Address Section - Endereço */}
              {editDialog.section === 'address' && (
                <div className="space-y-4">
                  <Alert variant="success">
                    <PiShieldCheckDuotone />
                    <AlertDescription>
                      Seu endereço nunca será compartilhado publicamente. Usamos
                      apenas para calcular distâncias e mostrar sua localização
                      aproximada para as famílias.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="zipCode">CEP</Label>
                      <button
                        type="button"
                        onClick={() => setAddressSearchModalOpen(true)}
                        className="text-sm text-fuchsia-600 hover:text-fuchsia-700 hover:underline"
                      >
                        Não sei o CEP
                      </button>
                    </div>
                    <Input
                      id="zipCode"
                      placeholder="00000-000"
                      maxLength={9}
                      value={(editDialog.data.zipCode as string) || ''}
                      onChange={(e) => {
                        const masked = maskCEP(e.target.value);
                        updateEditData('zipCode', masked);
                        // Busca automática quando CEP completo
                        if (masked.replace(/\D/g, '').length === 8) {
                          fetchAddressByCep(masked);
                        }
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="streetName">Logradouro</Label>
                      <Input
                        id="streetName"
                        placeholder="Rua, Avenida, etc"
                        value={(editDialog.data.streetName as string) || ''}
                        onChange={(e) =>
                          updateEditData('streetName', e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        placeholder="123"
                        value={(editDialog.data.number as string) || ''}
                        onChange={(e) =>
                          updateEditData('number', e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complement" optional>
                      Complemento
                    </Label>
                    <Input
                      id="complement"
                      placeholder="Apto 101"
                      value={(editDialog.data.complement as string) || ''}
                      onChange={(e) =>
                        updateEditData('complement', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      placeholder="Centro"
                      value={(editDialog.data.neighborhood as string) || ''}
                      onChange={(e) =>
                        updateEditData('neighborhood', e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        placeholder="São Paulo"
                        value={(editDialog.data.city as string) || ''}
                        onChange={(e) => updateEditData('city', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Select
                        value={(editDialog.data.state as string) || ''}
                        onValueChange={(value) =>
                          updateEditData('state', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRAZILIAN_STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic/Info Section - handles both 'basic' and 'info' for backwards compatibility */}
              {(editDialog.section === 'basic' ||
                editDialog.section === 'info') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={(editDialog.data.name as string) || ''}
                      onChange={(e) => updateEditData('name', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* About Me Section */}
              {editDialog.section === 'about' && (
                <div className="space-y-2">
                  <Label>Sobre Mim</Label>
                  <RichTextEditor
                    value={(editDialog.data.aboutMe as string) || ''}
                    onChange={(value) => updateEditData('aboutMe', value)}
                    placeholder="Conte mais sobre sua experiência e forma de trabalhar..."
                  />
                </div>
              )}

              {/* Experience Section - Anos, Idiomas, Necessidades Especiais */}
              {editDialog.section === 'experience' && (
                <div className="space-y-4">
                  {/* Anos de Experiência */}
                  <div className="space-y-2">
                    <Label>Anos de Experiência</Label>
                    <Select
                      value={String(editDialog.data.experienceYears ?? '')}
                      onValueChange={(value) =>
                        updateEditData('experienceYears', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_YEARS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Idiomas */}
                  <div className="space-y-2">
                    <Label>Idiomas</Label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={(
                              (editDialog.data.languages as string[]) || []
                            ).includes(option.value)}
                            onCheckedChange={(checked) => {
                              const current =
                                (editDialog.data.languages as string[]) || [];
                              if (checked) {
                                updateEditData('languages', [
                                  ...current,
                                  option.value,
                                ]);
                              } else {
                                updateEditData(
                                  'languages',
                                  current.filter((v) => v !== option.value),
                                );
                              }
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Necessidades Especiais */}
                  <div className="space-y-3">
                    <label className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={
                          (editDialog.data
                            .hasSpecialNeedsExperience as boolean) || false
                        }
                        onCheckedChange={(checked) =>
                          updateEditData('hasSpecialNeedsExperience', checked)
                        }
                      />
                      <span className="text-sm font-medium">
                        Tenho experiência com necessidades especiais
                      </span>
                    </label>
                    {Boolean(editDialog.data.hasSpecialNeedsExperience) && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="specialNeedsExperienceDescription"
                          optional
                        >
                          Descreva sua experiência
                        </Label>
                        <Textarea
                          id="specialNeedsExperienceDescription"
                          value={
                            (editDialog.data
                              .specialNeedsExperienceDescription as string) ||
                            ''
                          }
                          onChange={(e) =>
                            updateEditData(
                              'specialNeedsExperienceDescription',
                              e.target.value,
                            )
                          }
                          placeholder="Descreva sua experiência com crianças com necessidades especiais"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Age Ranges Section - Faixas Etárias */}
              {editDialog.section === 'age-ranges' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Faixas Etárias de Experiência</Label>
                    <div className="flex flex-wrap gap-2">
                      {CHILD_AGE_EXPERIENCE_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={(
                              (editDialog.data
                                .ageRangesExperience as string[]) || []
                            ).includes(option.value)}
                            onCheckedChange={(checked) => {
                              const current =
                                (editDialog.data
                                  .ageRangesExperience as string[]) || [];
                              if (checked) {
                                updateEditData('ageRangesExperience', [
                                  ...current,
                                  option.value,
                                ]);
                              } else {
                                updateEditData(
                                  'ageRangesExperience',
                                  current.filter((v) => v !== option.value),
                                );
                              }
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths Section - Pontos Fortes */}
              {editDialog.section === 'strengths' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pontos Fortes (máx. 3)</Label>
                    <div className="flex flex-wrap gap-2">
                      {STRENGTH_OPTIONS.map((option) => {
                        const current =
                          (editDialog.data.strengths as string[]) || [];
                        const isChecked = current.includes(option.value);
                        const isDisabled = !isChecked && current.length >= 3;
                        return (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}
                          >
                            <Checkbox
                              checked={isChecked}
                              disabled={isDisabled}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateEditData('strengths', [
                                    ...current,
                                    option.value,
                                  ]);
                                } else {
                                  updateEditData(
                                    'strengths',
                                    current.filter((v) => v !== option.value),
                                  );
                                }
                              }}
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Work Model Section - Modelo de Trabalho */}
              {editDialog.section === 'work-model' && (
                <div className="space-y-4">
                  {/* Tipo de Babá */}
                  <div className="space-y-2">
                    <Label>Tipo de Babá</Label>
                    <div className="flex flex-wrap gap-2">
                      {NANNY_TYPE_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={(
                              (editDialog.data.nannyTypes as string[]) || []
                            ).includes(option.value)}
                            onCheckedChange={(checked) => {
                              const current =
                                (editDialog.data.nannyTypes as string[]) || [];
                              if (checked) {
                                updateEditData('nannyTypes', [
                                  ...current,
                                  option.value,
                                ]);
                              } else {
                                updateEditData(
                                  'nannyTypes',
                                  current.filter((v) => v !== option.value),
                                );
                              }
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Regime de Contratação */}
                  <div className="space-y-2">
                    <Label>Regime de Contratação</Label>
                    <div className="flex flex-wrap gap-2">
                      {CONTRACT_REGIME_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={(
                              (editDialog.data.contractRegimes as string[]) ||
                              []
                            ).includes(option.value)}
                            onCheckedChange={(checked) => {
                              const current =
                                (editDialog.data.contractRegimes as string[]) ||
                                [];
                              if (checked) {
                                updateEditData('contractRegimes', [
                                  ...current,
                                  option.value,
                                ]);
                              } else {
                                updateEditData(
                                  'contractRegimes',
                                  current.filter((v) => v !== option.value),
                                );
                              }
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Trabalha em Feriados */}
                  <div className="space-y-2">
                    <Label>Trabalha em Feriados</Label>
                    <Select
                      value={
                        (editDialog.data.acceptsHolidayWork as string) || ''
                      }
                      onValueChange={(value) =>
                        updateEditData('acceptsHolidayWork', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCEPTS_HOLIDAY_WORK_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Work Values Section - Valores e Limites */}
              {editDialog.section === 'work-values' && (
                <div className="space-y-4">
                  {/* Faixa de Valor por Hora */}
                  <div className="space-y-2">
                    <Label>Faixa de Valor por Hora</Label>
                    <Select
                      value={(editDialog.data.hourlyRateRange as string) || ''}
                      onValueChange={(value) =>
                        updateEditData('hourlyRateRange', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURLY_RATE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Máximo de Crianças */}
                  <div className="space-y-2">
                    <Label>Máximo de Crianças</Label>
                    <Select
                      value={String(editDialog.data.maxChildrenCare || '')}
                      onValueChange={(value) =>
                        updateEditData('maxChildrenCare', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {MAX_CHILDREN_CARE_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Work Logistics Section - Logística */}
              {editDialog.section === 'work-logistics' && (
                <div className="space-y-4">
                  {/* Raio de Deslocamento */}
                  <div className="space-y-2">
                    <Label>Raio de Deslocamento</Label>
                    <Select
                      value={
                        (editDialog.data.maxTravelDistance as string) || ''
                      }
                      onValueChange={(value) =>
                        updateEditData('maxTravelDistance', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAVEL_RADIUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Work Preferences Section - handles both 'work-preferences' and 'work' for backwards compatibility */}
              {(editDialog.section === 'work-preferences' ||
                editDialog.section === 'work') && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Use as seções individuais para editar preferências de
                    trabalho.
                  </p>
                </div>
              )}

              {/* Activities Accepted Section - Atividades que Aceita */}
              {editDialog.section === 'activities-accepted' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Atividades que Aceita Fazer</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {ACCEPTED_ACTIVITIES_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={(
                              (editDialog.data
                                .acceptedActivities as string[]) || []
                            ).includes(option.value)}
                            onCheckedChange={(checked) => {
                              const current =
                                (editDialog.data
                                  .acceptedActivities as string[]) || [];
                              if (checked) {
                                updateEditData('acceptedActivities', [
                                  ...current,
                                  option.value,
                                ]);
                              } else {
                                updateEditData(
                                  'acceptedActivities',
                                  current.filter((v) => v !== option.value),
                                );
                              }
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Activities Not Accepted Section - Atividades que Não Aceita */}
              {editDialog.section === 'activities-not-accepted' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Atividades que NÃO Aceita Fazer</Label>
                    <div className="flex flex-wrap gap-2">
                      {ACTIVITIES_NOT_ACCEPTED_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={(
                              (editDialog.data
                                .activitiesNotAccepted as string[]) || []
                            ).includes(option.value)}
                            onCheckedChange={(checked) => {
                              const current =
                                (editDialog.data
                                  .activitiesNotAccepted as string[]) || [];
                              if (checked) {
                                updateEditData('activitiesNotAccepted', [
                                  ...current,
                                  option.value,
                                ]);
                              } else {
                                updateEditData(
                                  'activitiesNotAccepted',
                                  current.filter((v) => v !== option.value),
                                );
                              }
                            }}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Activities Environment Section - Preferências de Ambiente */}
              {editDialog.section === 'activities-environment' && (
                <div className="space-y-4">
                  {/* Conforto com Pets */}
                  <div className="space-y-2">
                    <Label>Conforto com Pets</Label>
                    <Select
                      value={
                        (editDialog.data.comfortableWithPets as string) || ''
                      }
                      onValueChange={(value) =>
                        updateEditData('comfortableWithPets', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMFORT_WITH_PETS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {editDialog.data.comfortableWithPets === 'ONLY_SOME' && (
                    <div className="space-y-2">
                      <Label htmlFor="petsDescription" optional>
                        Quais animais?
                      </Label>
                      <Input
                        id="petsDescription"
                        value={
                          (editDialog.data.petsDescription as string) || ''
                        }
                        onChange={(e) =>
                          updateEditData('petsDescription', e.target.value)
                        }
                        placeholder="Ex: Cachorros de pequeno porte"
                      />
                    </div>
                  )}

                  {/* Presença dos Pais */}
                  <div className="space-y-2">
                    <Label>Preferência de Presença dos Pais</Label>
                    <Select
                      value={
                        (editDialog.data.parentPresencePreference as string) ||
                        ''
                      }
                      onValueChange={(value) =>
                        updateEditData('parentPresencePreference', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {PARENT_PRESENCE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preferência de Tipo de Criança */}
                  <div className="space-y-2">
                    <Label>Preferência de Tipo de Criança (máx. 2)</Label>
                    <div className="flex flex-wrap gap-2">
                      {CHILD_TYPE_OPTIONS.map((option) => {
                        const current =
                          (editDialog.data.childTypePreference as string[]) ||
                          [];
                        const isChecked = current.includes(option.value);
                        const isDisabled = !isChecked && current.length >= 2;
                        return (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}
                          >
                            <Checkbox
                              checked={isChecked}
                              disabled={isDisabled}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateEditData('childTypePreference', [
                                    ...current,
                                    option.value,
                                  ]);
                                } else {
                                  updateEditData(
                                    'childTypePreference',
                                    current.filter((v) => v !== option.value),
                                  );
                                }
                              }}
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Metodologia de Cuidado */}
                  <div className="space-y-2">
                    <Label>Metodologia de Cuidado</Label>
                    <Select
                      value={(editDialog.data.careMethodology as string) || ''}
                      onValueChange={(value) =>
                        updateEditData('careMethodology', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARE_METHODOLOGY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Activities Section - handles both 'activities' and 'preferences' for backwards compatibility */}
              {(editDialog.section === 'activities' ||
                editDialog.section === 'preferences') && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Use as seções individuais para editar atividades.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setEditDialog({ open: false, section: '', data: {} })
                }
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Disponibilidade */}
        <Dialog
          open={isEditingAvailability}
          onOpenChange={setIsEditingAvailability}
        >
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Editar Disponibilidade</DialogTitle>
              <DialogDescription>
                Selecione os dias e períodos em que você está disponível.
              </DialogDescription>
            </DialogHeader>
            <AvailabilityGridEditor
              initialSlots={
                (nannyData?.availabilityJson as { slots?: string[] })?.slots ||
                []
              }
              onSaved={() => setIsEditingAvailability(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Modal de Validação de Documento */}
        <DocumentValidationModal
          open={documentValidationModalOpen}
          onOpenChange={setDocumentValidationModalOpen}
          onSuccess={refreshData}
        />

        {/* Modal de Validação Premium */}
        <ValidationModal
          open={validationModalOpen}
          onOpenChange={setValidationModalOpen}
          onSuccess={refreshData}
          hasActivePlan={hasActiveSubscription}
          documentValidated={isDocumentValid}
        />

        {/* Modal de Validação de Selfie (Prova de Vida) */}
        <SelfieValidationModal
          open={selfieModalOpen}
          onOpenChange={setSelfieModalOpen}
          onSuccess={refreshData}
          hasActivePlan={hasActiveSubscription}
        />

        {/* Modal de Validação de Antecedentes (Background Check) */}
        <BackgroundCheckModal
          open={backgroundCheckModalOpen}
          onOpenChange={setBackgroundCheckModalOpen}
          onSuccess={refreshData}
          hasActivePlan={hasActiveSubscription}
          cpf={nannyData?.cpf || null}
        />

        {/* Modal de Verificação de E-mail */}
        <Dialog
          open={emailVerificationModalOpen}
          onOpenChange={(open) => {
            setEmailVerificationModalOpen(open);
            if (!open) setEmailVerificationCode('');
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PiEnvelope className="size-5 text-fuchsia-600" />
                Verificar E-mail
              </DialogTitle>
              <DialogDescription>
                Digite o código de 6 dígitos enviado para seu e-mail.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="emailCode">Código de Verificação</Label>
                <Input
                  id="emailCode"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={emailVerificationCode}
                  onChange={(e) =>
                    setEmailVerificationCode(
                      e.target.value.replace(/\D/g, '').slice(0, 6),
                    )
                  }
                  className="text-center font-mono text-2xl tracking-widest"
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      emailVerificationCode.length === 6
                    ) {
                      handleVerifyEmailCode();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleResendEmailVerification}
                disabled={isResendingEmail}
                className="text-sm text-fuchsia-600 underline hover:text-fuchsia-700 disabled:opacity-50"
              >
                {isResendingEmail
                  ? 'Enviando...'
                  : 'Não recebeu? Reenviar código'}
              </button>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEmailVerificationModalOpen(false);
                  setEmailVerificationCode('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleVerifyEmailCode}
                disabled={
                  isVerifyingEmail || emailVerificationCode.length !== 6
                }
              >
                {isVerifyingEmail ? (
                  <>
                    <PiSpinner className="mr-2 size-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Address Search Modal */}
        <AddressSearchModal
          open={addressSearchModalOpen}
          onOpenChange={setAddressSearchModalOpen}
          onPlaceSelected={handleAddressSelected}
        />

        {/* Seal Upgrade Banner */}
        <SealUpgradeBanner
          hasIdentificada={hasIdentificada}
          hasPro={hasActiveSubscription}
          hasVerificadaRequirements={hasVerificadaRequirements}
        />
      </>
    );
  }

  // No profile found
  return (
    <>
      <PageTitle title="Perfil - Cuidly" />
      <Card className="p-8 text-center">
        <PiWarningCircle className="mx-auto size-12 text-gray-300" />
        <p className="mt-4 text-gray-500">Perfil não encontrado</p>
        <Button className="mt-4" onClick={() => router.push('/app')}>
          Voltar ao Dashboard
        </Button>
      </Card>
    </>
  );
}
