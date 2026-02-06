/**
 * API Route: Accept Terms
 * POST /api/users/accept-terms
 *
 * Records user's acceptance of terms and conditions with audit information
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Get client IP address for audit trail
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Update the appropriate entity (Nanny or Family)
    if (currentUser.type === 'nanny') {
      const nanny = await prisma.nanny.update({
        where: { id: currentUser.nanny.id },
        data: {
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          termsAcceptedIp: clientIp,
        },
        select: {
          id: true,
          emailAddress: true,
          termsAccepted: true,
          termsAcceptedAt: true,
          termsAcceptedIp: true,
        },
      });

      return NextResponse.json({
        success: true,
        user: nanny,
      });
    } else {
      const family = await prisma.family.update({
        where: { id: currentUser.family.id },
        data: {
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          termsAcceptedIp: clientIp,
        },
        select: {
          id: true,
          emailAddress: true,
          termsAccepted: true,
          termsAcceptedAt: true,
          termsAcceptedIp: true,
        },
      });

      return NextResponse.json({
        success: true,
        user: family,
      });
    }
  } catch (error) {
    console.error('Accept terms error:', error);
    return NextResponse.json(
      { error: 'Falha ao registrar aceite dos termos' },
      { status: 500 }
    );
  }
}
