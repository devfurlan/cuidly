'use client';

import { useState } from 'react';
import { PiFlag } from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import { ReportModal } from './ReportModal';

interface ReportButtonProps {
  targetType: 'NANNY' | 'JOB';
  targetId: number;
  targetName: string;
  variant?: 'default' | 'ghost' | 'outline' | 'link' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function ReportButton({
  targetType,
  targetId,
  targetName,
  variant = 'ghost',
  size = 'sm',
  className,
  showLabel = false,
}: ReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
        title="Denunciar"
      >
        <PiFlag className="size-4" />
        {showLabel && <span className="ml-1">Denunciar</span>}
      </Button>

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetName={targetName}
      />
    </>
  );
}
