import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import { CouponForm } from '../_components/CouponForm';

export const metadata = {
  title: 'Criar Cupom',
  description: 'Crie um novo cupom de desconto.',
};

export default async function CreateCouponPage() {
  await requirePermission('COUPONS');

  return (
    <PageContent title="Criar Cupom">
      <CouponForm mode="create" />
    </PageContent>
  );
}
