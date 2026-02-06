/**
 * Job Options Constants
 * All option arrays for job creation and management
 */

// Job type options
export const JOB_TYPE_OPTIONS = [
  { value: 'FIXED', label: 'Babá Fixa', description: 'Trabalho com horário fixo semanal' },
  { value: 'SUBSTITUTE', label: 'Folguista', description: 'Cobertura de folgas e férias' },
  { value: 'OCCASIONAL', label: 'Eventual', description: 'Trabalhos pontuais e avulsos' },
] as const;

// Contract type options
export const CONTRACT_TYPE_OPTIONS = [
  { value: 'CLT', label: 'CLT', description: 'Carteira assinada' },
  { value: 'DAILY_WORKER', label: 'Diarista', description: 'Pagamento por dia trabalhado' },
  { value: 'MEI', label: 'MEI/PJ', description: 'Microempreendedor Individual' },
  { value: 'TO_BE_DISCUSSED', label: 'A combinar', description: 'Aberta a discussão' },
] as const;

// Payment type options
export const PAYMENT_TYPE_OPTIONS = [
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'HOURLY', label: 'Por hora' },
  { value: 'DAILY', label: 'Por dia' },
] as const;

// Overnight options
export const OVERNIGHT_OPTIONS = [
  { value: 'NO', label: 'Não', description: 'Não requer pernoite' },
  { value: 'SOMETIMES', label: 'Às vezes', description: 'Ocasionalmente pode precisar' },
  { value: 'FREQUENTLY', label: 'Frequentemente', description: 'Pernoite é necessário regularmente' },
] as const;

// Benefits options
export const BENEFITS_OPTIONS = [
  { value: 'MEAL', label: 'Alimentação' },
  { value: 'TRANSPORT', label: 'Vale transporte' },
  { value: 'HEALTH_INSURANCE', label: 'Plano de saúde' },
  { value: 'DENTAL_INSURANCE', label: 'Plano odontológico' },
  { value: 'THIRTEENTH_SALARY', label: '13º salário' },
  { value: 'VACATION', label: 'Férias remuneradas' },
  { value: 'BONUS', label: 'Bônus' },
  { value: 'ACCOMMODATION', label: 'Alojamento' },
] as const;

// Mandatory requirements options (job perspective)
export const JOB_MANDATORY_REQUIREMENTS_OPTIONS = [
  { value: 'NON_SMOKER', label: 'Não fumante' },
  { value: 'HAS_VEHICLE', label: 'Possui veículo próprio' },
  { value: 'ACCEPTS_CAMERAS', label: 'Aceita câmeras de monitoramento' },
  { value: 'SPECIAL_NEEDS_EXPERIENCE', label: 'Experiência com necessidades especiais' },
  { value: 'PET_FRIENDLY', label: 'Confortável com animais' },
  { value: 'GENDER_PREFERENCE', label: 'Preferência de gênero obrigatória' },
  { value: 'CERT_FIRST_AID', label: 'Certificado em Primeiros Socorros' },
  { value: 'CERT_CPR', label: 'Certificado em RCP' },
  { value: 'CERT_CHILD_DEVELOPMENT', label: 'Formação em Desenvolvimento Infantil' },
] as const;

// Job status options
export const JOB_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'PAUSED', label: 'Pausada' },
  { value: 'FILLED', label: 'Preenchida' },
  { value: 'CLOSED', label: 'Encerrada' },
  { value: 'EXPIRED', label: 'Expirada' },
] as const;

// Job application status options
export const JOB_APPLICATION_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'ACCEPTED', label: 'Aceita' },
  { value: 'REJECTED', label: 'Rejeitada' },
  { value: 'WITHDRAWN', label: 'Desistiu' },
] as const;
