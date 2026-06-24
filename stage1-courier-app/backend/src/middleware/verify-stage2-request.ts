import type { NextFunction, Request, Response } from "express";
import { verifySignature } from "../security/hmac";

export function verifyStage2Request(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const apiKey = req.header("x-api-key");
  const signature = req.header("x-signature");
  const timestamp = req.header("x-timestamp");

  const expectedApiKey = process.env.STAGE1_RAW_UPDATES_API_KEY;
  const secret = process.env.STAGE2_TO_STAGE1_HMAC_SECRET;

  if (!expectedApiKey || !secret) {
    return res.status(500).json({
      error: "AUTH_CONFIG_MISSING",
      message: "Missing Stage 2 authentication configuration",
      data: null,
    });
  }

  if (!apiKey || !signature || !timestamp) {
    return res.status(401).json({
      error: "UNSIGNED_REQUEST",
      message: "Missing authentication headers",
      data: null,
    });
  }

  if (apiKey !== expectedApiKey) {
    return res.status(401).json({
      error: "INVALID_API_KEY",
      message: "Invalid API key",
      data: null,
    });
  }

  const rawBody = (
    (req as Request & { rawBody?: string }).rawBody ?? ""
  ).toString();
  const result = verifySignature({
    rawBody,
    timestamp,
    signature,
    secret,
  });

  if (!result.ok) {
    return res.status(401).json({
      error: result.reason,
      message: "Invalid request signature",
      data: null,
    });
  }

  return next();
}
