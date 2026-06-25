import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/app.error.js";
import { prisma } from "../lib/prisma.js";
import type { WebhookCreatePackageInput } from "../schemas/package.schema.js";
import { createPackageFromWebhook } from "./package.service.js";

type QueueProcessingResult = {
  processed: boolean;
  queueItemId?: string;
  skipped?: boolean;
  reason?: string;
};

let queueWorkerIntervalRef: NodeJS.Timeout | null = null;

function fingerprintApiKey(apiKey: string) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

function isPrismaUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function backoffDelaySeconds(attempt: number) {
  const base = 10;
  const max = 120;
  return Math.min(base * 2 ** Math.max(0, attempt - 1), max);
}

export async function enqueuePackageWebhook(params: {
  payload: WebhookCreatePackageInput;
  apiKey: string;
}) {
  const { payload, apiKey } = params;
  const apiKeyFingerprint = fingerprintApiKey(apiKey);

  try {
    const created = await prisma.webhookPackageQueue.create({
      data: {
        apiKeyFingerprint,
        trackingId: payload.trackingId,
        sourceRegionCode: payload.sourceRegionCode,
        destinationRegionCode: payload.destinationRegionCode,
      },
      select: {
        id: true,
        status: true,
        trackingId: true,
        createdAt: true,
      },
    });

    return {
      accepted: true,
      duplicate: false,
      queueItem: created,
    };
  } catch (error) {
    if (!isPrismaUniqueViolation(error)) {
      throw new AppError(
        "QUEUE_ENQUEUE_FAILED",
        "Failed to enqueue webhook package",
        500,
      );
    }

    const existing = await prisma.webhookPackageQueue.findUnique({
      where: {
        apiKeyFingerprint_trackingId: {
          apiKeyFingerprint,
          trackingId: payload.trackingId,
        },
      },
      select: {
        id: true,
        status: true,
        trackingId: true,
        createdAt: true,
        processedAt: true,
      },
    });

    if (!existing) {
      throw new AppError(
        "QUEUE_LOOKUP_FAILED",
        "Failed to resolve duplicated webhook package",
        500,
      );
    }

    return {
      accepted: true,
      duplicate: true,
      queueItem: existing,
    };
  }
}

export async function processOnePendingPackageWebhook(): Promise<QueueProcessingResult> {
  const candidate = await prisma.webhookPackageQueue.findFirst({
    where: {
      status: {
        in: ["PENDING", "FAILED"],
      },
      attempts: {
        lt: 5,
      },
      nextAttemptAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      trackingId: true,
      sourceRegionCode: true,
      destinationRegionCode: true,
      attempts: true,
      maxAttempts: true,
    },
  });

  if (!candidate) {
    return {
      processed: false,
      skipped: true,
      reason: "No pending queue items",
    };
  }

  const claimed = await prisma.webhookPackageQueue.updateMany({
    where: {
      id: candidate.id,
      status: {
        in: ["PENDING", "FAILED"],
      },
    },
    data: {
      status: "PROCESSING",
      attempts: {
        increment: 1,
      },
      lockedAt: new Date(),
      lastError: null,
    },
  });

  if (claimed.count === 0) {
    return {
      processed: false,
      skipped: true,
      reason: "Queue item already claimed",
      queueItemId: candidate.id,
    };
  }

  try {
    await createPackageFromWebhook({
      trackingId: candidate.trackingId,
      sourceRegionCode: candidate.sourceRegionCode,
      destinationRegionCode: candidate.destinationRegionCode,
    });

    await prisma.webhookPackageQueue.update({
      where: {
        id: candidate.id,
      },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        lockedAt: null,
        nextAttemptAt: new Date(),
      },
    });

    return {
      processed: true,
      queueItemId: candidate.id,
    };
  } catch (error) {
    if (error instanceof AppError && error.code === "TRACKING_ID_ALREADY_EXISTS") {
      await prisma.webhookPackageQueue.update({
        where: {
          id: candidate.id,
        },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
          lockedAt: null,
          lastError: null,
        },
      });

      return {
        processed: true,
        queueItemId: candidate.id,
      };
    }

    const latest = await prisma.webhookPackageQueue.findUnique({
      where: {
        id: candidate.id,
      },
      select: {
        attempts: true,
        maxAttempts: true,
      },
    });

    const attempts = latest?.attempts ?? candidate.attempts + 1;
    const maxAttempts = latest?.maxAttempts ?? candidate.maxAttempts;
    const shouldRetry = attempts < maxAttempts;
    const retryDelaySeconds = backoffDelaySeconds(attempts);
    const nextAttemptAt = new Date(Date.now() + retryDelaySeconds * 1000);

    await prisma.webhookPackageQueue.update({
      where: {
        id: candidate.id,
      },
      data: {
        status: "FAILED",
        lockedAt: null,
        processedAt: shouldRetry ? null : new Date(),
        nextAttemptAt,
        lastError: error instanceof Error ? error.message : "Unknown queue error",
      },
    });

    return {
      processed: false,
      queueItemId: candidate.id,
      skipped: true,
      reason: shouldRetry ? "Failed, scheduled for retry" : "Failed permanently",
    };
  }
}

export function startWebhookPackageQueueWorker() {
  const enabled = process.env.ENABLE_STAGE3_WEBHOOK_WORKER !== "false";

  if (!enabled || queueWorkerIntervalRef) {
    return;
  }

  const intervalMs = Number(process.env.WEBHOOK_QUEUE_INTERVAL_MS ?? 2000);

  const run = async () => {
    try {
      const result = await processOnePendingPackageWebhook();

      if (result.processed || result.reason === "Failed permanently") {
        // eslint-disable-next-line no-console
        console.log("[WebhookQueue] run result", result);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[WebhookQueue] worker failed", error);
    }
  };

  if (process.env.WEBHOOK_QUEUE_RUN_ON_START !== "false") {
    void run();
  }

  queueWorkerIntervalRef = setInterval(() => {
    void run();
  }, intervalMs);

  // eslint-disable-next-line no-console
  console.log(`[WebhookQueue] Worker started with interval ${intervalMs}ms`);
}

export function stopWebhookPackageQueueWorker() {
  if (!queueWorkerIntervalRef) {
    return;
  }

  clearInterval(queueWorkerIntervalRef);
  queueWorkerIntervalRef = null;
}
