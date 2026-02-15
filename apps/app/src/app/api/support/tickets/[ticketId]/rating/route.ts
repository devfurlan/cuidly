import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { TicketDissatisfactionReason } from '@cuidly/database';

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
    const { rating, reason, comment } = await request.json();

    if (typeof rating !== 'boolean') {
      return NextResponse.json(
        { error: 'Avaliação inválida' },
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

    if (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') {
      return NextResponse.json(
        { error: 'Só é possível avaliar chamados resolvidos ou encerrados' },
        { status: 400 },
      );
    }

    if (ticket.satisfactionRating !== null) {
      return NextResponse.json(
        { error: 'Este chamado já foi avaliado' },
        { status: 400 },
      );
    }

    // Negative rating requires a reason
    if (
      !rating &&
      (!reason ||
        !Object.values(TicketDissatisfactionReason).includes(reason))
    ) {
      return NextResponse.json(
        { error: 'Selecione um motivo para a avaliação negativa' },
        { status: 400 },
      );
    }

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        satisfactionRating: rating,
        satisfactionReason: rating ? null : reason,
        satisfactionComment: rating
          ? null
          : comment?.trim()?.substring(0, 1000) || null,
        satisfactionRatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao avaliar chamado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
