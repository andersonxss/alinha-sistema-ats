import { UnauthenticatedError } from "@/domain/errors/user-errors";
import type {
  IUserSessionRepository,
  SessionCredentials,
} from "@/domain/repositories/user-session.repository";

export class UserService {
  constructor(private readonly sessions: IUserSessionRepository) {}

  async authenticate(credentials: SessionCredentials) {
    const user = await this.sessions.findUser(credentials);
    if (!user) throw new UnauthenticatedError();
    return user;
  }
}
