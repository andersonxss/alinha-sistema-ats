import { Router } from "express";
import type { IAccountHandlers } from "@/domain/repositories/account.repository";
import { adapt } from "@/infrastructure/http/request-adapter";

export function AccountRouter(handlers: IAccountHandlers): Router {
  const router = Router();
  router.delete("/", adapt(handlers.deleteAccount));
  return router;
}
