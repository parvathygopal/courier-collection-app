import { randomUUID } from "crypto";
import type {
  CreatePackageInput,
  WebhookCreatePackageInput,
} from "../schemas/package.schema.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app.error.js";
import { signRawBody } from "../security/hmac.js";

const STATUS_TRANSITIONS = {
  TO_BE_PICKED_UP: "PICKED_UP",
  PICKED_UP: "ADDED_TO_BAG",
  ADDED_TO_BAG: "EN_ROUTE",
  EN_ROUTE: "ARRIVED",
  ARRIVED: "SCHEDULED_FOR_DELIVERY",
  SCHEDULED_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: null,
} as const;

async function addPackageHistory(packageId: string, status: string) {
  await prisma.packageHistory.create({
    data: {
      packageId,
      status: status as any,
    },
  });
}

export async function createPackage(data: CreatePackageInput) {
  const sourceRegion = await prisma.region.findUnique({
    where: {
      code: data.sourceRegionCode,
    },
  });

  const destinationRegion = await prisma.region.findUnique({
    where: {
      code: data.destinationRegionCode,
    },
  });

  if (!sourceRegion || !destinationRegion) {
    throw new AppError(
      "INVALID_REGION",
      "One or both regions were not found",
      400,
    );
  }

  return prisma.$transaction(async (tx) => {
    const createdPackage = await tx.package.create({
      data: {
        trackingId: randomUUID(),
        sourceRegionId: sourceRegion.id,
        destinationRegionId: destinationRegion.id,
        currentStatus: "TO_BE_PICKED_UP",
      },
      include: {
        bag: true,
        sourceRegion: true,
        destinationRegion: true,
      },
    });

    await tx.packageHistory.create({
      data: {
        packageId: createdPackage.id,
        status: "TO_BE_PICKED_UP",
      },
    });

    return createdPackage;
  });
}

export async function getPackages(page: number, limit: number) {
  return prisma.package.findMany({
    include: {
      bag: true,
      sourceRegion: true,
      destinationRegion: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });
}

export async function getPackageByTrackingId(trackingId: string) {
  const pkg = await prisma.package.findUnique({
    where: {
      trackingId,
    },
    include: {
      bag: true,
      sourceRegion: true,
      destinationRegion: true,
    },
  });

  if (!pkg) {
    throw new AppError("PACKAGE_NOT_FOUND", "Package not found", 404);
  }

  return pkg;
}

export async function getPackageHistoryByTrackingId(trackingId: string) {
  const pkg = await prisma.package.findUnique({
    where: {
      trackingId,
    },
    select: {
      id: true,
    },
  });

  if (!pkg) {
    throw new AppError("PACKAGE_NOT_FOUND", "Package not found", 404);
  }

  return prisma.packageHistory.findMany({
    where: {
      packageId: pkg.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function updatePackageStatus(trackingId: string) {
  const pkg = await prisma.package.findUnique({
    where: {
      trackingId,
    },
  });

  if (!pkg) {
    throw new AppError("PACKAGE_NOT_FOUND", "Package not found", 404);
  }

  const nextStatus = STATUS_TRANSITIONS[pkg.currentStatus];

  if (!nextStatus) {
    throw new AppError(
      "STATUS_ALREADY_FINAL",
      "Package is already in its final status",
      409,
    );
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.package.update({
      where: {
        id: pkg.id,
      },
      data: {
        currentStatus: nextStatus,
      },
      include: {
        bag: true,
        sourceRegion: true,
        destinationRegion: true,
      },
    });

    await tx.packageHistory.create({
      data: {
        packageId: pkg.id,
        status: nextStatus,
      },
    });

    return updated;
  });
}

export async function createPackageFromWebhook(
  data: WebhookCreatePackageInput,
) {
  const sourceRegion = await prisma.region.findUnique({
    where: {
      code: data.sourceRegionCode,
    },
  });

  const destinationRegion = await prisma.region.findUnique({
    where: {
      code: data.destinationRegionCode,
    },
  });

  if (!sourceRegion || !destinationRegion) {
    throw new AppError(
      "INVALID_REGION",
      "One or both regions were not found",
      400,
    );
  }

  const existingPackage = await prisma.package.findUnique({
    where: {
      trackingId: data.trackingId,
    },
    select: {
      id: true,
    },
  });

  if (existingPackage) {
    throw new AppError(
      "TRACKING_ID_ALREADY_EXISTS",
      "Package with trackingId already exists",
      409,
    );
  }

  return prisma.$transaction(async (tx) => {
    const createdPackage = await tx.package.create({
      data: {
        trackingId: data.trackingId,
        sourceRegionId: sourceRegion.id,
        destinationRegionId: destinationRegion.id,
        currentStatus: "TO_BE_PICKED_UP",
      },
      include: {
        bag: true,
        sourceRegion: true,
        destinationRegion: true,
      },
    });

    await tx.packageHistory.create({
      data: {
        packageId: createdPackage.id,
        status: "TO_BE_PICKED_UP",
      },
    });

    return createdPackage;
  });
}

const STAGE1_STATUS_MAP: Record<string, string> = {
  TO_BE_PICKED_UP: "CREATED",
  PICKED_UP: "PICKED_UP",
  ADDED_TO_BAG: "IN_TRANSIT",
  EN_ROUTE: "IN_TRANSIT",
  ARRIVED: "IN_TRANSIT",
  SCHEDULED_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
};

const ETL_PUSH_OFFSET_KEY = "stage1_push";
const DEFAULT_ETL_LOOKBACK_MS = 6 * 60 * 60 * 1000;

async function getLastSuccessfulPushAt() {
  const offset = await prisma.etlPushOffset.findUnique({
    where: { key: ETL_PUSH_OFFSET_KEY },
    select: { lastPushedAt: true },
  });

  if (offset) {
    return offset.lastPushedAt;
  }

  return new Date(Date.now() - DEFAULT_ETL_LOOKBACK_MS);
}

async function setLastSuccessfulPushAt(lastPushedAt: Date) {
  await prisma.etlPushOffset.upsert({
    where: { key: ETL_PUSH_OFFSET_KEY },
    create: {
      key: ETL_PUSH_OFFSET_KEY,
      lastPushedAt,
    },
    update: {
      lastPushedAt,
    },
  });
}

function mapLocationForStage1(
  status: string,
  sourceCode: string,
  destinationCode: string,
) {
  if (
    status === "TO_BE_PICKED_UP" ||
    status === "PICKED_UP" ||
    status === "ADDED_TO_BAG"
  ) {
    return sourceCode;
  }

  if (status === "EN_ROUTE") {
    return `EN_ROUTE_TO_${destinationCode}`;
  }

  return destinationCode;
}

export async function pushStatusUpdatesToStage1() {
  const stage1RawUpdatesUrl = process.env.STAGE1_RAW_UPDATES_URL;

  if (!stage1RawUpdatesUrl) {
    return {
      sent: 0,
      skipped: true,
      reason: "STAGE1_RAW_UPDATES_URL is not configured",
    };
  }

  const lastSuccessfulPushAt = await getLastSuccessfulPushAt();

  const updates = await prisma.packageHistory.findMany({
    where: {
      createdAt: {
        gt: lastSuccessfulPushAt,
      },
    },
    include: {
      package: {
        include: {
          sourceRegion: true,
          destinationRegion: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 500,
  });

  if (updates.length === 0) {
    return {
      sent: 0,
      skipped: true,
      reason: "No updates to push",
    };
  }

  const payload = {
    updates: updates.map((update) => ({
      updateId: update.id,
      trackingId: update.package.trackingId,
      status: STAGE1_STATUS_MAP[update.status] ?? "IN_TRANSIT",
      location: mapLocationForStage1(
        update.status,
        update.package.sourceRegion.code,
        update.package.destinationRegion.code,
      ),
      timestamp: update.createdAt.toISOString(),
      sourceStatus: update.status,
    })),
  };

  const stage2ApiKey =
    process.env.STAGE1_RAW_UPDATES_API_KEY ??
    process.env.STAGE1_RAW_UPDATES_API_KEY;
  const stage2Secret = process.env.STAGE1_SIGNING_SECRET;

  if (!stage2ApiKey || !stage2Secret) {
    throw new AppError(
      "ETL_AUTH_NOT_CONFIGURED",
      "Stage 2 to Stage 1 auth config missing",
      500,
    );
  }

  const rawBody = JSON.stringify(payload);
  const timestamp = Date.now().toString();
  const signature = signRawBody(rawBody, timestamp, stage2Secret);

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-api-key": stage2ApiKey,
    "x-timestamp": timestamp,
    "x-signature": signature,
  };

  const response = await fetch(stage1RawUpdatesUrl, {
    method: "POST",
    headers,
    body: rawBody,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new AppError(
      "ETL_PUSH_FAILED",
      `Failed to push updates to Stage 1: ${response.status} ${errorBody}`,
      502,
    );
  }

  const lastUpdate = updates[updates.length - 1];
  if (!lastUpdate) {
    return {
      sent: 0,
      skipped: true,
      reason: "No updates to push",
    };
  }

  await setLastSuccessfulPushAt(lastUpdate.createdAt);

  return {
    sent: updates.length,
    skipped: false,
  };
}
