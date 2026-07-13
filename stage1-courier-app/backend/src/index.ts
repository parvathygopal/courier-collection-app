// src/index.ts

import dotenv from "dotenv";
import app from "./app";
import { startRawUpdatesEtlJob, stopRawUpdatesEtlJob } from "./jobs/raw-update-etl.job";
import { startWebhookOutboxWorker, stopWebhookOutboxWorker } from "./services/webhook-outbox.service";

dotenv.config();

const PORT = process.env.PORT || 3001;

console.log("STAGE 1 BACKEND RUNNING");

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startRawUpdatesEtlJob();
  startWebhookOutboxWorker();
});

function gracefulShutdown(signal: string) {
  console.log(`\n[${signal}] Graceful shutdown initiated`);
  
  stopRawUpdatesEtlJob();
  stopWebhookOutboxWorker();
  console.log("Workers stopped");
  
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
