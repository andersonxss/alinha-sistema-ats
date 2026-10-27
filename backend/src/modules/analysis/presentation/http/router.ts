import { Router } from "express";
import type { IAnalysisHandlers } from "@/domain/repositories/analysis.repository";
import { adapt } from "@/infrastructure/http/request-adapter";

export function AnalysisRouter(handlers: IAnalysisHandlers): Router {
  const router = Router();
  router.post("/", adapt(handlers.createAnalysis));
  router.get("/:id", adapt(handlers.getAnalysis, true));
  router.post("/:id", adapt(handlers.adaptAnalysis, true));
  router.delete("/:id", adapt(handlers.deleteAnalysis, true));
  return router;
}
