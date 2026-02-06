import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cadastro - Cuidly',
  description: 'Cadastre-se como babá na Cuidly. Receba propostas de trabalho e conecte-se com famílias em todo o Brasil.',
  robots: 'noindex, nofollow',
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
