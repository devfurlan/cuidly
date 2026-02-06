import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getUserIdFromSession } from '@/lib/supabase/auth/session';

// ============================================
// Audit Action Types
// ============================================

export const AUDIT_ACTIONS = {
  // CRUD Actions
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',

  // Moderation Actions
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  MODERATE: 'MODERATE',

  // Subscription/Plan Actions
  CANCEL_SUBSCRIPTION: 'CANCEL_SUBSCRIPTION',
  CHANGE_PLAN: 'CHANGE_PLAN',
  REFUND_PAYMENT: 'REFUND_PAYMENT',

  // Chat Moderation
  VIEW_CONVERSATION: 'VIEW_CONVERSATION',
  DELETE_MESSAGE: 'DELETE_MESSAGE',

  // Sensitive Data Access
  VIEW_PERSONAL_DATA: 'VIEW_PERSONAL_DATA',
  EXPORT_DATA: 'EXPORT_DATA',

  // Admin Actions
  CHANGE_PERMISSIONS: 'CHANGE_PERMISSIONS',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

// ============================================
// Audit Tables (for filtering)
// ============================================

export const AUDIT_TABLES = {
  USERS: 'users',
  ADMIN_USERS: 'admin_users',
  NANNIES: 'nannies',
  FAMILIES: 'families',
  CHILDREN: 'children',
  SUBSCRIPTIONS: 'subscriptions',
  PLANS: 'plans',
  PAYMENTS: 'payments',
  REVIEWS: 'reviews',
  JOBS: 'jobs',
  JOB_APPLICATIONS: 'job_applications',
  VALIDATION_REQUESTS: 'validation_requests',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  COUPONS: 'coupons',
} as const;

export type AuditTable = (typeof AUDIT_TABLES)[keyof typeof AUDIT_TABLES];

// ============================================
// Audit Log Types
// ============================================

export type AuditLogData = {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  changes?: Record<string, { from: unknown; to: unknown }>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

export type CreateAuditLogInput = {
  action: AuditAction;
  table: string;
  recordId: string | number;
  data?: AuditLogData;
  adminUserId?: string;
};

export type AuditLogWithUser = {
  id: number;
  table: string;
  action: string;
  recordId: string;
  data: Prisma.JsonValue | null;
  adminUserId: string | null;
  createdAt: Date;
  adminUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

// ============================================
// Audit Service
// ============================================

class AuditService {
  /**
   * Logs a single audit entry
   */
  async log(input: CreateAuditLogInput): Promise<void> {
    const adminUserId = input.adminUserId || (await getUserIdFromSession());

    await prisma.auditLog.create({
      data: {
        action: input.action,
        table: input.table,
        recordId: String(input.recordId),
        adminUserId,
        data:
          input.data !== undefined
            ? (input.data as Prisma.InputJsonValue)
            : Prisma.DbNull,
      },
    });
  }

  /**
   * Logs multiple audit entries in a batch
   */
  async logMany(inputs: CreateAuditLogInput[]): Promise<void> {
    const adminUserId = await getUserIdFromSession();

    await prisma.auditLog.createMany({
      data: inputs.map((input) => ({
        action: input.action,
        table: input.table,
        recordId: String(input.recordId),
        adminUserId: input.adminUserId || adminUserId,
        data:
          input.data !== undefined
            ? (input.data as Prisma.InputJsonValue)
            : Prisma.DbNull,
      })),
    });
  }

  // ============================================
  // User Management Audit Methods
  // ============================================

  async logUserCreate(
    recordId: string,
    userData: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.CREATE,
      table: AUDIT_TABLES.USERS,
      recordId,
      data: { after: userData },
    });
  }

  async logUserUpdate(
    recordId: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): Promise<void> {
    const changes = this.computeChanges(before, after);
    await this.log({
      action: AUDIT_ACTIONS.UPDATE,
      table: AUDIT_TABLES.USERS,
      recordId,
      data: { before, after, changes },
    });
  }

  async logUserDelete(
    recordId: string,
    userData: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.DELETE,
      table: AUDIT_TABLES.USERS,
      recordId,
      data: { before: userData },
    });
  }

  // ============================================
  // Admin User Management Audit Methods
  // ============================================

  async logAdminCreate(
    recordId: string,
    adminData: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.CREATE,
      table: AUDIT_TABLES.ADMIN_USERS,
      recordId,
      data: {
        after: this.sanitizeAdminData(adminData),
      },
    });
  }

  async logAdminUpdate(
    recordId: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): Promise<void> {
    const changes = this.computeChanges(before, after);
    await this.log({
      action: AUDIT_ACTIONS.UPDATE,
      table: AUDIT_TABLES.ADMIN_USERS,
      recordId,
      data: {
        before: this.sanitizeAdminData(before),
        after: this.sanitizeAdminData(after),
        changes,
      },
    });
  }

  async logAdminDelete(
    recordId: string,
    adminData: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.DELETE,
      table: AUDIT_TABLES.ADMIN_USERS,
      recordId,
      data: {
        before: this.sanitizeAdminData(adminData),
      },
    });
  }

  async logPermissionChange(
    recordId: string,
    adminEmail: string,
    beforePermissions: string[],
    afterPermissions: string[]
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.CHANGE_PERMISSIONS,
      table: AUDIT_TABLES.ADMIN_USERS,
      recordId,
      data: {
        adminEmail,
        before: { permissions: beforePermissions },
        after: { permissions: afterPermissions },
        added: afterPermissions.filter((p) => !beforePermissions.includes(p)),
        removed: beforePermissions.filter((p) => !afterPermissions.includes(p)),
      },
    });
  }

  // ============================================
  // Subscription/Plan Audit Methods
  // ============================================

  async logSubscriptionCancel(
    subscriptionId: string | number,
    subscriptionData: Record<string, unknown>,
    reason?: string
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.CANCEL_SUBSCRIPTION,
      table: AUDIT_TABLES.SUBSCRIPTIONS,
      recordId: subscriptionId,
      data: {
        subscription: subscriptionData,
        reason,
      },
    });
  }

  async logPlanChange(
    subscriptionId: string | number,
    targetId: string,
    fromPlan: Record<string, unknown>,
    toPlan: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.CHANGE_PLAN,
      table: AUDIT_TABLES.SUBSCRIPTIONS,
      recordId: subscriptionId,
      data: {
        targetId,
        fromPlan,
        toPlan,
      },
    });
  }

  async logPlanCreate(
    planId: string | number,
    planData: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.CREATE,
      table: AUDIT_TABLES.PLANS,
      recordId: planId,
      data: { after: planData },
    });
  }

  async logPlanUpdate(
    planId: string | number,
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): Promise<void> {
    const changes = this.computeChanges(before, after);
    await this.log({
      action: AUDIT_ACTIONS.UPDATE,
      table: AUDIT_TABLES.PLANS,
      recordId: planId,
      data: { before, after, changes },
    });
  }

  async logPlanDelete(
    planId: string | number,
    planData: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.DELETE,
      table: AUDIT_TABLES.PLANS,
      recordId: planId,
      data: { before: planData },
    });
  }

  // ============================================
  // Validation Request Audit Methods
  // ============================================

  async logValidationApprove(
    requestId: string,
    validationData: Record<string, unknown>,
    approverEmail: string
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.APPROVE,
      table: AUDIT_TABLES.VALIDATION_REQUESTS,
      recordId: requestId,
      data: {
        ...validationData,
        approvedBy: approverEmail,
      },
    });
  }

  async logValidationReject(
    requestId: string,
    validationData: Record<string, unknown>,
    rejectorEmail: string,
    reason: string
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.REJECT,
      table: AUDIT_TABLES.VALIDATION_REQUESTS,
      recordId: requestId,
      data: {
        ...validationData,
        rejectedBy: rejectorEmail,
        reason,
      },
    });
  }

  // ============================================
  // Review Moderation Audit Methods
  // ============================================

  async logReviewModeration(
    reviewId: string | number,
    action: 'approve' | 'reject' | 'delete',
    reviewData: Record<string, unknown>,
    moderatorEmail: string,
    reason?: string
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.MODERATE,
      table: AUDIT_TABLES.REVIEWS,
      recordId: reviewId,
      data: {
        moderationAction: action,
        review: reviewData,
        moderatedBy: moderatorEmail,
        reason,
      },
    });
  }

  // ============================================
  // Chat/Conversation Audit Methods (MANDATORY)
  // ============================================

  async logConversationView(
    conversationId: string,
    viewerEmail: string,
    participantInfo: Record<string, unknown>[]
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.VIEW_CONVERSATION,
      table: AUDIT_TABLES.CONVERSATIONS,
      recordId: conversationId,
      data: {
        viewedBy: viewerEmail,
        participants: participantInfo,
        accessedAt: new Date().toISOString(),
      },
    });
  }

  async logMessageDelete(
    messageId: string,
    conversationId: string,
    messageContent: string,
    deleterEmail: string,
    reason?: string
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.DELETE_MESSAGE,
      table: AUDIT_TABLES.MESSAGES,
      recordId: messageId,
      data: {
        conversationId,
        messageContent,
        deletedBy: deleterEmail,
        reason,
      },
    });
  }

  // ============================================
  // Personal Data Access Audit Methods (MANDATORY)
  // ============================================

  async logPersonalDataView(
    table: AuditTable,
    recordId: string | number,
    viewerEmail: string,
    dataType: string
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.VIEW_PERSONAL_DATA,
      table,
      recordId,
      data: {
        viewedBy: viewerEmail,
        dataType,
        accessedAt: new Date().toISOString(),
      },
    });
  }

  async logDataExport(
    table: string,
    exporterEmail: string,
    filters: Record<string, unknown>,
    recordCount: number
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.EXPORT_DATA,
      table,
      recordId: 'export',
      data: {
        exportedBy: exporterEmail,
        filters,
        recordCount,
        exportedAt: new Date().toISOString(),
      },
    });
  }

  // ============================================
  // Job Management Audit Methods
  // ============================================

  async logJobCreate(
    jobId: string | number,
    jobData: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.CREATE,
      table: AUDIT_TABLES.JOBS,
      recordId: jobId,
      data: { after: jobData },
    });
  }

  async logJobUpdate(
    jobId: string | number,
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): Promise<void> {
    const changes = this.computeChanges(before, after);
    await this.log({
      action: AUDIT_ACTIONS.UPDATE,
      table: AUDIT_TABLES.JOBS,
      recordId: jobId,
      data: { before, after, changes },
    });
  }

  async logJobDelete(
    jobId: string | number,
    jobData: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.DELETE,
      table: AUDIT_TABLES.JOBS,
      recordId: jobId,
      data: { before: jobData },
    });
  }

  // ============================================
  // Coupon Management Audit Methods
  // ============================================

  async logCouponCreate(
    couponId: string | number,
    couponData: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.CREATE,
      table: AUDIT_TABLES.COUPONS,
      recordId: couponId,
      data: { after: couponData },
    });
  }

  async logCouponUpdate(
    couponId: string | number,
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): Promise<void> {
    const changes = this.computeChanges(before, after);
    await this.log({
      action: AUDIT_ACTIONS.UPDATE,
      table: AUDIT_TABLES.COUPONS,
      recordId: couponId,
      data: { before, after, changes },
    });
  }

  async logCouponDelete(
    couponId: string | number,
    couponData: Record<string, unknown>
  ): Promise<void> {
    await this.log({
      action: AUDIT_ACTIONS.DELETE,
      table: AUDIT_TABLES.COUPONS,
      recordId: couponId,
      data: { before: couponData },
    });
  }

  // ============================================
  // Query Methods
  // ============================================

  async getAuditLogs(options: {
    page?: number;
    limit?: number;
    action?: AuditAction;
    table?: string;
    adminUserId?: string;
    startDate?: Date;
    endDate?: Date;
    recordId?: string;
  }): Promise<{ logs: AuditLogWithUser[]; total: number }> {
    const { page = 1, limit = 25, action, table, adminUserId, startDate, endDate, recordId } = options;

    const where: Prisma.AuditLogWhereInput = {};

    if (action) where.action = action;
    if (table) where.table = table;
    if (adminUserId) where.adminUserId = adminUserId;
    if (recordId) where.recordId = recordId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          adminUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async getAuditLogById(id: number): Promise<AuditLogWithUser | null> {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        adminUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getAuditLogsByRecord(
    table: string,
    recordId: string
  ): Promise<AuditLogWithUser[]> {
    return prisma.auditLog.findMany({
      where: { table, recordId },
      include: {
        adminUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAuditLogsByAdminUser(adminUserId: string): Promise<AuditLogWithUser[]> {
    return prisma.auditLog.findMany({
      where: { adminUserId },
      include: {
        adminUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // ============================================
  // Helper Methods
  // ============================================

  private computeChanges(
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): Record<string, { from: unknown; to: unknown }> {
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of allKeys) {
      const fromValue = before[key];
      const toValue = after[key];

      if (JSON.stringify(fromValue) !== JSON.stringify(toValue)) {
        changes[key] = { from: fromValue, to: toValue };
      }
    }

    return changes;
  }

  private sanitizeAdminData(
    data: Record<string, unknown>
  ): Record<string, unknown> {
    // Remove sensitive fields from audit logs
    const sanitized = { ...data };
    delete sanitized.password;
    delete sanitized.passwordHash;
    return sanitized;
  }
}

// Export singleton instance
export const auditService = new AuditService();
