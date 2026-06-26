import { z } from "zod";

export const createTruckSchema = z.object({
  registrationNumber: z.string().min(1).optional(),
});

export type CreateTruckInput = z.infer<typeof createTruckSchema>;
