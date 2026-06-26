import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import { webhookCreatePackageSchema } from "../schemas/package.schema.js";
import { enqueuePackageWebhook } from "../services/webhook.service.js";

export async function createPackageFromStage1Webhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const payload = webhookCreatePackageSchema.parse(req.body);
    const apiKey = (req as Request & { integrationApiKey?: string })
      .integrationApiKey;

    if (!apiKey) {
      throw new AppError(
        "UNAUTHORIZED",
        "Validated integration API key is missing",
        401,
      );
    }

    const result = await enqueuePackageWebhook({
      payload,
      apiKey,
    });

    res.status(202).json({
      error: null,
      message: result.duplicate
        ? "Duplicate webhook request received"
        : "Webhook request accepted for processing",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
