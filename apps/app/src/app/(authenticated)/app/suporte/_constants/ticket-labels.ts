import {
  TicketCategory,
  TicketDissatisfactionReason,
  TicketStatus,
} from '@cuidly/database';

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Resolvido',
  CLOSED: 'Encerrado',
};

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  RESOLVED: 'bg-green-50 text-green-700 border-green-200',
  CLOSED: 'bg-gray-50 text-gray-500 border-gray-200',
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  SUBSCRIPTION_PAYMENT: 'Assinatura / Pagamento',
  ACCOUNT: 'Conta',
  BUG_TECHNICAL: 'Bug / Problema técnico',
  SUGGESTION: 'Sugestão',
  OTHER: 'Outro',
};

export const DISSATISFACTION_REASON_LABELS: Record<
  TicketDissatisfactionReason,
  string
> = {
  NOT_RESOLVED: 'Não resolveu meu problema',
  SLOW_RESPONSE: 'Demorou muito para responder',
  UNCLEAR_RESPONSE: 'Resposta pouco clara',
  OTHER: 'Outro motivo',
};
