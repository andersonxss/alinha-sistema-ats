import type { AuthService } from "../application/ports";
import { auth } from "./auth-client";
export const authService: AuthService = {
  signIn: (input) => auth.signIn.email(input),
  signUp: (input) => auth.signUp.email(input),
  signOut: () => auth.signOut(),
};
export const useSession = auth.useSession;
