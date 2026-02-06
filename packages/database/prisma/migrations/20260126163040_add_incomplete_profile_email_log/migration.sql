-- CreateTable
CREATE TABLE "incomplete_profile_email_logs" (
    "id" TEXT NOT NULL,
    "nanny_id" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incomplete_profile_email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incomplete_profile_email_logs_nanny_id_idx" ON "incomplete_profile_email_logs"("nanny_id");

-- CreateIndex
CREATE INDEX "incomplete_profile_email_logs_sent_at_idx" ON "incomplete_profile_email_logs"("sent_at");

-- AddForeignKey
ALTER TABLE "incomplete_profile_email_logs" ADD CONSTRAINT "incomplete_profile_email_logs_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
