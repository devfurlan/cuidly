/**
 * Job Matching Email Notifications
 *
 * Sends email notifications to compatible nannies when a new job is published
 */

import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email/sendEmail';
import { getCompatibleJobEmailTemplate } from '@/lib/email/react-templates';
import { formatChildrenAges, formatJobType, formatSchedule } from '@/lib/email/helpers';
import { config } from '@/config';

/**
 * Sends compatible job notification emails to matching nannies
 *
 * Rate limiting:
 * - Maximum 1 email per nanny every 24 hours
 * - Maximum 20 nannies per job
 *
 * @param jobId - ID of the newly published job
 */
export async function sendCompatibleJobEmails(jobId: number): Promise<void> {
  try {
    // Fetch job with all necessary data
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            address: true,
            children: {
              include: {
                child: true,
              },
            },
          },
        },
      },
    });

    // Validate job exists and is active
    if (!job || job.status !== 'ACTIVE') {
      console.log(`[JOB_MATCH_EMAILS] Job ${jobId} not found or not active`);
      return;
    }

    // Get job location
    const jobCity = job.family.address?.city;
    const jobNeighborhood = job.family.address?.neighborhood;

    if (!jobCity) {
      console.log(`[JOB_MATCH_EMAILS] Job ${jobId} has no city, skipping`);
      return;
    }

    // Calculate 24 hours ago for rate limiting
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find compatible nannies
    const compatibleNannies = await prisma.nanny.findMany({
      where: {
        // Must have verified email
        emailVerified: true,
        emailAddress: { not: null },

        // Must have complete profile (Selo Identificada)
        documentValidated: true,

        // Must be in the same city
        address: {
          city: jobCity,
        },

        // Rate limiting: hasn't received an email in the last 24 hours
        compatibleJobEmailLogs: {
          none: {
            sentAt: { gte: oneDayAgo },
          },
        },
      },
      select: {
        id: true,
        name: true,
        emailAddress: true,
        address: {
          select: {
            city: true,
          },
        },
      },
      take: 20, // Limit to 20 nannies per job
    });

    console.log(
      `[JOB_MATCH_EMAILS] Found ${compatibleNannies.length} compatible nannies for job ${jobId}`
    );

    // Get job children for ages
    const jobChildren = job.family.children
      .filter((cf) => job.childrenIds.includes(cf.childId))
      .map((cf) => cf.child);

    // Send email to each compatible nanny
    for (const nanny of compatibleNannies) {
      if (!nanny.emailAddress || !nanny.name) {
        console.log(`[JOB_MATCH_EMAILS] Skipping nanny ${nanny.id}: missing email or name`);
        continue;
      }

      try {
        const template = await getCompatibleJobEmailTemplate({
          name: nanny.name.split(' ')[0],
          familyName: 'Família', // Privacy: never reveal family name
          neighborhood: jobNeighborhood || jobCity,
          city: jobCity,
          childrenCount: jobChildren.length,
          childrenAges: formatChildrenAges(jobChildren),
          jobType: formatJobType(job.jobType),
          schedule: formatSchedule(job),
          hourlyRate:
            job.budgetMin && job.budgetMax
              ? `R$ ${job.budgetMin.toFixed(0)} - R$ ${job.budgetMax.toFixed(0)}/hora`
              : 'A combinar',
          viewJobUrl: `${config.site.url}/app/vagas/${job.id}`,
        });

        const result = await sendEmail({
          to: nanny.emailAddress,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        if (result.success) {
          // Log successful email send
          await prisma.compatibleJobEmailLog.create({
            data: {
              nannyId: nanny.id,
              jobId: job.id,
            },
          });

          console.log(
            `[JOB_MATCH_EMAILS] Sent email to nanny ${nanny.id} (${nanny.emailAddress}) for job ${jobId}`
          );
        } else {
          console.error(
            `[JOB_MATCH_EMAILS] Failed to send email to nanny ${nanny.id}:`,
            result.error
          );
        }
      } catch (error) {
        console.error(
          `[JOB_MATCH_EMAILS] Error sending email to nanny ${nanny.id}:`,
          error
        );
      }
    }

    console.log(
      `[JOB_MATCH_EMAILS] Finished sending compatible job emails for job ${jobId}`
    );
  } catch (error) {
    console.error(`[JOB_MATCH_EMAILS] Error in sendCompatibleJobEmails for job ${jobId}:`, error);
  }
}
