/*
  Warnings:

  - You are about to drop the column `mini_bio` on the `nannies` table. All the data in the column will be lost.
  - You are about to drop the column `open_to_negotiation` on the `nanny_availabilities` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'JOB_MATCH';
ALTER TYPE "NotificationType" ADD VALUE 'APPLICATION_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'APPLICATION_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'JOB_CLOSED';

-- AlterTable
ALTER TABLE "nannies" DROP COLUMN "mini_bio";

-- AlterTable
ALTER TABLE "nanny_availabilities" DROP COLUMN "open_to_negotiation";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "job_id" INTEGER;

-- CreateIndex
CREATE INDEX "notifications_job_id_idx" ON "notifications"("job_id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
