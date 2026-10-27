import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useAnalysis } from "@/features/analysis/hooks/use-analysis";
import { analysis, dashboard } from "./fixtures";
it("dashboard atualiza a cada quatro segundos e encerra timer ao desmontar", async () => {
  vi.useFakeTimers();
  const service = { get: vi.fn().mockResolvedValue(dashboard) };
  const onError = vi.fn();
  const view = renderHook(() => useDashboard(service, onError));
  await act(async () => {});
  expect(service.get).toHaveBeenCalledTimes(1);
  await act(() => vi.advanceTimersByTimeAsync(3999));
  expect(service.get).toHaveBeenCalledTimes(1);
  await act(() => vi.advanceTimersByTimeAsync(1));
  expect(service.get).toHaveBeenCalledTimes(2);
  view.unmount();
  await act(() => vi.advanceTimersByTimeAsync(8000));
  expect(service.get).toHaveBeenCalledTimes(2);
  expect(vi.getTimerCount()).toBe(0);
});
it("dashboard apresenta falha de carregamento", async () => {
  const service = { get: vi.fn().mockRejectedValue(new Error("Sem conexão")) };
  const onError = vi.fn();
  renderHook(() => useDashboard(service, onError));
  await act(async () => {});
  expect(onError).toHaveBeenCalledWith("Sem conexão");
});
it("análise selecionada atualiza e respostas anteriores não substituem nova seleção", async () => {
  vi.useFakeTimers();
  const first = analysis("a1"),
    second = analysis("a2");
  let resolveOld!: (value: ReturnType<typeof analysis>) => void;
  const service = {
    get: vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValue(second),
  };
  const view = renderHook(() => useAnalysis(service));
  await act(async () => {
    await view.result.current.open("a1");
  });
  await act(() => vi.advanceTimersByTimeAsync(4000));
  await act(async () => {
    await view.result.current.open("a2");
  });
  await act(async () => resolveOld(first));
  expect(view.result.current.selected?.id).toBe("a2");
  await act(() => vi.advanceTimersByTimeAsync(4000));
  expect(service.get).toHaveBeenLastCalledWith("a2");
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
