import express from "express";
import packageRoutes from "./routes/package.route.js";
import bagRoutes from "./routes/bag.route.js";
import truckRoutes from "./routes/truck.route.js";
import dashboardRoutes from "./routes/dasboard.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import cors from "cors";

const app = express();

const FRONTEND_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

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

app.get("/", (req, res) => {
  res.send("Hello from courier-logistics-app");
});

app.use(errorHandler);

export default app;
