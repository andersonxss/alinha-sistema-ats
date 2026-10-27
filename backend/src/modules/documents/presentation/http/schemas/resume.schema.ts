import { z } from "zod";

export const updateResumeSchema = z.object({
  text: z.string().min(150).max(60000),
  name: z.string().min(1).max(180),
});
