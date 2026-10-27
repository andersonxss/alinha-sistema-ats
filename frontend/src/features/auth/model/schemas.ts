import * as z from "zod";

const emailSchema = z.email("Informe um e-mail válido.");
const passwordSchema = z
  .string()
  .min(12, "A senha deve ter ao menos 12 caracteres.")
  .max(128, "A senha deve ter até 128 caracteres.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha.").max(128),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, "Informe seu nome.")
    .max(100)
    .refine((value) => value.trim().length > 0, "Informe seu nome."),
  email: emailSchema,
  password: passwordSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
