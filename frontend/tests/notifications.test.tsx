import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { useFeedbackMessage } from "@/shared/hooks/use-feedback-message";
import { useActionFeedback } from "@/shared/hooks/use-action-feedback";
import { useAuthForm } from "@/features/auth/hooks/use-auth-form";
import { useAnalysisNotifications } from "@/features/analysis/hooks/use-analysis-notifications";
import { analysis } from "./fixtures";

beforeEach(() => {
  vi.spyOn(toast, "error").mockReturnValue("error");
  vi.spyOn(toast, "success").mockReturnValue("success");
  vi.spyOn(toast, "dismiss").mockReturnValue("dismissed");
});

it("reutiliza o mesmo toast ao repetir um erro e o fecha ao corrigir", () => {
  const { result } = renderHook(() => useFeedbackMessage("error"));
  const update = result.current[1];
  act(() => update("Confira os dados."));
  expect(result.current[0]).toBe("Confira os dados.");
  expect(result.current[1]).toBe(update);
  act(() => update("Confira os dados."));
  expect(vi.mocked(toast.error).mock.calls[0][1]?.id).toBe(
    vi.mocked(toast.error).mock.calls[1][1]?.id,
  );
  act(() => update(""));
  expect(toast.dismiss).toHaveBeenCalledWith(
    vi.mocked(toast.error).mock.calls[0][1]?.id,
  );
});

it("apresenta erros de ações e confirmações de sucesso", async () => {
  const { result } = renderHook(() => useActionFeedback());
  await act(() =>
    result.current.run(async () => {
      throw new Error("Falha ao salvar.");
    }),
  );
  expect(toast.error).toHaveBeenCalledWith(
    "Falha ao salvar.",
    expect.any(Object),
  );
  act(() => result.current.setNotice("Currículo revisado e salvo."));
  expect(toast.success).toHaveBeenCalledWith(
    "Currículo revisado e salvo.",
    expect.any(Object),
  );
});

it("notifica validação e login concluído sem autenticar dados inválidos", async () => {
  const service = {
    signIn: vi.fn().mockResolvedValue({}),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };
  const { result } = renderHook(() => useAuthForm(service));
  await act(() => result.current.submit(new FormData()));
  expect(toast.error).toHaveBeenCalledWith(
    "Informe um e-mail válido.",
    expect.any(Object),
  );
  expect(service.signIn).not.toHaveBeenCalled();
  const form = new FormData();
  form.set("email", "teste@example.com");
  form.set("password", "senha-de-teste");
  await act(() => result.current.submit(form));
  expect(toast.success).toHaveBeenCalledWith(
    "Você entrou na sua conta.",
    expect.any(Object),
  );
});

it("notifica falha de processamento uma vez durante atualizações repetidas", () => {
  const failed = {
    ...analysis(),
    status: "failed",
    error: "O fornecedor recusou a análise.",
  };
  const view = renderHook(({ value }) => useAnalysisNotifications(value), {
    initialProps: { value: failed },
  });
  view.rerender({ value: { ...failed } });
  expect(toast.error).toHaveBeenCalledTimes(1);
  expect(toast.error).toHaveBeenCalledWith(failed.error, expect.any(Object));
});

it("notifica conclusão de análise e exportação sem repetir a cada polling", () => {
  const pending = {
    ...analysis(),
    tasks: [
      {
        id: "export-1",
        kind: "export",
        status: "processing",
        stage: "",
        attempts: 1,
        availableAt: "",
        error: null,
      },
    ],
  };
  const view = renderHook(({ value }) => useAnalysisNotifications(value), {
    initialProps: { value: pending },
  });
  const completed = {
    ...pending,
    status: "completed",
    tasks: [{ ...pending.tasks[0], status: "completed" }],
  };
  view.rerender({ value: completed });
  view.rerender({ value: { ...completed } });
  expect(toast.success).toHaveBeenCalledTimes(2);
});

it("notifica falhas de adaptação e exportação", () => {
  const failed = {
    ...analysis(),
    tasks: ["adapt", "export"].map((kind) => ({
      id: kind,
      kind,
      status: "failed",
      stage: "",
      attempts: 3,
      availableAt: "",
      error: `Falha em ${kind}.`,
    })),
  };
  renderHook(() => useAnalysisNotifications(failed));
  expect(toast.error).toHaveBeenCalledTimes(2);
  expect(toast.error).toHaveBeenCalledWith(
    "Falha em adapt.",
    expect.any(Object),
  );
  expect(toast.error).toHaveBeenCalledWith(
    "Falha em export.",
    expect.any(Object),
  );
});
