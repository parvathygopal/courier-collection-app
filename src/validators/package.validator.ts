import { z } from "zod";

export const packageCreateSchema = z.object({
  senderAddress: z.string().min(1),
  receiverAddress: z.string().min(1),
  sourceRegion: z.string().min(1),
  destinationRegion: z.string().min(1),
  currentLocation: z.string().optional(),
  weight: z.number().positive(),
});
