import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import prisma from '@/lib/prisma';

/**
 * POST /api/user/export-data
 * Exports all user data for LGPD compliance.
 * Returns a JSON object with all data associated with the user.
 */
export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      userType: currentUser.type,
    };

    if (currentUser.type === 'nanny') {
      const nanny = await prisma.nanny.findUnique({
        where: { id: currentUser.nanny.id },
        include: {
          address: true,
          references: true,
          subscription: true,
          jobApplications: {
            include: {
              job: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                },
              },
            },
          },
          reviews: {
            select: {
              id: true,
              overallRating: true,
              comment: true,
              createdAt: true,
              type: true,
            },
          },
          notifications: {
            select: {
              id: true,
              type: true,
              title: true,
              message: true,
              read: true,
              createdAt: true,
            },
          },
        },
      });

      if (!nanny) {
        return NextResponse.json({ error: 'Nanny not found' }, { status: 404 });
      }

      // Remove sensitive fields by creating a new object
      const safeNannyData = { ...nanny } as Record<string, unknown>;
      const hasCpf = !!safeNannyData.cpf;
      delete safeNannyData.cpfHash;
      delete safeNannyData.emailVerificationCode;
      delete safeNannyData.emailVerificationToken;
      delete safeNannyData.termsAcceptedIp;
      safeNannyData.cpf = hasCpf ? '***.***.***-**' : null;

      exportData.profile = safeNannyData;
    } else if (currentUser.type === 'family') {
      const family = await prisma.family.findUnique({
        where: { id: currentUser.family.id },
        include: {
          address: true,
          subscription: true,
          children: {
            include: {
              child: true,
            },
          },
          jobs: {
            include: {
              applications: {
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                  nanny: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          reviews: {
            select: {
              id: true,
              overallRating: true,
              comment: true,
              createdAt: true,
              type: true,
            },
          },
          notifications: {
            select: {
              id: true,
              type: true,
              title: true,
              message: true,
              read: true,
              createdAt: true,
            },
          },
          favorites: {
            select: {
              id: true,
              nannyId: true,
              createdAt: true,
            },
          },
        },
      });

      if (!family) {
        return NextResponse.json({ error: 'Family not found' }, { status: 404 });
      }

      // Remove sensitive fields by creating a new object
      const safeFamilyData = { ...family } as Record<string, unknown>;
      const hasCpf = !!safeFamilyData.cpf;
      delete safeFamilyData.cpfHash;
      delete safeFamilyData.emailVerificationCode;
      delete safeFamilyData.emailVerificationToken;
      delete safeFamilyData.termsAcceptedIp;
      safeFamilyData.cpf = hasCpf ? '***.***.***-**' : null;

      exportData.profile = safeFamilyData;
    }

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
