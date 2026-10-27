import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { dashboard } from "../../frontend/tests/fixtures";

it("F09: dashboard aceita uma resposta válida mesmo quando a API leva mais de quatro segundos", async () => {
  vi.useFakeTimers();
  const service = {
    get: vi.fn(() => new Promise<typeof dashboard>((resolve) => {
      setTimeout(() => resolve(dashboard), 5000);
    })),
  };
  const onError = vi.fn();
  const view = renderHook(() => useDashboard(service, onError));
  await act(() => vi.advanceTimersByTimeAsync(20000));
  expect(service.get).toHaveBeenCalledTimes(6);
  expect(onError).not.toHaveBeenCalled();
  // Four successful responses have already arrived; the UI must have data.
  expect(view.result.current.dashboard).toEqual(dashboard);
});
