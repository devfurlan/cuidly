import { withSuperAdmin } from '@/proxy';
import { NextResponse } from 'next/server';
import { auditService } from '@/services/auditService';
import { UserWithPermissions } from '@/lib/auth/checkPermission';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/audit-logs/[id]
 * Retorna detalhes de um log de auditoria especifico (apenas super admins)
 */
async function handleGet(
  _request: Request,
  context: RouteContext | undefined,
  _admin: UserWithPermissions
) {
  try {
    const { id } = await context!.params;
    const logId = parseInt(id);

    if (isNaN(logId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const log = await auditService.getAuditLogById(logId);

    if (!log) {
      return NextResponse.json(
        { error: 'Log de auditoria não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar log de auditoria';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withSuperAdmin(handleGet);
