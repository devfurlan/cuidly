'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AdminPermission } from '@prisma/client';

type PermissionsContextType = {
  permissions: AdminPermission[];
  isSuperAdmin: boolean;
  role: string;
  hasPermission: (permission: AdminPermission) => boolean;
};

const PermissionsContext = createContext<PermissionsContextType | null>(null);

type PermissionsProviderProps = {
  children: ReactNode;
  permissions: AdminPermission[];
  isSuperAdmin: boolean;
  role: string;
};

export function PermissionsProvider({
  children,
  permissions,
  isSuperAdmin,
  role,
}: PermissionsProviderProps) {
  const hasPermission = (permission: AdminPermission): boolean => {
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  return (
    <PermissionsContext.Provider
      value={{ permissions, isSuperAdmin, role, hasPermission }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    // Se não houver contexto, retornar valores padrão (sem permissões)
    return {
      permissions: [] as AdminPermission[],
      isSuperAdmin: false,
      role: 'CUSTOMER',
      hasPermission: () => false,
    };
  }
  return context;
}
