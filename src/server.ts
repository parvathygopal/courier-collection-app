import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import packageRoutes from "./routes/package.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/packages", packageRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handling
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
