import { prisma } from "../lib/prisma.js";

export async function getDashboardStats() {
  const totalPackages = await prisma.package.count();
  const totalBags = await prisma.bag.count();
  const totalTrucks = await prisma.truck.count();
  const inBagPackages = await prisma.package.count({
    where: {
      bagId: {
        not: null,
      },
    },
  });

  const created = await prisma.package.count({
    where: {
      currentStatus: "TO_BE_PICKED_UP",
    },
  });

  const inTransit = await prisma.package.count({
    where: {
      currentStatus: "EN_ROUTE",
    },
  });

  const delivered = await prisma.package.count({
    where: {
      currentStatus: "OUT_FOR_DELIVERY",
    },
  });

  return {
    totalPackages,
    totalBags,
    totalTrucks,
    inBagPackages,
    created,
    inTransit,
    delivered,
  };
}
