import { toNodeHandler } from "better-auth/node";
import { createRateLimiter } from "@/application/use-cases/rate-limiter";
import { auth } from "@/infrastructure/authentication/auth";
import { PrismaRateLimitRepository } from "@/infrastructure/database/prisma-rate-limit-repository";
import { sectionsFromText } from "@/infrastructure/storage/files";
import { AccountService } from "@/modules/account/application/account.service";
import { AccountRepository } from "@/modules/account/infrastructure/account.repository";
import * as account from "@/modules/account/presentation/http/account.route";
import { AnalysisService } from "@/modules/analysis/application/analysis.service";
import { AnalysisRepository } from "@/modules/analysis/infrastructure/analysis.repository";
import * as analysisResource from "@/modules/analysis/presentation/http/analysis.route";
import { DashboardService } from "@/modules/dashboard/application/dashboard.service";
import { DashboardRepository } from "@/modules/dashboard/infrastructure/dashboard.repository";
import * as dashboard from "@/modules/dashboard/presentation/http/dashboard.route";
import { ResumeService } from "@/modules/documents/application/resume.service";
import { VersionService } from "@/modules/documents/application/version.service";
import { ResumeRepository } from "@/modules/documents/infrastructure/resume.repository";
import { VersionRepository } from "@/modules/documents/infrastructure/version.repository";
import * as download from "@/modules/documents/presentation/http/download.route";
import * as resume from "@/modules/documents/presentation/http/resume.route";
import * as resumeFile from "@/modules/documents/presentation/http/resume-file.route";
import * as resumes from "@/modules/documents/presentation/http/resumes.route";
import * as version from "@/modules/documents/presentation/http/version.route";
import { HealthService } from "@/modules/health/application/health.service";
import { HealthRepository } from "@/modules/health/infrastructure/health.repository";
import * as health from "@/modules/health/presentation/http/health.route";
import * as importVacancy from "@/modules/import-vacancy/presentation/http/import-vacancy.route";
import { UserService } from "@/modules/user/application/user.service";
import { UserSessionRepository } from "@/modules/user/infrastructure/user-session.repository";
import { createApiRouter } from "@/presentation/http/api-router";
import { configureRateLimit } from "@/presentation/http/rate-limit";
import { createRequireUser } from "@/presentation/http/require-user";

export function composeApiRouter() {
  const requireUser = createRequireUser(
    new UserService(new UserSessionRepository(auth.api)),
    process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  );

  const resumeHandlers = resume.createHandlers(
    new ResumeService(new ResumeRepository(), sectionsFromText),
    requireUser,
  );

  const analysisResourceHandlers = analysisResource.createHandlers(
    new AnalysisService(new AnalysisRepository()),
    requireUser,
  );

  const updateVersion = version.createPATCH(
    new VersionService(new VersionRepository()),
    requireUser,
  );

  const deleteAccount = account.createDELETE(
    new AccountService(new AccountRepository()),
    requireUser,
  );

  const getDashboard = dashboard.createGET(
    new DashboardService(new DashboardRepository()),
    requireUser,
  );

  const getHealth = health.createGET(new HealthService(new HealthRepository()));

  configureRateLimit(createRateLimiter(new PrismaRateLimitRepository()));

  return createApiRouter({
    auth: toNodeHandler(auth),
    account: { deleteAccount },
    dashboard: { getDashboard },
    health: { getHealth },
    analysis: {
      createAnalysis: analysisResourceHandlers.CREATE,
      getAnalysis: analysisResourceHandlers.GET,
      adaptAnalysis: analysisResourceHandlers.POST,
      deleteAnalysis: analysisResourceHandlers.DELETE,
    },
    importVacancy: { importVacancy: importVacancy.createPOST(requireUser) },
    documents: {
      createResume: resumes.createPOST(requireUser),
      getResume: resumeHandlers.GET,
      updateResume: resumeHandlers.PATCH,
      deleteResume: resumeHandlers.DELETE,
      getResumeFile: resumeFile.createGET(requireUser),
      download: download.createGET(requireUser),
      updateVersion,
    },
  });
}
