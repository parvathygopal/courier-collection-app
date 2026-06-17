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

  return prisma.bag.update({
    where: {
      id: bagId,
    },
    data: {
      truckId,
    },
  });
}
