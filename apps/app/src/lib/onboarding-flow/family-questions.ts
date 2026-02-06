import type { FlowQuestion } from '@/components/onboarding-flow/FlowProvider';
import {
  DOMESTIC_HELP_OPTIONS,
  FAMILY_CONTRACT_REGIME_OPTIONS,
  FAMILY_HOURLY_RATE_OPTIONS,
  FAMILY_NANNY_TYPE_OPTIONS,
  MANDATORY_REQUIREMENTS_OPTIONS,
  RESPONSIBLE_GENDER_OPTIONS,
} from '@/constants/options/family-options';
import { maskCPF, maskDate } from '@/helpers/formatters';
import { birthDateValidator, cpfValidator } from '@/helpers/validators';
import {
  availabilitySchema,
  childrenListSchema,
} from '@/schemas/family-onboarding';
import { z } from 'zod';

// Alias for backwards compatibility
const HOURLY_RATE_OPTIONS = FAMILY_HOURLY_RATE_OPTIONS;

// Helper to convert options to the format expected by FlowQuestion
function toOptions<
  T extends readonly {
    value: string | number;
    label: string;
    description?: string;
  }[],
>(options: T): { value: string; label: string; description?: string }[] {
  return options.map((opt) => ({
    value: String(opt.value),
    label: opt.label,
    ...('description' in opt && opt.description
      ? { description: opt.description }
      : {}),
  }));
}

// Tipo para dados do formulário
export type FamilyFormData = Record<string, unknown>;

// ==========================================
// PERGUNTAS DO ONBOARDING DE FAMÍLIA (17 perguntas)
// ==========================================
// Nova ordem:
// 1. Nome completo
// 2. CPF
// 3. Data de nascimento
// 4. Gênero
// 5. Informações sobre as crianças (novo componente)
// 6. CEP (onde será o cuidado)
// 7. Disponibilidade (dias + turnos) - novo componente
// 8. Tipo de babá
// 9. Regime de contratação
// 10. Ajuda doméstica
// 11. Pets (+ descrição condicional)
// 12. Requisitos obrigatórios (não fumante, CNH)
// 13. Valor por hora
// 14. Foto da família (opcional)
// 15. Apresentação da família (IA)
// 16. Descrição da vaga (IA)
// 17. Fotos da vaga (opcional)
// ==========================================

export const FAMILY_ALL_QUESTIONS: FlowQuestion[] = [
  // Q1: Nome completo
  {
    id: 'responsibleName',
    field: 'responsibleName',
    type: 'text',
    title: 'Para começar, como podemos te chamar?',
    subtitle: 'Use seu nome e sobrenome, por favor.',
    placeholder: 'João da Silva',
    required: true,
    validation: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  },
  // Q2: CPF
  {
    id: 'cpf',
    field: 'cpf',
    type: 'text',
    title: 'Qual é o seu CPF?',
    subtitle:
      'Usamos apenas para validação de identidade e segurança da plataforma.',
    placeholder: '000.000.000-00',
    required: true,
    mask: maskCPF,
    maxLength: 14,
    validation: cpfValidator,
  },
  // Q3: Data de nascimento
  {
    id: 'birthDate',
    field: 'birthDate',
    type: 'text',
    title: 'Quando você nasceu?',
    subtitle: 'Isso nos ajuda a confirmar sua identidade.',
    placeholder: 'DD/MM/AAAA',
    required: true,
    mask: maskDate,
    maxLength: 10,
    validation: birthDateValidator,
  },
  // Q4: Gênero
  {
    id: 'gender',
    field: 'gender',
    type: 'radio',
    title: 'Qual é o seu gênero?',
    subtitle: 'Usamos essa informação apenas para cadastro e documentos.',
    required: true,
    options: toOptions(RESPONSIBLE_GENDER_OPTIONS),
    validation: z.string().min(1, 'Selecione o gênero'),
  },
  // Q5: Informações sobre as crianças (novo componente)
  {
    id: 'children',
    field: 'children',
    type: 'children-section',
    title: 'Agora, vamos falar sobre seus filhos',
    subtitle:
      'Adicione as crianças que a babá irá cuidar. Você pode incluir mais de uma.',
    required: true,
    validation: childrenListSchema,
  },
  // Q6: Endereço completo
  {
    id: 'address',
    field: 'address',
    type: 'address',
    title: 'Onde será o cuidado?',
    subtitle: 'Informe o endereço onde a babá irá cuidar das crianças.',
    required: true,
  },
  // Q7: Disponibilidade (dias + turnos) - novo componente
  {
    id: 'availability',
    field: 'availability',
    type: 'availability-section',
    title: 'Quando você precisa da babá?',
    subtitle: 'Selecione os dias e períodos em que precisa de ajuda.',
    required: true,
    validation: availabilitySchema,
  },
  // Q8: Tipo de babá
  {
    id: 'nannyType',
    field: 'nannyType',
    type: 'radio',
    title: 'Qual tipo de ajuda você está buscando?',
    subtitle: 'Isso nos ajuda a encontrar a babá ideal para sua rotina.',
    required: true,
    options: toOptions(FAMILY_NANNY_TYPE_OPTIONS),
    validation: z.string().min(1, 'Selecione o tipo de babá'),
  },
  // Q9: Regime de contratação
  {
    id: 'contractRegime',
    field: 'contractRegime',
    type: 'radio',
    title: 'Como você prefere contratar a babá?',
    subtitle: 'Selecione o modelo que faz mais sentido para você.',
    required: true,
    options: toOptions(FAMILY_CONTRACT_REGIME_OPTIONS),
    validation: z.string().min(1, 'Selecione o regime de contratação'),
  },
  // Q10: Ajuda doméstica
  {
    id: 'domesticHelp',
    field: 'domesticHelp',
    type: 'checkbox',
    title: 'Além de cuidar das crianças, você espera alguma ajuda extra?',
    subtitle: 'Selecione as tarefas que a babá também realizaria.',
    required: false,
    options: toOptions(DOMESTIC_HELP_OPTIONS),
  },
  // Q11: Pets
  {
    id: 'hasPets',
    field: 'hasPets',
    type: 'radio',
    title: 'Você tem pets em casa?',
    subtitle: 'Isso nos ajuda a encontrar babás compatíveis.',
    required: true,
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
    validation: z.string().min(1, 'Selecione uma opção'),
  },
  // Q11b: Tipos de pets (condicional)
  {
    id: 'petTypes',
    field: 'petTypes',
    type: 'checkbox',
    title: 'Quais pets você tem?',
    required: false,
    options: [
      { value: 'DOG', label: 'Cachorro' },
      { value: 'CAT', label: 'Gato' },
      { value: 'OTHER', label: 'Outros' },
    ],
    showIf: (data) => data.hasPets === 'true',
  },
  // Q12: Requisitos obrigatórios
  {
    id: 'mandatoryRequirements',
    field: 'mandatoryRequirements',
    type: 'checkbox',
    title: 'Algum requisito é essencial para você?',
    subtitle: 'Marque apenas o que for realmente necessário.',
    required: false,
    options: toOptions(MANDATORY_REQUIREMENTS_OPTIONS),
  },
  // Q13: Valor por hora
  {
    id: 'hourlyRateRange',
    field: 'hourlyRateRange',
    type: 'radio',
    title: 'Qual é a sua faixa de orçamento por hora?',
    subtitle:
      'Isso nos ajuda a encontrar babás compatíveis com o que você pode investir.',
    required: true,
    options: toOptions(HOURLY_RATE_OPTIONS),
    validation: z.string().min(1, 'Selecione uma faixa de valor'),
    hint: {
      title: 'Valor médio para esse tipo de vaga na sua região: R$ 36–45/h',
      description: 'Use como referência. O valor final pode variar.',
    },
  },
  // Q14: Foto de perfil da família (opcional)
  {
    id: 'familyPhoto',
    field: 'familyPhoto',
    type: 'photo',
    title: 'Que tal uma foto para o seu perfil?',
    subtitle: 'Perfis com foto geram mais confiança e recebem mais propostas.',
    required: false,
  },
  // Q15: Apresentação da família (texto gerado por IA automaticamente)
  {
    id: 'familyPresentation',
    field: 'familyPresentation',
    type: 'ai-generated-text',
    title: 'Vamos criar uma apresentação para sua família?',
    subtitle:
      'Nossa IA vai gerar um texto simpático para você. Você pode editar depois.',
    placeholder: 'Clique para gerar uma apresentação da sua família',
    required: false,
    maxLength: 1000,
    generateEndpoint: '/api/families/generate-presentation',
  },
  // Q16: Descrição da vaga (texto gerado por IA automaticamente)
  {
    id: 'jobDescription',
    field: 'jobDescription',
    type: 'ai-generated-text',
    title: 'Vamos descrever sua vaga',
    subtitle:
      'Nossa IA pode criar uma descrição clara e atrativa para você editar, se quiser.',
    placeholder: 'Clique para gerar a descrição da sua vaga',
    required: false,
    maxLength: 2000,
    generateEndpoint: '/api/families/generate-job-description',
  },
  // Q17: Fotos da vaga (upload múltiplo, opcional)
  {
    id: 'jobPhotos',
    field: 'jobPhotos',
    type: 'multi-photo',
    title: 'Quer adicionar fotos para a vaga?',
    subtitle: 'Fotos do ambiente ajudam as babás a entender melhor a rotina.',
    required: false,
  },
];

// Total de perguntas (usado para cálculo de progresso)
export const TOTAL_FAMILY_QUESTIONS = FAMILY_ALL_QUESTIONS.length;

// ==========================================
// Helpers para navegação
// ==========================================

/**
 * Retorna todas as perguntas visíveis dado o formData atual
 */
export function getVisibleQuestions(formData: FamilyFormData): FlowQuestion[] {
  return FAMILY_ALL_QUESTIONS.filter((q) => !q.showIf || q.showIf(formData));
}

/**
 * Retorna a pergunta dado q (1-based index nas perguntas VISÍVEIS)
 */
export function getQuestion(
  q: number,
  formData: FamilyFormData,
): FlowQuestion | null {
  const visibleQuestions = getVisibleQuestions(formData);
  if (q < 1 || q > visibleQuestions.length) {
    return null;
  }
  return visibleQuestions[q - 1];
}

/**
 * Calcula o próximo destino após responder a pergunta atual
 * @returns { q } para próxima pergunta ou 'complete' se acabou
 */
export function getNextDestination(
  q: number,
  formData: FamilyFormData,
): { q: number } | 'complete' {
  const visibleQuestions = getVisibleQuestions(formData);

  if (q >= visibleQuestions.length) {
    return 'complete';
  }

  return { q: q + 1 };
}

/**
 * Calcula o destino anterior (voltar)
 * @returns { q } para pergunta anterior ou 'exit' se é a primeira
 */
export function getPrevDestination(
  q: number,
  _formData: FamilyFormData,
): { q: number } | 'exit' {
  if (q <= 1) {
    return 'exit';
  }

  return { q: q - 1 };
}

/**
 * Encontra onde o usuário parou no onboarding
 * Retorna a primeira pergunta não respondida
 */
export function findResumePoint(
  formData: FamilyFormData,
): { q: number } | 'complete' {
  const visibleQuestions = getVisibleQuestions(formData);

  for (let i = 0; i < visibleQuestions.length; i++) {
    const question = visibleQuestions[i];
    const value = formData[question.field];

    const isRequired = question.required;
    const isEmpty =
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0);

    if (isRequired && isEmpty) {
      return { q: i + 1 };
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
  formData: FamilyFormData,
): { current: number; total: number } {
  const visibleQuestions = getVisibleQuestions(formData);
  return {
    current: Math.min(q, visibleQuestions.length),
    total: visibleQuestions.length,
  };
}

/**
 * Obtém o índice global (1-based) de uma pergunta visível
 */
export function getQuestionIndex(
  questionId: string,
  formData: FamilyFormData,
): number {
  const visibleQuestions = getVisibleQuestions(formData);
  const index = visibleQuestions.findIndex((q) => q.id === questionId);
  return index >= 0 ? index + 1 : -1;
}
