import { Router } from "express";
import type { IHealthHandlers } from "@/domain/repositories/health.repository";
import { adapt } from "@/infrastructure/http/request-adapter";

export function HealthRouter(handlers: IHealthHandlers): Router {
  const router = Router();
  router.get("/", adapt(handlers.getHealth));
  return router;
}
