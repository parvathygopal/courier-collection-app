import { NextFunction, Request, Response } from "express";
import {
  getLogisticsWebhookConfig,
  upsertLogisticsWebhookConfig,
} from "../services/integration.service";
import { UpsertLogisticsWebhookConfigInput } from "../validators/integration.validator";

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
      data: updated,
    });
  } catch (error) {
    return next(error as Error);
  }
}
