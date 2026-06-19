/*
  Warnings:

  - The values [ARRIVED_AT_REGION] on the enum `PackageStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PackageStatus_new" AS ENUM ('TO_BE_PICKED_UP', 'PICKED_UP', 'ADDED_TO_BAG', 'EN_ROUTE', 'ARRIVED', 'SCHEDULED_FOR_DELIVERY', 'OUT_FOR_DELIVERY');
ALTER TABLE "Package" ALTER COLUMN "currentStatus" TYPE "PackageStatus_new" USING ("currentStatus"::text::"PackageStatus_new");

ALTER TYPE "PackageStatus" RENAME TO "PackageStatus_old";
ALTER TYPE "PackageStatus_new" RENAME TO "PackageStatus";
DROP TYPE "public"."PackageStatus_old";
COMMIT;

-- CreateTable
CREATE TABLE "PackageHistory" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "status" "PackageStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PackageHistory_packageId_idx" ON "PackageHistory"("packageId");

-- AddForeignKey
ALTER TABLE "PackageHistory" ADD CONSTRAINT "PackageHistory_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
