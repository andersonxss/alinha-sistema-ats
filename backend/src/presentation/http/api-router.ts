import { type RequestHandler, Router } from "express";
import type { IAccountHandlers } from "@/domain/repositories/account.repository";
import type { IAnalysisHandlers } from "@/domain/repositories/analysis.repository";
import type { IDashboardHandlers } from "@/domain/repositories/dashboard.repository";
import type { IDocumentsHandlers } from "@/domain/repositories/documents.repository";
import type { IHealthHandlers } from "@/domain/repositories/health.repository";
import type { IImportVacancyHandlers } from "@/domain/repositories/import-vacancy.repository";
import { AccountRouter } from "@/modules/account/presentation/http/router";
import { AnalysisRouter } from "@/modules/analysis/presentation/http/router";
import { DashboardRouter } from "@/modules/dashboard/presentation/http/router";
import { DocumentsRouter } from "@/modules/documents/presentation/http/router";
import { HealthRouter } from "@/modules/health/presentation/http/router";
import { ImportVacancyRouter } from "@/modules/import-vacancy/presentation/http/router";

export interface ApiHandlers {
  auth: RequestHandler;
  account: IAccountHandlers;
  dashboard: IDashboardHandlers;
  health: IHealthHandlers;
  analysis: IAnalysisHandlers;
  importVacancy: IImportVacancyHandlers;
  documents: IDocumentsHandlers;
}

export function createApiRouter(handlers: ApiHandlers): Router {
  const router = Router();
  // Keep the full auth path visible to Better Auth, with the body untouched.
  router.all("/auth/*splat", handlers.auth);
  router.use("/account", AccountRouter(handlers.account));
  router.use("/dashboard", DashboardRouter(handlers.dashboard));
  router.use("/health", HealthRouter(handlers.health));
  router.use("/analyses", AnalysisRouter(handlers.analysis));
  router.use("/import", ImportVacancyRouter(handlers.importVacancy));
  router.use("/", DocumentsRouter(handlers.documents));
  return router;
}
