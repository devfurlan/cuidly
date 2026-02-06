'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@cuidly/shared';
import { PiListChecks } from 'react-icons/pi';
import { useProfileSetupData } from './hooks/useProfileSetupData';
import { useProfileSetupDismiss } from './hooks/useProfileSetupDismiss';
import { ProfileSetupWidgetContent } from './ProfileSetupWidgetContent';

export function ProfileSetupWidget() {
  const pathname = usePathname();
  const { data, isLoading } = useProfileSetupData();
  const { state, isVisible, minimize, expand, dismissFor24Hours } = useProfileSetupDismiss();

  // Don't render on onboarding pages
  if (pathname?.startsWith('/app/onboarding')) {
    return null;
  }

  // Don't render if dismissed or still loading
  if (!isVisible || isLoading) {
    return null;
  }

  // Don't render if no data
  if (!data) {
    return null;
  }

  // Don't render if profile is 100% complete
  if (data.percentComplete >= 100) {
    return null;
  }

  const pendingCount = data.totalTasks - data.completedTasks;

  // Minimized state: small floating button
  if (state.minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40 animate-in zoom-in duration-200">
        <button
          onClick={expand}
          className={cn(
            'relative flex size-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105',
            data.userType === 'nanny'
              ? 'bg-fuchsia-600 hover:bg-fuchsia-700'
              : 'bg-amber-500 hover:bg-amber-600'
          )}
          aria-label="Expandir configuração do perfil"
        >
          <PiListChecks className="size-6 text-white" />
          {pendingCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-orange-500 text-xs font-medium text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Expanded state: full widget card
  return (
    <div className="fixed bottom-4 right-4 z-40 animate-in slide-in-from-right-4 slide-in-from-bottom-4 duration-300">
      <ProfileSetupWidgetContent
        data={data}
        onMinimize={minimize}
        onDismiss={dismissFor24Hours}
      />
    </div>
  );
}
