import { NextFunction, Request, Response } from "express";
import {
  getLogisticsWebhookConfig,
  upsertLogisticsWebhookConfig,
} from "../services/integration.service";
import { UpsertLogisticsWebhookConfigInput } from "../validators/integration.validator";
import { successResponse } from "../types/api-response";

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
    res.status(200).json(successResponse(config, "Logistics webhook config fetched successfully"));
  } catch (error) {
    next(error as Error);
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
    res.status(200).json(
      successResponse(
        {
          ...updated,
          logisticsApiKey: maskApiKey(updated.logisticsApiKey),
        },
        "Logistics webhook registration saved",
      )
    );
  } catch (error) {
    next(error as Error);
  }
}
