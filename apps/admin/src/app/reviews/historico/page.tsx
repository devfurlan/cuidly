import PageContent from '@/components/layout/PageContent';
import ModerationLogsContent from './_components/ModerationLogsContent';
import { requirePermission } from '@/lib/auth/checkPermission';

export const metadata = {
  title: 'Histórico de Moderações',
};

export default async function HistoricoModeracaoPage() {
  // Verify permission
  await requirePermission('REVIEWS');

  return (
    <PageContent title="Histórico de Moderações">
      <ModerationLogsContent />
    </PageContent>
  );
}
