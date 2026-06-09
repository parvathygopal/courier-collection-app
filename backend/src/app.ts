import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import packageRoutes from "./routes/package.routes";
import dashboardRoutes from "./routes/dasboard.routes";
import { ZodError } from "zod";

dotenv.config();

const app = express();

const FRONTEND_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: FRONTEND_ORIGINS,
    credentials: true,
  }),
);

// Middleware
app.use(express.json());

// Routes
app.use("/packages", packageRoutes);

// Dashboard: package counts by status
app.use("/dashboard", dashboardRoutes);

// Health check
app.get("/health", (req, res) => {
  const body: ApiResponse<{ status: string }> = {
    error: null,
    message: "Health OK",
    data: { status: "OK" },
  };
  res.json(body);
});

// Error handling
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Validation failed",
      data: null,
      errors,
    } as unknown); // extra details attached
  }

  const message = err instanceof Error ? err.message : String(err);
  return res.status(500).json({
    error: "INTERNAL_ERROR",
    message: message || "Internal server error",
    data: null,
  } as ApiResponse<null>);
});

export default app;
