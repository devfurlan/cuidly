import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recuperar Senha - Cuidly',
  description: 'Recupere sua senha de acesso à Cuidly.',
  robots: 'noindex, nofollow',
};

export default function PasswordRecoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
