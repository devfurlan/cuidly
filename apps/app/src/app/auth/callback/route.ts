/**
 * Auth Callback Handler
 * Handles OAuth callbacks from Google/Facebook and email confirmations
 *
 * New architecture: No User table. Records are stored directly in Nanny or Family.
 */

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { createFreeSubscription } from '@/services/subscription/subscription-service';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const userType = searchParams.get('type')?.toUpperCase();
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
      const email = data.user.email || '';

      // Check if user already exists as Nanny
      let nanny = await prisma.nanny.findUnique({
        where: { authId },
      });

      if (nanny) {
        // Nanny exists - redirect based on onboarding status
        if (nanny.onboardingCompleted) {
          return NextResponse.redirect(`${origin}/app`);
        }
        return NextResponse.redirect(`${origin}/app/onboarding`);
      }

      // Check if user already exists as Family
      let family = await prisma.family.findUnique({
        where: { authId },
      });

      if (family) {
        // Family exists - redirect based on onboarding status
        if (family.onboardingCompleted) {
          return NextResponse.redirect(`${origin}/app`);
        }
        return NextResponse.redirect(`${origin}/app/onboarding`);
      }

      // User doesn't exist, create based on type
      const typeToCreate = userType || data.user.user_metadata?.user_type?.toUpperCase() || 'FAMILY';

      if (typeToCreate === 'NANNY') {
        nanny = await prisma.nanny.create({
          data: {
            authId,
            emailAddress: email,
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || null,
            status: 'PENDING',
          },
        });

        // Create free subscription
        await createFreeSubscription({ nannyId: nanny.id });

        return NextResponse.redirect(`${origin}/app/onboarding`);
      } else {
        family = await prisma.family.create({
          data: {
            authId,
            emailAddress: email,
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || 'Família',
            status: 'PENDING',
          },
        });

        // Create free subscription
        await createFreeSubscription({ familyId: family.id });

        return NextResponse.redirect(`${origin}/app/onboarding`);
      }
    }
  }

  // Default redirect
  return NextResponse.redirect(`${origin}${next}`);
}
