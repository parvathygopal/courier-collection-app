import { Request, Response, NextFunction } from "express";
import {
  createPackage,
  getAllPackages,
  getPackageByTrackingId,
  updatePackageStatusByTrackingId,
} from "../services/package.service";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const packageData = await createPackage(req.body);

    res.status(201).json({ success: true, data: packageData });
  } catch (error) {
    next(error as Error);
  }
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packages = await getAllPackages();
    return res.status(200).json({ success: true, data: packages });
  } catch (error) {
    return next(error as Error);
  }
};

export const getByTrackingId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackingId = Array.isArray(req.params.trackingId)
      ? req.params.trackingId[0]
      : req.params.trackingId;
    const packageData = await getPackageByTrackingId(trackingId as string);
    if (!packageData) {
      return res.status(404).json({ error: "Package not found" });
    }
    return res.status(200).json({ success: true, data: packageData });
  } catch (error) {
    return next(error as Error);
  }
};

export const updatePackageStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackingId = Array.isArray(req.params.trackingId)
      ? req.params.trackingId[0]
      : req.params.trackingId;
    const { location } = req.body;
    const updatedPackage = await updatePackageStatusByTrackingId(
      trackingId as string,
      location,
    );
    if (!updatedPackage) {
      return res.status(404).json({ error: "Package not found" });
    }
    return res.status(200).json({ success: true, data: updatedPackage });
  } catch (error) {
    return next(error as Error);
  }
};

export const getTrackingHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackingId = Array.isArray(req.params.trackingId)
      ? req.params.trackingId[0]
      : req.params.trackingId;
    const packageData = await getPackageByTrackingId(trackingId as string);
    if (!packageData) {
      return res.status(404).json({ error: "Package not found" });
    }
    return res.status(200).json({ success: true, data: packageData.statusHistory });
  } catch (error) {
    return next(error as Error);
  }
};
