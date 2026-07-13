import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import request from "supertest";
import app from "../src/app";
import {
  setupTestDatabase,
  teardownTestDatabase,
  clearTestDatabase,
  getPrismaClient,
} from "./utils/db";
import { createMockPackageData } from "./utils/fixtures";
import {
  processOneWebhookOutboxItem,
  enqueueWebhookOutbox,
} from "../src/services/webhook-outbox.service";

const prisma = getPrismaClient();

describe("Webhook Integration - Round Trip", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    // Mock fetch for webhook calls
    global.fetch = vi.fn();
  });

  afterEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("should create package and enqueue webhook outbox item", async () => {
    const packageData = createMockPackageData();

    const response = await request(app)
      .post("/packages")
      .send(packageData)
      .expect(201);

    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("trackingId");

    const trackingId = response.body.data.trackingId;

    // Verify package was created
    const pkg = await prisma.package.findUnique({
      where: { trackingId },
      include: { statusHistory: true },
    });

    expect(pkg).toBeDefined();
    expect(pkg!.currentStatus).toBe("CREATED");
    expect(pkg!.statusHistory).toHaveLength(1);
    expect(pkg!.statusHistory[0].status).toBe("CREATED");

    // Verify webhook outbox entry was created
    const outboxEntry = await prisma.webhookOutbox.findUnique({
      where: { trackingId },
    });

    expect(outboxEntry).toBeDefined();
    expect(outboxEntry!.status).toBe("PENDING");
    expect(outboxEntry!.attempts).toBe(0);
    expect(outboxEntry!.payload).toMatchObject({
      trackingId,
      sourceRegionCode: packageData.sourceRegion,
      destinationRegionCode: packageData.destinationRegion,
      weight: packageData.weight,
    });
  });

  it("should process webhook outbox entry and mark as completed", async () => {
    const packageData = createMockPackageData();

    // Create package
    const createResponse = await request(app)
      .post("/packages")
      .send(packageData)
      .expect(201);

    const trackingId = createResponse.body.data.trackingId;

    // Mock successful webhook call
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve("OK"),
    });

    // Process the webhook outbox
    const result = await processOneWebhookOutboxItem();

    expect(result.processed).toBe(true);
    expect(result.trackingId).toBe(trackingId);

    // Verify outbox entry is marked as completed
    const outboxEntry = await prisma.webhookOutbox.findUnique({
      where: { trackingId },
    });

    expect(outboxEntry!.status).toBe("COMPLETED");
    expect(outboxEntry!.attempts).toBe(1);
    expect(outboxEntry!.processedAt).toBeDefined();
  });

  it("should handle webhook failure and retry with backoff", async () => {
    const packageData = createMockPackageData();

    // Create package
    const createResponse = await request(app)
      .post("/packages")
      .send(packageData)
      .expect(201);

    const trackingId = createResponse.body.data.trackingId;

    // Mock failed webhook call
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: () => Promise.resolve("Bad Gateway"),
    });

    // First attempt should fail and schedule retry
    const result1 = await processOneWebhookOutboxItem();
    expect(result1.processed).toBe(false);
    expect(result1.reason).toBe("Failed; retry scheduled");

    let outboxEntry = await prisma.webhookOutbox.findUnique({
      where: { trackingId },
    });

    expect(outboxEntry!.status).toBe("FAILED");
    expect(outboxEntry!.attempts).toBe(1);
    expect(outboxEntry!.processedAt).toBeNull();
    expect(outboxEntry!.lastError).toContain("Webhook failed");
    const firstRetryTime = outboxEntry!.nextAttemptAt.getTime();

    // Simulate retry timeout and successful retry
    await prisma.webhookOutbox.update({
      where: { trackingId },
      data: {
        nextAttemptAt: new Date(Date.now() - 1000), // Make it ready for retry
      },
    });

    // Mock successful webhook call
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve("OK"),
    });

    const result2 = await processOneWebhookOutboxItem();
    expect(result2.processed).toBe(true);

    outboxEntry = await prisma.webhookOutbox.findUnique({
      where: { trackingId },
    });

    expect(outboxEntry!.status).toBe("COMPLETED");
    expect(outboxEntry!.attempts).toBe(2);
    expect(outboxEntry!.processedAt).toBeDefined();
  });

  it("should handle idempotent webhook outbox creation for duplicate tracking IDs", async () => {
    const trackingId = "test-tracking-id-001";
    const payload = {
      trackingId,
      senderAddress: "123 Sender St",
      receiverAddress: "456 Receiver Ave",
      sourceRegionCode: "REGION_A",
      destinationRegionCode: "REGION_B",
      weight: 2.5,
    };

    // Enqueue first time
    const result1 = await enqueueWebhookOutbox(payload);
    expect(result1.trackingId).toBe(trackingId);
    expect(result1.status).toBe("PENDING");

    // Enqueue same tracking ID again (should return existing)
    const result2 = await enqueueWebhookOutbox(payload);
    expect(result2.trackingId).toBe(trackingId);
    expect(result2.status).toBe("PENDING");

    // Verify only one entry in DB
    const entries = await prisma.webhookOutbox.findMany({
      where: { trackingId },
    });

    expect(entries).toHaveLength(1);
  });

  it("should skip already-claimed webhook outbox items", async () => {
    const packageData = createMockPackageData();

    // Create package
    const createResponse = await request(app)
      .post("/packages")
      .send(packageData)
      .expect(201);

    const trackingId = createResponse.body.data.trackingId;

    // Manually mark as processing (simulate concurrent processing)
    await prisma.webhookOutbox.update({
      where: { trackingId },
      data: {
        status: "PROCESSING",
      },
    });

    // Try to process (should be skipped since already processing)
    // The query won't find it since it only looks for PENDING and FAILED
    const result = await processOneWebhookOutboxItem();
    expect(result.processed).toBe(false);
    expect(result.reason).toBe("No pending webhook outbox items");
  });

  it("should not process items beyond max attempts", async () => {
    const packageData = createMockPackageData();

    // Create package
    const createResponse = await request(app)
      .post("/packages")
      .send(packageData)
      .expect(201);

    const trackingId = createResponse.body.data.trackingId;

    // Update to max attempts + failed state
    await prisma.webhookOutbox.update({
      where: { trackingId },
      data: {
        status: "FAILED",
        attempts: 5, // Equals maxAttempts
        nextAttemptAt: new Date(Date.now() - 1000), // Ready for retry
      },
    });

    // Try to process (should not process since attempts >= maxAttempts)
    const result = await processOneWebhookOutboxItem();
    expect(result.processed).toBe(false);
    expect(result.reason).toBe("No pending webhook outbox items");
  });

  it("should document required environment variables", () => {
    // This test ensures the integration works with expected env vars
    expect(process.env).toHaveProperty("DATABASE_URL");

    // Document expected env vars for CI
    const requiredEnvVars = [
      "DATABASE_URL", // Must point to test database
      "STAGE2_WEBHOOK_URL", // Optional, can be mocked
      "STAGE1_SIGNING_SECRET",
      "STAGE1_RAW_UPDATES_API_KEY",
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => envVar !== "STAGE2_WEBHOOK_URL" && !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      console.warn(
        `⚠️  Missing environment variables: ${missingEnvVars.join(", ")}`
      );
      console.warn(
        "This may cause some tests to fail if running against actual external services."
      );
    }
  });
});
