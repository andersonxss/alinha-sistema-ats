import { AccountConfirmationError } from "@/domain/errors/account-errors";
import type { RequireUser } from "@/domain/repositories/require-user.contract";
import type { AccountService } from "@/modules/account/application/account.service";
import { handle, jsonBody } from "@/presentation/http/http";
import { deleteAccountSchema } from "./schemas/account.schema";

export function createDELETE(
  service: AccountService,
  requireUser: RequireUser,
) {
  return async function DELETE(request: Request) {
    return handle(async () => {
      const user = await requireUser(request);
      const body = deleteAccountSchema.parse(await jsonBody(request, 2048));
      if (body.confirmation !== user.email)
        throw new AccountConfirmationError();
      await service.delete(user.id);
      return Response.json({ ok: true });
    });
  };
}
