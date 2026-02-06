import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redefinir Senha - Cuidly',
  description: 'Defina uma nova senha para sua conta na Cuidly.',
  robots: 'noindex, nofollow',
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
