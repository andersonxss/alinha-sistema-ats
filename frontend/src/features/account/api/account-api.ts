import type { HttpClient } from "@/shared/api/transport";

import type { AccountService } from "../application/ports";
export function createAccountService(http: HttpClient): AccountService {
  return {
    remove: (confirmation) => http("/api/account", "DELETE", { confirmation }),
  };
}
