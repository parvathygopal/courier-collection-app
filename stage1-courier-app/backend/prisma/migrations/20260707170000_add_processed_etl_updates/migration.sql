-- CreateTable
CREATE TABLE "processed_etl_updates" (
    "updateId" TEXT NOT NULL,
    "rawUpdateId" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_etl_updates_pkey" PRIMARY KEY ("updateId")
);
