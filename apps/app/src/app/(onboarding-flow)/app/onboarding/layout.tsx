import { Metadata } from 'next';
import { OnboardingHeader } from './_components/OnboardingHeader';

export const metadata: Metadata = {
  title: 'Complete seu cadastro | Cuidly',
  description: 'Complete seu perfil para comecar a usar a Cuidly',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-b from-fuchsia-50 to-fuchsia-100">
      <OnboardingHeader />
      {children}
    </div>
  );
}
