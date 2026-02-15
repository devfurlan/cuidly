-- CreateEnum
CREATE TYPE "TicketDissatisfactionReason" AS ENUM ('NOT_RESOLVED', 'SLOW_RESPONSE', 'UNCLEAR_RESPONSE', 'OTHER');

-- AlterTable
ALTER TABLE "support_tickets" ADD COLUMN     "satisfaction_comment" TEXT,
ADD COLUMN     "satisfaction_rated_at" TIMESTAMP(3),
ADD COLUMN     "satisfaction_rating" BOOLEAN,
ADD COLUMN     "satisfaction_reason" "TicketDissatisfactionReason";
