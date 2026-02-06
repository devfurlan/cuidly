/**
 * Cron Job: Incomplete Profile Reminders
 * GET /api/cron/incomplete-profile-reminders
 *
 * Runs daily to send reminder emails to nannies with incomplete profiles.
 * Encourages them to complete their profile to get the "Identificada" seal.
 *
 * Conditions:
 * - Account created more than 24 hours ago
 * - Email is verified (so they can receive emails)
 * - Profile is not complete (missing required fields for "Identificada" seal)
 * - No reminder email sent in the last 7 days
 *
 * This endpoint should be called by Vercel Cron at 14:00 BRT (17:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCronAuth } from '@/lib/cron-auth';
import { sendEmail } from '@/lib/email/sendEmail';
import { getIncompleteProfileEmailTemplate } from '@/lib/email/react-templates';
import { config } from '@/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Max 2 minutes for cron job

interface ProfileField {
  field: string;
  label: string;
  isArray?: boolean;
  isBoolean?: boolean;
  isNested?: string;
}

interface EmailResult {
  nannyId: number;
  email: string;
  name: string;
  completionPercentage: number;
  success: boolean;
  error?: string;
}

/**
 * Required fields for "Identificada" seal
 * Based on /api/profile/setup-status logic
 */
const REQUIRED_FIELDS: ProfileField[] = [
  // Identificação
  { field: 'name', label: 'Nome completo' },
  { field: 'cpf', label: 'CPF' },
  { field: 'birthDate', label: 'Data de nascimento' },
  { field: 'gender', label: 'Gênero' },
  { field: 'photoUrl', label: 'Foto de perfil' },
  // Endereço
  { field: 'city', label: 'Cidade', isNested: 'address' },
  { field: 'state', label: 'Estado', isNested: 'address' },
  { field: 'neighborhood', label: 'Bairro', isNested: 'address' },
  // Sobre mim
  { field: 'aboutMe', label: 'Sobre mim' },
  // Experiência
  { field: 'experienceYears', label: 'Anos de experiência' },
  { field: 'ageRangesExperience', label: 'Faixas etárias de experiência', isArray: true },
  { field: 'strengths', label: 'Pontos fortes', isArray: true },
  { field: 'acceptedActivities', label: 'Atividades aceitas', isArray: true },
  // Trabalho
  { field: 'nannyTypes', label: 'Tipo de babá', isArray: true },
  { field: 'contractRegimes', label: 'Regime de contratação', isArray: true },
  { field: 'hourlyRateRange', label: 'Faixa de valor por hora' },
  { field: 'maxChildrenCare', label: 'Máximo de crianças' },
  { field: 'maxTravelDistance', label: 'Raio de deslocamento' },
  // Disponibilidade
  { field: 'availabilityJson', label: 'Disponibilidade' },
  // Verificações
  { field: 'documentValidated', label: 'Documento (RG/CNH)', isBoolean: true },
];

/**
 * Calculate profile completion percentage and list of missing items
 */
function calculateProfileCompletion(nanny: Record<string, unknown>): {
  percentage: number;
  missingItems: string[];
} {
  const missingItems: string[] = [];
  let filledCount = 0;

  for (const { field, label, isArray, isBoolean, isNested } of REQUIRED_FIELDS) {
    let value: unknown;

    if (isNested) {
      const nestedObj = nanny[isNested] as Record<string, unknown> | null;
      value = nestedObj?.[field];
    } else {
      value = nanny[field];
    }

    let isFilled = false;

    if (isArray) {
      isFilled = Array.isArray(value) && value.length > 0;
    } else if (isBoolean) {
      isFilled = value === true;
    } else {
      isFilled = value !== null && value !== undefined && value !== '';
    }

    if (isFilled) {
      filledCount++;
    } else {
      missingItems.push(label);
    }
  }

  const percentage = Math.round((filledCount / REQUIRED_FIELDS.length) * 100);
  return { percentage, missingItems };
}

export async function GET(request: NextRequest) {
  // Verify cron authentication
  const auth = verifyCronAuth(request);
  if (!auth.isAuthorized) {
    return auth.errorResponse;
  }

  console.log('[CRON] Starting incomplete profile reminders job');

  const results: EmailResult[] = [];

  try {
    // Calculate date thresholds
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Find nannies with incomplete profiles who haven't received an email recently
    const nanniesWithIncompleteProfile = await prisma.nanny.findMany({
      where: {
        // Account created more than 24 hours ago
        createdAt: { lt: oneDayAgo },
        // Email is verified
        emailVerified: true,
        // Has an email address
        emailAddress: { not: null },
        // Has a name
        name: { not: null },
        // Profile is not complete - at least one required field is missing
        OR: [
          { photoUrl: null },
          { aboutMe: null },
          { cpf: null },
          { experienceYears: null },
          { availabilityJson: null },
          { documentValidated: false },
          { ageRangesExperience: { isEmpty: true } },
          { strengths: { isEmpty: true } },
          { acceptedActivities: { isEmpty: true } },
          { nannyTypes: { isEmpty: true } },
          { contractRegimes: { isEmpty: true } },
        ],
        // No reminder email sent in the last 7 days
        incompleteProfileEmailLogs: {
          none: {
            sentAt: { gte: sevenDaysAgo },
          },
        },
      },
      select: {
        id: true,
        name: true,
        emailAddress: true,
        cpf: true,
        birthDate: true,
        gender: true,
        photoUrl: true,
        aboutMe: true,
        experienceYears: true,
        ageRangesExperience: true,
        strengths: true,
        acceptedActivities: true,
        nannyTypes: true,
        contractRegimes: true,
        hourlyRateRange: true,
        maxChildrenCare: true,
        maxTravelDistance: true,
        availabilityJson: true,
        documentValidated: true,
        address: {
          select: {
            city: true,
            state: true,
            neighborhood: true,
          },
        },
      },
      take: 50, // Limit per execution to avoid timeout
    });

    console.log(
      `[CRON] Found ${nanniesWithIncompleteProfile.length} nannies with incomplete profiles`,
    );

    for (const nanny of nanniesWithIncompleteProfile) {
      if (!nanny.emailAddress || !nanny.name) continue;

      const { percentage, missingItems } = calculateProfileCompletion(
        nanny as unknown as Record<string, unknown>,
      );

      // Only send if profile is actually incomplete
      if (percentage >= 100) {
        console.log(`[CRON] Skipping nanny ${nanny.id} - profile is complete`);
        continue;
      }

      const result: EmailResult = {
        nannyId: nanny.id,
        email: nanny.emailAddress,
        name: nanny.name,
        completionPercentage: percentage,
        success: false,
      };

      try {
        const template = await getIncompleteProfileEmailTemplate({
          name: nanny.name.split(' ')[0],
          completionPercentage: percentage,
          missingItems,
          completeProfileUrl: `${config.site.url}/app/perfil/editar`,
        });

        const emailResult = await sendEmail({
          to: nanny.emailAddress,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        if (emailResult.success) {
          // Log the email as sent
          await prisma.incompleteProfileEmailLog.create({
            data: {
              nannyId: nanny.id,
            },
          });

          result.success = true;
          console.log(
            `[CRON] Sent incomplete profile reminder to ${nanny.emailAddress} (${percentage}% complete)`,
          );
        } else {
          result.error = emailResult.error || 'Failed to send email';
          console.error(
            `[CRON] Failed to send email to ${nanny.emailAddress}: ${result.error}`,
          );
        }
      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[CRON] Error processing nanny ${nanny.id}: ${result.error}`);
      }

      results.push(result);
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(
      `[CRON] Incomplete profile reminders job completed. Sent: ${successCount}, Failed: ${failureCount}`,
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed: results.length,
        emailsSent: successCount,
        emailsFailed: failureCount,
      },
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error in incomplete profile reminders job:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process incomplete profile reminders',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
