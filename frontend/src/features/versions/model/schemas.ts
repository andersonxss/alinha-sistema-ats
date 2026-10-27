import * as z from "zod";

export const versionApprovalSchema = z.object({
  text: z
    .string()
    .min(150, "O texto deve ter ao menos 150 caracteres.")
    .max(60_000),
  approved: z.literal(true, { error: "Confirme que revisou o conteúdo." }),
});

export type VersionApprovalInput = z.infer<typeof versionApprovalSchema>;
