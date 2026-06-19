import type { Request, Response, NextFunction } from "express";
import { getDashboardStats } from "../services/dashboard.service.js";

export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({
      error: null,
      message: "Dashboard fetched successfully",
      data: stats,
    });
  } catch (error: unknown) {
    next(error);
  }
};
