import type { WebHandler } from "./http-handler.contract";

export interface IDashboardHandlers {
  getDashboard: WebHandler;
}

export interface IDashboardRepository {
  getDashboardData(
    userId: string,
  ): Promise<{ resumes: unknown[]; analyses: unknown[]; tasks: unknown[] }>;
}
