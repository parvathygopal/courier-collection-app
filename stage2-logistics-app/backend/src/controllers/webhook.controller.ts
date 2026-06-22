import type { NextFunction, Request, Response } from "express";
import { webhookCreatePackageSchema } from "../schemas/package.schema.js";
import { createPackageFromWebhook } from "../services/package.service.js";

export async function createPackageFromStage1Webhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Webhook body:", req.body);
    const payload = webhookCreatePackageSchema.parse(req.body);
    const result = await createPackageFromWebhook(payload);

    res.status(201).json({
      error: null,
      message: "Package created from webhook successfully",
      data: result,
    });
  } catch (error) {
    console.error("Validation Error:", error);
    next(error);
  }
}
