import { Router } from "express";
import type { IImportVacancyHandlers } from "@/domain/repositories/import-vacancy.repository";
import { adapt } from "@/infrastructure/http/request-adapter";

export function ImportVacancyRouter(handlers: IImportVacancyHandlers): Router {
  const router = Router();
  router.post("/", adapt(handlers.importVacancy));
  return router;
}
