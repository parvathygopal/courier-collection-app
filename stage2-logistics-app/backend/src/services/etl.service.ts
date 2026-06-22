import { pushStatusUpdatesToStage1 } from "./package.service.js";

let etlIntervalRef: NodeJS.Timeout | null = null;

export function startPushEtlJob() {
  const enabled = process.env.ENABLE_STAGE3_PUSH_ETL === "true";

  if (!enabled) {
    return;
  }

  const intervalMs = Number(process.env.ETL_PUSH_INTERVAL_MS ?? 6 * 60 * 60 * 1000);

  const run = async () => {
    try {
      const result = await pushStatusUpdatesToStage1();
      // eslint-disable-next-line no-console
      console.log("[ETL] push status result", result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[ETL] push status failed", error);
    }
  };

  if (process.env.ETL_PUSH_RUN_ON_START === "true") {
    void run();
  }

  etlIntervalRef = setInterval(() => {
    void run();
  }, intervalMs);

  // eslint-disable-next-line no-console
  console.log(`[ETL] Push job started with interval ${intervalMs}ms`);
}

export function stopPushEtlJob() {
  if (!etlIntervalRef) {
    return;
  }

  clearInterval(etlIntervalRef);
  etlIntervalRef = null;
}
