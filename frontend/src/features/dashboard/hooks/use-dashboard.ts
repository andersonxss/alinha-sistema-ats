import { errorMessage } from "@/shared/lib/error-message";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardService } from "../application/ports";
import type { Dashboard } from "../model/types";
export function useDashboard(
  service: DashboardService,
  onError: (message: string) => void,
) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const active = useRef(false);
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++request.current;
    try {
      const data = await service.get();
      if (active.current && current === request.current) setDashboard(data);
    } catch (error) {
      if (active.current && current === request.current)
        onError(errorMessage(error));
    }
  }, [service, onError]);
  useEffect(() => {
    active.current = true;
    void refresh();
    const timer = setInterval(() => void refresh(), 4000);
    return () => {
      active.current = false;
      ++request.current;
      clearInterval(timer);
    };
  }, [refresh]);
  return { dashboard, refresh };
}
