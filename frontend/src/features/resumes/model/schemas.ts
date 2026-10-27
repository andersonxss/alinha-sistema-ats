import * as z from "zod";

export const resumeReviewSchema = z.object({
  name: z
    .string()
    .min(1, "Informe um nome para o currículo.")
    .max(180)
    .refine(
      (value) => value.trim().length > 0,
      "Informe um nome para o currículo.",
    ),
  text: z
    .string()
    .min(150, "O texto deve ter ao menos 150 caracteres.")
    .max(60_000),
});

export const resumeUploadSchema = z
  .instanceof(File, { error: "Selecione um arquivo PDF ou DOCX." })
  .refine((file) => /\.(pdf|docx)$/i.test(file.name), {
    error: "Envie um arquivo PDF ou DOCX.",
  })
  .refine((file) => file.size <= 10 * 1024 * 1024, {
    error: "O arquivo deve ter até 10 MB.",
  });

export type ResumeReviewInput = z.infer<typeof resumeReviewSchema>;
