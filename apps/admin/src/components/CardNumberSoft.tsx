'use client';

import { cn } from '@/utils/cn';
import { formatNumberWithDots } from '@/utils/formatNumberWithDots';
import {
  InfoIcon,
  CurrencyCircleDollarIcon,
  TrendUpIcon,
  CrownIcon,
  CalendarPlusIcon,
  UsersIcon,
  HouseIcon,
  FirstAidIcon,
  FirstAidKitIcon,
  UsersThreeIcon,
  UserCheckIcon,
  WarningIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BabyCarriageIcon,
  StarIcon,
  FlagIcon,
  EyeSlashIcon,
  MegaphoneIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { Tooltip } from './ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const iconMap = {
  currency: CurrencyCircleDollarIcon,
  'trend-up': TrendUpIcon,
  crown: CrownIcon,
  'calendar-plus': CalendarPlusIcon,
  users: UsersIcon,
  house: HouseIcon,
  'first-aid': FirstAidIcon,
  'first-aid-kit': FirstAidKitIcon,
  'users-three': UsersThreeIcon,
  'user-check': UserCheckIcon,
  warning: WarningIcon,
  'check-circle': CheckCircleIcon,
  'x-circle': XCircleIcon,
  clock: ClockIcon,
  'baby-carriage': BabyCarriageIcon,
  star: StarIcon,
  flag: FlagIcon,
  'eye-slash': EyeSlashIcon,
  megaphone: MegaphoneIcon,
  trash: TrashIcon,
} as const;

export type IconName = keyof typeof iconMap;

export default function CardNumberSoft({
  title,
  value,
  supportValue,
  color,
  iconName,
  tooltipText,
}: {
  title: string;
  value: number | string;
  supportValue?: string;
  color:
    | 'pink'
    | 'green'
    | 'orange'
    | 'cyan'
    | 'blue'
    | 'purple'
    | 'violet'
    | 'red'
    | 'yellow'
    | 'gray'
    | 'slate'
    | 'zinc'
    | 'neutral'
    | 'stone'
    | 'amber'
    | 'lime'
    | 'emerald'
    | 'teal'
    | 'sky'
    | 'indigo'
    | 'fuchsia'
    | 'rose';
  iconName: IconName;
  tooltipText?: string;
}) {
  const Icon = iconMap[iconName];

  return (
    <Card
      className={cn(
        'flex flex-col justify-center overflow-hidden rounded-xl border border-gray-200 bg-white bg-linear-to-bl from-5% to-white to-65% shadow-sm dark:border-neutral-700 dark:bg-neutral-800',
        `from-${color}-50`,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-1 text-sm font-medium text-gray-600">
          {title}
          {tooltipText && (
            <Tooltip content={tooltipText}>
              <InfoIcon className="size-3.5 shrink-0 text-gray-600" />
            </Tooltip>
          )}
        </CardTitle>
        <Icon className={`text-${color}-600 size-5`} />
      </CardHeader>
      <CardContent className="flex items-center space-x-2">
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? formatNumberWithDots(value) : value}
        </div>
        {supportValue && (
          <span className="text-sm text-gray-500">{supportValue}</span>
        )}
      </CardContent>
    </Card>
  );
}
