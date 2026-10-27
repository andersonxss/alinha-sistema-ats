import type {
  AuthenticatedUser,
  IUserSessionRepository,
  SessionCredentials,
} from "@/domain/repositories/user-session.repository";

export class UserSessionRepository implements IUserSessionRepository {
  constructor(
    private readonly sessionApi: {
      getSession(input: {
        headers: Headers;
      }): Promise<{ user: AuthenticatedUser } | null>;
    },
  ) {}

  async findUser(
    credentials: SessionCredentials,
  ): Promise<AuthenticatedUser | null> {
    const session = await this.sessionApi.getSession({
      headers: new Headers(credentials),
    });
    if (!session) return null;
    const { id, name, email } = session.user;
    return { id, name, email };
  }
}
