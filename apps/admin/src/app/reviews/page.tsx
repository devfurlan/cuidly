import PageContent from '@/components/layout/PageContent';
import ReviewsContent from './_components/ReviewsContent';
import { requirePermission } from '@/lib/auth/checkPermission';

export const metadata = {
  title: 'Avaliações',
};

export default async function ReviewsPage() {
  // Verify permission
  await requirePermission('REVIEWS');

  return (
    <PageContent title="Moderação de Avaliações">
      <ReviewsContent />
    </PageContent>
  );
}
