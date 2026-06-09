import cors from "cors";
import express from "express";

import dotenv from "dotenv";
import packageRoutes from "./routes/package.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const FRONTEND_ORIGINS = (
  process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173"
).split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests (curl/postman) with no origin
      if (!origin) return callback(null, true);
      if (FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json());

// Routes
app.use("/packages", packageRoutes);

app.get("/test-cors", (req, res) => {
  res.json({ works: true });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handling
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  },
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
