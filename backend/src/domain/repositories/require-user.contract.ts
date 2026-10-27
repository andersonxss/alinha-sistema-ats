import type { AuthenticatedUser } from "./user-session.repository";

export type RequireUser = (request: Request) => Promise<AuthenticatedUser>;
