/*
  Warnings:

  - The values [JOB_MATCH] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('REVIEW_PUBLISHED', 'REVIEW_REMINDER', 'REVIEW_RESPONSE', 'REVIEW_MODERATED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'JOB_CLOSED');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "families" ADD COLUMN     "last_activity_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "nannies" ADD COLUMN     "last_activity_at" TIMESTAMP(3);
