'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useCallback, ReactNode } from 'react';

export interface UserData {
  name: string | null;
  email: string | null;
  role: 'NANNY' | 'FAMILY';
  nannyId?: number;
  familyId?: number;
  photoUrl?: string | null;
}

interface UserContextType {
  user: UserData;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: UserData;
}) {
  const router = useRouter();

  // Força revalidação server-side quando chamado
  const refreshUser = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <UserContext.Provider
      value={{
        user: initialUser,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
