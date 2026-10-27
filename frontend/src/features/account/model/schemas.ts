import * as z from "zod";

export const deleteAccountSchema = z.object({
  confirmation: z.email("Informe um e-mail válido para confirmar."),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
