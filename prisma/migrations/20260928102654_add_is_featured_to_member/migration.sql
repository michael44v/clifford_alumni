-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'KORAPAY';

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
