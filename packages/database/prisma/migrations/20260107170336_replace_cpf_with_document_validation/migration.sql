/*
  Warnings:

  - You are about to drop the column `cpf_validated` on the `nannies` table. All the data in the column will be lost.
  - You are about to drop the column `cpf_validation_date` on the `nannies` table. All the data in the column will be lost.
  - You are about to drop the column `cpf_validation_message` on the `nannies` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "nannies_cpf_validated_idx";

-- AlterTable
ALTER TABLE "nannies" DROP COLUMN "cpf_validated",
DROP COLUMN "cpf_validation_date",
DROP COLUMN "cpf_validation_message",
ADD COLUMN     "document_expiration_date" DATE,
ADD COLUMN     "document_type" TEXT,
ADD COLUMN     "document_validated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "document_validation_date" TIMESTAMP(3),
ADD COLUMN     "document_validation_message" TEXT;

-- AlterTable
ALTER TABLE "validation_requests" ADD COLUMN     "documentoscopia_result" JSONB;

-- CreateIndex
CREATE INDEX "nannies_document_validated_idx" ON "nannies"("document_validated");
