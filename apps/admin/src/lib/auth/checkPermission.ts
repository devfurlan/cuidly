import { AdminPermission } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export type AdminUserWithPermissions = {
  id: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  permissions: AdminPermission[];
  isSuperAdmin: boolean;
};

// Backward compatibility alias
export type UserWithPermissions = AdminUserWithPermissions;

export class AuthorizationError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 403,
    code: string = 'FORBIDDEN'
  ) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Obtém o admin user atual com suas permissões do banco de dados
 */
export async function getCurrentUserWithPermissions(): Promise<AdminUserWithPermissions | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  // Buscar admin user pelo ID (que corresponde ao auth id) ou email
  let adminUser = await prisma.adminUser.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      photoUrl: true,
      permissions: true,
      isSuperAdmin: true,
      status: true,
    },
  });

  // Se não encontrou por ID, buscar por email como fallback
  if (!adminUser && authUser.email) {
    adminUser = await prisma.adminUser.findUnique({
      where: { email: authUser.email },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        permissions: true,
        isSuperAdmin: true,
        status: true,
      },
    });
  }

  if (!adminUser || adminUser.status !== 'ACTIVE') return null;

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    photoUrl: adminUser.photoUrl,
    permissions: adminUser.permissions,
    isSuperAdmin: adminUser.isSuperAdmin,
  };
}

/**
 * Verifica se o usuario atual tem a permissao necessaria
 * Redireciona para login se nao autenticado
 * Redireciona para /unauthorized se nao autorizado
 */
export async function requirePermission(
  permission: AdminPermission
): Promise<AdminUserWithPermissions> {
  const user = await getCurrentUserWithPermissions();

  if (!user) {
    redirect('/login');
  }

  if (!user.isSuperAdmin && !user.permissions.includes(permission)) {
    redirect('/unauthorized');
  }

  return user;
}

/**
 * Verifica se o usuario atual tem pelo menos uma das permissoes
 */
export async function requireAnyPermission(
  permissions: AdminPermission[]
): Promise<AdminUserWithPermissions> {
  const user = await getCurrentUserWithPermissions();

  if (!user) {
    redirect('/login');
  }

  const hasPermission =
    user.isSuperAdmin ||
    permissions.some((p) => user.permissions.includes(p));

  if (!hasPermission) {
    redirect('/unauthorized');
  }

  return user;
}

/**
 * Verifica se o usuario e superadmin (para paginas)
 * Redireciona para /unauthorized se nao for superadmin
 */
export async function requireSuperAdmin(): Promise<AdminUserWithPermissions> {
  const user = await getCurrentUserWithPermissions();

  if (!user) {
    redirect('/login');
  }

  if (!user.isSuperAdmin) {
    redirect('/unauthorized');
  }

  return user;
}

/**
 * Verifica se o usuario e admin (sem verificar permissoes especificas)
 */
export async function requireAdmin(): Promise<AdminUserWithPermissions> {
  const user = await getCurrentUserWithPermissions();

  if (!user) {
    redirect('/login');
  }

  return user;
}

// ============================================
// API Authorization Functions (throw errors instead of redirect)
// ============================================

/**
 * Verifica permissão para rotas de API (lança erro em vez de redirect)
 * Use esta função em API routes que precisam retornar 401/403
 */
export async function requirePermissionApi(
  permission: AdminPermission
): Promise<AdminUserWithPermissions> {
  const user = await getCurrentUserWithPermissions();

  if (!user) {
    throw new AuthorizationError('Não autenticado', 401, 'UNAUTHORIZED');
  }

  if (!user.isSuperAdmin && !user.permissions.includes(permission)) {
    throw new AuthorizationError(
      `Acesso negado. Permissao necessaria: ${permission}`,
      403,
      'MISSING_PERMISSION'
    );
  }

  return user;
}

/**
 * Verifica se o usuário tem pelo menos uma das permissões (API version)
 */
export async function requireAnyPermissionApi(
  permissions: AdminPermission[]
): Promise<AdminUserWithPermissions> {
  const user = await getCurrentUserWithPermissions();

  if (!user) {
    throw new AuthorizationError('Não autenticado', 401, 'UNAUTHORIZED');
  }

  const hasPermission =
    user.isSuperAdmin ||
    permissions.some((p) => user.permissions.includes(p));

  if (!hasPermission) {
    throw new AuthorizationError(
      `Acesso negado. Permissoes necessarias: ${permissions.join(' ou ')}`,
      403,
      'MISSING_PERMISSION'
    );
  }

  return user;
}

/**
 * Verifica se o usuário é superadmin (API version)
 */
export async function requireSuperAdminApi(): Promise<AdminUserWithPermissions> {
  const user = await getCurrentUserWithPermissions();

  if (!user) {
    throw new AuthorizationError('Não autenticado', 401, 'UNAUTHORIZED');
  }

  if (!user.isSuperAdmin) {
    throw new AuthorizationError(
      'Acesso negado. Apenas super administradores podem executar esta acao.',
      403,
      'NOT_SUPER_ADMIN'
    );
  }

  return user;
}
