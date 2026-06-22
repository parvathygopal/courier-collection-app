import dotenv from "dotenv";
// load env first so modules that import `prisma` see DATABASE_URL
dotenv.config();

import app from "./app.js";
import { startPushEtlJob } from "./services/etl.service.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
  startPushEtlJob();
});
