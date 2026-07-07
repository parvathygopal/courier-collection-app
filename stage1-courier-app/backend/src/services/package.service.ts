import z from "zod";
import { prisma } from "../config/prisma";
import { randomUUID } from "crypto";
import { AppError } from "../errors/app.error";
import { packageCreateSchema } from "../validators/package.validator";
import { enqueueWebhookOutbox } from "./webhook-outbox.service";

type PackageCreateInput = z.infer<typeof packageCreateSchema>;

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

  await enqueueWebhookOutbox({
    trackingId: pkg.trackingId,
    senderAddress: pkg.senderAddress,
    receiverAddress: pkg.receiverAddress,
    sourceRegionCode: pkg.sourceRegion,
    destinationRegionCode: pkg.destinationRegion,
    weight: pkg.weight,
  });

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
    throw AppError.notFound("Package not found");
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
      throw AppError.conflict("Package is already delivered");
    default:
      throw AppError.badRequest("Invalid package status");
  }

  await prisma.package.update({
    where: { trackingId },
    data: {
      currentStatus: newStatus,
      currentLocation: location ?? "",
      statusHistory: {
        create: {
          status: newStatus,
          location: location ?? "",
        },
      },
    },
  });

  return getPackageByTrackingId(trackingId);
}
