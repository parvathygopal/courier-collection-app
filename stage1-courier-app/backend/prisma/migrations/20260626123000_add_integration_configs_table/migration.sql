-- CreateTable
CREATE TABLE "integration_configs" (
    "key" TEXT NOT NULL,
    "logisticsWebhookUrl" TEXT NOT NULL,
    "logisticsApiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_configs_pkey" PRIMARY KEY ("key")
);
