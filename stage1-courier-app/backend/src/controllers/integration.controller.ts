import { NextFunction, Request, Response } from "express";
import {
  getLogisticsWebhookConfig,
  upsertLogisticsWebhookConfig,
} from "../services/integration.service";
import { UpsertLogisticsWebhookConfigInput } from "../validators/integration.validator";

function maskApiKey(apiKey: string | null): string | null {
  if (!apiKey || apiKey.length < 4) {
    return "****";
  }
  return "****" + apiKey.slice(-4);
}

export async function getLogisticsWebhookRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    void req;
    const config = await getLogisticsWebhookConfig();

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    return next(error as Error);
  }
}

export async function putLogisticsWebhookRegistration(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const payload = req.body as UpsertLogisticsWebhookConfigInput;
    const updated = await upsertLogisticsWebhookConfig(payload);

    return res.status(200).json({
      success: true,
      message: "Logistics webhook registration saved",
      data: {
        ...updated,
        logisticsApiKey: maskApiKey(updated.logisticsApiKey),
      },
    });
  } catch (error) {
    return next(error as Error);
  }
}
