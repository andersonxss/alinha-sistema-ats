import type { AuthService } from "@/features/auth/application/ports";
import type { AccountService } from "./ports";
export async function deleteAccount(
  account: AccountService,
  auth: Pick<AuthService, "signOut">,
  confirmation: string,
) {
  await account.remove(confirmation);
  await auth.signOut();
}
