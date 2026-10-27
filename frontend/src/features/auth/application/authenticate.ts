import type { AuthCredentials } from "../model/auth-credentials";
import type { AuthService } from "./ports";

export type AuthenticationService = Pick<AuthService, "signIn" | "signUp">;

export async function authenticate(
  service: AuthenticationService,
  credentials: AuthCredentials,
): Promise<{ error: string }> {
  try {
    const result =
      credentials.mode === "signUp"
        ? await service.signUp(credentials.input)
        : await service.signIn(credentials.input);

    if (!result.error) return { error: "" };

    return {
      error:
        result.error.code === "INVALID_EMAIL_OR_PASSWORD"
          ? "E-mail ou senha incorretos."
          : "Não foi possível entrar ou cadastrar. Confira seus dados; a senha deve ter ao menos 12 caracteres.",
    };
  } catch {
    return { error: "Não foi possível conectar. Tente novamente." };
  }
}
