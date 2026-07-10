import { NextFunction, Request, Response } from "express";
import { ingestRawUpdates } from "../services/raw-update.service";
import { RawUpdateBulkInput } from "../validators/raw-update.validator";
import { successResponse } from "../types/api-response";

export async function createRawUpdates(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const payload = req.body as RawUpdateBulkInput;
    const result = await ingestRawUpdates(payload);

    return res.status(202).json(successResponse(result, "Raw updates ingested successfully"));
  } catch (error) {
    return next(error as Error);
  }
}
