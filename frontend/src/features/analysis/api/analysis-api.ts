import type { HttpClient } from "@/shared/api/transport";
import type { AnalysisService } from "../application/ports";
import type { Analysis } from "../model/types";
export function createAnalysisService(http: HttpClient): AnalysisService {
  return {
    get: (id) => http<Analysis>(`/api/analyses/${id}`),
    create: (input) => http<{ id: string }>("/api/analyses", "POST", input),
    adapt: (id) => http(`/api/analyses/${id}`, "POST", {}),
    remove: (id) => http(`/api/analyses/${id}`, "DELETE"),
  };
}
