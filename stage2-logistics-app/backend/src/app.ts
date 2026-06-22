import express from "express";
import packageRoutes from "./routes/package.route.js";
import bagRoutes from "./routes/bag.route.js";
import truckRoutes from "./routes/truck.route.js";
import dashboardRoutes from "./routes/dasboard.routes.js";
import regionRoutes from "./routes/region.route.js";
import webhookRoutes from "./routes/webhook.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import cors from "cors";

const app = express();

const FRONTEND_ORIGINS = ["http://localhost:5174", "http://127.0.0.1:5174"];

app.use(
  cors({
    origin: FRONTEND_ORIGINS,
    credentials: true,
  }),
);

app.use(express.json());

app.use("/packages", packageRoutes);
app.use("/bags", bagRoutes);
app.use("/trucks", truckRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/regions", regionRoutes);
app.use("/webhook", webhookRoutes);

app.get("/", (req, res) => {
  res.send("Hello from courier-logistics-app");
});

app.use(errorHandler);

export default app;
