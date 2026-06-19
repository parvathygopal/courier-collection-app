import { z } from "zod";

export const packageStatusSchema = z.enum([
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
]);

export const rawUpdateItemSchema = z
  .object({
    trackingId: z.string().min(1),
    status: packageStatusSchema,
    location: z.string().optional(),
    timestamp: z.string().datetime().optional(),
  })
  .passthrough();

export const rawUpdateBulkSchema = z
  .union([
    z.array(rawUpdateItemSchema).min(1),
    z.object({ updates: z.array(rawUpdateItemSchema).min(1) }),
  ])
  .transform((value) => (Array.isArray(value) ? value : value.updates));

export type RawUpdateItemInput = z.infer<typeof rawUpdateItemSchema>;
export type RawUpdateBulkInput = z.infer<typeof rawUpdateBulkSchema>;
