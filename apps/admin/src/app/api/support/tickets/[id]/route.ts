import { withPermission } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function handleGet(
  _request: Request,
  context: RouteContext | undefined,
) {
  try {
    if (!context) {
      return NextResponse.json(
        { error: 'Contexto inválido' },
        { status: 400 },
      );
    }

    const { id } = await context.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        nanny: {
          select: { id: true, name: true, emailAddress: true, photoUrl: true },
        },
        family: {
          select: { id: true, name: true, emailAddress: true, photoUrl: true },
        },
        closedBy: { select: { name: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            senderNanny: { select: { name: true } },
            senderFamily: { select: { name: true } },
            senderAdmin: { select: { name: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Chamado não encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar chamado' },
      { status: 500 },
    );
  }
}

export const GET = withPermission<RouteContext>('SUPPORT', handleGet);
