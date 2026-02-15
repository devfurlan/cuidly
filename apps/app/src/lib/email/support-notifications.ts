import prisma from '@/lib/prisma';
import { sendEmail } from './sendEmail';
import { getNewTicketAdminEmailTemplate } from './react-templates/support/NewTicketAdminEmail';
import { getTicketReplyEmailTemplate } from './react-templates/support/TicketReplyEmail';
import { getTicketUserReplyAdminEmailTemplate } from './react-templates/support/TicketUserReplyAdminEmail';

const CATEGORY_LABELS: Record<string, string> = {
  SUBSCRIPTION_PAYMENT: 'Assinatura / Pagamento',
  ACCOUNT: 'Conta',
  BUG_TECHNICAL: 'Bug / Problema técnico',
  SUGGESTION: 'Sugestão',
  OTHER: 'Outro',
};

async function getAdminEmails(): Promise<string[]> {
  const admins = await prisma.adminUser.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { permissions: { has: 'SUPPORT' } },
        { isSuperAdmin: true },
      ],
    },
    select: { email: true },
  });

  return admins.map((a) => a.email);
}

export async function notifyAdminNewTicket({
  userName,
  userType,
  userEmail,
  subject,
  category,
  messageBody,
  ticketId,
}: {
  userName: string;
  userType: 'Babá' | 'Família';
  userEmail: string;
  subject: string;
  category: string;
  messageBody: string;
  ticketId: string;
}) {
  try {
    const adminEmails = await getAdminEmails();
    if (adminEmails.length === 0) return;

    const template = await getNewTicketAdminEmailTemplate({
      userName: userName.split(' ')[0],
      userType,
      userEmail,
      subject,
      category: CATEGORY_LABELS[category] || category,
      messagePreview:
        messageBody.length > 300
          ? messageBody.substring(0, 300) + '...'
          : messageBody,
      ticketUrl: `https://admin.cuidly.com/suporte/${ticketId}`,
    });

    await Promise.all(
      adminEmails.map((email) =>
        sendEmail({ to: email, ...template }),
      ),
    );
  } catch (error) {
    console.error('Erro ao notificar admin sobre novo chamado:', error);
  }
}

export async function notifyUserTicketReply({
  userEmail,
  userName,
  subject,
  messageBody,
  ticketId,
}: {
  userEmail: string;
  userName: string;
  subject: string;
  messageBody: string;
  ticketId: string;
}) {
  try {
    const template = await getTicketReplyEmailTemplate({
      name: userName.split(' ')[0],
      subject,
      messagePreview:
        messageBody.length > 300
          ? messageBody.substring(0, 300) + '...'
          : messageBody,
      ticketUrl: `https://cuidly.com/app/suporte/chamados/${ticketId}`,
    });

    await sendEmail({ to: userEmail, ...template });
  } catch (error) {
    console.error('Erro ao notificar usuário sobre resposta:', error);
  }
}

export async function notifyAdminUserReply({
  userName,
  userType,
  subject,
  messageBody,
  ticketId,
}: {
  userName: string;
  userType: 'Babá' | 'Família';
  subject: string;
  messageBody: string;
  ticketId: string;
}) {
  try {
    const adminEmails = await getAdminEmails();
    if (adminEmails.length === 0) return;

    const template = await getTicketUserReplyAdminEmailTemplate({
      userName: userName.split(' ')[0],
      userType,
      subject,
      messagePreview:
        messageBody.length > 300
          ? messageBody.substring(0, 300) + '...'
          : messageBody,
      ticketUrl: `https://admin.cuidly.com/suporte/${ticketId}`,
    });

    await Promise.all(
      adminEmails.map((email) =>
        sendEmail({ to: email, ...template }),
      ),
    );
  } catch (error) {
    console.error('Erro ao notificar admin sobre resposta do usuário:', error);
  }
}
