/**
 * Layout for Email Verification Page with Metadata
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificar E-mail - Cuidly',
  description: 'Verificação de e-mail para completar seu cadastro na Cuidly.',
  robots: 'noindex, nofollow',
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
