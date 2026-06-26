import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const packages = await prisma.package.findMany();
  console.log(packages);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
