import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error";

export function verifyIntegrationAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const adminKey = req.header("x-integration-admin-key");
  const expectedKey = process.env.INTEGRATION_ADMIN_KEY;

  if (!expectedKey) {
    throw AppError.internal("Integration admin key not configured");
  }

  if (!adminKey) {
    throw AppError.unauthorized("Missing integration admin key");
  }

  if (adminKey !== expectedKey) {
    throw AppError.unauthorized("Invalid integration admin key");
  }

  return next();
}
