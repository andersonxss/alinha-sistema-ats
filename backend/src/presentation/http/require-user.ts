import { UnauthenticatedError } from "@/domain/errors/user-errors";
import type { RequireUser } from "@/domain/repositories/require-user.contract";
import type { UserService } from "@/modules/user/application/user.service";
import { HttpError } from "./http-error";

const SAFE_METHODS = new Set(["GET", "HEAD"]);
export function createRequireUser(
  userService: UserService,
  frontendOrigin: string,
): RequireUser {
  return async (request) => {
    assertTrustedMutationOrigin(request, frontendOrigin);
    try {
      return await userService.authenticate(
        Object.fromEntries(request.headers),
      );
    } catch (error) {
      if (error instanceof UnauthenticatedError)
        throw new HttpError(401, error.message, error.code);
      throw error;
    }
  };
}

function assertTrustedMutationOrigin(
  request: Request,
  expectedOrigin: string,
): void {
  if (SAFE_METHODS.has(request.method)) return;

  if (request.headers.get("origin") !== expectedOrigin) {
    throw new HttpError(403, "Origem da solicitação inválida.");
  }
}
