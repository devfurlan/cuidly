/**
 * Family Welcome Section
 * Displays greeting with family name (server-rendered)
 */

import { CreateJobButton } from './QuickActions.client';

interface FamilyWelcomeSectionProps {
  name: string;
}

export function FamilyWelcomeSection({ name }: FamilyWelcomeSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {name}!
          </h1>
          <p className="text-gray-600">
            Encontre a babá perfeita para cuidar de quem você tanto ama
          </p>
        </div>
        <CreateJobButton />
      </div>
    </div>
  );
}
