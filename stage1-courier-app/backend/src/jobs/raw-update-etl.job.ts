import { processRawUpdatesBatch } from "../services/raw-update.service";

let intervalRef: NodeJS.Timeout | null = null;
let isProcessing = false;

export function startRawUpdatesEtlJob() {
  if (intervalRef) {
    return;
  }

  const intervalMs = Number(process.env.RAW_UPDATES_ETL_INTERVAL_MS ?? 60_000);
  const batchSize = Number(process.env.RAW_UPDATES_ETL_BATCH_SIZE ?? 100);

  const run = async () => {
    if (isProcessing) {
      return;
    }

    isProcessing = true;
    try {
      const result = await processRawUpdatesBatch(batchSize);
      if (result.fetched > 0) {
        console.log("Raw updates ETL batch", result);
      }
    } catch (error) {
      console.error("Raw updates ETL failed", error);
    } finally {
      isProcessing = false;
    }
  };

  void run();
  intervalRef = setInterval(() => {
    void run();
  }, intervalMs);

  console.log(
    `Raw updates ETL job started (interval: ${intervalMs}ms, batch: ${batchSize})`,
  );
}
