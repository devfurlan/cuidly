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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { brazilianStates } from '@/constants/brazilianStates';
import {
  ATTENDANCE_MODES,
  AVAILABILITY_SCHEDULES,
  SERVICE_TYPES,
  SKILLS,
  SPECIALTIES,
} from '@/constants/nannyOptions';
import { publicFilesUrl } from '@/constants/publicFilesUrl';
import { useToast } from '@/hooks/useToast';
import { deleteFile, uploadPublicImage } from '@/lib/supabase/storage/client';
import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';
import { convertBlobUrlToFile } from '@/utils/convertBlobUrlToFile';
import { EXPERIENCE_YEARS_OPTIONS } from '@/utils/getExperienceYearsLabel';
import { formatName } from '@/utils/formatName';
import { getGenderedTerm } from '@/utils/getGenderedTerm';
import { maskAlphanumeric } from '@/utils/maskAlphanumeric';
import { parseDateToBR } from '@/utils/parseDateToBR';
import { removeNonNumericCharacters } from '@/utils/removeNonNumericCharacters';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateNannySlug } from '@cuidly/shared/utils/slug';
import { useRouter, useSearchParams } from 'next/navigation';
import { FocusEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormNannySchema } from '../../../schemas/nannySchemas';
import {
  checkIfNannyExistsByCpf,
  createNanny,
} from '../../../services/nannyService';

// Phone formatting functions
function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '').slice(0, 11);

  if (cleaned.length === 0) return '';

  // Start with area code
  let masked = '(' + cleaned.substring(0, 2);

  if (cleaned.length >= 3) {
    masked += ') ' + cleaned.substring(2, 7);
  }

  if (cleaned.length >= 8) {
    // Cell phone (11 digits) or landline (10 digits)
    if (cleaned.length === 11 || (cleaned.length > 7 && cleaned[2] === '9')) {
      // Celular: (XX) 9XXXX-XXXX
      masked = '(' + cleaned.substring(0, 2) + ') ' + cleaned.substring(2, 7) + '-' + cleaned.substring(7, 11);
    } else {
      // Fixo: (XX) XXXX-XXXX
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

export default function CreateNannyPage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'personal-data';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const form = useForm<z.infer<typeof FormNannySchema>>({
    resolver: zodResolver(FormNannySchema),
    defaultValues: {
      isSmoker: false,
      status: 'ACTIVE',
      name: '',
      birthDate: '',
      cpf: '',
      phoneNumber: '',
      emailAddress: '',
      photoUrl: '',
      pixKey: '',
      motherName: '',
      birthCity: '',
      birthState: '',
      experienceYears: undefined,
      hourlyRate: undefined,
      minChildAge: undefined,
      maxChildAge: undefined,
      specialties: [],
      availabilitySchedules: [],
      serviceTypes: [],
      attendanceModes: [],
      skills: [],
      address: {
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
      },
    },
  });

  // Redirect to tab with validation errors
  const handleValidationError = (errors: any) => {
    const errorFields = Object.keys(errors);

    // Check which tab has errors
    if (errors.address) {
      handleTabChange('address');
    } else if (errorFields.some(field => ['pixKey', 'pixType', 'hourlyRate'].includes(field))) {
      handleTabChange('bank-data');
    } else if (errorFields.some(field => ['experienceYears', 'specialties', 'availabilitySchedules', 'serviceTypes', 'attendanceModes', 'skills', 'minChildAge', 'maxChildAge'].includes(field))) {
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

    try {
      await checkIfNannyExistsByCpf(cpf);
    } catch (error) {
      console.error('Babá já existe:', error);
      toast({
        variant: 'destructive',
        title: 'CPF já cadastrado',
        description: `Já existe uma babá com esse CPF cadastrada em nossa base.`,
      });
      form.setError('cpf', { message: 'CPF já cadastrado' });
      return;
    }

    const response = await fetch(
      `/api/data/basic-data?document=${removeNonNumericCharacters(cpf)}`,
    );

    if (!response.ok) {
      form.setError('cpf', {
        type: 'manual',
        message: 'CPF não encontrado',
      });
      return;
    }

    form.clearErrors('cpf');

    const result = await response.json();
    const basicData = result.Result[0].BasicData;
    const gender =
      basicData.Gender === 'M'
        ? 'MALE'
        : basicData.Gender === 'F'
          ? 'FEMALE'
          : 'OTHER';

    form.setValue('name', basicData.Name);
    form.setValue('birthDate', parseDateToBR(basicData.BirthDate));
    form.setValue('gender', gender);
  }

  async function onSubmit(data: z.infer<typeof FormNannySchema>) {
    // Check if CPF already exists before proceeding
    if (data.cpf) {
      try {
        await checkIfNannyExistsByCpf(data.cpf);
      } catch {
        toast({
          variant: 'destructive',
          title: 'CPF já cadastrado',
          description: 'Já existe uma babá com esse CPF cadastrada em nossa base.',
        });
        form.setError('cpf', { message: 'CPF já cadastrado' });
        handleTabChange('personal-data');
        return;
      }

      // Validate data against Receita Federal
      const response = await fetch(
        `/api/data/basic-data?document=${removeNonNumericCharacters(data.cpf)}`,
      );

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'CPF inválido',
          description: 'CPF não encontrado na base da Receita Federal.',
        });
        form.setError('cpf', { message: 'CPF não encontrado' });
        handleTabChange('personal-data');
        return;
      }

      const result = await response.json();
      const basicData = result.Result[0].BasicData;

      // Validate name
      const normalizedFormName = formatName(data.name).toUpperCase();
      const normalizedRFName = formatName(basicData.Name).toUpperCase();
      if (normalizedFormName !== normalizedRFName) {
        toast({
          variant: 'destructive',
          title: 'Nome não confere',
          description: `O nome informado não corresponde ao cadastrado na Receita Federal: ${basicData.Name}`,
        });
        form.setError('name', { message: 'Nome não confere com a Receita Federal' });
        handleTabChange('personal-data');
        return;
      }

      // Validate birth date
      const formBirthDate = data.birthDate.split('/').reverse().join('-'); // Convert DD/MM/YYYY to YYYY-MM-DD
      const rfBirthDate = basicData.BirthDate.split('T')[0]; // Get YYYY-MM-DD from ISO string
      if (formBirthDate !== rfBirthDate) {
        toast({
          variant: 'destructive',
          title: 'Data de nascimento não confere',
          description: `A data de nascimento informada não corresponde à cadastrada na Receita Federal: ${parseDateToBR(rfBirthDate)}`,
        });
        form.setError('birthDate', { message: 'Data de nascimento não confere com a Receita Federal' });
        handleTabChange('personal-data');
        return;
      }
    }

    let uploadedUrl = '';

    // Generate slug first to use in folder names
    const parsedName = formatName(data.name);
    const nannySlug = generateNannySlug(parsedName);

    // Upload da nova imagem
    if (
      imageUrl &&
      (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:'))
    ) {
      const { file } = await convertBlobUrlToFile(imageUrl);

      const { imageUrl: newImageUrl, error } = await uploadPublicImage({
        file: file,
        folder: `nanny/${nannySlug}/`,
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
      setImageUrl('');
    }

    // Convert phone to E.164 format before saving
    data.phoneNumber = phoneToE164(data.phoneNumber);

    try {
      await createNanny(data, uploadedUrl, nannySlug);
      const term = getGenderedTerm(
        data.gender || null,
        'baba',
        'baba',
      );
      toast({
        variant: 'success',
        title: `${capitalizeFirstLetter(term)} adicionada com sucesso!`,
        description: `${data.name} foi adicionada e já esta na nossa base.`,
      });
      router.push('/nannies');
    } catch (err) {
      console.error('Erro ao adicionar baba:', err);

      if (uploadedUrl) {
        await deleteFile(`${publicFilesUrl(uploadedUrl)}`);
      }

      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar baba',
        description: 'Verifique os dados e tente novamente.',
      });
    }
  }

  return (
    <PageContent title="Adicionar baba">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, handleValidationError)}>
          <Tabs
            className="mb-8 flex w-full items-start gap-8"
            defaultValue="personal-data"
            value={currentTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="flex h-auto w-[320px] flex-col justify-start">
              <TabsTrigger
                value="personal-data"
                className="w-full justify-start font-medium"
              >
                Dados pessoais
              </TabsTrigger>
              <TabsTrigger
                value="bank-data"
                className="w-full justify-start font-medium"
              >
                Dados bancarios
              </TabsTrigger>
              <TabsTrigger
                value="address"
                className="w-full justify-start font-medium"
              >
                Endereco
              </TabsTrigger>
              <TabsTrigger
                value="professional-data"
                className="w-full justify-start font-medium"
              >
                Dados profissionais
              </TabsTrigger>
            </TabsList>

            <div className="w-full md:w-1/2 md:max-w-[600px]">
              <TabsContent value="personal-data">
                <div className="grid gap-4">
                  <PhotoUploadField
                    imageUrl={imageUrl}
                    onImageChange={setImageUrl}
                    name={form.watch('name')}
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
                            required
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
                            onChange={(e) =>
                              form.setValue(
                                'birthDate',
                                maskAlphanumeric(e.target.value, '##/##/####'),
                              )
                            }
                            required
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
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === 'NONE' ? null : value)
                          }
                          value={field.value ?? 'NONE'}
                          defaultValue={field.value || ''}
                        >
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
                            value={formatPhoneDisplay(field.value)}
                            onChange={(e) => {
                              const masked = maskPhone(e.target.value);
                              form.setValue('phoneNumber', masked);
                            }}
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
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="maria@email.com"
                            {...field}
                            type="email"
                            required
                          />
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
                        <FormLabel isOptional>Nome completo da mae</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome completo da mae"
                            {...field}
                          />
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
                            <Input placeholder="Cidade" {...field} />
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
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um estado" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(brazilianStates).map(
                                  ([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                      {value}
                                    </SelectItem>
                                  ),
                                )}
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
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
                        <FormLabel>E fumante?</FormLabel>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0!"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="bank-data">
                <div className="grid gap-4">
                  <FormField
                    name="pixType"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Tipo da chave</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('pixKey', '');
                          }}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder="Selecione um tipo"
                                className="text-muted-foreground!"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CNPJ">CNPJ</SelectItem>
                            <SelectItem value="CPF">CPF</SelectItem>
                            <SelectItem value="EMAIL">E-mail</SelectItem>
                            <SelectItem value="PHONE">Telefone</SelectItem>
                            <SelectItem value="EVP">Chave aleatoria</SelectItem>
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

                              if (pixType === 'CPF') {
                                maskedValue = maskAlphanumeric(
                                  value,
                                  '###.###.###-##',
                                );
                              } else if (pixType === 'PHONE') {
                                maskedValue = maskAlphanumeric(
                                  value,
                                  '(##) #####-####',
                                );
                              } else if (pixType === 'CNPJ') {
                                maskedValue = maskAlphanumeric(
                                  value,
                                  '##.###.###/####-##',
                                );
                              }

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
                </div>
              </TabsContent>
              <TabsContent value="address">
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
                            onChange={(e) =>
                              form.setValue(
                                'address.zipCode',
                                maskAlphanumeric(e.target.value, '#####-###'),
                              )
                            }
                            onBlur={async (e) => {
                              const cep = e.target.value.replace(/\D/g, '');
                              if (cep.length === 8) {
                                try {
                                  const response = await fetch(
                                    `https://brasilapi.com.br/api/cep/v2/${cep}`,
                                  );
                                  if (response.ok) {
                                    const data = await response.json();
                                    form.setValue(
                                      'address.street',
                                      data.street,
                                    );
                                    form.setValue(
                                      'address.neighborhood',
                                      data.neighborhood,
                                    );
                                    form.setValue('address.city', data.city);
                                    form.setValue('address.state', data.state);
                                  }
                                } catch (error) {
                                  console.error(
                                    'Error fetching address data:',
                                    error,
                                  );
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

                  <FormField
                    name="address.street"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Rua</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua Exemplo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address.number"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address.complement"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Complemento</FormLabel>
                        <FormControl>
                          <Input placeholder="Apto 101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address.neighborhood"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Bairro Exemplo"
                            {...field}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address.city"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cidade Exemplo"
                            {...field}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="address.state"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(brazilianStates).map(
                                ([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {value}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="professional-data">
                <div className="grid gap-4">
                  <FormField
                    name="experienceYears"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel isOptional>Tempo de experiencia</FormLabel>
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
                          <FormLabel isOptional>Idade minima da crianca</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="18"
                              placeholder="0"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
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
                          <FormLabel isOptional>Idade maxima da crianca</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="18"
                              placeholder="18"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
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
                                      onCheckedChange={(
                                        checked: boolean | 'indeterminate',
                                      ) => {
                                        const currentValue = field.value || [];
                                        const newValue =
                                          checked === true
                                            ? [...currentValue, specialty]
                                            : currentValue.filter(
                                                (v) => v !== specialty,
                                              );
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">
                                    {specialty}
                                  </FormLabel>
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
                        <FormLabel isOptional>
                          Disponibilidade de Horarios
                        </FormLabel>
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
                                      checked={field.value?.includes(
                                        schedule.value,
                                      )}
                                      onCheckedChange={(
                                        checked: boolean | 'indeterminate',
                                      ) => {
                                        const currentValue = field.value || [];
                                        const newValue =
                                          checked === true
                                            ? [...currentValue, schedule.value]
                                            : currentValue.filter(
                                                (v) => v !== schedule.value,
                                              );
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">
                                    {schedule.label}
                                  </FormLabel>
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
                        <FormLabel isOptional>Tipos de Servico</FormLabel>
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
                                      checked={field.value?.includes(
                                        type.value,
                                      )}
                                      onCheckedChange={(
                                        checked: boolean | 'indeterminate',
                                      ) => {
                                        const currentValue = field.value || [];
                                        const newValue =
                                          checked === true
                                            ? [...currentValue, type.value]
                                            : currentValue.filter(
                                                (v) => v !== type.value,
                                              );
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">
                                    {type.label}
                                  </FormLabel>
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
                        <FormLabel isOptional>
                          Modalidade de Atendimento
                        </FormLabel>
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
                                      checked={field.value?.includes(
                                        mode.value,
                                      )}
                                      onCheckedChange={(
                                        checked: boolean | 'indeterminate',
                                      ) => {
                                        const currentValue = field.value || [];
                                        const newValue =
                                          checked === true
                                            ? [...currentValue, mode.value]
                                            : currentValue.filter(
                                                (v) => v !== mode.value,
                                              );
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">
                                    {mode.label}
                                  </FormLabel>
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
                                      checked={field.value?.includes(
                                        skill.value,
                                      )}
                                      onCheckedChange={(
                                        checked: boolean | 'indeterminate',
                                      ) => {
                                        const currentValue = field.value || [];
                                        const newValue =
                                          checked === true
                                            ? [...currentValue, skill.value]
                                            : currentValue.filter(
                                                (v) => v !== skill.value,
                                              );
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-normal">
                                    {skill.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

            </div>
          </Tabs>

          <div className="fixed bottom-0 right-0 m-8">
            <Button
              type="submit"
              className="mt-4"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </Form>
    </PageContent>
  );
}
