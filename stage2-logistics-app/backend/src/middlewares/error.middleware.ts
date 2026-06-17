import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { ZodIssue } from "zod";
import { AppError } from "../errors/app.error.js";
import { errorResponse } from "../types/api-response.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Log error for debugging (include stack in non-production)
  // eslint-disable-next-line no-console
  console.error("[errorHandler]", err);
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(
        errorResponse({ code: err.code, message: err.message }, err.message),
      );
  }

  // Zod validation errors -> return 400 with structured details
  if (err instanceof ZodError) {
    const details = err.issues.map((e: ZodIssue) => ({
      path: e.path.join("."),
      message: e.message,
    }));

    const payload = {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      statusCode: 400,
    } as any;
    const response = errorResponse(payload, "Validation failed");
    // include structured details for easier client rendering (only in non-production or always helpful)
    (response as any).details = details;
    if (process.env.NODE_ENV !== "production") {
      // also include original Zod issues for debugging
      (response as any).issues = err.issues;
    }

    return res.status(400).json(response);
  }

  if (err instanceof Error) {
    const payload = { code: "INTERNAL_ERROR", message: err.message };
    const response = errorResponse(payload, "Internal server error");
    if (process.env.NODE_ENV !== "production") {
      // include stack for easier debugging in dev
      // @ts-ignore add stack to response for debugging
      (response as any).stack = err.stack;
    }
    return res.status(500).json(response);
  }

  return res
    .status(500)
    .json(
      errorResponse(
        { code: "INTERNAL_ERROR", message: "Unknown error" },
        "Internal server error",
      ),
    );
}
