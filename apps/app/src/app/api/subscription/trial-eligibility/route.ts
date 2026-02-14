import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const CONFIG_KEYS = {
  TRIGGER_TRIAL_ENABLED: 'trigger_trial_enabled',
  TRIGGER_TRIAL_FAMILY_DAYS: 'trigger_trial_family_days',
  TRIGGER_TRIAL_NANNY_DAYS: 'trigger_trial_nanny_days',
};

async function getTriggerTrialConfig(): Promise<{
  enabled: boolean;
  familyDays: number;
  nannyDays: number;
}> {
  const configs = await prisma.systemConfig.findMany({
    where: {
      key: {
        in: [
          CONFIG_KEYS.TRIGGER_TRIAL_ENABLED,
          CONFIG_KEYS.TRIGGER_TRIAL_FAMILY_DAYS,
          CONFIG_KEYS.TRIGGER_TRIAL_NANNY_DAYS,
        ],
      },
    },
  });

  const enabledConfig = configs.find((c) => c.key === CONFIG_KEYS.TRIGGER_TRIAL_ENABLED);
  const familyDaysConfig = configs.find((c) => c.key === CONFIG_KEYS.TRIGGER_TRIAL_FAMILY_DAYS);
  const nannyDaysConfig = configs.find((c) => c.key === CONFIG_KEYS.TRIGGER_TRIAL_NANNY_DAYS);

  return {
    enabled: enabledConfig ? enabledConfig.value === 'true' : false,
    familyDays: familyDaysConfig ? parseInt(familyDaysConfig.value, 10) : 7,
    nannyDays: nannyDaysConfig ? parseInt(nannyDaysConfig.value, 10) : 7,
  };
}

/**
 * GET /api/subscription/trial-eligibility
 * Check if the current user is eligible for a trigger trial
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ eligible: false, reason: 'not_authenticated' });
    }

    // Check if trigger trials are enabled
    const config = await getTriggerTrialConfig();
    if (!config.enabled) {
      return NextResponse.json({ eligible: false, reason: 'disabled' });
    }

    // Check if user already used their trigger trial
    const isNanny = currentUser.type === 'nanny';
    const entity = isNanny ? currentUser.nanny : currentUser.family;

    if (entity.triggerTrialUsedAt) {
      return NextResponse.json({ eligible: false, reason: 'already_used' });
    }

    // Check if user has a FREE subscription (not already on paid plan)
    const subscription = entity.subscription;
    if (!subscription) {
      return NextResponse.json({ eligible: false, reason: 'no_subscription' });
    }

    const isFreePlan = subscription.plan === 'NANNY_FREE' || subscription.plan === 'FAMILY_FREE';
    if (!isFreePlan) {
      return NextResponse.json({ eligible: false, reason: 'already_paid' });
    }

    const trialDays = isNanny ? config.nannyDays : config.familyDays;
    const targetPlan = isNanny ? 'NANNY_PRO' : 'FAMILY_PLUS';

    return NextResponse.json({
      eligible: true,
      trialDays,
      plan: targetPlan,
    });
  } catch (error) {
    console.error('Error checking trial eligibility:', error);
    return NextResponse.json(
      { eligible: false, reason: 'error' },
      { status: 500 },
    );
  }
}
