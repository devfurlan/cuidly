-- CreateEnum
CREATE TYPE "PixReminderEmailType" AS ENUM ('REMINDER_1_DAY', 'EXPIRED');

-- CreateTable
CREATE TABLE "pix_reminder_email_logs" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "email_type" "PixReminderEmailType" NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pix_reminder_email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pix_reminder_email_logs_payment_id_idx" ON "pix_reminder_email_logs"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "pix_reminder_email_logs_payment_id_email_type_key" ON "pix_reminder_email_logs"("payment_id", "email_type");

-- AddForeignKey
ALTER TABLE "pix_reminder_email_logs" ADD CONSTRAINT "pix_reminder_email_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
