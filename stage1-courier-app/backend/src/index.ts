// src/index.ts

import dotenv from "dotenv";
import app from "./app";
import { startRawUpdatesEtlJob } from "./jobs/raw-update-etl.job";
import { startWebhookOutboxWorker } from "./services/webhook-outbox.service";

dotenv.config();

const PORT = process.env.PORT || 3001;

console.log("STAGE 1 BACKEND RUNNING");

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startRawUpdatesEtlJob();
  startWebhookOutboxWorker();
});
