import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { notifyAdminUserReply } from '@/lib/email/support-notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { ticketId } = await params;
    const { body } = await request.json();

    if (!body || !body.trim()) {
      return NextResponse.json(
        { error: 'A mensagem não pode estar vazia' },
        { status: 400 },
      );
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Chamado não encontrado' },
        { status: 404 },
      );
    }

    // Verify ownership
    const isOwner =
      (currentUser.type === 'nanny' &&
        ticket.nannyId === currentUser.nanny.id) ||
      (currentUser.type === 'family' &&
        ticket.familyId === currentUser.family.id);

    if (!isOwner) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (ticket.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Este chamado está encerrado' },
        { status: 400 },
      );
    }

    const nannyId = currentUser.type === 'nanny' ? currentUser.nanny.id : null;
    const familyId =
      currentUser.type === 'family' ? currentUser.family.id : null;

    // Create message and reopen if resolved
    const [message] = await prisma.$transaction([
      prisma.supportTicketMessage.create({
        data: {
          ticketId,
          senderNannyId: nannyId,
          senderFamilyId: familyId,
          body: body.trim(),
        },
      }),
      ...(ticket.status === 'RESOLVED'
        ? [
            prisma.supportTicket.update({
              where: { id: ticketId },
              data: { status: 'OPEN' },
            }),
          ]
        : []),
    ]);

    // Send email notification to admins (non-blocking)
    const userName =
      currentUser.type === 'nanny'
        ? currentUser.nanny.name || 'Usuário'
        : currentUser.family.name || 'Usuário';

    notifyAdminUserReply({
      userName,
      userType: currentUser.type === 'nanny' ? 'Babá' : 'Família',
      subject: ticket.subject,
      messageBody: body.trim(),
      ticketId,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
