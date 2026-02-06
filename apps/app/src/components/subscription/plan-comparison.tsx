'use client';

/**
 * Plan Comparison Component
 *
 * Displays a comparison table of subscription plans for Families and Nannies.
 * Shows 2 plans per user type: Free and Paid (Plus/Pro)
 * Billing interval (monthly/quarterly/yearly) is just a payment option, not different plans.
 *
 * Responsive: Table on desktop, Accordion (Collapsible) on mobile.
 */

import { PiCaretDown, PiCheckCircle, PiXCircle } from 'react-icons/pi';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/shadcn/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/shadcn/table';
import { cn } from '@cuidly/shared';
import { useState } from 'react';

type UserType = 'FAMILY' | 'NANNY';

interface PlanComparisonProps {
  userType: UserType;
  className?: string;
}

interface ComparisonFeature {
  name: string;
  description?: string;
  freePlan: boolean | string;
  paidPlan: boolean | string;
}

const familyFeatures: ComparisonFeature[] = [
  {
    name: 'Visualizar perfis de babás',
    freePlan: 'Ilimitado',
    paidPlan: 'Ilimitado',
  },
  {
    name: 'Ver avaliações das babás',
    freePlan: '1 por babá',
    paidPlan: 'Ilimitado',
  },
  {
    name: 'Criar vagas',
    freePlan: '1 vaga (7 dias)',
    paidPlan: 'Até 3 vagas (30 dias)',
  },
  {
    name: 'Favoritar babás',
    freePlan: true,
    paidPlan: true,
  },
  {
    name: 'Ver selos de verificação',
    description: 'Identificada, Verificada, Confiável',
    freePlan: true,
    paidPlan: true,
  },
  {
    name: 'Iniciar conversas (chat)',
    freePlan: '1 conversa',
    paidPlan: 'Ilimitado',
  },
  {
    name: 'Matching inteligente',
    description: 'Algoritmo de compatibilidade',
    freePlan: false,
    paidPlan: true,
  },
  {
    name: 'Avaliar babás',
    freePlan: true,
    paidPlan: true,
  },
];

const nannyFeatures: ComparisonFeature[] = [
  {
    name: 'Perfil completo',
    freePlan: true,
    paidPlan: true,
  },
  {
    name: 'Selo de verificação',
    freePlan: 'Selo Identificada',
    paidPlan: 'Verificada / Confiável',
  },
  {
    name: 'Visualizar vagas',
    freePlan: true,
    paidPlan: true,
  },
  {
    name: 'Candidatar-se a vagas',
    freePlan: true,
    paidPlan: true,
  },
  {
    name: 'Responder conversas no chat',
    freePlan: true,
    paidPlan: true,
  },
  {
    name: 'Mensagens ilimitadas',
    description: 'Chat liberado após candidatura',
    freePlan: false,
    paidPlan: true,
  },
  {
    name: 'Validação completa',
    description: 'Facial + Antecedentes',
    freePlan: false,
    paidPlan: 'Inclusa',
  },
  {
    name: 'Destaque de perfil',
    description: 'Aparece primeiro nas buscas',
    freePlan: false,
    paidPlan: true,
  },
  {
    name: 'Matching prioritário',
    description: 'Aparece nas sugestões de famílias',
    freePlan: false,
    paidPlan: true,
  },
];

const familyPlanNames = {
  free: 'Grátis',
  paid: 'Plus',
};

const nannyPlanNames = {
  free: 'Grátis',
  paid: 'Pro',
};

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <PiCheckCircle className="size-5 text-green-500" />
    ) : (
      <PiXCircle className="size-5 text-gray-300" />
    );
  }
  return <span className="text-sm font-medium text-gray-700">{value}</span>;
}

function MobileFeatureRow({
  feature,
  planNames,
}: {
  feature: ComparisonFeature;
  planNames: typeof familyPlanNames;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-white p-4 text-left hover:bg-gray-50">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{feature.name}</p>
          {feature.description && (
            <p className="mt-0.5 text-xs text-gray-500">{feature.description}</p>
          )}
        </div>
        <PiCaretDown
          className={cn(
            'size-5 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3">
          <div className="text-center">
            <p className="mb-1 text-xs font-medium text-gray-500">
              {planNames.free}
            </p>
            <div className="flex justify-center">
              <FeatureValue value={feature.freePlan} />
            </div>
          </div>
          <div className="text-center">
            <p className="mb-1 text-xs font-medium text-gray-500">
              {planNames.paid}
            </p>
            <div className="flex justify-center">
              <FeatureValue value={feature.paidPlan} />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function PlanComparison({ userType, className }: PlanComparisonProps) {
  const features = userType === 'FAMILY' ? familyFeatures : nannyFeatures;
  const planNames = userType === 'FAMILY' ? familyPlanNames : nannyPlanNames;

  return (
    <div className={cn('w-full', className)}>
      <h2 className="mb-6 text-center text-xl font-bold text-gray-900">
        Compare os Planos
      </h2>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[50%]">Funcionalidade</TableHead>
              <TableHead className="w-[25%] text-center">{planNames.free}</TableHead>
              <TableHead className="w-[25%] text-center bg-primary/5 font-semibold text-primary">
                {planNames.paid}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{feature.name}</p>
                    {feature.description && (
                      <p className="text-xs text-gray-500">{feature.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <FeatureValue value={feature.freePlan} />
                  </div>
                </TableCell>
                <TableCell className="bg-primary/5 text-center">
                  <div className="flex justify-center">
                    <FeatureValue value={feature.paidPlan} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Accordion View */}
      <div className="space-y-2 md:hidden">
        {features.map((feature, idx) => (
          <MobileFeatureRow
            key={idx}
            feature={feature}
            planNames={planNames}
          />
        ))}
      </div>
    </div>
  );
}
