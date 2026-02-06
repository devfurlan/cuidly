-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "has_user_restriction" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "coupon_allowed_emails" (
    "id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nanny_id" INTEGER,
    "family_id" INTEGER,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_allowed_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coupon_allowed_emails_coupon_id_idx" ON "coupon_allowed_emails"("coupon_id");

-- CreateIndex
CREATE INDEX "coupon_allowed_emails_email_idx" ON "coupon_allowed_emails"("email");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_allowed_emails_coupon_id_email_key" ON "coupon_allowed_emails"("coupon_id", "email");

-- AddForeignKey
ALTER TABLE "coupon_allowed_emails" ADD CONSTRAINT "coupon_allowed_emails_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_allowed_emails" ADD CONSTRAINT "coupon_allowed_emails_nanny_id_fkey" FOREIGN KEY ("nanny_id") REFERENCES "nannies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_allowed_emails" ADD CONSTRAINT "coupon_allowed_emails_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;
