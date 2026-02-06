import PageContent from '@/components/layout/PageContent';
import { requirePermission } from '@/lib/auth/checkPermission';
import { CouponForm } from '../../_components/CouponForm';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface EditCouponPageProps {
  params: Promise<{ id: string }>;
}

async function getCouponWithAllowedEmails(id: string) {
  const coupon = await prisma.coupon.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      allowedEmails: {
        include: {
          nanny: {
            select: { id: true, name: true, emailAddress: true },
          },
          family: {
            select: { id: true, name: true, emailAddress: true },
          },
        },
      },
    },
  });

  if (!coupon) return null;

  // Extrair dados para o formulário
  const allowedUserIds = {
    nannyIds: coupon.allowedEmails
      .filter((e) => e.nannyId)
      .map((e) => e.nannyId!),
    familyIds: coupon.allowedEmails
      .filter((e) => e.familyId)
      .map((e) => e.familyId!),
  };

  const allowedEmails = coupon.allowedEmails
    .filter((e) => !e.nannyId && !e.familyId)
    .map((e) => e.email);

  // Preparar lista de usuários iniciais para o componente
  const initialUsers = coupon.allowedEmails
    .filter((e) => e.nannyId || e.familyId)
    .map((e) => {
      if (e.nanny) {
        return {
          id: e.nanny.id,
          name: e.nanny.name || 'Babá sem nome',
          email: e.nanny.emailAddress || e.email,
          type: 'NANNY' as const,
        };
      }
      if (e.family) {
        return {
          id: e.family.id,
          name: e.family.name || 'Família sem nome',
          email: e.family.emailAddress || e.email,
          type: 'FAMILY' as const,
        };
      }
      return null;
    })
    .filter(Boolean) as Array<{
    id: number;
    name: string;
    email: string;
    type: 'NANNY' | 'FAMILY';
  }>;

  return {
    coupon,
    allowedUserIds,
    allowedEmails,
    initialUsers,
  };
}

export const metadata = {
  title: 'Editar Cupom',
  description: 'Edite um cupom de desconto existente.',
};

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  await requirePermission('COUPONS');

  const { id } = await params;
  const data = await getCouponWithAllowedEmails(id);

  if (!data) {
    notFound();
  }

  const { coupon, allowedUserIds, allowedEmails, initialUsers } = data;

  return (
    <PageContent title={`Editar Cupom: ${coupon.code}`}>
      <CouponForm
        mode="edit"
        couponId={coupon.id}
        initialUsers={initialUsers}
        defaultValues={{
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscount: coupon.maxDiscount,
          minPurchaseAmount: coupon.minPurchaseAmount,
          usageLimit: coupon.usageLimit,
          applicableTo: coupon.applicableTo,
          applicablePlanIds: coupon.applicablePlanIds,
          hasUserRestriction: coupon.hasUserRestriction,
          allowedUserIds,
          allowedEmails,
          startDate: coupon.startDate,
          endDate: coupon.endDate,
          isActive: coupon.isActive,
        }}
      />
    </PageContent>
  );
}
