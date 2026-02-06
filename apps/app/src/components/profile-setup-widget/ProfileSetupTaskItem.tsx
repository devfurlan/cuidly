'use client';

import Link from 'next/link';
import { cn } from '@cuidly/shared';
import {
  PiCheckCircle,
  PiLock,
  PiArrowRight,
  PiUser,
  PiTextAa,
  PiArticle,
  PiCalendar,
  PiCurrencyCircleDollar,
  PiIdentificationCard,
  PiShieldCheck,
  PiUsers,
  PiUserCheck,
  PiStar,
  PiBaby,
  PiMapPin,
  PiBriefcase,
  PiHouse,
  PiImages,
  PiEnvelope,
} from 'react-icons/pi';
import type { ProfileTask } from './types';

const TASK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'basic-profile': PiUser,
  'mini-bio': PiTextAa,
  'about-me': PiArticle,
  'availability': PiCalendar,
  'rates': PiCurrencyCircleDollar,
  'document-verification': PiIdentificationCard,
  'premium-validation': PiShieldCheck,
  'references': PiUsers,
  'references-verified': PiUserCheck,
  'reviews': PiStar,
  'children': PiBaby,
  'address': PiMapPin,
  'job-created': PiBriefcase,
  'family-presentation': PiHouse,
  'job-description': PiArticle,
  'job-photos': PiImages,
  'email-verified': PiEnvelope,
};

interface ProfileSetupTaskItemProps {
  task: ProfileTask;
  userType: 'nanny' | 'family';
}

export function ProfileSetupTaskItem({ task, userType }: ProfileSetupTaskItemProps) {
  const Icon = TASK_ICONS[task.id] || PiUser;

  // Using explicit classes for Tailwind to detect them
  const pendingIconBg = userType === 'nanny'
    ? 'bg-fuchsia-100 text-fuchsia-600'
    : 'bg-amber-100 text-amber-600';

  const isClickable = task.status === 'pending' && task.href;

  const content = (
    <>
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          task.status === 'completed' && 'bg-green-100 text-green-600',
          task.status === 'locked' && 'bg-gray-100 text-gray-400',
          task.status === 'pending' && pendingIconBg
        )}
      >
        <Icon className="size-4" />
      </div>

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm block truncate',
            task.status === 'completed' && 'line-through text-gray-400'
          )}
        >
          {task.label}
        </span>
        {task.requiresPro && task.status !== 'completed' && (
          <span className="text-xs text-fuchsia-600 font-medium">PRO</span>
        )}
      </div>

      {task.status === 'completed' ? (
        <PiCheckCircle className="size-5 shrink-0 text-green-500" />
      ) : task.status === 'locked' ? (
        <PiLock className="size-5 shrink-0 text-gray-400" />
      ) : isClickable ? (
        <PiArrowRight className={cn(
          'size-4 shrink-0',
          userType === 'nanny' ? 'text-fuchsia-600' : 'text-amber-600'
        )} />
      ) : null}
    </>
  );

  if (isClickable) {
    return (
      <Link
        href={task.href!}
        className="flex items-center gap-3 rounded-lg py-2 px-1 -mx-1 transition-colors hover:bg-gray-50"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2">
      {content}
    </div>
  );
}
