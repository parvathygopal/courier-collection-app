-- AlterTable
ALTER TABLE "Bag" ADD COLUMN     "truckId" TEXT;

-- AddForeignKey
ALTER TABLE "Bag" ADD CONSTRAINT "Bag_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;
