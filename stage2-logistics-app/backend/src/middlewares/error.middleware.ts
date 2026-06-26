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
  void req;
  void next;

  // eslint-disable-next-line no-console
  console.error("[errorHandler]", err);

  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(
        errorResponse({ code: err.code, message: err.message }, err.message),
      );
  }

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
    (response as any).details = details;

    return res.status(400).json(response);
  }

  return res
    .status(500)
    .json(
      errorResponse(
        { code: "INTERNAL_ERROR", message: "Internal server error" },
        "Internal server error",
      ),
    );
}
