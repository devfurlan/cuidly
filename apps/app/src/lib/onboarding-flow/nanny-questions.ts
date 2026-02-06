import { z } from 'zod';
import type { FlowStepConfig, FlowQuestion } from '@/components/onboarding-flow/FlowProvider';
import { cpfValidator, birthDateValidator } from '@/helpers/validators';
import { maskCPF, maskCEP } from '@/helpers/formatters';
import { isSafeText } from '@/services/content-moderation';
import { availabilitySchema } from '@/schemas/family-onboarding';
import {
  NANNY_GENDER_OPTIONS,
  TRAVEL_RADIUS_OPTIONS,
  EXPERIENCE_YEARS_OPTIONS,
  CHILD_AGE_EXPERIENCE_OPTIONS,
  SPECIAL_NEEDS_OPTIONS,
  CERTIFICATION_OPTIONS,
  STRENGTH_OPTIONS,
  MAX_CHILDREN_CARE_OPTIONS,
  COMFORT_WITH_PETS_OPTIONS,
  ACCEPTED_ACTIVITIES_OPTIONS,
  HOURLY_RATE_OPTIONS,
  ACTIVITIES_NOT_ACCEPTED_OPTIONS,
  MARITAL_STATUS_OPTIONS_FEMALE,
  MARITAL_STATUS_OPTIONS_MALE,
  NANNY_TYPE_OPTIONS,
  CONTRACT_REGIME_OPTIONS,
} from '@/constants/options/nanny-options';

const TOTAL_STEPS = 10;

// Helper to convert options to the format expected by FlowQuestion
function toOptions<T extends readonly { value: string | number; label: string; description?: string }[]>(
  options: T
): { value: string; label: string; description?: string }[] {
  return options.map((opt) => ({
    value: String(opt.value),
    label: opt.label,
    ...('description' in opt && opt.description ? { description: opt.description } : {}),
  }));
}

// ==========================================
// Step 1: Dados Pessoais
// ==========================================
export const nannyStep1Questions: FlowQuestion[] = [
  {
    id: 'name',
    field: 'name',
    type: 'text',
    title: 'Qual é o seu nome completo?',
    subtitle: 'Digite seu nome e sobrenome',
    placeholder: 'Maria da Silva',
    required: true,
    validation: z
      .string()
      .min(1, 'Nome é obrigatório')
      .refine((val) => val.trim().split(/\s+/).length >= 2, {
        message: 'Digite seu nome completo (nome e sobrenome)',
      }),
  },
  {
    id: 'cpf',
    field: 'cpf',
    type: 'text',
    title: 'Qual é o seu CPF?',
    subtitle: 'Precisamos do CPF para verificação de identidade',
    placeholder: '000.000.000-00',
    required: true,
    mask: maskCPF,
    maxLength: 14,
    validation: cpfValidator,
  },
  {
    id: 'birthDate',
    field: 'birthDate',
    type: 'date',
    title: 'Qual é a sua data de nascimento?',
    placeholder: 'DD/MM/AAAA',
    required: true,
    validation: birthDateValidator,
  },
  {
    id: 'gender',
    field: 'gender',
    type: 'radio',
    title: 'Qual é o seu gênero?',
    required: true,
    options: toOptions(NANNY_GENDER_OPTIONS),
    validation: z.string().min(1, 'Selecione o gênero'),
  },
  {
    id: 'maritalStatus_female',
    field: 'maritalStatus',
    type: 'radio',
    title: 'Qual é o seu estado civil?',
    subtitle: 'Opcional',
    required: false,
    options: toOptions(MARITAL_STATUS_OPTIONS_FEMALE),
    showIf: (data) => data.gender === 'FEMALE',
  },
  {
    id: 'maritalStatus_male',
    field: 'maritalStatus',
    type: 'radio',
    title: 'Qual é o seu estado civil?',
    subtitle: 'Opcional',
    required: false,
    options: toOptions(MARITAL_STATUS_OPTIONS_MALE),
    showIf: (data) => data.gender === 'MALE',
  },
];

export const nannyStep1Config: FlowStepConfig = {
  stepNumber: 1,
  totalSteps: TOTAL_STEPS,
  questions: nannyStep1Questions,
};

// ==========================================
// Step 2: Endereço
// ==========================================
export const nannyStep2Questions: FlowQuestion[] = [
  {
    id: 'zipCode',
    field: 'zipCode',
    type: 'text',
    title: 'Qual é o seu CEP?',
    subtitle: 'Usamos para mostrar você para famílias próximas',
    placeholder: '00000-000',
    required: true,
    mask: maskCEP,
    maxLength: 9,
    validation: z.string().min(9, 'CEP obrigatório'),
  },
  {
    id: 'streetName',
    field: 'streetName',
    type: 'text',
    title: 'Qual é o nome da sua rua?',
    placeholder: 'Rua das Flores',
    required: true,
    validation: z.string().min(1, 'Logradouro obrigatório'),
  },
  {
    id: 'number',
    field: 'number',
    type: 'text',
    title: 'Qual é o número?',
    subtitle: 'Opcional - deixe em branco se não houver',
    placeholder: '123',
    required: false,
  },
  {
    id: 'complement',
    field: 'complement',
    type: 'text',
    title: 'Complemento',
    subtitle: 'Opcional - apartamento, bloco, etc.',
    placeholder: 'Apto 101',
    required: false,
  },
  {
    id: 'neighborhood',
    field: 'neighborhood',
    type: 'text',
    title: 'Qual é o bairro?',
    placeholder: 'Centro',
    required: true,
    validation: z.string().min(1, 'Bairro obrigatório'),
  },
  {
    id: 'city',
    field: 'city',
    type: 'text',
    title: 'Qual é a cidade?',
    placeholder: 'São Paulo',
    required: true,
    validation: z.string().min(1, 'Cidade obrigatória'),
  },
  {
    id: 'state',
    field: 'state',
    type: 'text',
    title: 'Qual é o estado?',
    placeholder: 'SP',
    required: true,
    maxLength: 2,
    validation: z.string().min(2, 'Estado obrigatório'),
  },
  {
    id: 'travelRadius',
    field: 'travelRadius',
    type: 'radio',
    title: 'Até onde você pode se deslocar para trabalhar?',
    subtitle: 'Distância máxima que você aceita viajar',
    required: true,
    options: toOptions(TRAVEL_RADIUS_OPTIONS),
    validation: z.string().min(1, 'Selecione o raio de deslocamento'),
  },
];

export const nannyStep2Config: FlowStepConfig = {
  stepNumber: 2,
  totalSteps: TOTAL_STEPS,
  questions: nannyStep2Questions,
};

// ==========================================
// Step 3: Experiência
// ==========================================
export const nannyStep3Questions: FlowQuestion[] = [
  {
    id: 'experienceYears',
    field: 'experienceYears',
    type: 'radio',
    title: 'Há quanto tempo você trabalha com crianças?',
    required: true,
    options: toOptions(EXPERIENCE_YEARS_OPTIONS),
    validation: z.string().min(1, 'Selecione os anos de experiência'),
  },
  {
    id: 'childAgeExperiences',
    field: 'childAgeExperiences',
    type: 'checkbox',
    title: 'Com quais faixas etárias você tem experiência?',
    required: true,
    options: toOptions(CHILD_AGE_EXPERIENCE_OPTIONS),
    validation: z.array(z.string()).min(1, 'Selecione pelo menos uma faixa etária'),
  },
];

export const nannyStep3Config: FlowStepConfig = {
  stepNumber: 3,
  totalSteps: TOTAL_STEPS,
  questions: nannyStep3Questions,
};

// ==========================================
// Step 4: Necessidades Especiais
// ==========================================
export const nannyStep4Questions: FlowQuestion[] = [
  {
    id: 'hasSpecialNeedsExperience',
    field: 'hasSpecialNeedsExperience',
    type: 'radio',
    title: 'Você tem experiência com crianças com necessidades especiais?',
    required: true,
    options: [
      { value: 'true', label: 'Sim, tenho experiência' },
      { value: 'false', label: 'Não tenho experiência' },
    ],
  },
  {
    id: 'specialNeedsExperiences',
    field: 'specialNeedsExperiences',
    type: 'checkbox',
    title: 'Quais tipos de necessidades especiais você tem experiência?',
    required: false,
    options: toOptions(SPECIAL_NEEDS_OPTIONS),
    showIf: (data) => data.hasSpecialNeedsExperience === 'true',
  },
];

export const nannyStep4Config: FlowStepConfig = {
  stepNumber: 4,
  totalSteps: TOTAL_STEPS,
  questions: nannyStep4Questions,
};

// ==========================================
// Step 5: Certificações e Idiomas
// ==========================================
export const nannyStep5Questions: FlowQuestion[] = [
  {
    id: 'certifications',
    field: 'certifications',
    type: 'checkbox',
    title: 'Você possui alguma certificação?',
    subtitle: 'Opcional',
    required: false,
    options: toOptions(CERTIFICATION_OPTIONS),
  },
];

export const nannyStep5Config: FlowStepConfig = {
  stepNumber: 5,
  totalSteps: TOTAL_STEPS,
  questions: nannyStep5Questions,
};

// ==========================================
// Step 6: Preferências e Pontos Fortes
// ==========================================
export const nannyStep6Questions: FlowQuestion[] = [
  {
    id: 'strengths',
    field: 'strengths',
    type: 'checkbox',
    title: 'Quais são seus pontos fortes?',
    required: true,
    maxSelections: 3,
    options: toOptions(STRENGTH_OPTIONS),
    validation: z.array(z.string()).min(1, 'Selecione pelo menos 1 ponto forte').max(3, 'Máximo 3 pontos fortes'),
  },
  {
    id: 'maxChildrenCare',
    field: 'maxChildrenCare',
    type: 'radio',
    title: 'Quantas crianças você consegue cuidar ao mesmo tempo?',
    required: true,
    options: toOptions(MAX_CHILDREN_CARE_OPTIONS),
    validation: z.string().min(1, 'Selecione uma opção'),
  },
];

export const nannyStep6Config: FlowStepConfig = {
  stepNumber: 6,
  totalSteps: TOTAL_STEPS,
  questions: nannyStep6Questions,
};

// ==========================================
// Step 7: Pets, Atividades e Câmeras
// ==========================================
export const nannyStep7Questions: FlowQuestion[] = [
  {
    id: 'comfortableWithPets',
    field: 'comfortableWithPets',
    type: 'radio',
    title: 'Você se sente confortável trabalhando em casas com animais de estimação?',
    required: true,
    options: toOptions(COMFORT_WITH_PETS_OPTIONS),
    validation: z.string().min(1, 'Selecione uma opção'),
  },
  {
    id: 'acceptedActivities',
    field: 'acceptedActivities',
    type: 'checkbox',
    title: 'Quais atividades você está disposta a fazer?',
    required: true,
    options: toOptions(ACCEPTED_ACTIVITIES_OPTIONS),
    validation: z.array(z.string()).min(1, 'Selecione pelo menos uma atividade'),
  },
];

export const nannyStep7Config: FlowStepConfig = {
  stepNumber: 7,
  totalSteps: TOTAL_STEPS,
  questions: nannyStep7Questions,
};

// ==========================================
// Step 8: Metodologia e Preferências Pessoais
// ==========================================
export const nannyStep8Questions: FlowQuestion[] = [
  {
    id: 'hasCnh',
    field: 'hasCnh',
    type: 'radio',
    title: 'Você possui CNH (carteira de motorista)?',
    subtitle: 'Pode ser necessário para transportar as crianças',
    required: true,
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
  },
  {
    id: 'isSmoker',
    field: 'isSmoker',
    type: 'radio',
    title: 'Você é fumante?',
    required: true,
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
  },
];

export const nannyStep8Config: FlowStepConfig = {
  stepNumber: 8,
  totalSteps: TOTAL_STEPS,
  questions: nannyStep8Questions,
};

// ==========================================
// Step 9: Sobre Você (Bio) - penúltimo para ter todas as infos para IA
// ==========================================

// Helper to get plain text length from HTML
function getPlainTextLength(html: string): number {
  if (!html) return 0;
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
  return text.length;
}

export const nannyStep9Questions: FlowQuestion[] = [
  {
    id: 'aboutMe',
    field: 'aboutMe',
    type: 'textarea',
    title: 'Conte um pouco sobre você',
    placeholder: 'Sou uma pessoa dedicada e carinhosa, apaixonada por trabalhar com crianças...',
    required: true,
    minLength: 200,
    maxLength: 2000,
    validation: z
      .string()
      .refine(
        (val) => getPlainTextLength(val) >= 200,
        'Mínimo de 200 caracteres'
      )
      .refine(
        (val) => getPlainTextLength(val) <= 2000,
        'Máximo de 2000 caracteres'
      )
      .refine(
        (val) => {
          const plainText = val.replace(/<[^>]*>/g, '');
          return isSafeText(plainText).safe;
        },
        'Não é permitido incluir dados de contato (telefone, email, redes sociais) na bio'
      ),
  },
];

export const nannyStep9Config: FlowStepConfig = {
  stepNumber: 9,
  totalSteps: TOTAL_STEPS,
  questions: nannyStep9Questions,
};

// ==========================================
// Step 10: Foto (handled separately - custom component)
// ==========================================
export const nannyStep10Questions: FlowQuestion[] = [
  {
    id: 'photo',
    field: 'photo',
    type: 'custom',
    title: 'Adicione uma foto sua',
    subtitle: 'Uma boa foto ajuda as famílias a te conhecerem melhor',
    required: false,
  },
];

export const nannyStep10Config: FlowStepConfig = {
  stepNumber: 10,
  totalSteps: TOTAL_STEPS,
  questions: nannyStep10Questions,
};

// ==========================================
// Export all configs
// ==========================================
export const NANNY_STEP_CONFIGS = {
  1: nannyStep1Config,
  2: nannyStep2Config,
  3: nannyStep3Config,
  4: nannyStep4Config,
  5: nannyStep5Config,
  6: nannyStep6Config,
  7: nannyStep7Config,
  8: nannyStep8Config,
  9: nannyStep9Config,
  10: nannyStep10Config,
} as const;

// Helper to get marital status options based on gender
export function getMaritalStatusOptionsForGender(gender: string | undefined) {
  if (gender === 'MALE') {
    return toOptions(MARITAL_STATUS_OPTIONS_MALE);
  }
  return toOptions(MARITAL_STATUS_OPTIONS_FEMALE);
}

// ==========================================
// NOVA ESTRUTURA: Perguntas Principais e Condicionais
// ==========================================

// Tipo para dados do formulário
export type NannyFormData = Record<string, unknown>;

// Perguntas principais (indexadas por q=N, onde N começa em 1)
// Exclui perguntas com showIf
export const NANNY_MAIN_QUESTIONS: FlowQuestion[] = [
  // q=1: name
  {
    id: 'name',
    field: 'name',
    type: 'text',
    title: 'Para começar, qual é o seu nome completo?',
    subtitle: 'Use seu nome e sobrenome, por favor.',
    placeholder: 'Maria da Silva',
    required: true,
    validation: z
      .string()
      .min(1, 'Nome é obrigatório')
      .refine((val) => val.trim().split(/\s+/).length >= 2, {
        message: 'Digite seu nome completo (nome e sobrenome)',
      }),
  },
  // q=2: cpf
  {
    id: 'cpf',
    field: 'cpf',
    type: 'text',
    title: 'Qual é o seu CPF?',
    subtitle: 'Usamos apenas para validação de identidade e segurança da plataforma.',
    placeholder: '000.000.000-00',
    required: true,
    mask: maskCPF,
    maxLength: 14,
    validation: cpfValidator,
  },
  // q=3: birthDate
  {
    id: 'birthDate',
    field: 'birthDate',
    type: 'date',
    title: 'Qual é a sua data de nascimento?',
    subtitle: 'Precisamos confirmar que você é maior de 18 anos.',
    placeholder: 'DD/MM/AAAA',
    required: true,
    validation: birthDateValidator,
  },
  // q=4: gender (tem condicionais: maritalStatus)
  {
    id: 'gender',
    field: 'gender',
    type: 'radio',
    title: 'Qual é o seu gênero?',
    subtitle: 'Usamos essa informação apenas para cadastro e documentos.',
    required: true,
    options: toOptions(NANNY_GENDER_OPTIONS),
    validation: z.string().min(1, 'Selecione o gênero'),
  },
  // q=5: photo
  {
    id: 'photo',
    field: 'photo',
    type: 'custom',
    title: 'Adicione uma foto sua',
    subtitle: 'Uma foto clara e sorrindo ajuda as famílias a te conhecerem melhor.',
    required: false,
  },
  // q=6: address (CEP, rua, número, complemento, bairro, cidade, estado)
  {
    id: 'address',
    field: 'address',
    type: 'address',
    title: 'Onde você mora?',
    subtitle: 'Seu endereço não será exibido. Usamos apenas para encontrar oportunidades perto de você.',
    required: true,
  },
  // q=7: travelRadius
  {
    id: 'travelRadius',
    field: 'travelRadius',
    type: 'radio',
    title: 'Até que distância você aceita se deslocar para trabalhar?',
    subtitle: 'Selecione o raio máximo que faz sentido para você.',
    required: true,
    options: toOptions(TRAVEL_RADIUS_OPTIONS),
    validation: z.string().min(1, 'Selecione o raio de deslocamento'),
  },
  // q=8: availability (grade de disponibilidade)
  {
    id: 'availability',
    field: 'availability',
    type: 'availability-section',
    title: 'Quando você está disponível para trabalhar?',
    subtitle: 'Selecione os dias e períodos em que você pode atuar.',
    required: true,
    validation: availabilitySchema,
  },
  // q=9: nannyType (tipo de babá)
  {
    id: 'nannyType',
    field: 'nannyType',
    type: 'checkbox',
    title: 'Que tipo de trabalho você procura?',
    subtitle: 'Você pode selecionar mais de uma opção.',
    required: true,
    options: toOptions(NANNY_TYPE_OPTIONS),
    validation: z.array(z.string()).min(1, 'Selecione pelo menos uma opção'),
  },
  // q=10: contractRegime (regime de contratação)
  {
    id: 'contractRegime',
    field: 'contractRegime',
    type: 'checkbox',
    title: 'Como você prefere ser contratada?',
    subtitle: 'Selecione os modelos de contratação que você aceita.',
    required: true,
    options: toOptions(CONTRACT_REGIME_OPTIONS),
    validation: z.array(z.string()).min(1, 'Selecione pelo menos uma opção'),
  },
  // q=11: hourlyRateRange (valor por hora referência)
  {
    id: 'hourlyRateRange',
    field: 'hourlyRateRange',
    type: 'radio',
    title: 'Qual é o seu valor por hora (referência)?',
    subtitle: 'Esse valor é apenas uma referência e pode variar conforme a vaga.',
    required: true,
    options: toOptions(HOURLY_RATE_OPTIONS),
    validation: z.string().min(1, 'Selecione uma faixa de valor'),
    hint: {
      title: 'Valor médio para esse tipo de vaga na sua região: R$ 36–45/h',
      description: 'Use como referência. O valor final pode variar.',
    },
  },
  // q=12: experienceYears
  {
    id: 'experienceYears',
    field: 'experienceYears',
    type: 'radio',
    title: 'Há quanto tempo você trabalha com crianças?',
    subtitle: 'Selecione a opção que melhor representa sua experiência.',
    required: true,
    options: toOptions(EXPERIENCE_YEARS_OPTIONS),
    validation: z.string().min(1, 'Selecione os anos de experiência'),
  },
  // q=13: childAgeExperiences
  {
    id: 'childAgeExperiences',
    field: 'childAgeExperiences',
    type: 'checkbox',
    title: 'Com quais idades você tem experiência?',
    subtitle: 'Marque todas as faixas etárias com as quais já trabalhou.',
    required: true,
    options: toOptions(CHILD_AGE_EXPERIENCE_OPTIONS),
    validation: z.array(z.string()).min(1, 'Selecione pelo menos uma faixa etária'),
  },
  // q=14: maxChildrenCare
  {
    id: 'maxChildrenCare',
    field: 'maxChildrenCare',
    type: 'radio',
    title: 'Quantas crianças você consegue cuidar ao mesmo tempo?',
    subtitle: 'Seja sincera para garantir um trabalho de qualidade.',
    required: true,
    options: toOptions(MAX_CHILDREN_CARE_OPTIONS),
    validation: z.string().min(1, 'Selecione uma opção'),
  },
  // q=15: hasCnh
  {
    id: 'hasCnh',
    field: 'hasCnh',
    type: 'radio',
    title: 'Você possui CNH (carteira de motorista)?',
    subtitle: 'Pode ser necessário para transportar as crianças.',
    required: true,
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
    validation: z.string().min(1, 'Selecione uma opção'),
  },
  // q=16: isSmoker
  {
    id: 'isSmoker',
    field: 'isSmoker',
    type: 'radio',
    title: 'Você é fumante?',
    subtitle: 'Muitas famílias preferem babás não fumantes.',
    required: true,
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
    validation: z.string().min(1, 'Selecione uma opção'),
  },
  // q=17: comfortableWithPets
  {
    id: 'comfortableWithPets',
    field: 'comfortableWithPets',
    type: 'radio',
    title: 'Você se sente confortável trabalhando em casas com animais de estimação?',
    required: true,
    options: toOptions(COMFORT_WITH_PETS_OPTIONS),
    validation: z.string().min(1, 'Selecione uma opção'),
  },
  // q=18: strengths
  {
    id: 'strengths',
    field: 'strengths',
    type: 'checkbox',
    title: 'Quais são seus principais pontos fortes como babá?',
    subtitle: 'Selecione até 3 características que te representam.',
    required: true,
    maxSelections: 3,
    options: toOptions(STRENGTH_OPTIONS),
    validation: z.array(z.string()).min(1, 'Selecione pelo menos 1 ponto forte').max(3, 'Máximo 3 pontos fortes'),
  },
  // q=19: acceptedActivities
  {
    id: 'acceptedActivities',
    field: 'acceptedActivities',
    type: 'checkbox',
    title: 'Quais atividades você aceita realizar?',
    subtitle: 'Marque o que faz parte da sua rotina de trabalho.',
    required: true,
    options: toOptions(ACCEPTED_ACTIVITIES_OPTIONS),
    validation: z.array(z.string()).min(1, 'Selecione pelo menos uma atividade'),
  },
  // q=20: activitiesNotAccepted
  {
    id: 'activitiesNotAccepted',
    field: 'activitiesNotAccepted',
    type: 'checkbox',
    title: 'Existe alguma atividade que você prefere não realizar?',
    subtitle: 'Selecione até 2 opções, se houver.',
    required: false,
    maxSelections: 2,
    options: toOptions(ACTIVITIES_NOT_ACCEPTED_OPTIONS),
    validation: z.array(z.string()).max(2, 'Máximo 2 opções'),
  },
  // q=21: aboutMe
  {
    id: 'aboutMe',
    field: 'aboutMe',
    type: 'textarea',
    title: 'Conte um pouco sobre você',
    subtitle: 'Fale sobre sua experiência, seu jeito de trabalhar e o que considera importante no cuidado com crianças.',
    placeholder: 'Sou uma pessoa dedicada e carinhosa, apaixonada por trabalhar com crianças...',
    required: true,
    minLength: 200,
    maxLength: 2000,
    validation: z
      .string()
      .refine(
        (val) => getPlainTextLength(val) >= 200,
        'Mínimo de 200 caracteres'
      )
      .refine(
        (val) => getPlainTextLength(val) <= 2000,
        'Máximo de 2000 caracteres'
      )
      .refine(
        (val) => {
          const plainText = val.replace(/<[^>]*>/g, '');
          return isSafeText(plainText).safe;
        },
        'Não é permitido incluir dados de contato (telefone, email, redes sociais) na bio'
      ),
  },
];

// Mapeamento de perguntas condicionais (q -> lista de perguntas condicionais)
// qc=1 significa primeira condicional após a pergunta q
export const NANNY_CONDITIONAL_QUESTIONS: Record<number, FlowQuestion[]> = {
  // Após gender (q=4): perguntar estado civil
  4: [
    {
      id: 'maritalStatus_female',
      field: 'maritalStatus',
      type: 'radio',
      title: 'Qual é o seu estado civil?',
      subtitle: 'Opcional',
      required: false,
      options: toOptions(MARITAL_STATUS_OPTIONS_FEMALE),
      showIf: (data: NannyFormData) => data.gender === 'FEMALE',
    },
    {
      id: 'maritalStatus_male',
      field: 'maritalStatus',
      type: 'radio',
      title: 'Qual é o seu estado civil?',
      subtitle: 'Opcional',
      required: false,
      options: toOptions(MARITAL_STATUS_OPTIONS_MALE),
      showIf: (data: NannyFormData) => data.gender === 'MALE',
    },
  ],
};

// Total de perguntas principais
export const TOTAL_MAIN_QUESTIONS = NANNY_MAIN_QUESTIONS.length;

// ==========================================
// Helpers para navegação
// ==========================================

/**
 * Retorna a pergunta dado q e qc
 * @param q - Índice da pergunta principal (1-based)
 * @param qc - Índice da pergunta condicional (1-based, opcional)
 * @param formData - Dados do formulário para avaliar showIf
 */
export function getQuestion(
  q: number,
  qc: number | undefined,
  formData: NannyFormData
): FlowQuestion | null {
  // Validar q
  if (q < 1 || q > TOTAL_MAIN_QUESTIONS) {
    return null;
  }

  // Se não tem qc, retorna pergunta principal
  if (!qc) {
    return NANNY_MAIN_QUESTIONS[q - 1];
  }

  // Se tem qc, buscar pergunta condicional
  const conditionals = NANNY_CONDITIONAL_QUESTIONS[q];
  if (!conditionals || conditionals.length === 0) {
    return null;
  }

  // Filtrar condicionais visíveis
  const visibleConditionals = conditionals.filter(
    (cq) => !cq.showIf || cq.showIf(formData)
  );

  if (qc < 1 || qc > visibleConditionals.length) {
    return null;
  }

  return visibleConditionals[qc - 1];
}

/**
 * Calcula o próximo destino após responder a pergunta atual
 * @returns { q, qc? } para próxima pergunta ou 'complete' se acabou
 */
export function getNextDestination(
  q: number,
  qc: number | undefined,
  formData: NannyFormData
): { q: number; qc?: number } | 'complete' {
  if (qc) {
    // Estamos em uma condicional
    const conditionals = NANNY_CONDITIONAL_QUESTIONS[q] || [];
    const visibleConditionals = conditionals.filter(
      (cq) => !cq.showIf || cq.showIf(formData)
    );

    // Se tem mais condicionais, vai para próxima
    if (qc < visibleConditionals.length) {
      return { q, qc: qc + 1 };
    }

    // Senão, vai para próxima pergunta principal
    if (q >= TOTAL_MAIN_QUESTIONS) {
      return 'complete';
    }
    return { q: q + 1 };
  }

  // Estamos em uma pergunta principal
  // Verificar se tem condicionais visíveis
  const conditionals = NANNY_CONDITIONAL_QUESTIONS[q] || [];
  const visibleConditionals = conditionals.filter(
    (cq) => !cq.showIf || cq.showIf(formData)
  );

  if (visibleConditionals.length > 0) {
    return { q, qc: 1 };
  }

  // Sem condicionais, vai para próxima pergunta principal
  if (q >= TOTAL_MAIN_QUESTIONS) {
    return 'complete';
  }
  return { q: q + 1 };
}

/**
 * Calcula o destino anterior (voltar)
 * @returns { q, qc? } para pergunta anterior ou 'exit' se é a primeira
 */
export function getPrevDestination(
  q: number,
  qc: number | undefined,
  formData: NannyFormData
): { q: number; qc?: number } | 'exit' {
  if (qc) {
    // Estamos em uma condicional
    if (qc > 1) {
      // Volta para condicional anterior
      return { q, qc: qc - 1 };
    }
    // Volta para pergunta principal
    return { q };
  }

  // Estamos em uma pergunta principal
  if (q <= 1) {
    return 'exit';
  }

  // Verificar se pergunta anterior tem condicionais visíveis
  const prevQ = q - 1;
  const conditionals = NANNY_CONDITIONAL_QUESTIONS[prevQ] || [];
  const visibleConditionals = conditionals.filter(
    (cq) => !cq.showIf || cq.showIf(formData)
  );

  if (visibleConditionals.length > 0) {
    // Volta para última condicional da pergunta anterior
    return { q: prevQ, qc: visibleConditionals.length };
  }

  // Volta para pergunta principal anterior
  return { q: prevQ };
}

/**
 * Encontra onde o usuário parou no onboarding
 * Retorna a primeira pergunta não respondida
 */
export function findResumePoint(
  formData: NannyFormData
): { q: number; qc?: number } | 'complete' {
  for (let q = 1; q <= TOTAL_MAIN_QUESTIONS; q++) {
    const mainQuestion = NANNY_MAIN_QUESTIONS[q - 1];
    const value = formData[mainQuestion.field];

    // Verificar se pergunta principal está respondida
    const isRequired = mainQuestion.required;
    const isEmpty = value === undefined || value === null || value === '' ||
      (Array.isArray(value) && value.length === 0);

    if (isRequired && isEmpty) {
      return { q };
    }

    // Verificar condicionais
    const conditionals = NANNY_CONDITIONAL_QUESTIONS[q] || [];
    const visibleConditionals = conditionals.filter(
      (cq) => !cq.showIf || cq.showIf(formData)
    );

    for (let qc = 1; qc <= visibleConditionals.length; qc++) {
      const condQuestion = visibleConditionals[qc - 1];
      const condValue = formData[condQuestion.field];
      const condRequired = condQuestion.required;
      const condEmpty = condValue === undefined || condValue === null || condValue === '' ||
        (Array.isArray(condValue) && condValue.length === 0);

      if (condRequired && condEmpty) {
        return { q, qc };
      }
    }
  }

  return 'complete';
}

/**
 * Calcula o progresso total (para progress bar)
 * Retorna { current, total } onde current é a posição atual e total é o total de perguntas visíveis
 */
export function calculateProgress(
  q: number,
  qc: number | undefined,
  formData: NannyFormData
): { current: number; total: number } {
  let total = 0;
  let current = 0;
  let foundCurrent = false;

  for (let i = 1; i <= TOTAL_MAIN_QUESTIONS; i++) {
    total++;

    if (!foundCurrent) {
      if (i === q && !qc) {
        current = total;
        foundCurrent = true;
      }
    }

    // Contar condicionais visíveis
    const conditionals = NANNY_CONDITIONAL_QUESTIONS[i] || [];
    const visibleConditionals = conditionals.filter(
      (cq) => !cq.showIf || cq.showIf(formData)
    );

    for (let j = 1; j <= visibleConditionals.length; j++) {
      total++;

      if (!foundCurrent && i === q && qc === j) {
        current = total;
        foundCurrent = true;
      }
    }
  }

  return { current, total };
}
