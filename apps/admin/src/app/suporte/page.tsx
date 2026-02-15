import PageContent from '@/components/layout/PageContent';
import SupportContent from './_components/SupportContent';
import { requirePermission } from '@/lib/auth/checkPermission';

export const metadata = {
  title: 'Suporte',
};

export default async function SupportPage() {
  await requirePermission('SUPPORT');

  return (
    <PageContent title="Chamados de Suporte">
      <SupportContent />
    </PageContent>
  );
}
