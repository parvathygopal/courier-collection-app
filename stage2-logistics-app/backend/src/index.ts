import dotenv from "dotenv";
// load env first so modules that import `prisma` see DATABASE_URL
dotenv.config();

import app from "./app.js";
import { startPushEtlJob, stopPushEtlJob } from "./services/etl.service.js";
import { startWebhookPackageQueueWorker, stopWebhookPackageQueueWorker } from "./services/webhook.service.js";
import { registerWithStage1 } from "./services/stage1-registration.service.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
  registerWithStage1().catch(console.error);
  startPushEtlJob();
  startWebhookPackageQueueWorker();
});

function gracefulShutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`\n[${signal}] Graceful shutdown initiated`);
  
  stopPushEtlJob();
  stopWebhookPackageQueueWorker();
  // eslint-disable-next-line no-console
  console.log("Workers stopped");
  
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log("HTTP server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    // eslint-disable-next-line no-console
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
