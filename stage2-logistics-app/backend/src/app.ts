import express from "express";
import type { Request } from "express";
import packageRoutes from "./routes/package.route.js";
import bagRoutes from "./routes/bag.route.js";
import truckRoutes from "./routes/truck.route.js";
import dashboardRoutes from "./routes/dasboard.routes.js";
import regionRoutes from "./routes/region.route.js";
import webhookRoutes from "./routes/webhook.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import cors from "cors";

const app = express();

const FRONTEND_ORIGINS = process.env.FRONTEND_ORIGINS?.split(",").map((s) =>
  s.trim(),
) ?? [
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: FRONTEND_ORIGINS,
    credentials: true,
  }),
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      (req as Request & { rawBody?: string }).rawBody = buf.toString("utf8");
    },
  }),
);

app.use("/packages", packageRoutes);
app.use("/bags", bagRoutes);
app.use("/trucks", truckRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/regions", regionRoutes);
app.use("/webhooks", webhookRoutes);

app.get("/", (req, res) => {
  res.send("Hello from courier-logistics-app");
});

app.use(errorHandler);

export default app;
