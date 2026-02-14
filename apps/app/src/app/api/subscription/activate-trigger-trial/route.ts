import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';
import { getTrialWelcomeEmailTemplate } from '@/lib/email/react-templates';
import { PLAN_LABELS } from '@cuidly/core';
import { config } from '@/config';

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
 * POST /api/subscription/activate-trigger-trial
 * Activate a trigger-based trial for the current user
 */
export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Check if trigger trials are enabled
    const trialConfig = await getTriggerTrialConfig();
    if (!trialConfig.enabled) {
      return NextResponse.json(
        { error: 'Período de teste não está disponível no momento' },
        { status: 400 },
      );
    }

    const isNanny = currentUser.type === 'nanny';
    const entity = isNanny ? currentUser.nanny : currentUser.family;
    const entityIdField = isNanny
      ? { nannyId: currentUser.nanny.id }
      : { familyId: currentUser.family.id };

    // Check if user already used their trigger trial
    if (entity.triggerTrialUsedAt) {
      return NextResponse.json(
        { error: 'Você já utilizou seu período de teste gratuito' },
        { status: 400 },
      );
    }

    // Check if user has a FREE subscription
    const subscription = entity.subscription;
    if (!subscription) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura encontrada' },
        { status: 400 },
      );
    }

    const isFreePlan = subscription.plan === 'NANNY_FREE' || subscription.plan === 'FAMILY_FREE';
    if (!isFreePlan) {
      return NextResponse.json(
        { error: 'Você já possui um plano pago' },
        { status: 400 },
      );
    }

    // Determine trial parameters
    const trialDays = isNanny ? trialConfig.nannyDays : trialConfig.familyDays;
    const targetPlan = isNanny ? 'NANNY_PRO' : 'FAMILY_PLUS';
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    // Upgrade subscription to paid plan with TRIALING status
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: targetPlan,
        status: 'TRIALING',
        trialEndDate,
        currentPeriodEnd: trialEndDate,
        externalCustomerId: null,
        externalSubscriptionId: null,
      },
    });

    // Mark trigger trial as used
    if (isNanny) {
      await prisma.nanny.update({
        where: { id: currentUser.nanny.id },
        data: { triggerTrialUsedAt: new Date() },
      });
    } else {
      await prisma.family.update({
        where: { id: currentUser.family.id },
        data: { triggerTrialUsedAt: new Date() },
      });
    }

    // Send trial welcome email
    const email = isNanny
      ? currentUser.nanny.emailAddress
      : currentUser.family.emailAddress;
    const customerName = isNanny
      ? currentUser.nanny.name
      : currentUser.family.name;

    if (email && customerName) {
      const planLabel = PLAN_LABELS[targetPlan as keyof typeof PLAN_LABELS] || targetPlan;
      const trialEmailTemplate = await getTrialWelcomeEmailTemplate({
        name: customerName.split(' ')[0],
        userType: isNanny ? 'nanny' : 'family',
        planName: planLabel,
        trialDays,
        trialEndDate: trialEndDate.toLocaleDateString('pt-BR'),
        dashboardUrl: `${config.site.url}/app`,
      });

      sendEmail({
        to: email,
        subject: trialEmailTemplate.subject,
        html: trialEmailTemplate.html,
        text: trialEmailTemplate.text,
      }).catch((err) => console.error('Erro ao enviar e-mail de trial:', err));
    }

    return NextResponse.json({
      success: true,
      status: 'TRIALING',
      plan: targetPlan,
      trialEndDate: trialEndDate.toISOString(),
      trialDays,
      message: `Período de teste de ${trialDays} dias ativado! Aproveite todos os recursos do plano.`,
    });
  } catch (error) {
    console.error('Error activating trigger trial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
