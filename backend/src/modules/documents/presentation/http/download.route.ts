import { ExportNotFoundError } from "@/domain/errors/document-errors";
import type { HttpResourceContext } from "@/domain/repositories/http-handler.contract";
import type { RequireUser } from "@/domain/repositories/require-user.contract";
import { db } from "@/infrastructure/database/db";
import { loadFile } from "@/infrastructure/storage/files";
import { handle } from "@/presentation/http/http";
export function createGET(requireUser: RequireUser) {
  return async function GET(request: Request, ctx: HttpResourceContext) {
    return handle(async () => {
      const user = await requireUser(request);
      const { id } = await ctx.params;
      const file = await db.export.findFirst({
        where: { id, version: { resume: { userId: user.id } } },
        include: {
          version: { include: { analysis: { include: { vacancy: true } } } },
        },
      });
      if (!file) throw new ExportNotFoundError();
      const title = file.version.analysis.vacancy.title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-]/g, "-")
        .slice(0, 60);
      return new Response(new Uint8Array(await loadFile(file.fileKey)), {
        headers: {
          "Content-Type":
            file.format === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="curriculo-${title}-v${file.revision}.${file.format}"`,
          "Cache-Control": "private, no-store",
        },
      });
    });
  };
}
