'use client';

import { PiCheck, PiClock, PiLightning } from 'react-icons/pi';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { BoostButton } from '@/components/BoostButton';

interface BoostCheckResponse {
  canBoost: boolean;
  hasFeature: boolean;
  daysRemaining?: number;
  isActive?: boolean;
  activeBoost?: {
    id: number;
    endDate: string;
  } | null;
  message: string;
}

interface BoostSectionProps {
  type: 'NANNY_PROFILE' | 'JOB';
  targetId: string | number;
  onBoostActivated?: () => void;
}

export function BoostSection({ type, targetId, onBoostActivated }: BoostSectionProps) {
  const [boostData, setBoostData] = useState<BoostCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoostStatus = async () => {
      try {
        const response = await fetch(`/api/boost/check?type=${type}`);
        if (response.ok) {
          const data = await response.json();
          setBoostData(data);
        }
      } catch (error) {
        console.error('Erro ao verificar boost:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoostStatus();
  }, [type]);

  // Não mostra nada até carregar e confirmar que tem a feature
  if (isLoading || !boostData?.hasFeature) {
    return null;
  }

  const handleBoostActivated = () => {
    // Recarregar status do boost
    setIsLoading(true);
    fetch(`/api/boost/check?type=${type}`)
      .then((res) => res.json())
      .then((data) => setBoostData(data))
      .finally(() => setIsLoading(false));

    onBoostActivated?.();
  };

  const isNanny = type === 'NANNY_PROFILE';
  const boostLabel = isNanny ? 'Boost Semanal' : 'Boost Mensal';
  const boostDescription = isNanny
    ? 'Coloque seu perfil no topo das buscas por 24 horas.'
    : 'Coloque sua vaga no topo da lista por 7 dias.';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PiLightning className="size-5 text-yellow-500" />
          {boostLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {boostData?.isActive && boostData.activeBoost ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <PiCheck className="size-5" />
              <span className="font-semibold">Boost Ativo!</span>
            </div>
            <p className="text-sm text-gray-600">
              {isNanny ? 'Seu perfil está no topo' : 'Sua vaga está no topo'} até{' '}
              <span className="font-medium">
                {new Date(boostData.activeBoost.endDate).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          </div>
        ) : !boostData?.canBoost && boostData?.daysRemaining !== undefined ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-600">
              <PiClock className="size-5" />
              <span className="font-medium">Aguardando cooldown</span>
            </div>
            <p className="text-sm text-gray-600">
              Você já usou seu boost {isNanny ? 'semanal' : 'mensal'}. Aguarde{' '}
              <span className="font-medium">{boostData.daysRemaining} dia(s)</span> para usar novamente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{boostDescription}</p>
            <BoostButton
              type={type}
              targetId={targetId}
              canBoost={boostData?.canBoost}
              daysRemaining={boostData?.daysRemaining}
              onBoostActivated={handleBoostActivated}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
