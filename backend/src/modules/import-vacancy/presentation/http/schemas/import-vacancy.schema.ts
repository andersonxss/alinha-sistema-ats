import { z } from "zod";

export const importVacancySchema = z.object({
  url: z.string().url().max(2048),
});
