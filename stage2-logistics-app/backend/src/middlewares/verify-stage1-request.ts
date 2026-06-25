import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";
import { verifySignature } from "../security/hmac.js";

export function verifyIntegration(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  void res;

  const apiKeyFromEnv =
    process.env.WEBHOOK_API_KEY ?? process.env.STAGE1_RAW_UPDATES_API_KEY;
  const signingSecretFromEnv =
    process.env.WEBHOOK_SIGNING_SECRET ?? process.env.STAGE1_SIGNING_SECRET;

  const apiKey = req.header("x-api-key");
  const signature = req.header("x-signature") ?? "";
  const timestamp = req.header("x-timestamp") ?? "";

  if (!apiKeyFromEnv || !signingSecretFromEnv) {
    return next(
      new AppError(
        "CONFIGURATION_ERROR",
        "Integration webhook secrets are not configured",
        500,
      ),
    );
  }

  if (!apiKey || !signature || !timestamp) {
    return next(
      new AppError("UNAUTHORIZED", "Missing authentication headers", 401),
    );
  }

  if (apiKey !== apiKeyFromEnv) {
    return next(new AppError("UNAUTHORIZED", "Invalid API key", 401));
  }

  const rawBody = (req as Request & { rawBody?: string }).rawBody ?? "";
  const verification = verifySignature({
    rawBody,
    timestamp,
    signature,
    secret: signingSecretFromEnv,
  });

  if (!verification.ok) {
    return next(
      new AppError(
        verification.reason,
        verification.reason === "STALE_TIMESTAMP"
          ? "Request timestamp is outside allowed window"
          : "Invalid request signature",
        401,
      ),
    );
  }

  (req as Request & { integrationApiKey?: string }).integrationApiKey = apiKey;

  return next();
}
