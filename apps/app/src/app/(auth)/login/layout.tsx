import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acesse sua conta na Cuidly',
  description: 'Acesse sua conta na Cuidly. Portal de babás profissionais.',
  robots: 'noindex, nofollow',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
