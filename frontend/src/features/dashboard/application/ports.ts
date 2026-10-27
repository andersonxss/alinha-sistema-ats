import type { Dashboard } from "../model/types";
export interface DashboardService {
  get(): Promise<Dashboard>;
}
