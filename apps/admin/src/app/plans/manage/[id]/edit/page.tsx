import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { PlanForm } from '../../_components/PlanForm';
import { PlanFeatures } from '@/schemas/planSchemas';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export const metadata = {
  title: 'Editar Plano',
};

interface EditPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  await requirePermission('SUBSCRIPTIONS');

  const { id } = await params;
  const planId = parseInt(id);

  if (isNaN(planId)) {
    notFound();
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    notFound();
  }

  const planData = {
    id: plan.id,
    name: plan.name,
    type: plan.type,
    price: Number(plan.price),
    billingCycle: plan.billingCycle,
    features: plan.features as PlanFeatures,
    isActive: plan.isActive,
  };

  return (
    <PageContent
      title={`Editar Plano: ${plan.name}`}
      actions={
        <Button variant="outline" asChild>
          <Link href="/plans/manage">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      }
    >
      <PlanForm plan={planData} />
    </PageContent>
  );
}
