-- AlterEnum
ALTER TYPE "DiscountType" ADD VALUE 'FREE_TRIAL_DAYS';

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "trial_end_date" TIMESTAMP(3);
