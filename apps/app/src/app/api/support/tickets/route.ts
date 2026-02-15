import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { TicketCategory } from '@cuidly/database';
import { notifyAdminNewTicket } from '@/lib/email/support-notifications';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { category, subject, body: messageBody } = body;

    if (!category || !subject || !messageBody) {
      return NextResponse.json(
        { error: 'Categoria, assunto e descrição são obrigatórios' },
        { status: 400 },
      );
    }

    if (!Object.values(TicketCategory).includes(category)) {
      return NextResponse.json(
        { error: 'Categoria inválida' },
        { status: 400 },
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { error: 'O assunto deve ter no máximo 200 caracteres' },
        { status: 400 },
      );
    }

    const nannyId = currentUser.type === 'nanny' ? currentUser.nanny.id : null;
    const familyId =
      currentUser.type === 'family' ? currentUser.family.id : null;

    const ticket = await prisma.supportTicket.create({
      data: {
        nannyId,
        familyId,
        category,
        subject,
        messages: {
          create: {
            senderNannyId: nannyId,
            senderFamilyId: familyId,
            body: messageBody,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    // Send email notification to admins (non-blocking)
    const userName =
      currentUser.type === 'nanny'
        ? currentUser.nanny.name || 'Usuário'
        : currentUser.family.name || 'Usuário';
    const userEmail =
      currentUser.type === 'nanny'
        ? currentUser.nanny.emailAddress || ''
        : currentUser.family.emailAddress || '';

    notifyAdminNewTicket({
      userName,
      userType: currentUser.type === 'nanny' ? 'Babá' : 'Família',
      userEmail,
      subject,
      category,
      messageBody,
      ticketId: ticket.id,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const where =
      currentUser.type === 'nanny'
        ? { nannyId: currentUser.nanny.id }
        : { familyId: currentUser.family.id };

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Erro ao listar chamados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
