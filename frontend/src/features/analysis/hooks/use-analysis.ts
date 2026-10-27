import { useAnalysisNotifications } from "./use-analysis-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalysisService } from "../application/ports";
import type { Analysis } from "../model/types";
export function useAnalysis(service: Pick<AnalysisService, "get">) {
  const [selected, setSelected] = useState<Analysis | null>(null);
  const active = useRef(true);
  const request = useRef(0);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      ++request.current;
    };
  }, []);
  const open = useCallback(
    async (id: string) => {
      const current = ++request.current;
      const analysis = await service.get(id);
      if (!active.current || current !== request.current) return false;
      setSelected(analysis);
      return true;
    },
    [service],
  );
  const selectedId = selected?.id;
  useEffect(() => {
    if (!selectedId) return;
    let disposed = false;
    const timer = setInterval(async () => {
      const current = request.current;
      try {
        const analysis = await service.get(selectedId);
        if (!disposed && active.current && current === request.current)
          setSelected(analysis);
      } catch {
        // Preserve background retries; explicit opening reports errors.
      }
    }, 4000);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [selectedId, service]);
  useAnalysisNotifications(selected);
  return { selected, open };
}
