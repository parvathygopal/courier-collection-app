import { prisma } from "../lib/prisma.js";

export async function getRegions() {
  return prisma.region.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}
