import { createAccountService } from "@/features/account/api/account-api";
import { createAnalysisService } from "@/features/analysis/api/analysis-api";
import { createVacancyService } from "@/features/analysis/api/vacancy-api";
import { authService } from "@/features/auth/api/auth-service";
import { createDashboardService } from "@/features/dashboard/api/dashboard-api";
import { createResumesService } from "@/features/resumes/api/resumes-api";
import { createVersionsService } from "@/features/versions/api/versions-api";
import { api, API_BASE } from "@/shared/api/client";
export const frontendServices = {
  dashboard: createDashboardService(api),
  resumes: createResumesService(api, API_BASE),
  analysis: createAnalysisService(api),
  versions: createVersionsService(api, API_BASE),
  account: createAccountService(api),
  vacancy: createVacancyService(api),
  auth: authService,
};
