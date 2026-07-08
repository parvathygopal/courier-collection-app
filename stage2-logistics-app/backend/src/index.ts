import dotenv from "dotenv";
// load env first so modules that import `prisma` see DATABASE_URL
dotenv.config();

import app from "./app.js";
import { startPushEtlJob } from "./services/etl.service.js";
import { startWebhookPackageQueueWorker } from "./services/webhook.service.js";
import { registerWithStage1 } from "./services/stage1-registration.service.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
  registerWithStage1().catch(console.error);
  startPushEtlJob();
  startWebhookPackageQueueWorker();
});
