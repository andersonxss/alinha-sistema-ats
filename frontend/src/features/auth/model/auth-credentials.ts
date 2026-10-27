import {
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from "./schemas";

export type AuthCredentials =
  | { mode: "signIn"; input: SignInInput }
  | { mode: "signUp"; input: SignUpInput };

export type AuthMode = AuthCredentials["mode"];

type ValidationResult =
  | { success: true; credentials: AuthCredentials }
  | { success: false; error: string };

export function validateAuthCredentials(
  mode: AuthMode,
  input: unknown,
): ValidationResult {
  if (mode === "signUp") {
    const parsed = signUpSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ?? "Confira os dados informados.",
      };
    }
    return { success: true, credentials: { mode, input: parsed.data } };
  }

  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Confira os dados informados.",
    };
  }
  return { success: true, credentials: { mode, input: parsed.data } };
}
