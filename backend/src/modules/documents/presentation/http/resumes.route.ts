import { InvalidResumeFileError } from "@/domain/errors/document-errors";
import type { RequireUser } from "@/domain/repositories/require-user.contract";
import { db } from "@/infrastructure/database/db";
import {
  extractFile,
  removeFile,
  saveFile,
  sectionsFromText,
} from "@/infrastructure/storage/files";
import { formBody, handle, limited } from "@/presentation/http/http";
export function createPOST(requireUser: RequireUser) {
  return async function POST(request: Request) {
    return handle(async () => {
      const user = await requireUser(request);
      await limited(user.id, "upload", 5);
      const max = Number(process.env.MAX_UPLOAD_MB ?? 10) * 1024 * 1024 + 65536;
      const form = await formBody(request, max);
      const file = form.get("file");
      if (!(file instanceof File)) throw new InvalidResumeFileError();
      const bytes = Buffer.from(await file.arrayBuffer());
      let extracted: Awaited<ReturnType<typeof extractFile>>;
      try {
        extracted = await extractFile(file.name, bytes);
      } catch (e) {
        throw new InvalidResumeFileError(
          e instanceof Error ? e.message : "Falha na leitura.",
        );
      }
      const fileKey = await saveFile(bytes, extracted.format);
      try {
        const resume = await db.resume.create({
          data: {
            userId: user.id,
            name: file.name.slice(0, 180),
            fileKey,
            extractedText: extracted.text,
            reviewedText: extracted.text,
            sections: sectionsFromText(extracted.text),
            extractionWarning: extracted.warning,
          },
        });
        return Response.json(resume, {
          status: 201,
          headers: {
            Location: `/api/resumes/${encodeURIComponent(resume.id)}`,
          },
        });
      } catch (e) {
        await removeFile(fileKey);
        throw e;
      }
    });
  };
}
