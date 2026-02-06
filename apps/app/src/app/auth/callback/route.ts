/**
 * Auth Callback Handler
 * Handles OAuth callbacks from Google/Facebook and email confirmations
 *
 * New architecture: No User table. Records are stored directly in Nanny or Family.
 */

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    if (data.user) {
      const authId = data.user.id;

      // Check if user already exists as Nanny
      const nanny = await prisma.nanny.findUnique({
        where: { authId },
      });

      if (nanny && nanny.status !== 'DELETED') {
        if (nanny.onboardingCompleted) {
          return NextResponse.redirect(`${origin}/app`);
        }
        return NextResponse.redirect(`${origin}/app/onboarding`);
      }

      // Check if user already exists as Family
      const family = await prisma.family.findUnique({
        where: { authId },
      });

      if (family && family.status !== 'DELETED') {
        if (family.onboardingCompleted) {
          return NextResponse.redirect(`${origin}/app`);
        }
        return NextResponse.redirect(`${origin}/app/onboarding`);
      }

      // New user without a type — redirect to onboarding (type selection)
      return NextResponse.redirect(`${origin}/app/onboarding`);
    }
  }

  // Default redirect
  return NextResponse.redirect(`${origin}${next}`);
}
