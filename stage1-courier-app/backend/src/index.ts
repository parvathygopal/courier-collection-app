// src/index.ts

import dotenv from "dotenv";
import app from "./app";
import { startRawUpdatesEtlJob } from "./jobs/raw-update-etl.job";

dotenv.config();

const PORT = process.env.PORT || 3001;

console.log("STAGE 2 BACKEND RUNNING");

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startRawUpdatesEtlJob();
});
