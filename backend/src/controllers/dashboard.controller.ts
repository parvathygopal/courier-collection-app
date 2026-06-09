import { Request, Response, NextFunction } from "express";
import { getDashboardStats } from "../services/dashboard.service";

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error : unknown) {
    next(error);
  }
};
