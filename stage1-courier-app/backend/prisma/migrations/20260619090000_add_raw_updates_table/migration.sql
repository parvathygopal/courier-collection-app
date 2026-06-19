-- CreateTable
CREATE TABLE "raw_updates" (
    "id" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raw_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "raw_updates_processed_createdAt_idx" ON "raw_updates"("processed", "createdAt");
