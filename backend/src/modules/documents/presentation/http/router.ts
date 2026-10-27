import { Router } from "express";
import type { IDocumentsHandlers } from "@/domain/repositories/documents.repository";
import { adapt } from "@/infrastructure/http/request-adapter";

export function DocumentsRouter(handlers: IDocumentsHandlers): Router {
  const router = Router();
  router.post("/resumes", adapt(handlers.createResume));
  router.get("/resumes/:id", adapt(handlers.getResume, true));
  router.patch("/resumes/:id", adapt(handlers.updateResume, true));
  router.delete("/resumes/:id", adapt(handlers.deleteResume, true));
  router.get("/resumes/:id/file", adapt(handlers.getResumeFile, true));
  router.get("/download/:id", adapt(handlers.download, true));
  router.patch("/versions/:id", adapt(handlers.updateVersion, true));
  return router;
}
