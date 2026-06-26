import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.region.createMany({
    data: [
      { code: "CHN", name: "Chennai" },
      { code: "BLR", name: "Bangalore" },
      { code: "HYD", name: "Hyderabad" },
      { code: "DEL", name: "Delhi" },
    ],
    skipDuplicates: true,
  });

  console.log("Regions seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
