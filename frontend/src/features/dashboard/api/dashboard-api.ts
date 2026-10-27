import type { HttpClient } from "@/shared/api/transport";
import type { DashboardService } from "../application/ports";
import type { Dashboard } from "../model/types";
export function createDashboardService(http: HttpClient): DashboardService {
  return { get: () => http<Dashboard>("/api/dashboard") };
}
