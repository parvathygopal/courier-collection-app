-- CreateEnum
CREATE TYPE "WebhookQueueStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "WebhookPackageQueue" (
    "id" TEXT NOT NULL,
    "apiKeyFingerprint" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "sourceRegionCode" TEXT NOT NULL,
    "destinationRegionCode" TEXT NOT NULL,
    "status" "WebhookQueueStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookPackageQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookPackageQueue_status_nextAttemptAt_createdAt_idx" ON "WebhookPackageQueue"("status", "nextAttemptAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookPackageQueue_apiKeyFingerprint_trackingId_key" ON "WebhookPackageQueue"("apiKeyFingerprint", "trackingId");
