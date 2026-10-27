import { VacancyImportError } from "@/domain/errors/import-errors";
import type { RequireUser } from "@/domain/repositories/require-user.contract";
import { importUrl } from "@/infrastructure/importer/import-url";
import { handle, jsonBody, limited } from "@/presentation/http/http";
import { importVacancySchema } from "./schemas/import-vacancy.schema";
export function createPOST(requireUser: RequireUser) {
  return async function POST(request: Request) {
    return handle(async () => {
      const user = await requireUser(request);
      await limited(user.id, "import", 5);
      const { url } = importVacancySchema.parse(await jsonBody(request, 4096));
      try {
        return Response.json(await importUrl(url));
      } catch (e) {
        throw new VacancyImportError(
          e instanceof Error
            ? e.message
            : "Não foi possível importar. Cole a descrição.",
        );
      }
    });
  };
}
