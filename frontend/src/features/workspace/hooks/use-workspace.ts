import type { AnalysisService } from "@/features/analysis/application/ports";
import { useAnalysis } from "@/features/analysis/hooks/use-analysis";
import type { DashboardService } from "@/features/dashboard/application/ports";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useActionFeedback } from "@/shared/hooks/use-action-feedback";
import { useState } from "react";
import type { WorkspaceScreen } from "../model/navigation";
export function useWorkspace(
  dashboardService: DashboardService,
  analysisService: Pick<AnalysisService, "get">,
) {
  const [screen, setScreen] = useState<WorkspaceScreen>("home");
  const feedback = useActionFeedback();
  const { dashboard, refresh } = useDashboard(
    dashboardService,
    feedback.setError,
  );
  const { selected, open } = useAnalysis(analysisService);
  const openAnalysis = (id: string) =>
    feedback.run(async () => {
      if (await open(id)) setScreen("result");
    });
  return {
    screen,
    setScreen,
    ...feedback,
    dashboard,
    refresh,
    selected,
    openAnalysis,
  };
}
