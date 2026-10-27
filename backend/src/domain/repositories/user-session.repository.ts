export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

/** Plain credential/context values; no Request or Headers instance crosses this port. */
export type SessionCredentials = Readonly<Record<string, string>>;

export interface IUserSessionRepository {
  /** Return null for missing, expired or invalid sessions. */
  findUser(credentials: SessionCredentials): Promise<AuthenticatedUser | null>;
}
