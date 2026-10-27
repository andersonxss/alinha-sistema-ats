import { useEffect, useRef } from "react";
import { notifications } from "@/shared/lib/notifications";
import type { Analysis } from "../model/types";

export function useAnalysisNotifications(analysis: Analysis | null) {
  const observed = useRef(new Map<string, string>());

  useEffect(() => {
    if (!analysis) return;
    const statuses = observed.current;
    const analysisKey = `analysis:${analysis.id}`;
    const previous = statuses.get(analysisKey);
    if (analysis.status === "failed" && previous !== "failed") {
      const reason =
        analysis.error ||
        analysis.tasks.find((task) => task.kind === "analyze")?.error;
      notifications.error(
        reason ||
          "Não foi possível concluir a análise. Inicie uma nova análise.",
        analysisKey,
      );
    }
    if (
      analysis.status === "completed" &&
      previous &&
      previous !== "completed"
    ) {
      notifications.success(
        "Análise concluída. Confira o resultado.",
        analysisKey,
      );
    }
    statuses.set(analysisKey, analysis.status);

    for (const task of analysis.tasks) {
      if (task.kind === "analyze") continue;
      const key = `task:${task.id}`;
      const before = statuses.get(key);
      if (before === task.status) continue;
      statuses.set(key, task.status);
      if (task.status === "failed") {
        notifications.error(
          task.error || "Não foi possível concluir o processamento.",
          key,
        );
      } else if (task.status === "completed" && before) {
        notifications.success(
          task.kind === "export"
            ? "Exportação concluída. Seus arquivos estão disponíveis."
            : "Versão adaptada pronta para revisão.",
          key,
        );
      }
    }
  }, [analysis]);
}
