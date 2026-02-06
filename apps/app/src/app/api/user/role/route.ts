/**
 * API Route: Get User Role
 * GET /api/user/role
 *
 * Returns the role of the current authenticated user
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Return role based on user type ('nanny' or 'family')
    return NextResponse.json({
      role: currentUser.type.toUpperCase()
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
