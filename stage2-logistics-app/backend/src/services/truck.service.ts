import { randomUUID } from "crypto";
import type { CreateTruckInput } from "../schemas/truck.schema.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app.error.js";

export async function createTruck(data: CreateTruckInput) {
  const registrationNumber =
    data.registrationNumber ?? `TRK-${randomUUID().slice(0, 8)}`;

  return prisma.truck.create({
    data: {
      registrationNumber,
    },
  });
}

export async function getTrucks(page: number, limit: number) {
  return prisma.truck.findMany({
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });
}

export async function assignBagToTruck(truckId: string, bagId: string) {
  const truck = await prisma.truck.findUnique({
    where: {
      id: truckId,
    },
  });

  if (!truck) {
    throw new AppError("TRUCK_NOT_FOUND", "Truck not found", 404);
  }

  const bag = await prisma.bag.findUnique({
    where: {
      id: bagId,
    },
    include: {
      packages: true,
    },
  });

  if (!bag) {
    throw new AppError("BAG_NOT_FOUND", "Bag not found", 404);
  }

  if (bag.truckId) {
    throw new AppError(
      "BAG_ALREADY_ASSIGNED",
      "Bag is already assigned to a truck",
      409,
    );
  }

  if (bag.packages.length === 0) {
    throw new AppError(
      "EMPTY_BAG",
      "Cannot assign an empty bag to a truck",
      409,
    );
  }

  const allPackagesAddedToBag = bag.packages.every(
    (pkg) => pkg.currentStatus === "ADDED_TO_BAG",
  );

  if (!allPackagesAddedToBag) {
    throw new AppError(
      "INVALID_PACKAGE_STATUS",
      "All packages in the bag must be in ADDED_TO_BAG status",
      409,
    );
  }

  return prisma.$transaction(async (tx) => {
    const updatedBag = await tx.bag.update({
      where: {
        id: bagId,
      },
      data: {
        truckId,
      },
    });

    const bagPackages = await tx.package.findMany({
      where: {
        bagId,
      },
      select: {
        id: true,
      },
    });

    if (bagPackages.length > 0) {
      await tx.package.updateMany({
        where: {
          bagId,
        },
        data: {
          currentStatus: "EN_ROUTE",
        },
      });

      await tx.packageHistory.createMany({
        data: bagPackages.map((pkg) => ({
          packageId: pkg.id,
          status: "EN_ROUTE",
        })),
      });
    }

    return updatedBag;
  });
}
