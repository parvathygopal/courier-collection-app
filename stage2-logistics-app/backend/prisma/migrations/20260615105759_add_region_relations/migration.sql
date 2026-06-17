-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_sourceRegionId_fkey" FOREIGN KEY ("sourceRegionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_destinationRegionId_fkey" FOREIGN KEY ("destinationRegionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
