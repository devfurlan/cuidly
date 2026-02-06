'use client';

import PageContent from '@/components/layout/PageContent';
import { PhotoUploadField } from '@/components/PhotoUploadField';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { brazilianStates } from '@/constants/brazilianStates';
import {
  ACCEPTS_HOLIDAY_WORK_OPTIONS,
  ACCEPTED_ACTIVITIES_OPTIONS,
  ACTIVITIES_NOT_ACCEPTED_OPTIONS,
  AGE_RANGES_EXPERIENCE_OPTIONS,
  ATTENDANCE_MODES,
  AVAILABILITY_SCHEDULES,
  CERTIFICATIONS_OPTIONS,
  COMFORT_WITH_PETS_OPTIONS,
  CONTRACT_REGIME_OPTIONS,
  HOURLY_RATE_RANGE_OPTIONS,
  LANGUAGES_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  MAX_TRAVEL_DISTANCE_OPTIONS,
  NANNY_TYPE_OPTIONS,
  PARENT_PRESENCE_PREFERENCE_OPTIONS,
  SERVICE_TYPES,
  SKILLS,
  SPECIALTIES,
  STRENGTHS_OPTIONS,
} from '@/constants/nannyOptions';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { publicFilesUrl } from '@/constants/publicFilesUrl';
import { useToast } from '@/hooks/useToast';
import { deleteFile, uploadPublicImage } from '@/lib/supabase/storage/client';
import { FormNannyEditSchema, FormNanny } from '@/schemas/nannySchemas';
import { getNannyBySlug, updateNanny } from '@/services/nannyService';
import { convertBlobUrlToFile } from '@/utils/convertBlobUrlToFile';
import { EXPERIENCE_YEARS_OPTIONS } from '@/utils/getExperienceYearsLabel';
import { maskAlphanumeric } from '@/utils/maskAlphanumeric';
import { parseDateToBR } from '@/utils/parseDateToBR';
import { removeNonNumericCharacters } from '@/utils/removeNonNumericCharacters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Address, Nanny } from '@prisma/client';
import { ArrowRightIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FocusEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

// Phone formatting functions
function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '').slice(0, 11);
  if (cleaned.length === 0) return '';
  let masked = '(' + cleaned.substring(0, 2);
  if (cleaned.length >= 3) {
    masked += ') ' + cleaned.substring(2, 7);
  }
  if (cleaned.length >= 8) {
    if (cleaned.length === 11 || (cleaned.length > 7 && cleaned[2] === '9')) {
      masked = '(' + cleaned.substring(0, 2) + ') ' + cleaned.substring(2, 7) + '-' + cleaned.substring(7, 11);
    } else {
      masked = '(' + cleaned.substring(0, 2) + ') ' + cleaned.substring(2, 6) + '-' + cleaned.substring(6, 10);
    }
  }
  return masked;
}

function phoneToE164(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return `+${cleaned}`;
  }
  const phoneDigits = cleaned.startsWith('55') ? cleaned.substring(2) : cleaned;
  return `+55${phoneDigits}`;
}

function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('55') && cleaned.length > 11) {
    cleaned = cleaned.substring(2);
  }
  return maskPhone(cleaned);
}

export default function EditNannyPage() {
  const { slug } = useParams();
  const [nanny, setNanny] = useState<Partial<Nanny & { address?: Address | null }> | null>();
  const [imageUrl, setImageUrl] = useState('');
  const [oldAvatarUrl, setOldAvatarUrl] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'personal-data';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const form = useForm<FormNanny>({
    resolver: zodResolver(FormNannyEditSchema),
    defaultValues: async () => {
      const nanny = await getNannyBySlug(slug as string);

      if (!nanny) {
        router.push('/404');
        return {} as FormNanny;
      }

      setNanny(nanny);
      setImageUrl(nanny.photoUrl || '');
      setOldAvatarUrl(nanny.photoUrl || '');

      return {
        name: nanny.name || '',
        cpf: maskAlphanumeric(nanny.cpf as string, '###.###.###-##') || '',
        emailAddress: nanny.emailAddress || '',
        birthDate: nanny.birthDate
          ? parseDateToBR(
              typeof nanny.birthDate === 'string'
                ? (nanny.birthDate as string).split('T')[0]
                : (nanny.birthDate as Date).toISOString().split('T')[0],
            )
          : '',
        gender: nanny.gender || '',
        phoneNumber: formatPhoneDisplay(nanny.phoneNumber as string) || '',
        status: nanny.status || '',
        isSmoker: nanny.isSmoker || false,
        pixType: nanny.pixType || 'null',
        pixKey: nanny.pixKey || '',
        motherName: nanny.motherName || '',
        birthCity: nanny.birthCity || '',
        birthState: nanny.birthState || '',
        experienceYears: nanny.experienceYears || undefined,
        hourlyRate: nanny.hourlyRate ? Number(nanny.hourlyRate) : undefined,
        minChildAge: nanny.minChildAge || undefined,
        maxChildAge: nanny.maxChildAge || undefined,
        specialties: Array.isArray(nanny.specialtiesJson) ? nanny.specialtiesJson : [],
        availabilitySchedules: Array.isArray(nanny.availabilityJson) ? nanny.availabilityJson : [],
        serviceTypes: Array.isArray(nanny.serviceTypesJson) ? nanny.serviceTypesJson : [],
        attendanceModes: Array.isArray(nanny.attendanceModesJson) ? nanny.attendanceModesJson : [],
        skills: Array.isArray(nanny.skillsJson) ? nanny.skillsJson : [],
        acceptsHolidayWork: nanny.acceptsHolidayWork || undefined,
        hourlyRateReference: nanny.hourlyRateReference ? Number(nanny.hourlyRateReference) : undefined,
        // Personal/lifestyle fields
        maritalStatus: nanny.maritalStatus || undefined,
        hasChildren: nanny.hasChildren || false,
        hasCnh: nanny.hasCnh || false,
        hasVehicle: nanny.hasVehicle || false,
        // New onboarding fields
        nannyTypes: Array.isArray(nanny.nannyTypes) ? nanny.nannyTypes : [],
        contractRegimes: Array.isArray(nanny.contractRegimes) ? nanny.contractRegimes : [],
        hourlyRateRange: nanny.hourlyRateRange || undefined,
        activitiesNotAccepted: Array.isArray(nanny.activitiesNotAccepted) ? nanny.activitiesNotAccepted : [],
        maxChildrenCare: nanny.maxChildrenCare || undefined,
        // V2.0 fields
        maxTravelDistance: nanny.maxTravelDistance || undefined,
        ageRangesExperience: Array.isArray(nanny.ageRangesExperience) ? nanny.ageRangesExperience : [],
        hasSpecialNeedsExperience: nanny.hasSpecialNeedsExperience || false,
        specialNeedsExperienceDescription: nanny.specialNeedsExperienceDescription || '',
        certifications: Array.isArray(nanny.certifications) ? nanny.certifications : [],
        languages: Array.isArray(nanny.languages) ? nanny.languages : [],
        childTypePreference: Array.isArray(nanny.childTypePreference) ? nanny.childTypePreference : [],
        strengths: Array.isArray(nanny.strengths) ? nanny.strengths : [],
        careMethodology: nanny.careMethodology || undefined,
        comfortableWithPets: nanny.comfortableWithPets || undefined,
        petsDescription: nanny.petsDescription || '',
        acceptedActivities: Array.isArray(nanny.acceptedActivities) ? nanny.acceptedActivities : [],
        parentPresencePreference: nanny.parentPresencePreference || undefined,
        aboutMe: nanny.aboutMe || '',
        address: {
          zipCode: maskAlphanumeric(nanny.address?.zipCode as string, '#####-###') || '',
          street: nanny.address?.streetName || '',
          number: nanny.address?.number || '',
          complement: nanny.address?.complement || '',
          neighborhood: nanny.address?.neighborhood || '',
          city: nanny.address?.city || '',
          state: nanny.address?.state || '',
        },
      } as FormNanny;
    },
  });

  const handleValidationError = (errors: any) => {
    const errorFields = Object.keys(errors);
    if (errors.address) {
      handleTabChange('address');
    } else if (errorFields.some(field => ['pixKey', 'pixType', 'hourlyRate', 'hourlyRateReference'].includes(field))) {
      handleTabChange('bank-data');
    } else if (errorFields.some(field => ['experienceYears', 'specialties', 'availabilitySchedules', 'serviceTypes', 'attendanceModes', 'skills', 'minChildAge', 'maxChildAge', 'acceptsHolidayWork'].includes(field))) {
      handleTabChange('professional-data');
    } else {
      handleTabChange('personal-data');
    }
  };

  async function handleCpf(event: FocusEvent<HTMLInputElement>) {
    const cpf = event.target.value;
    const maskedValue = maskAlphanumeric(cpf, '###.###.###-##');
    form.setValue('cpf', maskedValue);

    if (cpf.length < 14) return;

    const response = await fetch(
      `/api/data/basic-data?document=${removeNonNumericCharacters(cpf)}`,
    );

    if (!response.ok) {
      form.setError('cpf', { type: 'manual', message: 'CPF não encontrado' });
      return;
    }

    form.clearErrors('cpf');
    const result = await response.json();
    const basicData = result.Result[0].BasicData;
    const gender = basicData.Gender === 'M' ? 'MALE' : basicData.Gender === 'F' ? 'FEMALE' : 'OTHER';

    form.setValue('name', basicData.Name);
    form.setValue('birthDate', parseDateToBR(basicData.BirthDate));
    form.setValue('gender', gender);
  }

  async function onSubmit(data: FormNanny) {
    let uploadedUrl = '';

    if (oldAvatarUrl && (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:'))) {
      try {
        await deleteFile(publicFilesUrl(oldAvatarUrl));
      } catch (error) {
        console.error('Error deleting the old avatar:', error);
      }
    }

    if (imageUrl && (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:'))) {
      const { file } = await convertBlobUrlToFile(imageUrl);
      const { imageUrl: newImageUrl, error } = await uploadPublicImage({
        file: file,
        folder: `nanny/${nanny?.slug || slug}/`,
        nameCustom: 'avatar',
      });

      if (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Erro ao enviar imagem',
          description: 'Falha no upload da imagem. Tente novamente.',
        });
        return;
      }

      uploadedUrl = newImageUrl;
      setImageUrl(newImageUrl);
      setOldAvatarUrl(newImageUrl);
    } else {
      uploadedUrl = oldAvatarUrl;
    }

    data.phoneNumber = phoneToE164(data.phoneNumber);

    try {
      const updatedNanny = await updateNanny(nanny?.id as number, data, uploadedUrl);
      toast({
        variant: 'success',
        title: 'Babá atualizada com sucesso!',
        description: `Os dados da babá ${updatedNanny.name} foram atualizados.`,
      });
    } catch (err) {
      console.error('Erro ao atualizar babá:', err);
      if (uploadedUrl && uploadedUrl !== oldAvatarUrl) {
        await deleteFile(`${publicFilesUrl(uploadedUrl)}`);
      }
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar babá',
        description: 'Verifique os dados e tente novamente.',
      });
    }
  }

  return (
    <PageContent title={`Editar: ${nanny?.name}`}>
      <Tabs
        className="mb-8 mt-2 flex w-full items-start gap-8 text-gray-200"
        defaultValue="personal-data"
        value={currentTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="flex h-auto w-[320px] flex-col justify-start">
          <TabsTrigger value="personal-data" className="w-full justify-start font-medium hover:text-gray-900">
            Dados pessoais
          </TabsTrigger>
          <TabsTrigger value="bank-data" className="w-full justify-start font-medium hover:text-gray-900">
            Dados bancários
          </TabsTrigger>
          <TabsTrigger value="address" className="w-full justify-start font-medium hover:text-gray-900">
            Endereço
          </TabsTrigger>
          <TabsTrigger value="professional-data" className="w-full justify-start font-medium hover:text-gray-900">
            Dados profissionais
          </TabsTrigger>
          <Separator className="my-2" />
          <TabsTrigger value="profile" className="group w-full justify-start font-medium hover:text-gray-900" asChild>
            <Link href={`/nannies/${slug}`}>
              Ver perfil <ArrowRightIcon className="ml-2 size-4 transition-all duration-500 group-hover:ml-3.5" />
            </Link>
          </TabsTrigger>
          <a
            href={`https://www.cuidly.com/baba/${nanny?.address?.city ? nanny.address.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-') : 'cidade'}/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex w-full items-center justify-start whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Ver perfil publico <ArrowRightIcon className="ml-2 size-4 transition-all duration-500 group-hover:ml-3.5" />
          </a>
        </TabsList>

        <div className="w-full md:w-1/2 md:max-w-[600px]">
          <TabsContent value="personal-data">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, handleValidationError)}>
                <div className="grid gap-4">
                  <PhotoUploadField
                    imageUrl={imageUrl}
                    onImageChange={setImageUrl}
                    name={form.watch('name') || nanny?.name || ''}
                  />

                  <FormField
                    name="cpf"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123.456.789-00"
                            {...field}
                            value={field.value || ''}
                            onChange={handleCpf}
                            required
                            disabled
                            className="bg-gray-50 text-gray-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Maria Aparecida da Silva"
                            {...field}
                            value={field.value || ''}
                            required
                            disabled
                            className="bg-gray-50 text-gray-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="birthDate"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de nascimento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="05/11/1990"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => form.setValue('birthDate', maskAlphanumeric(e.target.value, '##/##/####'))}
                            required
                            disabled
                            className="bg-gray-50 text-gray-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="gender"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Sexo</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'NONE' ? null : value)} value={field.value ?? 'NONE'} defaultValue={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um sexo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">Nenhum</SelectItem>
                            <SelectItem value="MALE">Masculino</SelectItem>
                            <SelectItem value="FEMALE">Feminino</SelectItem>
                            <SelectItem value="OTHER">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="phoneNumber"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 91234-5678"
                            {...field}
                            value={formatPhoneDisplay(field.value || '')}
                            onChange={(e) => form.setValue('phoneNumber', maskPhone(e.target.value))}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="emailAddress"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="maria@email.com" {...field} value={field.value || ''} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="motherName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Nome completo da mãe</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome completo da mãe" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      name="birthCity"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel isOptional>Cidade de nascimento</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="birthState"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel isOptional>Estado de nascimento</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um estado" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(brazilianStates).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PENDING">Pendente</SelectItem>
                            <SelectItem value="ACTIVE">Ativo</SelectItem>
                            <SelectItem value="INACTIVE">Inativo</SelectItem>
                            <SelectItem value="SUSPENDED">Suspenso</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="isSmoker"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="my-2 flex items-center gap-2">
                        <FormLabel>É fumante?</FormLabel>
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0!" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="maritalStatus"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Estado civil</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'NONE' ? null : value)} value={field.value ?? 'NONE'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o estado civil" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">Nenhum</SelectItem>
                            {MARITAL_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <FormField
                      name="hasChildren"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="my-2 flex items-center gap-2">
                          <FormLabel>Tem filhos?</FormLabel>
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0!" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="hasCnh"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="my-2 flex items-center gap-2">
                          <FormLabel>Tem CNH?</FormLabel>
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0!" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="hasVehicle"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="my-2 flex items-center gap-2">
                          <FormLabel>Tem veículo?</FormLabel>
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0!" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="fixed bottom-0 right-0 m-8">
                  <Button type="submit" className="mt-4" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Editando...' : 'Editar'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="bank-data">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, handleValidationError)}>
                <div className="grid gap-4">
                  <FormField
                    name="pixType"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Tipo da chave</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); form.setValue('pixKey', ''); }} value={field.value || ''} defaultValue={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">Selecione um tipo</SelectItem>
                            <SelectItem value="CNPJ">CNPJ</SelectItem>
                            <SelectItem value="CPF">CPF</SelectItem>
                            <SelectItem value="EMAIL">E-mail</SelectItem>
                            <SelectItem value="PHONE">Telefone</SelectItem>
                            <SelectItem value="EVP">Chave aleatória</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="pixKey"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Chave PIX</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="maria@email.com"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              const pixType = form.getValues('pixType');
                              let maskedValue = value;
                              if (pixType === 'CPF') maskedValue = maskAlphanumeric(value, '###.###.###-##');
                              else if (pixType === 'PHONE') maskedValue = maskAlphanumeric(value, '(##) #####-####');
                              else if (pixType === 'CNPJ') maskedValue = maskAlphanumeric(value, '##.###.###/####-##');
                              field.onChange(maskedValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="hourlyRate"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Valor hora (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="50.00"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="hourlyRateReference"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor por hora - referência (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="50.00"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="fixed bottom-0 right-0 m-8">
                  <Button type="submit" className="mt-4" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Editando...' : 'Editar'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="address">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, handleValidationError)}>
                <div className="grid gap-4">
                  <FormField
                    name="address.zipCode"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12345-678"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => form.setValue('address.zipCode', maskAlphanumeric(e.target.value, '#####-###'))}
                            onBlur={async (e) => {
                              const cep = e.target.value.replace(/\D/g, '');
                              if (cep.length === 8) {
                                try {
                                  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
                                  if (response.ok) {
                                    const data = await response.json();
                                    form.setValue('address.street', data.street);
                                    form.setValue('address.neighborhood', data.neighborhood);
                                    form.setValue('address.city', data.city);
                                    form.setValue('address.state', data.state);
                                  }
                                } catch (error) {
                                  console.error('Error fetching address data:', error);
                                }
                              }
                            }}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField name="address.street" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl><Input placeholder="Rua Exemplo" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="address.number" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel isOptional>Número</FormLabel>
                      <FormControl><Input placeholder="123" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="address.complement" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel isOptional>Complemento</FormLabel>
                      <FormControl><Input placeholder="Apto 101" {...field} value={field.value || ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="address.neighborhood" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl><Input placeholder="Bairro Exemplo" {...field} value={field.value || ''} required /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField name="address.city" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl><Input placeholder="Cidade Exemplo" {...field} value={field.value || ''} required /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField
                    name="address.state"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value || ''}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(brazilianStates).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="fixed bottom-0 right-0 m-8">
                  <Button type="submit" className="mt-4" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Editando...' : 'Editar'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="professional-data">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, handleValidationError)}>
                <div className="grid gap-4">
                  <FormField
                    name="experienceYears"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Tempo de experiência</FormLabel>
                        <Select
                          value={field.value?.toString() || ''}
                          onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : undefined)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tempo de experiência" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EXPERIENCE_YEARS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      name="minChildAge"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel isOptional>Idade mínima da criança</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="18" placeholder="0" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="maxChildAge"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel isOptional>Idade máxima da criança</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="18" placeholder="18" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    name="specialties"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Especialidades</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {SPECIALTIES.map((specialty) => (
                            <FormField
                              key={specialty}
                              control={form.control}
                              name="specialties"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(specialty)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, specialty] : currentValue.filter((v) => v !== specialty);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{specialty}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="availabilitySchedules"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Disponibilidade de Horarios</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {AVAILABILITY_SCHEDULES.map((schedule) => (
                            <FormField
                              key={schedule.value}
                              control={form.control}
                              name="availabilitySchedules"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(schedule.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, schedule.value] : currentValue.filter((v) => v !== schedule.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{schedule.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="serviceTypes"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Tipos de Serviço</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {SERVICE_TYPES.map((type) => (
                            <FormField
                              key={type.value}
                              control={form.control}
                              name="serviceTypes"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(type.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, type.value] : currentValue.filter((v) => v !== type.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{type.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="attendanceModes"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Modalidade de Atendimento</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {ATTENDANCE_MODES.map((mode) => (
                            <FormField
                              key={mode.value}
                              control={form.control}
                              name="attendanceModes"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(mode.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, mode.value] : currentValue.filter((v) => v !== mode.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{mode.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="skills"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Habilidades</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {SKILLS.map((skill) => (
                            <FormField
                              key={skill.value}
                              control={form.control}
                              name="skills"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(skill.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, skill.value] : currentValue.filter((v) => v !== skill.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{skill.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="acceptsHolidayWork"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Você aceita trabalhar em feriados?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === 'NONE' ? null : value)}
                            value={field.value ?? 'NONE'}
                            className="flex flex-col space-y-2"
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="NONE" id="holiday-none" />
                              <Label htmlFor="holiday-none" className="cursor-pointer font-normal">Nenhum</Label>
                            </div>
                            {ACCEPTS_HOLIDAY_WORK_OPTIONS.map((option) => (
                              <div key={option.value} className="flex items-center space-x-3">
                                <RadioGroupItem value={option.value} id={`holiday-${option.value}`} />
                                <Label htmlFor={`holiday-${option.value}`} className="cursor-pointer font-normal">{option.label}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="nannyTypes"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Tipo de Babá</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          {NANNY_TYPE_OPTIONS.map((type) => (
                            <FormField
                              key={type.value}
                              control={form.control}
                              name="nannyTypes"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(type.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, type.value] : currentValue.filter((v) => v !== type.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{type.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="contractRegimes"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Regime de Contratação</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          {CONTRACT_REGIME_OPTIONS.map((regime) => (
                            <FormField
                              key={regime.value}
                              control={form.control}
                              name="contractRegimes"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(regime.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, regime.value] : currentValue.filter((v) => v !== regime.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{regime.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="maxTravelDistance"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Raio de deslocamento</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'NONE' ? null : value)} value={field.value ?? 'NONE'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o raio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">Nenhum</SelectItem>
                            {MAX_TRAVEL_DISTANCE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="ageRangesExperience"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Faixa etária de experiência</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {AGE_RANGES_EXPERIENCE_OPTIONS.map((age) => (
                            <FormField
                              key={age.value}
                              control={form.control}
                              name="ageRangesExperience"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(age.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, age.value] : currentValue.filter((v) => v !== age.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{age.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="maxChildrenCare"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Máximo de crianças que pode cuidar</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="10" placeholder="3" {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="hasSpecialNeedsExperience"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="my-2 flex items-center gap-2">
                        <FormLabel>Experiência com crianças especiais?</FormLabel>
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0!" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="specialNeedsExperienceDescription"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Descrição da experiência com crianças especiais</FormLabel>
                        <FormControl>
                          <Input placeholder="Descreva sua experiencia..." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="certifications"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Certificações</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {CERTIFICATIONS_OPTIONS.map((cert) => (
                            <FormField
                              key={cert.value}
                              control={form.control}
                              name="certifications"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(cert.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, cert.value] : currentValue.filter((v) => v !== cert.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{cert.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="languages"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Idiomas</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {LANGUAGES_OPTIONS.map((lang) => (
                            <FormField
                              key={lang.value}
                              control={form.control}
                              name="languages"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(lang.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, lang.value] : currentValue.filter((v) => v !== lang.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{lang.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="strengths"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Pontos Fortes (max. 3)</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {STRENGTHS_OPTIONS.map((strength) => (
                            <FormField
                              key={strength.value}
                              control={form.control}
                              name="strengths"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(strength.value)}
                                      disabled={(field.value?.length || 0) >= 3 && !field.value?.includes(strength.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, strength.value] : currentValue.filter((v) => v !== strength.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{strength.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="comfortableWithPets"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Confortável com animais?</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'NONE' ? null : value)} value={field.value ?? 'NONE'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma opção" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">Nenhum</SelectItem>
                            {COMFORT_WITH_PETS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="petsDescription"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Descrição sobre animais</FormLabel>
                        <FormControl>
                          <Input placeholder="Descreva quais animais você aceita..." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="acceptedActivities"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Atividades que aceita fazer</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {ACCEPTED_ACTIVITIES_OPTIONS.map((activity) => (
                            <FormField
                              key={activity.value}
                              control={form.control}
                              name="acceptedActivities"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(activity.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, activity.value] : currentValue.filter((v) => v !== activity.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{activity.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="activitiesNotAccepted"
                    control={form.control}
                    render={() => (
                      <FormItem>
                        <FormLabel isOptional>Atividades que NÃO aceita fazer</FormLabel>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {ACTIVITIES_NOT_ACCEPTED_OPTIONS.map((activity) => (
                            <FormField
                              key={activity.value}
                              control={form.control}
                              name="activitiesNotAccepted"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(activity.value)}
                                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                                        const currentValue = field.value || [];
                                        const newValue = checked === true ? [...currentValue, activity.value] : currentValue.filter((v) => v !== activity.value);
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">{activity.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="parentPresencePreference"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Preferência de presença dos pais</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'NONE' ? null : value)} value={field.value ?? 'NONE'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma opção" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">Nenhum</SelectItem>
                            {PARENT_PRESENCE_PREFERENCE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="hourlyRateRange"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Faixa de valor por hora</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'NONE' ? null : value)} value={field.value ?? 'NONE'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a faixa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">Nenhum</SelectItem>
                            {HOURLY_RATE_RANGE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="fixed bottom-0 right-0 m-8">
                  <Button type="submit" className="mt-4" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Editando...' : 'Editar'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

        </div>
      </Tabs>
    </PageContent>
  );
}
