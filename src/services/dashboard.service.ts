import { prisma } from "../config/prisma";

export async function getDashboardStats() {
  const totalPackages = await prisma.package.count();
  const created = await prisma.package.count({
    where: { currentStatus: "CREATED" },
  });
  const inTransit = await prisma.package.count({
    where: { currentStatus: "IN_TRANSIT" },
  });
  const delivered = await prisma.package.count({
    where: { currentStatus: "DELIVERED" },
  });

  return {
    totalPackages,
    created,
    inTransit,
    delivered,
  };
}
