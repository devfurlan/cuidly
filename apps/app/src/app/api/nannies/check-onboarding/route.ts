/**
 * API Route: Check Nanny Onboarding Status
 * GET /api/nannies/check-onboarding
 *
 * Requer autenticação - usuário só pode verificar seu próprio status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({
        completed: false,
      });
    }

    // Check if essential fields are filled (onboarding completed)
    const completed = !!(
      currentUser.nanny.cpf &&
      currentUser.nanny.birthDate &&
      currentUser.nanny.addressId &&
      currentUser.nanny.onboardingCompleted
    );

    return NextResponse.json({
      completed,
      nannyId: currentUser.nanny.id,
    });
  } catch (error) {
    console.error('Check onboarding error:', error);
    return NextResponse.json(
      { error: 'Falha ao verificar status do onboarding' },
      { status: 500 }
    );
  }
}
