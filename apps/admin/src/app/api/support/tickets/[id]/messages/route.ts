import { withPermission } from '@/proxy';
import { type UserWithPermissions } from '@/lib/auth/checkPermission';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email/sendEmail';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function handlePost(
  request: Request,
  context: RouteContext | undefined,
  user: UserWithPermissions,
) {
  try {
    if (!context) {
      return NextResponse.json(
        { error: 'Contexto inválido' },
        { status: 400 },
      );
    }

    const { id } = await context.params;
    const { body } = await request.json();

    if (!body || !body.trim()) {
      return NextResponse.json(
        { error: 'A mensagem não pode estar vazia' },
        { status: 400 },
      );
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Chamado não encontrado' },
        { status: 404 },
      );
    }

    // Create message and auto-transition OPEN -> IN_PROGRESS
    const [message] = await prisma.$transaction([
      prisma.supportTicketMessage.create({
        data: {
          ticketId: id,
          senderAdminId: user.id,
          body: body.trim(),
        },
      }),
      ...(ticket.status === 'OPEN'
        ? [
            prisma.supportTicket.update({
              where: { id },
              data: { status: 'IN_PROGRESS' },
            }),
          ]
        : []),
    ]);

    // Send email notification to user (non-blocking)
    const ticketWithUser = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        nanny: { select: { name: true, emailAddress: true } },
        family: { select: { name: true, emailAddress: true } },
      },
    });

    if (ticketWithUser) {
      const userEmail =
        ticketWithUser.nanny?.emailAddress ||
        ticketWithUser.family?.emailAddress;
      const userName =
        ticketWithUser.nanny?.name || ticketWithUser.family?.name || 'Usuário';
      const firstName = userName.split(' ')[0];

      if (userEmail) {
        const ticketUrl = `https://cuidly.com/app/suporte/chamados/${id}`;
        const preview =
          body.trim().length > 300
            ? body.trim().substring(0, 300) + '...'
            : body.trim();

        sendEmail({
          to: userEmail,
          subject: `Resposta ao seu chamado: ${ticketWithUser.subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Resposta ao seu chamado</h2>
              <p>Olá, ${firstName}! Sua solicitação sobre "${ticketWithUser.subject}" recebeu uma resposta.</p>
              <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0;">${preview}</p>
              </div>
              <p style="text-align: center; margin: 32px 0;">
                <a href="${ticketUrl}" style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
                  Ver chamado completo
                </a>
              </p>
              <p style="color: #6b7280; font-size: 12px;">Cuidly Babás</p>
            </div>
          `,
        });
      }
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending admin reply:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar resposta' },
      { status: 500 },
    );
  }
}

export const POST = withPermission<RouteContext>('SUPPORT', handlePost);
