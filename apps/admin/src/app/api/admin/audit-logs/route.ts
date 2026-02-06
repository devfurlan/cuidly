import { withSuperAdmin } from '@/proxy';
import { NextResponse } from 'next/server';
import { auditService, AUDIT_ACTIONS, AUDIT_TABLES } from '@/services/auditService';
import { UserWithPermissions } from '@/lib/auth/checkPermission';

/**
 * GET /api/admin/audit-logs
 * Lista os logs de auditoria (apenas super admins)
 */
async function handleGet(
  request: Request,
  _context: undefined,
  _admin: UserWithPermissions
) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const action = searchParams.get('action') || undefined;
    const table = searchParams.get('table') || undefined;
    const adminUserId = searchParams.get('adminUserId') || undefined;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    const { logs, total } = await auditService.getAuditLogs({
      page,
      limit,
      action: action as typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS],
      table,
      adminUserId,
      startDate,
      endDate,
    });

    // Get available filter options
    const filterOptions = {
      actions: Object.values(AUDIT_ACTIONS),
      tables: Object.values(AUDIT_TABLES),
    };

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filterOptions,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    const message =
      error instanceof Error ? error.message : 'Erro ao buscar logs de auditoria';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = withSuperAdmin(handleGet);
