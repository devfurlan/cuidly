'use client';

import {
  PiCalendar,
  PiMapPin,
  PiPencilSimple,
  PiUser,
} from 'react-icons/pi';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { ReportButton } from '@/components/ReportButton';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type Job, STATUS_LABELS, formatDate } from './types';

interface JobHeaderProps {
  job: Job;
  isOwner: boolean;
  jobId: string;
}

export function JobHeader({ job, isOwner, jobId }: JobHeaderProps) {
  const router = useRouter();
  const [status, setStatus] = useState(job.status);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleStatusChange(newStatus: string) {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="mb-6">
      {/* Family Header - Only for nannies */}
      {!isOwner && (
        <div className="mb-6 flex items-center gap-4">
          <div className="size-16 shrink-0 overflow-hidden rounded-full bg-fuchsia-100">
            {job.family.photoUrl ? (
              <img
                src={job.family.photoUrl}
                alt={job.family.name}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <PiUser className="size-8 text-fuchsia-500" />
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{job.family.name}</h2>
            <p className="text-sm text-gray-500">
              {job.family.neighborhood && `${job.family.neighborhood}, `}
              {job.family.city}
              {job.family.state && ` - ${job.family.state}`}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {job.title}
            </h1>
            <Badge variant={STATUS_LABELS[status]?.variant || 'default'}>
              {STATUS_LABELS[status]?.label || status}
            </Badge>
          </div>
          <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
            {isOwner && (job.family.city || job.family.neighborhood) && (
              <span className="flex items-center gap-1">
                <PiMapPin className="size-4 shrink-0" />
                <span className="line-clamp-1">
                  {job.family.neighborhood && `${job.family.neighborhood}, `}
                  {job.family.city}
                  {job.family.state && ` - ${job.family.state}`}
                </span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <PiCalendar className="size-4 shrink-0" />
              Inicio: {formatDate(job.startDate)}
            </span>
          </div>
        </div>

        {isOwner ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/app/vagas/${jobId}/editar`)}
            >
              <PiPencilSimple className="size-4 sm:mr-1" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Select
              value={status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-28 sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativa</SelectItem>
                <SelectItem value="PAUSED">Pausada</SelectItem>
                <SelectItem value="CLOSED">Encerrada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <ReportButton
            targetType="JOB"
            targetId={job.id}
            targetName={job.title}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-500"
            showLabel
          />
        )}
      </div>
    </div>
  );
}
