import { Router } from "express";
import type { IDashboardHandlers } from "@/domain/repositories/dashboard.repository";
import { adapt } from "@/infrastructure/http/request-adapter";

export function DashboardRouter(handlers: IDashboardHandlers): Router {
  const router = Router();
  router.get("/", adapt(handlers.getDashboard));
  return router;
}
