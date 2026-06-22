import z from "zod";
import { prisma } from "../config/prisma";
import { randomUUID } from "crypto";
import { packageCreateSchema } from "../validators/package.validator";

type PackageCreateInput = z.infer<typeof packageCreateSchema>;

async function notifyStage2Webhook(pkg: {
  trackingId: string;
  senderAddress: string;
  receiverAddress: string;
  sourceRegion: string;
  destinationRegion: string;
  weight: number;
  currentLocation: string;
}) {
  const webhookUrl = process.env.STAGE2_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[Webhook] STAGE2_WEBHOOK_URL not set — skipping");
    return;
  }
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackingId: pkg.trackingId,
        senderAddress: pkg.senderAddress,
        receiverAddress: pkg.receiverAddress,
        sourceRegionCode: pkg.sourceRegion,
        destinationRegionCode: pkg.destinationRegion,
        weight: pkg.weight,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.log("[Webhook] Status:", res.status);
      console.log("[Webhook] Body:", text);
    } else {
      console.log(`[Webhook] Package ${pkg.trackingId} sent to Stage 2`);
    }
  } catch (err) {
    console.error("[Webhook] Failed to call Stage 2:", err);
  }
}

export async function createPackage(data: PackageCreateInput) {
  const pkg = await prisma.package.create({
    data: {
      trackingId: randomUUID(),
      senderAddress: data.senderAddress,
      receiverAddress: data.receiverAddress,
      sourceRegion: data.sourceRegion,
      destinationRegion: data.destinationRegion,
      weight: data.weight,
      currentLocation: data.currentLocation ?? "",
    },
  });

  // Fire-and-forget webhook — does not block response
  void notifyStage2Webhook(pkg);

  return pkg;
}

export async function getAllPackages() {
  return prisma.package.findMany({
    include: { sale: true, statusHistory: true },
  });
}

export async function getPackageByTrackingId(trackingId: string) {
  return prisma.package.findUnique({
    where: { trackingId },
    include: { sale: true, statusHistory: true },
  });
}

export async function updatePackageStatusByTrackingId(
  trackingId: string,
  location: string,
) {
  const packageData = await prisma.package.findUnique({
    where: { trackingId },
  });

  if (!packageData) {
    throw new Error("Package not found");
  }

  let newStatus: "CREATED" | "IN_TRANSIT" | "DELIVERED";
  switch (packageData.currentStatus) {
    case "CREATED":
      newStatus = "IN_TRANSIT";
      break;
    case "IN_TRANSIT":
      newStatus = "DELIVERED";
      break;
    case "DELIVERED":
      throw new Error("Package is already delivered");
    default:
      throw new Error("Invalid package status");
  }

  await prisma.package.update({
    where: { trackingId },
    data: {
      currentStatus: newStatus,
      statusHistory: {
        create: {
          status: newStatus,
          location: location,
        },
      },
    },
  });

  return getPackageByTrackingId(trackingId);
}
