import { Request, Response, NextFunction } from "express";
import {
  createPackage,
  getAllPackages,
  getPackageByTrackingId,
  updatePackageStatusByTrackingId,
} from "../services/package.service";
import { successResponse, errorResponse } from "../types/api-response";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const packageData = await createPackage(req.body);
    res.status(201).json(successResponse(packageData, "Package created successfully"));
  } catch (error) {
    next(error as Error);
  }
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packages = await getAllPackages();
    res.status(200).json(successResponse(packages, "Packages fetched successfully"));
  } catch (error) {
    next(error as Error);
  }
};

export const getByTrackingId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackingId = Array.isArray(req.params.trackingId)
      ? req.params.trackingId[0]
      : req.params.trackingId;
    const packageData = await getPackageByTrackingId(trackingId as string);
    if (!packageData) {
      res.status(404).json(
        errorResponse(
          { code: "NOT_FOUND", message: "Package not found", statusCode: 404 },
          "Package not found"
        )
      );
      return;
    }
    res.status(200).json(successResponse(packageData, "Package fetched successfully"));
  } catch (error) {
    next(error as Error);
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
    res.status(200).json(successResponse(updatedPackage, "Package status updated successfully"));
  } catch (error) {
    next(error as Error);
  }
};

export const getTrackingHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trackingId = Array.isArray(req.params.trackingId)
      ? req.params.trackingId[0]
      : req.params.trackingId;
    const packageData = await getPackageByTrackingId(trackingId as string);
    if (!packageData) {
      res.status(404).json(
        errorResponse(
          { code: "NOT_FOUND", message: "Package not found", statusCode: 404 },
          "Package not found"
        )
      );
      return;
    }
    res.status(200).json(successResponse(packageData.statusHistory, "Tracking history fetched successfully"));
  } catch (error) {
    next(error as Error);
  }
};

export const getPublicPackageByTrackingId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const trackingId = Array.isArray(req.params.trackingId)
      ? req.params.trackingId[0]
      : req.params.trackingId;
    const packageData = await getPackageByTrackingId(trackingId as string);
    if (!packageData) {
      res.status(404).json(
        errorResponse(
          { code: "NOT_FOUND", message: "Package not found", statusCode: 404 },
          "Package not found"
        )
      );
      return;
    }

    const publicData = {
      trackingId: packageData.trackingId,
      currentStatus: packageData.currentStatus,
      currentLocation: packageData.currentLocation,
      destinationRegion: packageData.destinationRegion,
      createdAt: packageData.createdAt,
      statusHistory: packageData.statusHistory.map((item) => ({
        status: item.status,
        location: item.location,
        timestamp: item.timestamp,
      })),
    };

    res.status(200).json(successResponse(publicData, "Package fetched successfully"));
  } catch (error) {
    next(error as Error);
  }
};
