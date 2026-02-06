import { AdminPermission } from '@prisma/client';

export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  NANNIES: 'Babás',
  FAMILIES: 'Famílias',
  CHILDREN: 'Crianças',
  SUBSCRIPTIONS: 'Assinaturas',
  ADMIN_USERS: 'Usuários Admins',
  REVIEWS: 'Avaliações',
  COUPONS: 'Cupons',
  JOBS: 'Vagas',
  VALIDATIONS: 'Validações',
  CHAT_MODERATION: 'Moderação de Chat',
  REPORTS: 'Denúncias',
};

export const PERMISSION_DESCRIPTIONS: Record<AdminPermission, string> = {
  NANNIES: 'Visualizar, criar, editar e excluir babás',
  FAMILIES: 'Visualizar, criar, editar e excluir famílias',
  CHILDREN: 'Visualizar, criar, editar e excluir crianças',
  SUBSCRIPTIONS: 'Visualizar e gerenciar planos e assinaturas',
  ADMIN_USERS: 'Gerenciar usuários administradores',
  REVIEWS: 'Moderar avaliações de usuários',
  COUPONS: 'Gerenciar cupons de desconto',
  JOBS: 'Gerenciar vagas e candidaturas',
  VALIDATIONS: 'Gerenciar solicitações de validação de perfil',
  CHAT_MODERATION: 'Moderar conversas e mensagens do chat',
  REPORTS: 'Gerenciar denúncias de perfis e vagas',
};

export const ALL_PERMISSIONS: AdminPermission[] = [
  'NANNIES',
  'FAMILIES',
  'CHILDREN',
  'SUBSCRIPTIONS',
  'ADMIN_USERS',
  'REVIEWS',
  'COUPONS',
  'JOBS',
  'VALIDATIONS',
  'CHAT_MODERATION',
  'REPORTS',
];

/**
 * Verifica se um usuario tem uma permissao especifica
 */
export function hasPermission(
  userPermissions: AdminPermission[],
  requiredPermission: AdminPermission,
  isSuperAdmin: boolean = false,
): boolean {
  if (isSuperAdmin) return true;
  return userPermissions.includes(requiredPermission);
}

/**
 * Verifica se um usuario tem pelo menos uma das permissoes fornecidas
 */
export function hasAnyPermission(
  userPermissions: AdminPermission[],
  requiredPermissions: AdminPermission[],
  isSuperAdmin: boolean = false,
): boolean {
  if (isSuperAdmin) return true;
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
}

/**
 * Verifica se um usuario tem todas as permissoes fornecidas
 */
export function hasAllPermissions(
  userPermissions: AdminPermission[],
  requiredPermissions: AdminPermission[],
  isSuperAdmin: boolean = false,
): boolean {
  if (isSuperAdmin) return true;
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
}

/**
 * Verifica se um usuario e superadmin
 */
export function isSuperAdminUser(isSuperAdmin: boolean): boolean {
  return isSuperAdmin;
}
