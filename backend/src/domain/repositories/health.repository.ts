import type { WebHandler } from "./http-handler.contract";

export interface IHealthHandlers {
  getHealth: WebHandler;
}

export interface IHealthRepository {
  check(): Promise<boolean>;
}
