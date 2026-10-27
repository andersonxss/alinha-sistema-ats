import { z } from "zod";

export const createAnalysisSchema = z.object({
  resumeId: z.string(),
  text: z.string().min(100).max(30000),
  title: z.string().min(2).max(160),
  company: z.string().min(2).max(160),
  url: z.string().url().max(2048).optional(),
  consent: z.literal(true),
});
