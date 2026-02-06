'use client';

import { PiCaretLeft, PiCaretRight, PiCheck, PiWarningCircle } from 'react-icons/pi';

import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { Button } from '@/components/ui/shadcn/button';
import { Checkbox } from '@/components/ui/shadcn/checkbox';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { Progress } from '@/components/ui/shadcn/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { BRAZILIAN_STATES } from '@/constants/brazilian-states';
import {
  ATTENDANCE_MODES,
  AVAILABILITY_SCHEDULES,
  CHILD_AGE_EXPERIENCES,
  SERVICE_TYPES,
  SKILLS,
  SPECIALTIES,
} from '@/schemas/nanny-registration';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatPhoneDisplay, phoneToE164, maskCPF, maskPhone, maskCEP, maskDate } from '@/helpers/formatters';

const STEPS = [
  { id: 1, title: 'Dados Pessoais', description: 'Suas informações básicas' },
  { id: 2, title: 'Endereço', description: 'Onde você mora' },
  { id: 3, title: 'Experiência', description: 'Sua experiência profissional' },
  { id: 4, title: 'Disponibilidade', description: 'Quando pode trabalhar' },
  { id: 5, title: 'Sobre você', description: 'Conte mais sobre você' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [nannyId, setNannyId] = useState<number | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Personal data
    name: '',
    cpf: '',
    birthDate: '',
    gender: '',
    phoneNumber: '',

    // Step 2: Address
    zipCode: '',
    streetName: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',

    // Step 3: Experience
    specialties: [] as string[],
    experienceYears: 0,
    childAgeExperiences: [] as string[],

    // Step 4: Availability
    availabilitySchedules: [] as string[],
    serviceTypes: [] as string[],
    attendanceModes: [] as string[],
    hourlyRate: '',

    // Step 5: About
    skills: [] as string[],
    isSmoker: false,
  });

  // Load user data on mount
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      // Load existing nanny data if any
      try {
        const response = await fetch(`/api/nannies/by-user/${user.id}`);
        if (response.ok) {
          const nanny = await response.json();
          setNannyId(nanny.id);

          // Pre-fill form with existing data
          setFormData((prev) => ({
            ...prev,
            name: nanny.name || user.user_metadata?.name || '',
            cpf: nanny.cpf ? maskCPF(nanny.cpf) : '',
            birthDate: nanny.birthDate
              ? formatDateForDisplay(nanny.birthDate)
              : '',
            gender: nanny.gender || '',
            phoneNumber: nanny.phoneNumber
              ? formatPhoneDisplay(nanny.phoneNumber)
              : '',
            zipCode: nanny.address?.zipCode
              ? maskCEP(nanny.address.zipCode)
              : '',
            streetName: nanny.address?.streetName || '',
            number: nanny.address?.number || '',
            complement: nanny.address?.complement || '',
            neighborhood: nanny.address?.neighborhood || '',
            city: nanny.address?.city || '',
            state: nanny.address?.state || '',
            specialties: nanny.specialtiesJson || [],
            experienceYears: nanny.experienceYears || 0,
            childAgeExperiences: nanny.childAgeExperiencesJson || [],
            availabilitySchedules: nanny.availabilityJson || [],
            serviceTypes: nanny.serviceTypesJson || [],
            attendanceModes: nanny.attendanceModesJson || [],
            hourlyRate: nanny.hourlyRate?.toString() || '',
            skills: nanny.skillsJson || [],
            isSmoker: nanny.isSmoker || false,
          }));
        } else {
          // Pre-fill name from user metadata
          setFormData((prev) => ({
            ...prev,
            name: user.user_metadata?.name || '',
          }));
        }
      } catch (err) {
        console.error('Error loading nanny data:', err);
      }
    }
    loadUser();
  }, [router, supabase]);

  function formatDateForDisplay(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  async function fetchAddressByCep(cep: string) {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(
        `https://brasilapi.com.br/api/cep/v2/${cleanCep}`,
      );
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          streetName: data.street || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
        }));
      }
    } catch (err) {
      console.error('Error fetching address:', err);
    }
  }

  function handleInputChange(field: string, value: string | number | boolean | string[]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function toggleArrayItem(field: string, value: string) {
    setFormData((prev) => {
      const array = prev[field as keyof typeof prev] as string[];
      const newArray = array.includes(value)
        ? array.filter((v) => v !== value)
        : [...array, value];
      return { ...prev, [field]: newArray };
    });
  }

  function validateStep(step: number): boolean {
    switch (step) {
      case 1:
        if (!formData.name || formData.name.trim().split(/\s+/).length < 2) {
          setError('Digite seu nome completo (nome e sobrenome)');
          return false;
        }
        if (!formData.cpf || formData.cpf.length < 14) {
          setError('Digite um CPF válido');
          return false;
        }
        if (!formData.birthDate || formData.birthDate.length < 10) {
          setError('Digite sua data de nascimento');
          return false;
        }
        if (!formData.gender) {
          setError('Selecione o gênero');
          return false;
        }
        if (!formData.phoneNumber || formData.phoneNumber.length < 14) {
          setError('Digite um telefone válido');
          return false;
        }
        break;
      case 2:
        if (!formData.zipCode || formData.zipCode.length < 9) {
          setError('Digite um CEP válido');
          return false;
        }
        if (!formData.neighborhood) {
          setError('Digite o bairro');
          return false;
        }
        if (!formData.city) {
          setError('Digite a cidade');
          return false;
        }
        if (!formData.state) {
          setError('Selecione o estado');
          return false;
        }
        break;
      case 3:
        if (formData.specialties.length === 0) {
          setError('Selecione pelo menos uma especialidade');
          return false;
        }
        break;
      case 4:
        if (formData.availabilitySchedules.length === 0) {
          setError('Selecione pelo menos um horário de disponibilidade');
          return false;
        }
        break;
      case 5:
        // Optional step - no validation required
        break;
    }
    return true;
  }

  async function handleNext() {
    if (!validateStep(currentStep)) return;

    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await handleSubmit();
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
    }
  }

  async function handleSubmit() {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Format data for API
      const birthDateParts = formData.birthDate.split('/');
      const formattedBirthDate = `${birthDateParts[2]}-${birthDateParts[1]}-${birthDateParts[0]}`;

      const formattedPhone = phoneToE164(formData.phoneNumber);

      const payload = {
        userId,
        nannyId,
        name: formData.name,
        cpf: formData.cpf.replace(/\D/g, ''),
        birthDate: formattedBirthDate,
        gender: formData.gender,
        phoneNumber: formattedPhone,
        isSmoker: formData.isSmoker,
        address: {
          zipCode: formData.zipCode.replace(/\D/g, ''),
          streetName: formData.streetName,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
        },
        specialties: formData.specialties,
        experienceYears: formData.experienceYears,
        childAgeExperiences: formData.childAgeExperiences,
        availabilitySchedules: formData.availabilitySchedules,
        serviceTypes: formData.serviceTypes,
        attendanceModes: formData.attendanceModes,
        hourlyRate: formData.hourlyRate
          ? parseFloat(formData.hourlyRate)
          : null,
        skills: formData.skills,
      };

      const response = await fetch('/api/nannies/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao salvar dados');
      }

      // Redirect to dashboard
      router.push('/dashboard/baba');
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
    } finally {
      setIsLoading(false);
    }
  }

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Complete seu perfil
        </h1>
        <p className="mt-2 text-gray-600">
          Preencha suas informações para começar a trabalhar como babá na Cuidly
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Passo {currentStep} de {STEPS.length}
          </span>
          <span>{STEPS[currentStep - 1].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <PiWarningCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form Steps */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        {/* Step 1: Personal Data */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{STEPS[0].title}</h2>
            <p className="text-sm text-gray-500">{STEPS[0].description}</p>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Maria da Silva"
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) =>
                    handleInputChange('cpf', maskCPF(e.target.value))
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Data de nascimento *</Label>
                <Input
                  id="birthDate"
                  value={formData.birthDate}
                  onChange={(e) =>
                    handleInputChange('birthDate', maskDate(e.target.value))
                  }
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                />
              </div>

              <div>
                <Label htmlFor="gender">Gênero *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v: string) => handleInputChange('gender', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEMALE">Feminino</SelectItem>
                    <SelectItem value="MALE">Masculino</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phoneNumber">WhatsApp *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange('phoneNumber', maskPhone(e.target.value))
                  }
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{STEPS[1].title}</h2>
            <p className="text-sm text-gray-500">{STEPS[1].description}</p>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="zipCode">CEP *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) =>
                    handleInputChange('zipCode', maskCEP(e.target.value))
                  }
                  onBlur={(e) => fetchAddressByCep(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>

              <div>
                <Label htmlFor="streetName">Logradouro</Label>
                <Input
                  id="streetName"
                  value={formData.streetName}
                  onChange={(e) =>
                    handleInputChange('streetName', e.target.value)
                  }
                  placeholder="Rua, Avenida, etc"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) =>
                      handleInputChange('number', e.target.value)
                    }
                    placeholder="123"
                  />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.complement}
                    onChange={(e) =>
                      handleInputChange('complement', e.target.value)
                    }
                    placeholder="Apto 101"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) =>
                    handleInputChange('neighborhood', e.target.value)
                  }
                  placeholder="Centro"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(v: string) => handleInputChange('state', v)}
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
          </div>
        )}

        {/* Step 3: Experience */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{STEPS[2].title}</h2>
            <p className="text-sm text-gray-500">{STEPS[2].description}</p>

            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Especialidades *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIALTIES.map((specialty) => (
                    <label
                      key={specialty}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={formData.specialties.includes(specialty)}
                        onCheckedChange={() =>
                          toggleArrayItem('specialties', specialty)
                        }
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="experienceYears">Anos de experiência</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) =>
                    handleInputChange(
                      'experienceYears',
                      parseInt(e.target.value) || 0,
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label className="mb-3 block">
                  Experiência com faixas etárias
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {CHILD_AGE_EXPERIENCES.map((exp) => (
                    <label
                      key={exp.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={formData.childAgeExperiences.includes(
                          exp.value,
                        )}
                        onCheckedChange={() =>
                          toggleArrayItem('childAgeExperiences', exp.value)
                        }
                      />
                      <span className="text-sm">{exp.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Availability */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{STEPS[3].title}</h2>
            <p className="text-sm text-gray-500">{STEPS[3].description}</p>

            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Horários disponíveis *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABILITY_SCHEDULES.map((schedule) => (
                    <label
                      key={schedule.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={formData.availabilitySchedules.includes(
                          schedule.value,
                        )}
                        onCheckedChange={() =>
                          toggleArrayItem(
                            'availabilitySchedules',
                            schedule.value,
                          )
                        }
                      />
                      <span className="text-sm">{schedule.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Tipos de serviço</Label>
                <div className="grid grid-cols-1 gap-2">
                  {SERVICE_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={formData.serviceTypes.includes(type.value)}
                        onCheckedChange={() =>
                          toggleArrayItem('serviceTypes', type.value)
                        }
                      />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Modalidade de atendimento</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ATTENDANCE_MODES.map((mode) => (
                    <label
                      key={mode.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={formData.attendanceModes.includes(mode.value)}
                        onCheckedChange={() =>
                          toggleArrayItem('attendanceModes', mode.value)
                        }
                      />
                      <span className="text-sm">{mode.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="hourlyRate">Valor por hora (R$)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    handleInputChange('hourlyRate', e.target.value)
                  }
                  placeholder="50.00"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: About */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{STEPS[4].title}</h2>
            <p className="text-sm text-gray-500">{STEPS[4].description}</p>

            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Habilidades</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SKILLS.map((skill) => (
                    <label
                      key={skill.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={formData.skills.includes(skill.value)}
                        onCheckedChange={() =>
                          toggleArrayItem('skills', skill.value)
                        }
                      />
                      <span className="text-sm">{skill.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={formData.isSmoker}
                    onCheckedChange={(checked: boolean | 'indeterminate') =>
                      handleInputChange('isSmoker', checked === true)
                    }
                  />
                  <span className="text-sm">Sou fumante</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isLoading}
        >
          <PiCaretLeft className="mr-1 size-4" />
          Voltar
        </Button>

        <Button onClick={handleNext} disabled={isLoading}>
          {isLoading ? (
            'Salvando...'
          ) : currentStep === STEPS.length ? (
            <>
              Concluir
              <PiCheck className="ml-1 size-4" />
            </>
          ) : (
            <>
              Proximo
              <PiCaretRight className="ml-1 size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
