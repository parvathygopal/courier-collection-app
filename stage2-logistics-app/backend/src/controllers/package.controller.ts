import * as packageService from "../services/package.service.js";
import { createPackageSchema } from "../schemas/package.schema.js";
import type { Request, Response, NextFunction } from "express";

export async function createPackage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createPackageSchema.parse(req.body);

    const result = await packageService.createPackage(data);

    res.status(201).json({
      error: null,
      message: "Package created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPackages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await packageService.getPackages(page, limit);

    res.json({
      error: null,
      message: "Packages fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
