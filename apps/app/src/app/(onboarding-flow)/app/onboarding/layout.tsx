import { GTMPageContext } from '@/components/GTMPageContext';
import { Metadata } from 'next';
import { OnboardingBackProvider } from '@/components/onboarding-flow/OnboardingBackContext';
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
    <OnboardingBackProvider>
      <GTMPageContext pageType="onboarding" showCookieConsent={false} />
      <div className="min-h-screen bg-linear-to-b from-fuchsia-50 to-fuchsia-100">
        <OnboardingHeader />
        {children}
      </div>
    </OnboardingBackProvider>
  );
}
