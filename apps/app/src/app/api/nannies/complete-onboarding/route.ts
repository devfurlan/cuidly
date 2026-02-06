import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';

// Config keys (same as admin)
const CONFIG_KEYS = {
  NANNY_TRIAL_ENABLED: 'nanny_trial_enabled',
  NANNY_TRIAL_DAYS: 'nanny_trial_days',
};

async function getTrialConfig(): Promise<{ enabled: boolean; days: number }> {
  const configs = await prisma.systemConfig.findMany({
    where: {
      key: { in: [CONFIG_KEYS.NANNY_TRIAL_ENABLED, CONFIG_KEYS.NANNY_TRIAL_DAYS] },
    },
  });

  const enabledConfig = configs.find((c) => c.key === CONFIG_KEYS.NANNY_TRIAL_ENABLED);
  const daysConfig = configs.find((c) => c.key === CONFIG_KEYS.NANNY_TRIAL_DAYS);

  return {
    enabled: enabledConfig ? enabledConfig.value === 'true' : false, // Default: disabled
    days: daysConfig ? parseInt(daysConfig.value, 10) : 0, // Default: 0 (must be configured by admin)
  };
}

export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.type !== 'nanny') {
      return NextResponse.json({ error: 'User is not a nanny' }, { status: 400 });
    }

    // Verify nanny has required fields (name and slug)
    if (!currentUser.nanny.name || !currentUser.nanny.slug) {
      return NextResponse.json({ error: 'Nome é obrigatório para completar o cadastro' }, { status: 400 });
    }

    const now = new Date();

    // Get trial configuration from database
    const trialConfig = await getTrialConfig();

    // Determine which plan to assign
    const plan = trialConfig.enabled ? 'NANNY_PRO' : 'NANNY_FREE';

    // Calculate end date based on trial config
    const endDate = new Date(now);
    if (trialConfig.enabled) {
      endDate.setDate(endDate.getDate() + trialConfig.days);
    } else {
      // Free plan: set far future date (100 years)
      endDate.setFullYear(endDate.getFullYear() + 100);
    }

    // Create or update subscription
    await prisma.subscription.upsert({
      where: { nannyId: currentUser.nanny.id },
      update: {
        plan,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
        billingInterval: 'MONTH',
      },
      create: {
        nannyId: currentUser.nanny.id,
        plan,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
        billingInterval: 'MONTH',
      },
    });

    // Update nanny status to ACTIVE and mark onboarding as completed
    await prisma.nanny.update({
      where: { id: currentUser.nanny.id },
      data: {
        status: 'ACTIVE',
        onboardingCompleted: true,
        onboardingCompletedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      nannyId: currentUser.nanny.id,
      subscription: {
        startDate: now,
        endDate,
        plan,
        trialEnabled: trialConfig.enabled,
        trialDays: trialConfig.enabled ? trialConfig.days : null,
      },
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
