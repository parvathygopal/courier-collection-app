-- CreateTable
CREATE TABLE "EtlPushOffset" (
    "key" TEXT NOT NULL,
    "lastPushedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EtlPushOffset_pkey" PRIMARY KEY ("key")
);
