-- CreateTable
CREATE TABLE "compatible_job_email_logs" (
    "id" TEXT NOT NULL,
    "nanny_id" INTEGER NOT NULL,
    "job_id" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compatible_job_email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "compatible_job_email_logs_nanny_id_idx" ON "compatible_job_email_logs"("nanny_id");

-- CreateIndex
CREATE INDEX "compatible_job_email_logs_job_id_idx" ON "compatible_job_email_logs"("job_id");

-- CreateIndex
CREATE INDEX "compatible_job_email_logs_sent_at_idx" ON "compatible_job_email_logs"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "compatible_job_email_logs_nanny_id_job_id_key" ON "compatible_job_email_logs"("nanny_id", "job_id");

-- AddForeignKey
ALTER TABLE "compatible_job_email_logs" ADD CONSTRAINT "compatible_job_email_logs_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compatible_job_email_logs" ADD CONSTRAINT "compatible_job_email_logs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
