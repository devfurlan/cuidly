-- CreateEnum
CREATE TYPE "PaymentOperationType" AS ENUM ('CANCEL_SUBSCRIPTION', 'CANCEL_INVOICE', 'RECREATE_SUBSCRIPTION', 'UPDATE_SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "PendingOperationStatus" AS ENUM ('PENDING', 'RETRYING', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "pending_payment_operations" (
    "id" TEXT NOT NULL,
    "type" "PaymentOperationType" NOT NULL,
    "subscription_id" TEXT,
    "payment_id" TEXT,
    "external_id" TEXT,
    "operation_data" JSONB,
    "status" "PendingOperationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "last_attempt_at" TIMESTAMP(3),
    "last_error" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_payment_operations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pending_payment_operations_status_last_attempt_at_idx" ON "pending_payment_operations"("status", "last_attempt_at");

-- CreateIndex
CREATE INDEX "pending_payment_operations_subscription_id_idx" ON "pending_payment_operations"("subscription_id");

-- CreateIndex
CREATE INDEX "pending_payment_operations_payment_id_idx" ON "pending_payment_operations"("payment_id");

-- CreateIndex
CREATE INDEX "pending_payment_operations_type_idx" ON "pending_payment_operations"("type");

-- AddForeignKey
ALTER TABLE "pending_payment_operations" ADD CONSTRAINT "pending_payment_operations_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_payment_operations" ADD CONSTRAINT "pending_payment_operations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
