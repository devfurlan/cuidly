import CardNumberSoft from '@/components/CardNumberSoft';
import prisma from '@/lib/prisma';

async function fetchData() {
  try {
    const [families, subscriptions] = await Promise.all([
      prisma.family.findMany({
        where: {
          status: {
            not: 'DELETED',
          },
        },
      }),
      prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          familyId: { not: null },
          plan: { in: ['FAMILY_PLUS'] },
        },
        select: { familyId: true },
      }),
    ]);

    const totalFamilies = families.length;
    const payingFamilies = subscriptions.length;
    const activeFamilies = families.filter(
      (family) => family.status === 'ACTIVE',
    ).length;
    const inactiveFamilies = families.filter(
      (family) => family.status === 'INACTIVE',
    ).length;

    return {
      totalFamilies,
      payingFamilies,
      activeFamilies,
      inactiveFamilies,
    };
  } catch (error) {
    console.error('FamiliesCounters ~ Error fetching data', error);
  }
}

export default async function FamiliesCounters() {
  const totals = await fetchData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      <CardNumberSoft
        title="Total de famílias"
        value={Number(totals?.totalFamilies)}
        color="stone"
        iconName="users-three"
      />

      <CardNumberSoft
        title="Pagantes"
        value={Number(totals?.payingFamilies)}
        color="indigo"
        iconName="crown"
      />

      <CardNumberSoft
        title="Ativas"
        value={Number(totals?.activeFamilies)}
        color="green"
        iconName="user-check"
      />

      <CardNumberSoft
        title="Inativas"
        value={Number(totals?.inactiveFamilies)}
        color="red"
        iconName="warning"
      />
    </div>
  );
}
