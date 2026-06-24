import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function verifyIntegration(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const apiKeyFromEnv = process.env.STAGE1_RAW_UPDATES_API_KEY;

  const signingSecretFromEnv = process.env.STAGE1_SIGNING_SECRET;

  const apiKey = req.header("x-api-key");
  const signature = req.header("x-signature") ?? "";
  const timestamp = req.header("x-timestamp") ?? "";

  if (!apiKeyFromEnv || !signingSecretFromEnv) {
    return res.status(500).json({
      error: {
        code: "CONFIGURATION_ERROR",
        message: "Integration secrets not set",
      },
      message: "Configuration error",
      data: null,
    });
  }

  if (!apiKey || !signature || !timestamp) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Missing auth headers" },
      message: "Unauthorized",
      data: null,
    });
  }

  if (apiKey !== apiKeyFromEnv) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Invalid API key" },
      message: "Unauthorized",
      data: null,
    });
  }

  const rawBody = (req as Request & { rawBody?: string }).rawBody ?? "";
  const expected = crypto
    .createHmac("sha256", signingSecretFromEnv)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return res.status(401).json({
      error: {
        code: "INVALID_SIGNATURE",
        message: "Invalid request signature",
      },
      message: "Unauthorized",
      data: null,
    });
  }

  return next();
}
