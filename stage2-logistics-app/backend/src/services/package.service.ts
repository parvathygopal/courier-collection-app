import { randomUUID } from "crypto";
import type { CreatePackageInput } from "../schemas/package.schema.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app.error.js";

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

  return prisma.package.create({
    data: {
      trackingId: randomUUID(),
      sourceRegionId: sourceRegion.id,
      destinationRegionId: destinationRegion.id,
      currentStatus: "TO_BE_PICKED_UP",
    },
    include: {
      bag: true,
    },
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
