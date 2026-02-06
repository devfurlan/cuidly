'use client';

/**
 * My Plan Card Component
 *
 * Shows the current plan, usage limits and upgrade CTA for both families and nannies.
 */

import { PiCheck, PiCrown, PiX } from 'react-icons/pi';
import { PLAN_PRICES } from '@cuidly/core/subscriptions';

import { Button } from '@/components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card';
import { Progress } from '@/components/ui/shadcn/progress';
import { Badge } from '@/components/ui/shadcn/badge';

interface PlanFeatures {
  viewProfiles?: number;
  createJobs?: number;
  unlimitedContact?: boolean;
  matching?: boolean;
  seeReviews?: boolean;
  favorite?: boolean;
  applyToJobs?: boolean;
  premiumBadge?: boolean;
  completeValidation?: boolean;
  profileHighlight?: boolean;
}

interface FamilyPlanCardProps {
  planName: string;
  profilesViewed?: number;
  activeJobs?: number;
  features?: PlanFeatures;
  onUpgradeClick?: () => void;
}

export function FamilyPlanCard({
  planName,
  profilesViewed = 0,
  activeJobs = 0,
  features,
  onUpgradeClick,
}: FamilyPlanCardProps) {
  const isFree = planName === 'FREE';
  const maxProfiles = features?.viewProfiles === -1 ? 'Ilimitado' : (features?.viewProfiles ?? 3);
  const maxJobs = features?.createJobs ?? 0;

  const getPlanDisplayName = () => {
    switch (planName) {
      case 'FREE':
      case 'FAMILY_FREE':
        return 'Cuidly Free (Grátis)';
      case 'FAMILY_MONTHLY':
      case 'FAMILY_PLUS':
        return `Cuidly Plus (R$ ${PLAN_PRICES.FAMILY_PLUS.MONTH.price}/mês)`;
      case 'FAMILY_QUARTERLY':
        return `Cuidly Plus (R$ ${PLAN_PRICES.FAMILY_PLUS.QUARTER.price}/trimestre)`;
      default:
        return planName;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiCrown className="w-5 h-5 text-amber-500" />
          Meu Plano
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Plano atual */}
          <div>
            <div className="text-sm text-gray-500">Plano Atual</div>
            <div className="text-lg font-bold">{getPlanDisplayName()}</div>
          </div>

          {/* Perfis visualizados (apenas para FREE) */}
          {isFree && typeof maxProfiles === 'number' && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Perfis visualizados</span>
                <span>{profilesViewed}/{maxProfiles}</span>
              </div>
              <Progress value={(profilesViewed / maxProfiles) * 100} />
            </div>
          )}

          {/* Vagas ativas */}
          {maxJobs > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Vagas ativas</span>
                <span>{activeJobs}/{maxJobs}</span>
              </div>
              <Progress value={(activeJobs / maxJobs) * 100} />
            </div>
          )}

          {/* Funcionalidades */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              {features?.seeReviews ? (
                <PiCheck className="w-4 h-4 text-green-500" />
              ) : (
                <PiX className="w-4 h-4 text-red-400" />
              )}
              <span className={features?.seeReviews ? '' : 'text-gray-400'}>Ver avaliações</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {features?.unlimitedContact ? (
                <PiCheck className="w-4 h-4 text-green-500" />
              ) : (
                <PiX className="w-4 h-4 text-red-400" />
              )}
              <span className={features?.unlimitedContact ? '' : 'text-gray-400'}>Ver contato</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {features?.favorite ? (
                <PiCheck className="w-4 h-4 text-green-500" />
              ) : (
                <PiX className="w-4 h-4 text-red-400" />
              )}
              <span className={features?.favorite ? '' : 'text-gray-400'}>Favoritar babas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {features?.matching ? (
                <PiCheck className="w-4 h-4 text-green-500" />
              ) : (
                <PiX className="w-4 h-4 text-red-400" />
              )}
              <span className={features?.matching ? '' : 'text-gray-400'}>Matching inteligente</span>
            </div>
          </div>

          {/* CTA para upgrade */}
          {isFree && onUpgradeClick && (
            <Button onClick={onUpgradeClick} className="w-full">
              <PiCrown className="w-4 h-4" />
              Fazer Upgrade
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface NannyPlanCardProps {
  planName: string;
  features?: PlanFeatures;
  onUpgradeClick?: () => void;
}

export function NannyPlanCard({
  planName,
  features,
  onUpgradeClick,
}: NannyPlanCardProps) {
  const isBasic = planName === 'NANNY_BASIC';

  const getPlanDisplayName = () => {
    switch (planName) {
      case 'NANNY_BASIC':
      case 'NANNY_FREE':
        return 'Básico (Grátis)';
      case 'NANNY_PREMIUM_MONTHLY':
      case 'NANNY_PRO':
        return `Pro Mensal (R$ ${PLAN_PRICES.NANNY_PRO.MONTH.price}/mês)`;
      case 'NANNY_PREMIUM_YEARLY':
        return `Pro Anual (R$ ${PLAN_PRICES.NANNY_PRO.YEAR.price}/ano)`;
      default:
        return planName;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiCrown className="w-5 h-5 text-amber-500" />
          Meu Plano
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Plano atual */}
          <div>
            <div className="text-sm text-gray-500">Plano Atual</div>
            <div className="text-lg font-bold">{getPlanDisplayName()}</div>
          </div>

          {/* Selo */}
          <div>
            <div className="text-sm text-gray-500 mb-2">Selo de Validação</div>
            {features?.premiumBadge ? (
              <Badge variant="success-solid">Verificado</Badge>
            ) : (
              <Badge variant="secondary">Básico</Badge>
            )}
          </div>

          {/* Funcionalidades */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <PiCheck className="w-4 h-4 text-green-500" />
              <span>Candidatar-se a vagas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {features?.completeValidation ? (
                <PiCheck className="w-4 h-4 text-green-500" />
              ) : (
                <PiX className="w-4 h-4 text-red-400" />
              )}
              <span className={features?.completeValidation ? '' : 'text-gray-400'}>Mensagens ilimitadas</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {features?.profileHighlight ? (
                <PiCheck className="w-4 h-4 text-green-500" />
              ) : (
                <PiX className="w-4 h-4 text-red-400" />
              )}
              <span className={features?.profileHighlight ? '' : 'text-gray-400'}>Perfil em Destaque</span>
            </div>
          </div>

          {/* CTA para upgrade */}
          {isBasic && onUpgradeClick && (
            <Button onClick={onUpgradeClick} className="w-full">
              <PiCrown className="w-4 h-4" />
              Fazer Upgrade para Pro
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
