import { z } from 'zod';

export const AuditLogSchema = z.object({
  id: z.number(),
  table: z.string(),
  action: z.string(),
  recordId: z.string(),
  data: z.unknown().nullable(),
  userId: z.string().nullable(),
  createdAt: z.date(),
  user: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      email: z.string(),
    })
    .nullable(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// Labels for action types
export const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Criação',
  UPDATE: 'Atualização',
  DELETE: 'Exclusão',
  APPROVE: 'Aprovação',
  REJECT: 'Rejeição',
  MODERATE: 'Moderação',
  CANCEL_SUBSCRIPTION: 'Cancelamento de Assinatura',
  CHANGE_PLAN: 'Mudança de Plano',
  REFUND_PAYMENT: 'Reembolso',
  VIEW_CONVERSATION: 'Visualização de Conversa',
  DELETE_MESSAGE: 'Exclusão de Mensagem',
  VIEW_PERSONAL_DATA: 'Visualização de Dados Pessoais',
  EXPORT_DATA: 'Exportação de Dados',
  CHANGE_PERMISSIONS: 'Alteração de Permissões',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
};

// Labels for table names
export const TABLE_LABELS: Record<string, string> = {
  users: 'Usuários',
  admin_users: 'Administradores',
  nannies: 'Babás',
  families: 'Famílias',
  children: 'Crianças',
  subscriptions: 'Assinaturas',
  plans: 'Planos',
  payments: 'Pagamentos',
  reviews: 'Avaliações',
  jobs: 'Vagas',
  job_applications: 'Candidaturas',
  validation_requests: 'Solicitações de Validação',
  conversations: 'Conversas',
  messages: 'Mensagens',
  coupons: 'Cupons',
};

// Action severity for visual indicators
export const ACTION_SEVERITY: Record<string, 'low' | 'medium' | 'high'> = {
  CREATE: 'low',
  UPDATE: 'medium',
  DELETE: 'high',
  APPROVE: 'low',
  REJECT: 'medium',
  MODERATE: 'medium',
  CANCEL_SUBSCRIPTION: 'high',
  CHANGE_PLAN: 'medium',
  REFUND_PAYMENT: 'high',
  VIEW_CONVERSATION: 'low',
  DELETE_MESSAGE: 'medium',
  VIEW_PERSONAL_DATA: 'low',
  EXPORT_DATA: 'medium',
  CHANGE_PERMISSIONS: 'high',
  LOGIN: 'low',
  LOGOUT: 'low',
};
