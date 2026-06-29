import { prisma } from "../config/prisma";
import { UpsertLogisticsWebhookConfigInput } from "../validators/integration.validator";

const LOGISTICS_WEBHOOK_CONFIG_KEY = "logistics_webhook";

export async function getLogisticsWebhookConfig() {
  return prisma.integrationConfig.findUnique({
    where: {
      key: LOGISTICS_WEBHOOK_CONFIG_KEY,
    },
    select: {
      logisticsWebhookUrl: true,
      logisticsApiKey: true,
      isActive: true,
      updatedAt: true,
    },
  });
}

export async function upsertLogisticsWebhookConfig(
  payload: UpsertLogisticsWebhookConfigInput,
) {
  return prisma.integrationConfig.upsert({
    where: {
      key: LOGISTICS_WEBHOOK_CONFIG_KEY,
    },
    create: {
      key: LOGISTICS_WEBHOOK_CONFIG_KEY,
      logisticsWebhookUrl: payload.logisticsWebhookUrl,
      logisticsApiKey: payload.logisticsApiKey,
      isActive: true,
    },
    update: {
      logisticsWebhookUrl: payload.logisticsWebhookUrl,
      logisticsApiKey: payload.logisticsApiKey,
      isActive: true,
    },
    select: {
      logisticsWebhookUrl: true,
      logisticsApiKey: true,
      isActive: true,
      updatedAt: true,
    },
  });
}
