import * as bagService from "../services/bag.service.js";
import { createBagSchema } from "../schemas/bag.schema.js";
import { AppError } from "../errors/app.error.js";
import type { Request, Response, NextFunction } from "express";

export async function createBag(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createBagSchema.parse(req.body);

    const result = await bagService.createBag(data);

    res.status(201).json({
      error: null,
      message: "Bag created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBags(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await bagService.getBags(page, limit);

    res.json({
      error: null,
      message: "Bags fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function assignPackageToBag(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { bagId, packageId } = req.params;

    if (!bagId || Array.isArray(bagId)) {
      throw new AppError("INVALID_BAG_ID", "Invalid bagId parameter", 400);
    }
    if (!packageId || Array.isArray(packageId)) {
      throw new AppError(
        "INVALID_PACKAGE_ID",
        "Invalid packageId parameter",
        400,
      );
    }

    const result = await bagService.assignPackageToBag(bagId, packageId);

    res.json({
      error: null,
      message: "Package assigned to bag successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
