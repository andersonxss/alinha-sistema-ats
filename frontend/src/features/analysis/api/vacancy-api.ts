import type { HttpClient } from "@/shared/api/transport";
import type { VacancyService } from "../application/vacancy-port";
export function createVacancyService(http: HttpClient): VacancyService {
  return {
    importUrl: (url) => http<{ text: string }>("/api/import", "POST", { url }),
  };
}
