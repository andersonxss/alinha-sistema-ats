import type { RequireUser } from "@/domain/repositories/require-user.contract";
import { aiConfigurationStatus } from "@/infrastructure/ai/config";
import type { DashboardService } from "@/modules/dashboard/application/dashboard.service";
import { handle } from "@/presentation/http/http";
export const dynamic = "force-dynamic";

export function createGET(service: DashboardService, requireUser: RequireUser) {
  return async function GET(request: Request) {
    return handle(async () => {
      const user = await requireUser(request);
      const { resumes, analyses, tasks } = await service.get(user.id);
      const ai = aiConfigurationStatus();
      return Response.json({
        user: { name: user.name, email: user.email },
        resumes,
        analyses,
        tasks,
        aiConfigured: ai.configured,
        aiConfiguredModel: ai.modelConfigured,
        uploads: resumes.length,
      });
    });
  };
}
