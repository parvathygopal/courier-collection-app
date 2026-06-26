import { z } from "zod";

export const createPackageSchema = z.object({
  sourceRegionCode: z.string().min(1),
  destinationRegionCode: z.string().min(1),
});

export const webhookCreatePackageSchema = z.object({
  trackingId: z.string().min(1),
  sourceRegionCode: z.string().min(1),
  destinationRegionCode: z.string().min(1),
});

export const packageTrackingParamSchema = z.object({
  trackingId: z.string().min(1),
});

export const listPackagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const updatePackageStatusSchema = z.object({});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type WebhookCreatePackageInput = z.infer<
  typeof webhookCreatePackageSchema
>;
export type PackageTrackingParamInput = z.infer<
  typeof packageTrackingParamSchema
>;
export type ListPackagesQueryInput = z.infer<typeof listPackagesQuerySchema>;
