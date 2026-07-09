import { prisma } from "../config/prisma";
import { UpsertLogisticsWebhookConfigInput } from "../validators/integration.validator";

const LOGISTICS_WEBHOOK_CONFIG_KEY = "logistics_webhook";

function maskApiKey(apiKey: string | null): string | null {
  if (!apiKey || apiKey.length < 4) {
    return "****";
  }
  return "****" + apiKey.slice(-4);
}

export async function getLogisticsWebhookConfigInternal() {
  const config = await prisma.integrationConfig.findUnique({
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

  return config;
}

export async function getLogisticsWebhookConfig() {
  const config = await getLogisticsWebhookConfigInternal();

  if (!config) {
    return null;
  }

  return {
    ...config,
    logisticsApiKey: maskApiKey(config.logisticsApiKey),
  };
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
