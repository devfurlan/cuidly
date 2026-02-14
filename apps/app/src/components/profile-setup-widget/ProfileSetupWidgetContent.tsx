'use client';

import { cn } from '@cuidly/shared';
import { useRouter } from 'next/navigation';
import { PiX, PiMinus, PiSparkle } from 'react-icons/pi';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import { useTrialEligibility } from '@/hooks/useTrialEligibility';
import { ProfileSetupProgress } from './ProfileSetupProgress';
import { ProfileSetupTaskItem } from './ProfileSetupTaskItem';
import { NANNY_TASK_CONFIGS } from './nanny-tasks';
import { FAMILY_TASK_CONFIGS } from './family-tasks';
import type { ProfileSetupData, ProfileTask } from './types';

interface ProfileSetupWidgetContentProps {
  data: ProfileSetupData;
  onMinimize: () => void;
  onDismiss: () => void;
}

export function ProfileSetupWidgetContent({
  data,
  onMinimize,
  onDismiss,
}: ProfileSetupWidgetContentProps) {
  const router = useRouter();
  const taskConfigs = data.userType === 'nanny' ? NANNY_TASK_CONFIGS : FAMILY_TASK_CONFIGS;
  const { eligible: trialEligible, trialDays, activateTrial, isActivating } = useTrialEligibility();
  const isProfileComplete = data.completedTasks === data.totalTasks && data.totalTasks > 0;

  const handleActivateTrial = async () => {
    const result = await activateTrial();
    if (result.success) {
      toast.success(result.message || 'Período de teste ativado!');
      router.refresh();
    } else {
      toast.error(result.message || 'Erro ao ativar período de teste');
    }
  };

  // Enrich tasks with href from configs
  const enrichedTasks: ProfileTask[] = data.tasks.map((task) => ({
    ...task,
    href: taskConfigs[task.id]?.href,
  }));

  // Sort tasks: pending first, then locked, then completed
  const sortedTasks = [...enrichedTasks].sort((a, b) => {
    const order: Record<string, number> = { pending: 0, locked: 1, completed: 2 };
    return (order[a.status] ?? 1) - (order[b.status] ?? 1);
  });

  return (
    <Card className="w-80 shadow-xl border-0 bg-white">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              {data.userType === 'nanny' ? 'Selo Identificada' : 'Primeiros passos'}
            </h3>
            {data.hasProSubscription && (
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full text-white',
                  data.userType === 'nanny' ? 'bg-fuchsia-500' : 'bg-amber-500'
                )}
              >
                PRO
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onMinimize}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Minimizar"
            >
              <PiMinus className="size-4 text-gray-500" />
            </button>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Fechar por 24 horas"
            >
              <PiX className="size-4 text-gray-500" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0">
        {/* Progress section */}
        <div className="space-y-2 mb-4">
          <ProfileSetupProgress
            completedSegments={data.completedTasks}
            totalSegments={data.totalTasks}
            userType={data.userType}
          />
          <p className="text-sm text-gray-600">
            {data.completedTasks} de {data.totalTasks} completos
          </p>
          {data.userType === 'nanny' && (
            <p className="text-sm text-gray-500">
              Complete as etapas abaixo para obter seu selo e aumentar suas chances de contratação.
            </p>
          )}
        </div>

        {/* Trial offer when profile is 100% complete */}
        {isProfileComplete && data.userType === 'nanny' && trialEligible && (
          <div className="mb-4 rounded-lg border border-fuchsia-200 bg-fuchsia-50/50 p-3">
            <p className="mb-2 text-sm font-medium text-fuchsia-700">
              Perfil completo! Experimente o Pro grátis por {trialDays} dias.
            </p>
            <Button
              size="sm"
              className="w-full"
              onClick={handleActivateTrial}
              disabled={isActivating}
            >
              <PiSparkle className="mr-1 size-4" />
              {isActivating ? 'Ativando...' : `Ativar ${trialDays} dias grátis`}
            </Button>
          </div>
        )}

        {/* Task list */}
        <ScrollArea className="h-64">
          <div className="space-y-1 pr-3">
            {sortedTasks.map((task) => (
              <ProfileSetupTaskItem
                key={task.id}
                task={task}
                userType={data.userType}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
