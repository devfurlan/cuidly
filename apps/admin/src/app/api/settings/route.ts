import { withAuth } from '@/proxy';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/checkPermission';
import { logAudit } from '@/utils/auditLog';

/**
 * GET /api/settings
 * Lista todas as configurações do sistema
 */
async function handleGet() {
  try {
    await requirePermission('ADMIN');

    const configs = await prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });

    return NextResponse.json({ configs });
  } catch (error) {
    console.error('Error fetching settings:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar configurações';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/settings
 * Cria ou atualiza uma configuracao
 */
async function handlePost(request: Request) {
  try {
    await requirePermission('ADMIN');

    const body = await request.json();
    const { key, value, type, label, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'key e value são obrigatórios' },
        { status: 400 }
      );
    }

    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value: String(value),
        type: type || 'string',
        label,
        description,
      },
      create: {
        key,
        value: String(value),
        type: type || 'string',
        label,
        description,
      },
    });

    await logAudit({
      action: 'UPDATE',
      table: 'system_configs',
      recordId: config.id,
      data: { key, value },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error saving setting:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao salvar configuracao';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost);
