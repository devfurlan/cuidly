import PageContent from '@/components/layout/PageContent';
import ReportsContent from './_components/ReportsContent';
import { requirePermission } from '@/lib/auth/checkPermission';

export const metadata = {
  title: 'Denuncias',
};

export default async function ReportsPage() {
  await requirePermission('REPORTS');

  return (
    <PageContent title="Gerenciamento de Denuncias">
      <ReportsContent />
    </PageContent>
  );
}
