import { VersionConflictError } from "@/domain/errors/document-errors";
import type { HttpResourceContext } from "@/domain/repositories/http-handler.contract";
import type { RequireUser } from "@/domain/repositories/require-user.contract";
import type { VersionService } from "@/modules/documents/application/version.service";
import { handle, jsonBody, limited } from "@/presentation/http/http";
import { updateVersionSchema } from "./schemas/version.schema";
export function createPATCH(service: VersionService, requireUser: RequireUser) {
  return async function PATCH(request: Request, ctx: HttpResourceContext) {
    return handle(async () => {
      const user = await requireUser(request);
      await limited(user.id, "export", 5);
      const { id } = await ctx.params;
      const data = updateVersionSchema.parse(await jsonBody(request));
      if (!(await service.review(user.id, id, data)))
        throw new VersionConflictError();
      return Response.json({ ok: true }, { status: 202 });
    });
  };
}
