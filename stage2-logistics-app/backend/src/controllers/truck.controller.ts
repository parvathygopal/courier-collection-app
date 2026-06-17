import * as truckService from "../services/truck.service.js";
import { createTruckSchema } from "../schemas/truck.schema.js";
import { AppError } from "../errors/app.error.js";
import type { Request, Response, NextFunction } from "express";

export async function createTruck(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createTruckSchema.parse(req.body);

    const result = await truckService.createTruck(data);

    res.status(201).json({
      error: null,
      message: "Truck created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrucks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await truckService.getTrucks(page, limit);

    res.json({
      error: null,
      message: "Trucks fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function assignBagToTruck(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { truckId, bagId } = req.params;

    if (!truckId || Array.isArray(truckId)) {
      throw new AppError(
        "INVALID_TRUCK_ID",
        "The truckId parameter is invalid",
        400,
      );
    }
    if (!bagId || Array.isArray(bagId)) {
      throw new AppError(
        "INVALID_BAG_ID",
        "The bagId parameter is invalid",
        400,
      );
    }

    const result = await truckService.assignBagToTruck(truckId, bagId);

    res.json({
      error: null,
      message: "Bag assigned to truck successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
