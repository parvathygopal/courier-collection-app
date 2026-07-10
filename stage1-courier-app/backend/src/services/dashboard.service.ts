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

  // Query packages for operational sections
  const waitingPickup = await prisma.package.findMany({
    where: { currentStatus: "CREATED" },
    select: {
      id: true,
      trackingId: true,
      sourceRegion: true,
      destinationRegion: true,
      currentStatus: true,
      currentLocation: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const inTransitPackages = await prisma.package.findMany({
    where: {
      currentStatus: {
        in: ["IN_TRANSIT", "OUT_FOR_DELIVERY"],
      },
    },
    select: {
      id: true,
      trackingId: true,
      sourceRegion: true,
      destinationRegion: true,
      currentStatus: true,
      currentLocation: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const delayedPackages = await prisma.package.findMany({
    where: {
      createdAt: {
        lt: twentyFourHoursAgo,
      },
      currentStatus: {
        not: "DELIVERED",
      },
    },
    select: {
      id: true,
      trackingId: true,
      sourceRegion: true,
      destinationRegion: true,
      currentStatus: true,
      currentLocation: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    totalPackages,
    created,
    inTransit,
    delivered,
    sections: {
      waitingPickup,
      inTransit: inTransitPackages,
      delayed: delayedPackages,
    },
  };
}
