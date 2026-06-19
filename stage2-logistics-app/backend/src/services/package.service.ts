import { randomUUID } from "crypto";
import type { CreatePackageInput } from "../schemas/package.schema.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app.error.js";

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
