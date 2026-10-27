import { notifications } from "@/shared/lib/notifications";
import type { RunAction } from "@/shared/model/action";
import { useState } from "react";
import type { AnalysisService } from "../application/ports";
export function useAnalysisActions(
  id: string,
  service: Pick<AnalysisService, "remove" | "adapt">,
  run: RunAction,
  refresh: () => unknown,
  onDeleted: () => void,
) {
  const [editing, setEditing] = useState<string | null>(null);
  return {
    editing,
    toggleEditor: (id: string) => setEditing(editing === id ? null : id),
    remove: () =>
      run(async () => {
        await service.remove(id);
        notifications.success("Análise excluída.");
        onDeleted();
      }),
    adapt: () =>
      run(async () => {
        await service.adapt(id);
        notifications.success("Geração da versão adaptada solicitada.");
        refresh();
      }),
  };
}
