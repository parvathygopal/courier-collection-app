import { PackageStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { RawUpdateBulkInput } from "../validators/raw-update.validator";

type ParsedRawUpdate = {
  trackingId: string;
  status: PackageStatus;
  location: string;
  timestamp?: string;
};

function parseRawUpdate(rawData: Prisma.JsonValue): ParsedRawUpdate {
  if (!rawData || Array.isArray(rawData) || typeof rawData !== "object") {
    throw new Error("Invalid raw update format");
  }

  const record = rawData as Record<string, unknown>;
  const trackingId = record.trackingId;
  const status = record.status;
  const location = record.location;
  const timestamp = record.timestamp;

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

export async function processRawUpdatesBatch(limit = 100) {
  const pendingUpdates = await prisma.rawUpdate.findMany({
    where: { processed: false },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  let updatedPackages = 0;
  let failed = 0;

  for (const pendingUpdate of pendingUpdates) {
    try {
      const parsed = parseRawUpdate(pendingUpdate.rawData);
      const statusTimestamp = parsed.timestamp
        ? new Date(parsed.timestamp)
        : new Date();

      if (Number.isNaN(statusTimestamp.getTime())) {
        throw new Error("Invalid timestamp value");
      }

      await prisma.$transaction(async (tx) => {
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
          },
        });
      });

      updatedPackages += 1;
    } catch (error) {
      failed += 1;

      await prisma.rawUpdate.update({
        where: { id: pendingUpdate.id },
        data: {
          processed: true,
          processedAt: new Date(),
          error: error instanceof Error ? error.message : "Unknown ETL error",
        },
      });
    }
  }

  return {
    fetched: pendingUpdates.length,
    processed: pendingUpdates.length,
    updatedPackages,
    failed,
  };
}
