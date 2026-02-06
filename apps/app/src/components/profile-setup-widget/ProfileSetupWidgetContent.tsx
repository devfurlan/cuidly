'use client';

import { cn } from '@cuidly/shared';
import { PiX, PiMinus } from 'react-icons/pi';
import { Card, CardContent, CardHeader } from '@/components/ui/shadcn/card';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
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
  const taskConfigs = data.userType === 'nanny' ? NANNY_TASK_CONFIGS : FAMILY_TASK_CONFIGS;

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
