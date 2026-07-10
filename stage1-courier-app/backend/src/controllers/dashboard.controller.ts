import { Request, Response, NextFunction } from "express";
import { getDashboardStats } from "../services/dashboard.service";
import { successResponse } from "../types/api-response";

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json(successResponse(stats, "Dashboard stats fetched successfully"));
  } catch (error : unknown) {
    next(error);
  }
};
