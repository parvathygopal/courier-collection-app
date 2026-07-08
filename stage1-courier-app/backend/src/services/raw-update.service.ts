import { PackageStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { RawUpdateBulkInput } from "../validators/raw-update.validator";

type ParsedRawUpdate = {
  updateId?: string;
  trackingId: string;
  status: PackageStatus;
  location: string;
  timestamp?: string;
};

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

function parseRawUpdate(rawData: Prisma.JsonValue): ParsedRawUpdate {
  if (!rawData || Array.isArray(rawData) || typeof rawData !== "object") {
    throw new Error("Invalid raw update format");
  }

  const record = rawData as Record<string, unknown>;
  const updateId = record.updateId;
  const trackingId = record.trackingId;
  const status = record.status;
  const location = record.location;
  const timestamp = record.timestamp;

  if (updateId !== undefined && (typeof updateId !== "string" || updateId.length === 0)) {
    throw new Error("Invalid updateId");
  }

  if (typeof trackingId !== "string" || trackingId.length === 0) {
    throw new Error("Missing trackingId");
  }

  const allowedStatuses = new Set(Object.values(PackageStatus));
  if (
    typeof status !== "string" ||
    !allowedStatuses.has(status as PackageStatus)
  ) {
    throw new Error("Invalid status");
  }

  if (location !== undefined && typeof location !== "string") {
    throw new Error("Invalid location");
  }

  if (timestamp !== undefined && typeof timestamp !== "string") {
    throw new Error("Invalid timestamp");
  }

  return {
    updateId: typeof updateId === "string" ? updateId : undefined,
    trackingId,
    status: status as PackageStatus,
    location: location ?? "",
    timestamp,
  };
}

export async function ingestRawUpdates(rawUpdates: RawUpdateBulkInput) {
  const result = await prisma.rawUpdate.createMany({
    data: rawUpdates.map((update) => ({
      rawData: update as Prisma.InputJsonValue,
    })),
  });

  return {
    received: rawUpdates.length,
    stored: result.count,
  };
}

async function markRawUpdateProcessed(
  rawUpdateId: string,
  attempts: number,
  error: string | null = null,
) {
  await prisma.rawUpdate.update({
    where: { id: rawUpdateId },
    data: {
      processed: true,
      processedAt: new Date(),
      error,
      attempts,
    },
  });
}

export async function processRawUpdatesBatch(limit = 100) {
  const pendingUpdates = await prisma.rawUpdate.findMany({
    where: {
      processed: false,
      nextAttemptAt: {
        lte: new Date(),
      },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      rawData: true,
      attempts: true,
      maxAttempts: true,
    },
  });

  let updatedPackages = 0;
  let failed = 0;
  let retried = 0;
  let duplicated = 0;

  for (const pendingUpdate of pendingUpdates) {
    const attempts = pendingUpdate.attempts + 1;

    try {
      const parsed = parseRawUpdate(pendingUpdate.rawData);

      if (parsed.updateId) {
        const existingProcessed = await prisma.processedEtlUpdate.findUnique({
          where: { updateId: parsed.updateId },
          select: { updateId: true },
        });

        if (existingProcessed) {
          await markRawUpdateProcessed(pendingUpdate.id, attempts);
          duplicated += 1;
          continue;
        }
      }

      const statusTimestamp = parsed.timestamp
        ? new Date(parsed.timestamp)
        : new Date();

      if (Number.isNaN(statusTimestamp.getTime())) {
        throw new Error("Invalid timestamp value");
      }

      await prisma.$transaction(async (tx) => {
        if (parsed.updateId) {
          try {
            await tx.processedEtlUpdate.create({
              data: {
                updateId: parsed.updateId,
                rawUpdateId: pendingUpdate.id,
              },
            });
          } catch (error) {
            if (isUniqueViolation(error)) {
              throw new Error("DUPLICATE_UPDATE_ID");
            }

            throw error;
          }
        }

        const existingPackage = await tx.package.findUnique({
          where: { trackingId: parsed.trackingId },
          select: { id: true },
        });

        if (!existingPackage) {
          throw new Error(
            `Package not found for trackingId: ${parsed.trackingId}`,
          );
        }

        await tx.package.update({
          where: { id: existingPackage.id },
          data: {
            currentStatus: parsed.status,
            currentLocation: parsed.location,
          },
        });

        await tx.statusHistory.create({
          data: {
            packageId: existingPackage.id,
            status: parsed.status,
            location: parsed.location,
            timestamp: statusTimestamp,
          },
        });

        await tx.rawUpdate.update({
          where: { id: pendingUpdate.id },
          data: {
            processed: true,
            processedAt: new Date(),
            error: null,
            attempts,
          },
        });
      });

      updatedPackages += 1;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "DUPLICATE_UPDATE_ID"
      ) {
        await markRawUpdateProcessed(pendingUpdate.id, attempts);
        duplicated += 1;
        continue;
      }

      failed += 1;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown ETL error";

      const isPermanentError =
        error instanceof Error &&
        error.message.includes("Package not found");

      const shouldRetry = !isPermanentError && attempts < pendingUpdate.maxAttempts;

      if (shouldRetry) {
        retried += 1;
      } else if (isPermanentError) {
        console.warn(`[ETL] Package not found: ${errorMessage}`);
      }

      await prisma.rawUpdate.update({
        where: { id: pendingUpdate.id },
        data: {
          attempts,
          processed: !shouldRetry,
          processedAt: shouldRetry ? null : new Date(),
          nextAttemptAt: shouldRetry
            ? new Date(Date.now() + backoffDelaySeconds(attempts) * 1000)
            : new Date(),
          error: errorMessage,
        },
      });
    }
  }

  return {
    fetched: pendingUpdates.length,
    processed: pendingUpdates.length,
    updatedPackages,
    failed,
    retried,
    duplicated,
  };
}
