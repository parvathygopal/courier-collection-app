import * as packageService from "../services/package.service.js";
import {
  createPackageSchema,
  listPackagesQuerySchema,
  packageTrackingParamSchema,
  updatePackageStatusSchema,
} from "../schemas/package.schema.js";
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
    const { page, limit } = listPackagesQuerySchema.parse(req.query);
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

export async function getPackageByTrackingId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { trackingId } = packageTrackingParamSchema.parse(req.params);
    const result = await packageService.getPackageByTrackingId(trackingId);

    res.json({
      error: null,
      message: "Package fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPackageHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { trackingId } = packageTrackingParamSchema.parse(req.params);
    const result =
      await packageService.getPackageHistoryByTrackingId(trackingId);

    res.json({
      error: null,
      message: "Package history fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePackageStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { trackingId } = packageTrackingParamSchema.parse(req.params);
    updatePackageStatusSchema.parse(req.body ?? {});

    const result = await packageService.updatePackageStatus(trackingId);

    res.json({
      error: null,
      message: "Package status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
