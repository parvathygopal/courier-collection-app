import { z } from "zod";

export const createPackageSchema = z.object({
  sourceRegionCode: z.string().min(1),
  destinationRegionCode: z.string().min(1),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
