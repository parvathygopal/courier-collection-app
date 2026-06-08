import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import packageRoutes from "./routes/package.routes";
import dashboardRoutes from "./routes/dasboard.routes";
import { ZodError } from "zod";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/packages", packageRoutes);

// Dashboard: package counts by status
app.use("/dashboard", dashboardRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handling
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ success: false, errors });
  }

  const message = err instanceof Error ? err.message : String(err);
  return res.status(500).json({
    success: false,
    message: message || "Internal server error",
  });
});

export default app;
