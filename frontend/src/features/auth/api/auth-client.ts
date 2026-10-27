import { API_BASE } from "@/shared/api/client";
import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  baseURL: API_BASE,
  fetchOptions: { credentials: "include" },
});
