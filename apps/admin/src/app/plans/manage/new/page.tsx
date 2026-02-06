import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import { PlanForm } from '../_components/PlanForm';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export const metadata = {
  title: 'Novo Plano',
};

export default async function NewPlanPage() {
  await requirePermission('SUBSCRIPTIONS');

  return (
    <PageContent
      title="Novo Plano"
      actions={
        <Button variant="outline" asChild>
          <Link href="/plans/manage">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      }
    >
      <PlanForm />
    </PageContent>
  );
}
