import * as z from "zod";

export const vacancyUrlSchema = z.object({
  url: z
    .url("Informe uma URL válida.")
    .refine(
      (value) => /^https?:\/\//i.test(value),
      "A URL deve começar com HTTP ou HTTPS.",
    ),
});

export const newAnalysisSchema = z.object({
  title: z
    .string()
    .min(2, "O cargo deve ter ao menos 2 caracteres.")
    .max(160)
    .refine(
      (value) => value.trim().length >= 2,
      "O cargo deve ter ao menos 2 caracteres.",
    ),
  company: z
    .string()
    .min(2, "A empresa deve ter ao menos 2 caracteres.")
    .max(160)
    .refine(
      (value) => value.trim().length >= 2,
      "A empresa deve ter ao menos 2 caracteres.",
    ),
  vacancy: z
    .string()
    .min(100, "A descrição deve ter ao menos 100 caracteres.")
    .max(30_000)
    .refine(
      (value) => value.trim().length >= 100,
      "A descrição deve ter ao menos 100 caracteres.",
    ),
  consent: z.literal(true, {
    error: "Confirme a autorização para processar o conteúdo.",
  }),
  url: z
    .url("Informe uma URL válida.")
    .refine(
      (value) => /^https?:\/\//i.test(value),
      "A URL deve começar com HTTP ou HTTPS.",
    )
    .optional()
    .or(z.literal("")),
});

export type NewAnalysisInput = z.infer<typeof newAnalysisSchema>;
