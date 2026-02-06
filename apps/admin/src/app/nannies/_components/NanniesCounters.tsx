import CardNumberSoft from '@/components/CardNumberSoft';
import prisma from '@/lib/prisma';

async function fetchData() {
  try {
    const [nannies, subscriptions] = await Promise.all([
      prisma.nanny.findMany({
        where: {
          status: {
            not: 'DELETED',
          },
        },
      }),
      prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          nannyId: { not: null },
          plan: { in: ['NANNY_PRO'] },
        },
        select: { nannyId: true },
      }),
    ]);

    const totalNannies = nannies.length;
    const premiumNannies = subscriptions.length;
    const activeNannies = nannies.filter(
      (nanny) => nanny.status === 'ACTIVE',
    ).length;
    const suspendedNannies = nannies.filter(
      (nanny) => nanny.status === 'SUSPENDED',
    ).length;

    return {
      totalNannies,
      premiumNannies,
      activeNannies,
      suspendedNannies,
    };
  } catch (error) {
    console.error('NanniesCounters ~ Error fetching data', error);
  }
}

export default async function NanniesCounters() {
  const totals = await fetchData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      <CardNumberSoft
        title="Total de babás"
        value={Number(totals?.totalNannies)}
        color="stone"
        iconName="users-three"
      />

      <CardNumberSoft
        title="Pro"
        value={Number(totals?.premiumNannies)}
        color="indigo"
        iconName="crown"
      />

      <CardNumberSoft
        title="Ativas"
        value={Number(totals?.activeNannies)}
        color="green"
        iconName="user-check"
      />

      <CardNumberSoft
        title="Bloqueadas"
        value={Number(totals?.suspendedNannies)}
        color="red"
        iconName="warning"
      />
    </div>
  );
}
