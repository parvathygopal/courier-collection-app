import { prisma } from "../lib/prisma.js";

function startOfToday(hours = 0) {
  const date = new Date();
  date.setHours(hours, 0, 0, 0);
  return date;
}

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
      currentStatus: {
        in: ["OUT_FOR_DELIVERY", "DELIVERED"],
      },
    },
  });

  const morningStart = startOfToday(6);
  const noonStart = startOfToday(12);
  const eveningStart = startOfToday(18);

  const latestTruck = await prisma.truck.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });

  const waitingMorningToNoon = await prisma.package.findMany({
    where: {
      currentStatus: "PICKED_UP",
      bagId: null,
      createdAt: {
        gte: morningStart,
        lt: noonStart,
      },
    },
    include: {
      sourceRegion: true,
      destinationRegion: true,
      bag: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const waitingNoonToEvening = await prisma.package.findMany({
    where: {
      currentStatus: "PICKED_UP",
      bagId: null,
      createdAt: {
        gte: noonStart,
        lt: eveningStart,
      },
    },
    include: {
      sourceRegion: true,
      destinationRegion: true,
      bag: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const waitingFromLastTruckArrival = await prisma.package.findMany({
    where: {
      currentStatus: "PICKED_UP",
      bagId: null,
      ...(latestTruck
        ? {
            createdAt: {
              gte: latestTruck.createdAt,
            },
          }
        : {}),
    },
    include: {
      sourceRegion: true,
      destinationRegion: true,
      bag: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const baggedLoadedToTrucks = await prisma.package.findMany({
    where: {
      bag: {
        is: {
          truckId: {
            not: null,
          },
        },
      },
    },
    include: {
      sourceRegion: true,
      destinationRegion: true,
      bag: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 25,
  });

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  const delayedPackages = await prisma.package.findMany({
    where: {
      OR: [
        {
          currentStatus: {
            in: ["PICKED_UP", "ADDED_TO_BAG"],
          },
          createdAt: {
            lt: sixHoursAgo,
          },
        },
        {
          currentStatus: "EN_ROUTE",
          createdAt: {
            lt: sixHoursAgo,
          },
        },
      ],
    },
    include: {
      sourceRegion: true,
      destinationRegion: true,
      bag: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 25,
  });

  return {
    totalPackages,
    totalBags,
    totalTrucks,
    inBagPackages,
    created,
    inTransit,
    delivered,
    sections: {
      waitingToBeBagged: {
        morningToNoon: waitingMorningToNoon,
        noonToEvening: waitingNoonToEvening,
      },
      fromLastTruckArrivalYetToBeBagged: waitingFromLastTruckArrival,
      baggedLoadedToTrucks,
      delayedPackages,
    },
  };
}
