import { randomUUID } from "crypto";
import type { CreateBagInput } from "../schemas/bag.schema.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app.error.js";

export async function createBag(data: CreateBagInput) {
  const bagCode = data.bagCode ?? `BAG-${randomUUID().slice(0, 8)}`;

  return prisma.bag.create({
    data: {
      bagCode,
    },
    include: {
      packages: true,
    },
  });
}

export async function getBags(page: number, limit: number) {
  return prisma.bag.findMany({
    include: {
      packages: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });
}

export async function assignPackageToBag(bagId: string, packageId: string) {
  const bag = await prisma.bag.findUnique({
    where: {
      id: bagId,
    },
  });

  if (!bag) {
    throw new AppError("BAG_NOT_FOUND", "Bag not found", 404);
  }

  const pkg = await prisma.package.findUnique({
    where: {
      id: packageId,
    },
  });

  if (!pkg) {
    throw new AppError("PACKAGE_NOT_FOUND", "Package not found", 404);
  }

  if (pkg.bagId) {
    throw new AppError(
      "PACKAGE_ALREADY_ASSIGNED",
      "Package is already assigned to a bag",
      409,
    );
  }

  return prisma.$transaction(async (tx) => {
    const updatedPackage = await tx.package.update({
      where: {
        id: packageId,
      },
      data: {
        bagId,
        currentStatus: "ADDED_TO_BAG",
      },
      include: {
        bag: true,
      },
    });

    await tx.packageHistory.create({
      data: {
        packageId,
        status: "ADDED_TO_BAG",
      },
    });

    return updatedPackage;
  });
}
