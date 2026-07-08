-- AlterTable
ALTER TABLE "raw_updates" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "raw_updates" ADD COLUMN "maxAttempts" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "raw_updates" ADD COLUMN "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "raw_updates" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropIndex
DROP INDEX "raw_updates_processed_createdAt_idx";

-- CreateIndex
CREATE INDEX "raw_updates_processed_nextAttemptAt_createdAt_idx" ON "raw_updates"("processed", "nextAttemptAt", "createdAt");
