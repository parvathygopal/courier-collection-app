import type { NextFunction, Request, Response } from "express";
import * as regionService from "../services/region.service.js";

export async function getRegions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await regionService.getRegions();

    res.json({
      error: null,
      message: "Regions fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
