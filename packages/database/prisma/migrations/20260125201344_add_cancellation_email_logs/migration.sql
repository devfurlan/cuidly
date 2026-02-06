-- CreateEnum
CREATE TYPE "CancellationEmailType" AS ENUM ('CONFIRMATION', 'REMINDER_5_DAYS', 'REMINDER_1_DAY', 'CANCELED');

-- CreateTable
CREATE TABLE "cancellation_email_logs" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "email_type" "CancellationEmailType" NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cancellation_email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cancellation_email_logs_subscription_id_idx" ON "cancellation_email_logs"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "cancellation_email_logs_subscription_id_email_type_key" ON "cancellation_email_logs"("subscription_id", "email_type");

-- CreateIndex
CREATE INDEX "subscriptions_cancel_at_period_end_status_idx" ON "subscriptions"("cancel_at_period_end", "status");

-- AddForeignKey
ALTER TABLE "cancellation_email_logs" ADD CONSTRAINT "cancellation_email_logs_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
