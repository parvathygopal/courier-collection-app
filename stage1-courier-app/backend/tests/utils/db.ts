import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

let prisma: PrismaClient;

const getDatabaseUrl = () => {
  const baseUrl =
    process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/courier_collection_test";
  // Ensure we're using test database
  if (!baseUrl.includes("_test")) {
    return baseUrl.replace("courier_collection", "courier_collection_test");
  }
  return baseUrl;
};

export function getPrismaClient(): PrismaClient {
  if (prisma) {
    return prisma;
  }

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

  return prisma;
}

export async function setupTestDatabase() {
  const prismaClient = getPrismaClient();

  // Run migrations on test database
  const databaseUrl = getDatabaseUrl();

  try {
    await execAsync(
      `DATABASE_URL="${databaseUrl}" npx prisma migrate deploy --skip-generate`,
      {
        cwd: process.cwd(),
      }
    );
    console.log("✓ Test database migrations applied");
  } catch (error) {
    // Migrations may have already been applied
    console.log("Migrations already applied or using existing schema");
  }

  return prismaClient;
}

export async function teardownTestDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null as any;
  }
}

export async function clearTestDatabase() {
  const prismaClient = getPrismaClient();

  // Delete in dependency order
  await prismaClient.statusHistory.deleteMany({});
  await prismaClient.sale.deleteMany({});
  await prismaClient.package.deleteMany({});
  await prismaClient.webhookOutbox.deleteMany({});
  await prismaClient.processedEtlUpdate.deleteMany({});
  await prismaClient.rawUpdate.deleteMany({});

  console.log("✓ Test database cleared");
}

export async function resetTestDatabase() {
  await clearTestDatabase();
}

export { prisma };
