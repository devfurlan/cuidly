import CardNumberSoft from '@/components/CardNumberSoft';
import prisma from '@/lib/prisma';

async function fetchData() {
  try {
    const children = await prisma.child.findMany({
      where: {
        status: {
          not: 'DELETED',
        },
      },
      select: {
        id: true,
        birthDate: true,
        status: true,
      },
    });

    const now = new Date();
    const totalChildren = children.length;
    const activeChildren = children.filter(
      (child) => child.status === 'ACTIVE',
    ).length;

    // Count babies (less than 1 year old)
    const babies = children.filter((child) => {
      if (!child.birthDate) return false;
      const ageInMonths =
        (now.getFullYear() - child.birthDate.getFullYear()) * 12 +
        (now.getMonth() - child.birthDate.getMonth());
      return ageInMonths < 12;
    }).length;

    return {
      totalChildren,
      activeChildren,
      babies,
    };
  } catch (error) {
    console.error('ChildrenCounters ~ Error fetching data', error);
  }
}

export default async function ChildrenCounters() {
  const totals = await fetchData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      <CardNumberSoft
        title="Total de crianças"
        value={Number(totals?.totalChildren)}
        color="stone"
        iconName="users-three"
      />

      <CardNumberSoft
        title="Ativas"
        value={Number(totals?.activeChildren)}
        color="green"
        iconName="user-check"
      />

      <CardNumberSoft
        title="Bebês (menos de 1 ano)"
        value={Number(totals?.babies)}
        color="pink"
        iconName="baby-carriage"
      />
    </div>
  );
}
