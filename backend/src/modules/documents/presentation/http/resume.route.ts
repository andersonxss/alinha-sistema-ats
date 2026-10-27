import { ResumeNotFoundError } from "@/domain/errors/resume-errors";
import type { HttpResourceContext } from "@/domain/repositories/http-handler.contract";
import type { RequireUser } from "@/domain/repositories/require-user.contract";
import type { ResumeService } from "@/modules/documents/application/resume.service";
import { handle, jsonBody } from "@/presentation/http/http";
import { updateResumeSchema } from "./schemas/resume.schema";
export function createHandlers(
  service: ResumeService,
  requireUser: RequireUser,
) {
  async function GET(request: Request, ctx: HttpResourceContext) {
    return handle(async () => {
      const user = await requireUser(request);
      const { id } = await ctx.params;
      const row = await service.get(user.id, id);
      if (!row) throw new ResumeNotFoundError();
      return Response.json(row);
    });
  }
  async function PATCH(request: Request, ctx: HttpResourceContext) {
    return handle(async () => {
      const user = await requireUser(request);
      const { id } = await ctx.params;
      const data = updateResumeSchema.parse(await jsonBody(request));
      if (!(await service.review(user.id, id, data)))
        throw new ResumeNotFoundError();
      return Response.json({ ok: true });
    });
  }
  async function DELETE(request: Request, ctx: HttpResourceContext) {
    return handle(async () => {
      const user = await requireUser(request);
      const { id } = await ctx.params;
      if (!(await service.delete(user.id, id))) throw new ResumeNotFoundError();
      return Response.json({ ok: true });
    });
  }

  return { GET, PATCH, DELETE };
}
