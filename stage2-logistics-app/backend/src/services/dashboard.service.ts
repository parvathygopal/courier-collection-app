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

  return {
    totalPackages,
    totalBags,
    totalTrucks,
    inBagPackages,
  };
}
