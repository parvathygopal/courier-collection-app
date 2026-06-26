import { z } from "zod";

export const createBagSchema = z.object({
  bagCode: z.string().min(1).optional(),
});

export type CreateBagInput = z.infer<typeof createBagSchema>;
