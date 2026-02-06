import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { getUserIdFromSession } from '@/lib/supabase/auth/session';

const AuditAction = z.enum(['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'VIEW_CONVERSATION', 'DELETE_MESSAGE']);
type AuditAction = z.infer<typeof AuditAction>;

type LogAuditProps = {
  action: AuditAction;
  table: string;
  recordId: number | string;
  data?: Record<string, unknown>;
};

export async function logAudit({
  action,
  table,
  recordId,
  data,
}: LogAuditProps) {
  const adminUserId = await getUserIdFromSession();

  await prisma.auditLog.create({
    data: {
      action,
      table,
      recordId: String(recordId),
      adminUserId,
      data: data !== undefined ? (data as Prisma.InputJsonValue) : Prisma.DbNull,
    },
  });
}

export async function logAuditMany(logs: LogAuditProps[]) {
  const adminUserId = await getUserIdFromSession();

  await prisma.auditLog.createMany({
    data: logs.map((log) => ({
      action: log.action,
      table: log.table,
      recordId: String(log.recordId),
      adminUserId,
      data: log.data !== undefined ? (log.data as Prisma.InputJsonValue) : Prisma.DbNull,
    })),
  });
}
