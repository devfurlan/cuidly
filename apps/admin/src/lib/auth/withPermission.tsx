import { ReactNode } from 'react';
import { AdminPermission } from '@prisma/client';
import { getCurrentUserWithPermissions } from './checkPermission';
import { hasPermission, hasAnyPermission } from '../permissions';

type WithPermissionProps = {
  permission: AdminPermission;
  children: ReactNode;
  fallback?: ReactNode;
};

type WithAnyPermissionProps = {
  permissions: AdminPermission[];
  children: ReactNode;
  fallback?: ReactNode;
};

type WithSuperAdminProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Componente wrapper que renderiza children apenas se o usuário tiver a permissão
 * Útil para ocultar elementos da UI baseado em permissões
 */
export async function WithPermission({
  permission,
  children,
  fallback = null,
}: WithPermissionProps) {
  const user = await getCurrentUserWithPermissions();

  if (!user) {
    return <>{fallback}</>;
  }

  const allowed = hasPermission(
    user.permissions,
    permission,
    user.isSuperAdmin
  );

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Componente wrapper que renderiza children se o usuário tiver qualquer uma das permissões
 */
export async function WithAnyPermission({
  permissions,
  children,
  fallback = null,
}: WithAnyPermissionProps) {
  const user = await getCurrentUserWithPermissions();

  if (!user) {
    return <>{fallback}</>;
  }

  const allowed = hasAnyPermission(
    user.permissions,
    permissions,
    user.isSuperAdmin
  );

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Componente wrapper que renderiza children apenas se o usuário for superadmin
 */
export async function WithSuperAdmin({
  children,
  fallback = null,
}: WithSuperAdminProps) {
  const user = await getCurrentUserWithPermissions();

  if (!user) {
    return <>{fallback}</>;
  }

  if (!user.isSuperAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
