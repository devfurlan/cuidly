'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PiCheckCircle,
  PiSpinner,
  PiUser,
  PiXCircle,
} from 'react-icons/pi';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { getCertificationLabel, getExperienceYearsLabel } from '@/helpers/label-getters';
import { getNannyProfileUrl } from '@/utils/slug';
import {
  type Application,
  APPLICATION_STATUS_LABELS,
  getScoreColor,
  getScoreBgColor,
} from './types';

interface ApplicationsListProps {
  applications: Application[];
  jobId: number;
  hasActiveSubscription: boolean;
}

export function ApplicationsList({
  applications: initialApplications,
  jobId,
  hasActiveSubscription,
}: ApplicationsListProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdateApplication(
    applicationId: number,
    status: 'ACCEPTED' | 'REJECTED'
  ) {
    setUpdatingId(applicationId);
    setError(null);

    try {
      const response = await fetch(
        `/api/jobs/${jobId}/applications/${applicationId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar candidatura');
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        )
      );
    } catch (err) {
      console.error('Error updating application:', err);
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar candidatura'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (applications.length === 0) {
    return (
      <Card className="mt-6 p-8 text-center">
        <PiUser className="mx-auto size-12 text-gray-300" />
        <p className="mt-4 text-gray-500">
          Ainda não há candidaturas para esta vaga
        </p>
      </Card>
    );
  }

  return (
    <Card className="mt-6 p-6">
      <div className="mb-4 flex items-center gap-2">
        <PiUser className="size-5 text-fuchsia-500" />
        <h2 className="text-lg font-semibold">Lista de Candidaturas</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <button
                  onClick={() =>
                    router.push(
                      getNannyProfileUrl(app.nanny.slug, app.nanny.city)
                    )
                  }
                  className="shrink-0"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-fuchsia-100">
                    {app.nanny.photoUrl ? (
                      <img
                        src={app.nanny.photoUrl}
                        alt={app.nanny.name}
                        className="size-14 rounded-full object-cover"
                      />
                    ) : (
                      <PiUser className="size-7 text-fuchsia-500" />
                    )}
                  </div>
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          getNannyProfileUrl(app.nanny.slug, app.nanny.city)
                        )
                      }
                      className="font-semibold text-gray-900 hover:text-fuchsia-600"
                    >
                      {app.nanny.name}
                    </button>
                    <Badge
                      className={
                        APPLICATION_STATUS_LABELS[app.status]?.color || ''
                      }
                    >
                      {APPLICATION_STATUS_LABELS[app.status]?.label || app.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {app.nanny.experienceYears !== null && (
                      <span>
                        {getExperienceYearsLabel(app.nanny.experienceYears)} exp.
                      </span>
                    )}
                    {app.nanny.city && (
                      <span>
                        {app.nanny.city} - {app.nanny.state}
                      </span>
                    )}
                  </div>
                  {app.nanny.certifications.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {app.nanny.certifications.slice(0, 3).map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {getCertificationLabel(cert)}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {app.message && (
                    <p className="mt-2 rounded-lg bg-gray-50 p-2 text-sm text-gray-700">
                      &ldquo;{app.message}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {hasActiveSubscription && app.matchScore !== null && (
                  <div
                    className={`rounded-lg px-3 py-1 text-center ${getScoreBgColor(app.matchScore)}`}
                  >
                    <p
                      className={`text-lg font-bold ${getScoreColor(app.matchScore)}`}
                    >
                      {app.matchScore}%
                    </p>
                    <p className="text-xs text-gray-500">Match</p>
                  </div>
                )}

                {app.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateApplication(app.id, 'ACCEPTED')}
                      disabled={updatingId === app.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updatingId === app.id ? (
                        <PiSpinner className="size-4 animate-spin" />
                      ) : (
                        <PiCheckCircle className="size-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateApplication(app.id, 'REJECTED')}
                      disabled={updatingId === app.id}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      {updatingId === app.id ? (
                        <PiSpinner className="size-4 animate-spin" />
                      ) : (
                        <PiXCircle className="size-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              className="mt-3 w-full"
              onClick={() =>
                router.push(getNannyProfileUrl(app.nanny.slug, app.nanny.city))
              }
            >
              Ver Perfil Completo
            </Button>
          </Card>
        ))}
      </div>
    </Card>
  );
}
