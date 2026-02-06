import { AdminPermission, CommonStatus } from '@prisma/client';

export type AdminUser = {
  id: string;
  photoUrl: string | null;
  name: string | null;
  email: string;
  permissions: AdminPermission[];
  isSuperAdmin: boolean;
  notifyFailedPayments: boolean;
  status: CommonStatus;
  createdAt: Date;
  updatedAt: Date | null;
  lastVisitAt: Date | null;
};
