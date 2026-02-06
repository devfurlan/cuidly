import { CommonStatus } from '@prisma/client';
import { Badge, BadgeProps } from './ui/Badge';
import { Tooltip } from './ui/tooltip';

interface BadgeStatusProps extends Partial<BadgeProps> {
  status: CommonStatus | string;
  displayVariant?: 'default' | 'circle';
}

const getBadgeStatusVariant = (status: string): BadgeProps['variant'] => {
  const statusVariants: Record<string, BadgeProps['variant']> = {
    active: 'teal',
    suspended: 'red',
    inactive: 'muted',
    pending: 'yellow',
    completed: 'teal',
    processing: 'blue',
    failed: 'red',
    cancelled: 'muted',
    deleted: 'red',
    to_execute: 'yellow',
  };

  return statusVariants[status.toLowerCase()] || 'yellow';
};

export default function BadgeStatus({
  status,
  displayVariant = 'default',
  ...props
}: BadgeStatusProps) {
  const statusVariant = getBadgeStatusVariant(status);

  const statusLabel =
    {
      active: 'ATIVA',
      suspended: 'SUSPENSA',
      inactive: 'INATIVA',
      pending: 'PENDENTE',
      completed: 'CONCLUÍDA',
      processing: 'PROCESSANDO',
      failed: 'FALHOU',
      cancelled: 'CANCELADA',
      deleted: 'DELETADA',
      to_execute: 'A EXECUTAR',
    }[status.toLowerCase()] || status;

  if (displayVariant === 'circle') {
    return (
      <Tooltip content={statusLabel}>
        <Badge
          className="size-2.5 rounded-full p-0"
          variant={statusVariant}
          {...props}
        />
      </Tooltip>
    );
  }

  return (
    <Badge className="uppercase" variant={statusVariant} {...props}>
      {statusLabel}
    </Badge>
  );
}
