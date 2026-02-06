/**
 * Nanny Welcome Section
 * Displays greeting with nanny name (server-rendered)
 */

import { QuickActions } from './QuickActions.client';

interface NannyWelcomeSectionProps {
  name: string;
}

export function NannyWelcomeSection({ name }: NannyWelcomeSectionProps) {
  const firstName = name.split(' ')[0];

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {firstName}!</h1>
          <p className="text-gray-600">
            Acompanhe suas candidaturas e encontre novas oportunidades
          </p>
        </div>
        <QuickActions userType="nanny" />
      </div>
    </div>
  );
}
