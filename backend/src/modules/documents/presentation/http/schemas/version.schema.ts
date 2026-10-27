import { z } from "zod";

export const updateVersionSchema = z.object({
  text: z.string().min(150).max(60000),
  accepted: z.boolean(),
  revision: z.number().int().nonnegative(),
});
