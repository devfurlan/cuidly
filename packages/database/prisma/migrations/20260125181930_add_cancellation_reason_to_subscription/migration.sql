-- CreateEnum
CREATE TYPE "CancellationReason" AS ENUM ('FOUND_WHAT_I_NEEDED', 'TOO_EXPENSIVE', 'NOT_USING', 'MISSING_FEATURES', 'TECHNICAL_ISSUES', 'OTHER');

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "cancellation_feedback" TEXT,
ADD COLUMN     "cancellation_reason" "CancellationReason";
