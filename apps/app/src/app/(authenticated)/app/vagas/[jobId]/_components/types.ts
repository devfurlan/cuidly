/**
 * Types for Job Detail page components
 */

export interface DaySchedule {
  enabled: boolean;
  startTime?: string;
  endTime?: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface Child {
  id: number;
  name: string | null;
  birthDate: string | null;
  hasSpecialNeeds: boolean;
  gender: string | null;
  carePriorities: string[];
  routine: string | null;
  specialNeedsTypes: string[];
  specialNeedsDescription: string | null;
  unborn: boolean;
  expectedBirthDate: string | null;
}

export interface JobFamily {
  id: number;
  name: string;
  photoUrl: string | null;
  familyPresentation: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  neededShifts: string[];
  neededDays: string[];
  hasPets: boolean;
  petTypes: string[];
  petsDescription: string | null;
  housingType: string | null;
  parentPresence: string | null;
  domesticHelpExpected: string[];
  houseRules: string[];
}

export interface Job {
  id: number;
  title: string;
  description: string | null;
  jobType: string;
  schedule: WeeklySchedule;
  requiresOvernight: string;
  contractType: string;
  benefits: string[];
  paymentType: string;
  budgetMin: number;
  budgetMax: number;
  mandatoryRequirements: string[];
  photos: string[];
  startDate: string;
  status: string;
  createdAt: string;
  children: Child[];
  family: JobFamily;
}

export interface ApplicationNanny {
  id: number;
  name: string;
  slug: string;
  photoUrl: string | null;
  experienceYears: number | null;
  certifications: string[];
  hasSpecialNeedsExperience: boolean;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
}

export interface Application {
  id: number;
  status: string;
  matchScore: number | null;
  message: string | null;
  createdAt: string;
  nanny: ApplicationNanny;
}

export interface ScoreComponent {
  score: number;
  maxScore: number;
  weight: number;
  weighted: number;
  details?: string;
}

export interface MatchBreakdown {
  ageRange?: ScoreComponent;
  nannyType?: ScoreComponent;
  activities?: ScoreComponent;
  contractRegime?: ScoreComponent;
  availability?: ScoreComponent;
  childrenCount?: ScoreComponent;
  seal?: ScoreComponent;
  reviews?: ScoreComponent;
  distanceBonus?: ScoreComponent;
  budgetBonus?: ScoreComponent;
  [key: string]: ScoreComponent | undefined;
}

export interface MatchResult {
  score: number;
  isEligible: boolean;
  eliminationReasons: string[];
  breakdown: MatchBreakdown;
}

export interface RecommendedNanny {
  nanny: {
    id: number;
    name: string;
    slug: string;
    photoUrl: string | null;
    experienceYears: number | null;
    certifications: string[];
    hasSpecialNeedsExperience: boolean;
    city: string | null;
    state: string | null;
  };
  matchScore: number;
  breakdown: MatchBreakdown;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

// Props interfaces for components
export interface JobDetailContentProps {
  job: Job;
  isOwner: boolean;
  hasActiveSubscription: boolean;
  applications: Application[];
  stats: ApplicationStats | null;
  myApplication: Application | null;
  matchResult: MatchResult | null;
}

export interface JobHeaderProps {
  job: Job;
  isOwner: boolean;
  onStatusChange: (status: string) => Promise<void>;
}

export interface ApplySectionProps {
  jobId: number;
  familyName: string;
  matchResult: MatchResult | null;
  myApplication: Application | null;
  onApplicationSuccess: (application: Application, matchResult: MatchResult | null) => void;
}

export interface MatchScoreCardProps {
  matchResult: MatchResult;
}

export interface ApplicationsListProps {
  applications: Application[];
  jobId: number;
  hasActiveSubscription: boolean;
  onApplicationUpdate: (applicationId: number, status: 'ACCEPTED' | 'REJECTED') => void;
}

export interface RecommendedNanniesProps {
  jobId: number;
  hasActiveSubscription: boolean;
}

// Label maps
export const JOB_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Babá Fixa',
  SUBSTITUTE: 'Folguista',
  OCCASIONAL: 'Eventual',
};

export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  CLT: 'CLT',
  DAILY_WORKER: 'Diarista',
  MEI: 'MEI/PJ',
  TO_BE_DISCUSSED: 'A combinar',
};

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  MONTHLY: '/mês',
  HOURLY: '/hora',
  DAILY: '/dia',
};

export const STATUS_LABELS: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'default' }
> = {
  ACTIVE: { label: 'Ativa', variant: 'success' },
  PAUSED: { label: 'Pausada', variant: 'warning' },
  CLOSED: { label: 'Encerrada', variant: 'default' },
};

export const APPLICATION_STATUS_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  PENDING: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-700',
  },
  ACCEPTED: {
    label: 'Aceita',
    color: 'bg-green-100 text-green-700',
  },
  REJECTED: {
    label: 'Recusada',
    color: 'bg-red-100 text-red-700',
  },
  WITHDRAWN: {
    label: 'Cancelada',
    color: 'bg-gray-100 text-gray-700',
  },
};

export const REQUIREMENT_LABELS: Record<string, string> = {
  NON_SMOKER: 'Não fumante',
  HAS_VEHICLE: 'Veículo próprio',
  ACCEPTS_CAMERAS: 'Aceita câmeras',
  SPECIAL_NEEDS_EXPERIENCE: 'Experiência com necessidades especiais',
  PET_FRIENDLY: 'Confortável com animais',
  GENDER_PREFERENCE: 'Preferência de gênero',
  CERT_FIRST_AID: 'Primeiros Socorros',
  CERT_CPR: 'RCP',
  CERT_CHILD_DEVELOPMENT: 'Desenvolvimento Infantil',
};

export const BENEFIT_LABELS: Record<string, string> = {
  MEAL: 'Alimentação',
  TRANSPORT: 'Vale transporte',
  HEALTH_INSURANCE: 'Plano de saúde',
  DENTAL_INSURANCE: 'Plano odontológico',
  THIRTEENTH_SALARY: '13º salário',
  VACATION: 'Férias remuneradas',
  BONUS: 'Bônus',
  ACCOMMODATION: 'Alojamento',
};

export const SHIFT_LABELS: Record<string, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  NIGHT: 'Noite',
  OVERNIGHT: 'Pernoite',
};

export const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Seg',
  TUESDAY: 'Ter',
  WEDNESDAY: 'Qua',
  THURSDAY: 'Qui',
  FRIDAY: 'Sex',
  SATURDAY: 'Sáb',
  SUNDAY: 'Dom',
};

export const HOUSING_TYPE_LABELS: Record<string, string> = {
  HOUSE: 'Casa',
  APARTMENT_NO_ELEVATOR: 'Apartamento sem elevador',
  APARTMENT_WITH_ELEVATOR: 'Apartamento com elevador',
  CONDOMINIUM: 'Condomínio fechado',
};

export const PARENT_PRESENCE_LABELS: Record<string, string> = {
  ALWAYS: 'Sempre em casa',
  SOMETIMES: 'Às vezes em casa',
  RARELY: 'Raramente em casa',
  NEVER: 'Nunca em casa',
};

export const PET_TYPE_LABELS: Record<string, string> = {
  DOG: 'Cachorro',
  CAT: 'Gato',
  OTHER: 'Outros',
};

export const DOMESTIC_HELP_LABELS: Record<string, string> = {
  COOKING: 'Preparar refeições simples',
  ORGANIZE: 'Organizar o ambiente da criança',
  HOMEWORK: 'Ajudar com tarefas escolares',
  TRANSPORT: 'Levar e buscar na escola',
  BATHING: 'Dar banho',
  SLEEPING: 'Colocar para dormir',
  PLAYING: 'Brincadeiras e atividades lúdicas',
  READING: 'Ler histórias',
  OUTDOOR: 'Passeios ao ar livre',
  CRAFTS: 'Atividades manuais e artísticas',
  SPORTS: 'Atividades esportivas',
  LAUNDRY: 'Lavar roupas da criança',
  CLEANING: 'Faxina leve',
};

export const CHILD_GENDER_LABELS: Record<string, string> = {
  MALE: 'Menino',
  FEMALE: 'Menina',
};

export const HOUSE_RULES_LABELS: Record<string, string> = {
  SCREEN_LIMIT: 'Limite de tela',
  SLEEP_ROUTINE: 'Rotina de sono',
  HEALTHY_FOOD: 'Alimentação saudável',
  NO_SUGAR: 'Sem açúcar',
  OUTDOOR_PLAY: 'Brincadeiras ao ar livre',
  EDUCATIONAL_ACTIVITIES: 'Atividades educativas',
  RELIGIOUS_PRACTICES: 'Práticas religiosas',
  NO_SCREEN_TIME: 'Sem telas/TV',
  ORGANIC_FOOD: 'Alimentação orgânica',
  STRICT_SCHEDULE: 'Horários rígidos',
  NAP_TIME: 'Horário de soneca',
};

export const DAYS_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export const SHIFTS_ORDER = ['MORNING', 'AFTERNOON', 'NIGHT', 'OVERNIGHT'] as const;

// Utility functions
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

export function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  if (score >= 40) return 'bg-orange-100';
  return 'bg-red-100';
}

export const MATCH_BREAKDOWN_LABELS: Record<string, string> = {
  ageRange: 'Faixa Etária',
  nannyType: 'Tipo de Babá',
  activities: 'Atividades',
  contractRegime: 'Regime',
  availability: 'Disponibilidade',
  childrenCount: 'Nº Crianças',
  seal: 'Selo',
  reviews: 'Avaliações',
  distanceBonus: 'Distância',
  budgetBonus: 'Orçamento',
};
