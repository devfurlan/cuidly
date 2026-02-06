'use client';

import { useState } from 'react';
import {
  PiCheckCircle,
  PiHourglass,
  PiPaperPlaneTilt,
  PiSpinner,
  PiUser,
  PiXCircle,
} from 'react-icons/pi';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { Textarea } from '@/components/ui/shadcn/textarea';
import {
  type Application,
  type MatchResult,
  APPLICATION_STATUS_LABELS,
  formatDate,
} from './types';

interface ApplySectionProps {
  jobId: number;
  familyName: string;
  matchResult: MatchResult | null;
  myApplication: Application | null;
  onApplicationSuccess: (
    application: Application,
    matchResult: MatchResult | null
  ) => void;
}

const STATUS_ICONS = {
  PENDING: PiHourglass,
  ACCEPTED: PiCheckCircle,
  REJECTED: PiXCircle,
  WITHDRAWN: PiXCircle,
};

export function ApplySection({
  jobId,
  familyName,
  matchResult,
  myApplication: initialApplication,
  onApplicationSuccess,
}: ApplySectionProps) {
  const [myApplication, setMyApplication] = useState(initialApplication);
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    setIsApplying(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: applyMessage || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao se candidatar');
      }

      const newApplication: Application = {
        id: data.application.id,
        status: data.application.status,
        matchScore: data.application.matchScore,
        message: applyMessage || null,
        createdAt: data.application.createdAt,
        nanny: {} as Application['nanny'],
      };

      setMyApplication(newApplication);
      setShowApplyForm(false);
      setApplyMessage('');
      setApplicationSuccess(true);
      onApplicationSuccess(newApplication, data.matchResult);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error applying:', err);
      setError(err instanceof Error ? err.message : 'Erro ao se candidatar');
    } finally {
      setIsApplying(false);
    }
  }

  // Success message card
  if (applicationSuccess) {
    return (
      <>
        <Card className="mb-6 border-green-200 bg-green-50 p-6">
          <div className="flex items-start gap-4">
            <PiCheckCircle className="size-8 shrink-0 text-green-600" />
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-bold text-green-800">
                Candidatura Enviada com Sucesso!
              </h3>
              <p className="mb-3 text-gray-700">
                Sua candidatura foi enviada para a família{' '}
                <strong>{familyName}</strong>. Eles entrarão em contato pelo
                chat do app.
              </p>
              <p className="mt-3 text-xs text-gray-600">
                <strong>Importante:</strong> Fique atenta às notificações e
                aguarde o contato da família pelo chat.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApplicationSuccess(false)}
                className="mt-3"
              >
                Fechar
              </Button>
            </div>
          </div>
        </Card>
        <ApplicationStatusCard application={myApplication!} />
      </>
    );
  }

  // Already applied - show status
  if (myApplication) {
    return <ApplicationStatusCard application={myApplication} />;
  }

  // Apply form
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <PiPaperPlaneTilt className="size-5 text-fuchsia-500" />
        <h2 className="text-lg font-semibold">Candidatar-se</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showApplyForm ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Mensagem (opcional)
            </label>
            <Textarea
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="Apresente-se para a família..."
              className="min-h-24"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleApply}
              disabled={isApplying}
              className="flex-1"
            >
              {isApplying ? (
                <>
                  <PiSpinner className="mr-2 size-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Candidatura'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowApplyForm(false)}
              disabled={isApplying}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {matchResult && !matchResult.isEligible ? (
            <p className="mb-4 text-sm text-gray-600">
              Você não atende aos requisitos obrigatórios desta vaga.
            </p>
          ) : (
            <p className="mb-4 text-sm text-gray-600">
              Interessado nesta vaga? Envie sua candidatura!
            </p>
          )}
          <Button
            onClick={() => setShowApplyForm(true)}
            className="w-full"
            disabled={matchResult ? !matchResult.isEligible : false}
          >
            <PiPaperPlaneTilt className="mr-2 size-4" />
            Candidatar-se
          </Button>
        </>
      )}
    </Card>
  );
}

function ApplicationStatusCard({ application }: { application: Application }) {
  const StatusIcon = STATUS_ICONS[application.status as keyof typeof STATUS_ICONS] || PiUser;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <PiUser className="size-5 text-fuchsia-500" />
        <h2 className="text-lg font-semibold">Sua Candidatura</h2>
      </div>

      <div
        className={`flex items-center gap-2 rounded-lg p-3 ${APPLICATION_STATUS_LABELS[application.status]?.color || 'bg-gray-100'}`}
      >
        <StatusIcon className="size-5" />
        <span className="font-medium">
          {APPLICATION_STATUS_LABELS[application.status]?.label || application.status}
        </span>
      </div>

      {application.matchScore !== null && (
        <p className="mt-3 text-sm text-gray-600">
          Score: <span className="font-medium">{application.matchScore}%</span>
        </p>
      )}

      <p className="mt-2 text-sm text-gray-500">
        Candidatura enviada em {formatDate(application.createdAt)}
      </p>

      {application.message && (
        <div className="mt-3 border-t pt-3">
          <span className="text-sm text-gray-500">Sua mensagem:</span>
          <p className="mt-1 text-sm text-gray-700">{application.message}</p>
        </div>
      )}
    </Card>
  );
}
