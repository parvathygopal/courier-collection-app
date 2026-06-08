/*
  Warnings:

  - You are about to drop the column `receiverName` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `senderName` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `sales` table. All the data in the column will be lost.
  - Added the required column `destinationRegion` to the `packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceRegion` to the `packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "packages" DROP COLUMN "receiverName",
DROP COLUMN "senderName",
ADD COLUMN     "destinationRegion" TEXT NOT NULL,
ADD COLUMN     "sourceRegion" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "paymentMethod";

-- DropEnum
DROP TYPE "PaymentMethod";
