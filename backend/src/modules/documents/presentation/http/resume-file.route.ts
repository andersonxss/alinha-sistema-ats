import { OriginalResumeFileNotFoundError } from "@/domain/errors/document-errors";
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
      const resume = await db.resume.findFirst({
        where: { id, userId: user.id },
      });
      if (!resume?.fileKey) throw new OriginalResumeFileNotFoundError();
      const format = resume.fileKey.endsWith(".pdf") ? "pdf" : "docx";
      return new Response(new Uint8Array(await loadFile(resume.fileKey)), {
        headers: {
          "Content-Type":
            format === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="curriculo-original.${format}"`,
          "Cache-Control": "private, no-store",
        },
      });
    });
  };
}
