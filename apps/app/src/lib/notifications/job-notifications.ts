import prisma from '@/lib/prisma';
import { NotificationType } from '@cuidly/database';

interface NotificationData {
  nannyId?: number;
  familyId?: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  jobId?: number;
}

/**
 * Creates a notification without sending email
 * Used for job-related notifications
 */
export async function createNotificationWithoutEmail(data: NotificationData) {
  const notification = await prisma.notification.create({
    data: {
      nannyId: data.nannyId,
      familyId: data.familyId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      jobId: data.jobId,
    },
  });

  return notification;
}

/**
 * Notifies a nanny that their application was accepted
 */
export async function notifyApplicationAccepted(applicationId: number) {
  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: { id: true, title: true, familyId: true },
        include: {
          family: { select: { name: true } },
        },
      },
      nanny: { select: { id: true } },
    },
  });

  if (!application) return;

  const familyName = application.job.family.name || 'A família';

  await createNotificationWithoutEmail({
    nannyId: application.nanny.id,
    type: NotificationType.APPLICATION_ACCEPTED,
    title: 'Candidatura aceita!',
    message: `${familyName} aceitou sua candidatura para a vaga "${application.job.title}"`,
    link: `/app/candidaturas`,
    jobId: application.job.id,
  });
}

/**
 * Notifies a nanny that their application was rejected
 */
export async function notifyApplicationRejected(applicationId: number) {
  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: { id: true, title: true },
      },
      nanny: { select: { id: true } },
    },
  });

  if (!application) return;

  await createNotificationWithoutEmail({
    nannyId: application.nanny.id,
    type: NotificationType.APPLICATION_REJECTED,
    title: 'Atualização de candidatura',
    message: `Sua candidatura para "${application.job.title}" não foi selecionada`,
    link: `/app/candidaturas`,
    jobId: application.job.id,
  });
}

/**
 * Notifies all applicants when a job is closed
 */
export async function notifyJobClosed(jobId: number) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      applications: {
        select: { nannyId: true },
      },
    },
  });

  if (!job) return;

  const notifications = job.applications.map((app) =>
    createNotificationWithoutEmail({
      nannyId: app.nannyId,
      type: NotificationType.JOB_CLOSED,
      title: 'Vaga encerrada',
      message: `A vaga "${job.title}" foi encerrada`,
      link: `/app/vagas`,
      jobId: job.id,
    })
  );

  await Promise.all(notifications);
}
