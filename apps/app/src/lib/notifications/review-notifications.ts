import { config } from '@/config';
import { sendEmail } from '@/lib/email/sendEmail';
import prisma from '@/lib/prisma';
import { getFirstName, getNannyProfileUrl } from '@/utils/slug';
import { NotificationType } from '@cuidly/database';

interface NotificationData {
  nannyId?: number;
  familyId?: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  reviewId?: number;
}

export async function createNotification(data: NotificationData) {
  const notification = await prisma.notification.create({
    data: {
      nannyId: data.nannyId,
      familyId: data.familyId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      reviewId: data.reviewId,
    },
  });

  // Buscar email do nanny ou family para enviar email
  let email: string | null = null;
  let recipientName: string | null = null;

  if (data.nannyId) {
    const nanny = await prisma.nanny.findUnique({
      where: { id: data.nannyId },
      select: { emailAddress: true, name: true },
    });
    email = nanny?.emailAddress ?? null;
    recipientName = nanny?.name ?? null;
  } else if (data.familyId) {
    const family = await prisma.family.findUnique({
      where: { id: data.familyId },
      select: { emailAddress: true, name: true },
    });
    email = family?.emailAddress ?? null;
    recipientName = family?.name ?? null;
  }

  if (email) {
    await sendEmail({
      to: email,
      subject: data.title,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f0abfc; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; }
            .button { display: inline-block; background: #CE93D8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">Cuidly</h1>
            </div>
            <div class="content">
              <h2>${data.title}</h2>
              <p>${data.message}</p>
              ${data.link ? `<a href="${config.site.url}${data.link}" class="button">Ver detalhes</a>` : ''}
            </div>
            <div class="footer">
              <p>Este email foi enviado automaticamente pelo Cuidly.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  return notification;
}

export async function notifyReviewPublished(reviewId: number) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      family: {
        select: { id: true, name: true },
      },
      nanny: {
        include: {
          address: { select: { city: true } },
        },
      },
    },
  });

  if (!review) return;

  // Determinar quem avaliou e quem foi avaliado com base no tipo
  if (review.type === 'FAMILY_TO_NANNY') {
    // Família avaliou a babá - notificar a família e a babá
    await createNotification({
      familyId: review.familyId,
      type: NotificationType.REVIEW_PUBLISHED,
      title: 'Sua avaliação foi publicada',
      message: `Sua avaliação de ${getFirstName(review.nanny.name ?? '')} foi publicada e agora está visível no perfil.`,
      link: getNannyProfileUrl(
        review.nanny.slug ?? '',
        review.nanny.address?.city ?? undefined,
      ),
      reviewId: review.id,
    });

    await createNotification({
      nannyId: review.nannyId,
      type: NotificationType.REVIEW_PUBLISHED,
      title: 'Você recebeu uma nova avaliação',
      message: `${review.family.name} deixou uma avaliação para você.`,
      link: `/app/perfil`,
      reviewId: review.id,
    });
  } else {
    // Babá avaliou a família (NANNY_TO_FAMILY)
    await createNotification({
      nannyId: review.nannyId,
      type: NotificationType.REVIEW_PUBLISHED,
      title: 'Sua avaliação foi publicada',
      message: `Sua avaliação de ${review.family.name} foi publicada.`,
      link: `/app/avaliacoes`,
      reviewId: review.id,
    });

    await createNotification({
      familyId: review.familyId,
      type: NotificationType.REVIEW_PUBLISHED,
      title: 'Você recebeu uma nova avaliação',
      message: `${getFirstName(review.nanny.name ?? '')} deixou uma avaliação para você.`,
      link: `/app/perfil`,
      reviewId: review.id,
    });
  }
}

/**
 * Sends review reminders based on conversation history
 * @param conversationId - The conversation ID to check for pending reviews
 * @deprecated Review reminders are now based on conversation history, not contacts
 */
export async function notifyReviewReminder(conversationId: string) {
  // Get conversation participants
  const participants = await prisma.participant.findMany({
    where: { conversationId },
    include: {
      nanny: {
        select: { id: true, name: true },
      },
      family: {
        select: { id: true, name: true },
      },
    },
  });

  if (participants.length < 2) return;

  // Find family and nanny participants
  const familyParticipant = participants.find((p) => p.familyId);
  const nannyParticipant = participants.find((p) => p.nannyId);

  if (!familyParticipant || !nannyParticipant) return;

  const familyId = familyParticipant.familyId;
  const nannyId = nannyParticipant.nannyId;

  if (!familyId || !nannyId) return;

  // Check if family already reviewed
  const familyReview = await prisma.review.findFirst({
    where: {
      familyId,
      nannyId,
      type: 'FAMILY_TO_NANNY',
    },
  });

  if (!familyReview) {
    const nannyName = nannyParticipant.nanny?.name
      ? getFirstName(nannyParticipant.nanny.name)
      : 'a babá';
    await createNotification({
      familyId,
      type: NotificationType.REVIEW_REMINDER,
      title: 'Lembre-se de avaliar',
      message: `Você tem 7 dias para avaliar ${nannyName}. Sua opinião é importante!`,
      link: `/app/avaliacoes`,
    });
  }

  // Check if nanny already reviewed
  const nannyReview = await prisma.review.findFirst({
    where: {
      familyId,
      nannyId,
      type: 'NANNY_TO_FAMILY',
    },
  });

  if (!nannyReview) {
    const familyName = familyParticipant.family?.name || 'a família';
    await createNotification({
      nannyId,
      type: NotificationType.REVIEW_REMINDER,
      title: 'Lembre-se de avaliar',
      message: `Você tem 7 dias para avaliar ${familyName}. Sua opinião é importante!`,
      link: `/app/avaliacoes`,
    });
  }
}

export async function notifyReviewResponse(reviewId: number) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      family: {
        select: { id: true, name: true },
      },
      nanny: {
        include: {
          address: { select: { city: true } },
        },
      },
    },
  });

  if (!review || !review.response) return;

  // Determinar quem fez a avaliação para notificá-lo sobre a resposta
  if (review.type === 'FAMILY_TO_NANNY') {
    // Família avaliou, babá respondeu -> notificar família
    await createNotification({
      familyId: review.familyId,
      type: NotificationType.REVIEW_RESPONSE,
      title: 'Resposta à sua avaliação',
      message: `${getFirstName(review.nanny.name ?? '')} respondeu sua avaliação.`,
      link: getNannyProfileUrl(
        review.nanny.slug ?? '',
        review.nanny.address?.city ?? undefined,
      ),
      reviewId: review.id,
    });
  } else {
    // Babá avaliou, família respondeu -> notificar babá
    await createNotification({
      nannyId: review.nannyId,
      type: NotificationType.REVIEW_RESPONSE,
      title: 'Resposta à sua avaliação',
      message: `${review.family.name} respondeu sua avaliação.`,
      link: `/app/avaliacoes`,
      reviewId: review.id,
    });
  }
}

/**
 * Notifica o usuário quando sua avaliação foi moderada (ocultada ou deletada)
 */
export async function notifyReviewModerated(
  reviewId: number,
  action: 'hidden' | 'deleted',
  reason?: string,
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        type: true,
        familyId: true,
        nannyId: true,
      },
    });

    if (!review) {
      console.error('Avaliação não encontrada para notificação:', reviewId);
      return;
    }

    const actionText = action === 'hidden' ? 'ocultada' : 'removida';
    const title = `Sua avaliação foi ${actionText}`;
    const message = reason
      ? `Sua avaliação foi ${actionText} pela moderação. Motivo: ${reason}`
      : `Sua avaliação foi ${actionText} pela moderação por violar nossas diretrizes de comunidade.`;

    // Determinar quem fez a avaliação para notificá-lo
    if (review.type === 'FAMILY_TO_NANNY') {
      // Família fez a avaliação
      await createNotification({
        familyId: review.familyId,
        type: NotificationType.REVIEW_MODERATED,
        title,
        message,
        link: '/app/minhas-avaliacoes',
        reviewId: review.id,
      });
    } else {
      // Babá fez a avaliação
      await createNotification({
        nannyId: review.nannyId,
        type: NotificationType.REVIEW_MODERATED,
        title,
        message,
        link: '/app/minhas-avaliacoes',
        reviewId: review.id,
      });
    }

    console.log(`Notificação de moderação enviada para avaliação ${reviewId}`);
  } catch (error) {
    console.error('Erro ao notificar moderação:', error);
  }
}

/**
 * Notifica o usuário por nannyId ou familyId quando sua avaliação foi moderada
 * Usado quando a avaliação já foi deletada
 */
export async function notifyReviewModeratedByEntityId(
  entityId: { nannyId?: number; familyId?: number },
  action: 'hidden' | 'deleted',
  reason?: string,
) {
  try {
    const actionText = action === 'hidden' ? 'ocultada' : 'removida';
    const title = `Sua avaliação foi ${actionText}`;
    const message = reason
      ? `Sua avaliação foi ${actionText} pela moderação. Motivo: ${reason}`
      : `Sua avaliação foi ${actionText} pela moderação por violar nossas diretrizes de comunidade.`;

    // Criar notificação in-app
    await createNotification({
      nannyId: entityId.nannyId,
      familyId: entityId.familyId,
      type: NotificationType.REVIEW_MODERATED,
      title,
      message,
      link: '/app/minhas-avaliacoes',
    });

    console.log(`Notificação de moderação enviada`);
  } catch (error) {
    console.error('Erro ao notificar moderação:', error);
  }
}

// Keep the old function name for backward compatibility but mark as deprecated
/**
 * @deprecated Use notifyReviewModeratedByEntityId instead
 */
export const notifyReviewModeratedByUserId = notifyReviewModeratedByEntityId;
