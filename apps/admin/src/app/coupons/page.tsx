import { DataTable } from '@/components/DataTable/DataTable';
import PageContent from '@/components/layout/PageContent';
import { columns } from './columns';
import { Coupon } from './schema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { requirePermission } from '@/lib/auth/checkPermission';
import prisma from '@/lib/prisma';

async function fetchCoupons(): Promise<Coupon[]> {
  const coupons = await prisma.coupon.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { usages: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return coupons.map((coupon) => ({
    ...coupon,
    startDate: new Date(coupon.startDate),
    endDate: new Date(coupon.endDate),
    createdAt: new Date(coupon.createdAt),
    updatedAt: new Date(coupon.updatedAt),
  }));
}

export const metadata = {
  title: 'Cupons de Desconto',
  description: 'Gerencie os cupons de desconto da plataforma.',
};

export default async function CouponsPage() {
  await requirePermission('COUPONS');

  const couponsData = await fetchCoupons();

  return (
    <PageContent
      title="Cupons de Desconto"
      actions={
        <Button asChild>
          <Link href="/coupons/create">Adicionar</Link>
        </Button>
      }
    >
      <DataTable data={couponsData} columns={columns} />
    </PageContent>
  );
}
