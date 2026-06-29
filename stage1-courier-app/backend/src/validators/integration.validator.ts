import { z } from "zod";

export const upsertLogisticsWebhookConfigSchema = z.object({
  logisticsWebhookUrl: z.string().url(),
  logisticsApiKey: z.string().min(1),
});

export type UpsertLogisticsWebhookConfigInput = z.infer<
  typeof upsertLogisticsWebhookConfigSchema
>;
