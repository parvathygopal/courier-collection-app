import { NextFunction, Request, Response } from "express";
import { ingestRawUpdates } from "../services/raw-update.service";
import { RawUpdateBulkInput } from "../validators/raw-update.validator";

export async function createRawUpdates(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const payload = req.body as RawUpdateBulkInput;
    const result = await ingestRawUpdates(payload);

    return res.status(202).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error as Error);
  }
}
