import { withPermission } from '@/proxy';
import { type UserWithPermissions } from '@/lib/auth/checkPermission';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TicketStatus } from '@cuidly/database';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function handlePatch(
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
    const { status } = await request.json();

    if (!Object.values(TicketStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
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

    const updateData: Record<string, unknown> = { status };

    if (status === 'CLOSED') {
      updateData.closedAt = new Date();
      updateData.closedById = user.id;
    }

    await prisma.supportTicket.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Status atualizado com sucesso',
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status' },
      { status: 500 },
    );
  }
}

export const PATCH = withPermission<RouteContext>('SUPPORT', handlePatch);
