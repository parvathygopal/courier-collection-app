import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { signRawBody } from "../security/hmac";
import { getLogisticsWebhookConfigInternal } from "./integration.service";

type Stage2WebhookPayload = {
  trackingId: string;
  senderAddress: string;
  receiverAddress: string;
  sourceRegionCode: string;
  destinationRegionCode: string;
  weight: number;
};

let outboxIntervalRef: NodeJS.Timeout | null = null;

async function resolveWebhookDestinationConfig() {
  const registration = await getLogisticsWebhookConfigInternal();

  if (registration?.isActive) {
    return {
      webhookUrl: registration.logisticsWebhookUrl,
      apiKey: registration.logisticsApiKey,
    };
  }

  return {
    webhookUrl: process.env.STAGE2_WEBHOOK_URL,
    apiKey: process.env.STAGE1_RAW_UPDATES_API_KEY,
  };
}

function backoffDelaySeconds(attempt: number) {
  const baseSeconds = 10;
  const maxSeconds = 300;
  return Math.min(baseSeconds * 2 ** Math.max(0, attempt - 1), maxSeconds);
}

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function sendStage2Webhook(payload: Stage2WebhookPayload) {
  const { webhookUrl, apiKey } = await resolveWebhookDestinationConfig();
  const secret = process.env.STAGE1_SIGNING_SECRET;

  if (!webhookUrl) {
    throw new Error("STAGE2_WEBHOOK_URL not configured");
  }

  if (!apiKey || !secret) {
    throw new Error("Stage1 to Stage2 auth config missing");
  }

  const rawBody = JSON.stringify(payload);
  const timestamp = Date.now().toString();
  const signature = signRawBody(rawBody, timestamp, secret);

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "x-timestamp": timestamp,
      "x-signature": signature,
    },
    body: rawBody,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Webhook failed (${response.status}): ${text}`);
  }
}

export async function enqueueWebhookOutbox(payload: Stage2WebhookPayload) {
  try {
    return await prisma.webhookOutbox.create({
      data: {
        trackingId: payload.trackingId,
        payload: payload as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        trackingId: true,
        status: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (!isUniqueViolation(error)) {
      throw error;
    }

    return prisma.webhookOutbox.findUnique({
      where: {
        trackingId: payload.trackingId,
      },
      select: {
        id: true,
        trackingId: true,
        status: true,
        createdAt: true,
      },
    });
  }
}

export async function processOneWebhookOutboxItem() {
  const candidate = await prisma.webhookOutbox.findFirst({
    where: {
      status: {
        in: ["PENDING", "FAILED"],
      },
      nextAttemptAt: {
        lte: new Date(),
      },
      attempts: {
        lt: 5,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      trackingId: true,
      payload: true,
      attempts: true,
      maxAttempts: true,
    },
  });

  if (!candidate) {
    return { processed: false, reason: "No pending webhook outbox items" };
  }

  const claimed = await prisma.webhookOutbox.updateMany({
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
      lastError: null,
    },
  });

  if (claimed.count === 0) {
    return { processed: false, reason: "Already claimed" };
  }

  try {
    await sendStage2Webhook(
      candidate.payload as unknown as Stage2WebhookPayload,
    );

    await prisma.webhookOutbox.update({
      where: {
        id: candidate.id,
      },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
        nextAttemptAt: new Date(),
      },
    });

    return { processed: true, trackingId: candidate.trackingId };
  } catch (error) {
    const latest = await prisma.webhookOutbox.findUnique({
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
    const nextAttemptAt = new Date(
      Date.now() + backoffDelaySeconds(attempts) * 1000,
    );

    await prisma.webhookOutbox.update({
      where: {
        id: candidate.id,
      },
      data: {
        status: "FAILED",
        processedAt: shouldRetry ? null : new Date(),
        nextAttemptAt,
        lastError: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return {
      processed: false,
      trackingId: candidate.trackingId,
      reason: shouldRetry ? "Failed; retry scheduled" : "Failed permanently",
    };
  }
}

export function startWebhookOutboxWorker() {
  if (outboxIntervalRef) {
    return;
  }

  const enabled = process.env.ENABLE_STAGE1_WEBHOOK_OUTBOX_WORKER !== "false";

  if (!enabled) {
    return;
  }

  const intervalMs = Number(
    process.env.STAGE1_WEBHOOK_OUTBOX_INTERVAL_MS ?? 2000,
  );

  const run = async () => {
    try {
      const result = await processOneWebhookOutboxItem();
      if (result.processed || result.reason === "Failed permanently") {
        // eslint-disable-next-line no-console
        console.log("[WebhookOutbox] run result", result);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[WebhookOutbox] worker failed", error);
    }
  };

  void run();
  outboxIntervalRef = setInterval(() => {
    void run();
  }, intervalMs);

  // eslint-disable-next-line no-console
  console.log(`[WebhookOutbox] Worker started with interval ${intervalMs}ms`);
}

export function stopWebhookOutboxWorker() {
  if (!outboxIntervalRef) {
    return;
  }

  clearInterval(outboxIntervalRef);
  outboxIntervalRef = null;
}
