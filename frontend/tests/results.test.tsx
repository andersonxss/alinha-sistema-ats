import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AnalysisResult } from "@/features/analysis/ui/AnalysisResult";
import { statusLabels, statusVariant } from "@/features/analysis/model/labels";
import { analysis, version } from "./fixtures";
const run = async (action: () => Promise<void>) => action();
function props() {
  return {
    busy: false,
    run,
    refresh: vi.fn(),
    onDeleted: vi.fn(),
    service: {
      remove: vi.fn().mockResolvedValue({ ok: true }),
      adapt: vi.fn().mockResolvedValue({ ok: true }),
    },
    versions: {
      approve: vi.fn(),
      downloadUrl: (id: string) => `https://api.example.com/api/download/${id}`,
    },
  };
}
it.each(["pending", "processing", "failed"])(
  "apresenta estado %s e mensagem do processamento",
  (status) => {
    const data = {
      ...analysis(),
      status,
      error: status === "failed" ? "Falha do provedor" : null,
    };
    render(<AnalysisResult analysis={data} {...props()} />);
    expect(
      screen.getByRole("heading", { name: statusLabels[status] }),
    ).toBeTruthy();
    if (status === "failed")
      expect(screen.getByRole("alert").textContent).toContain(
        "Falha do provedor",
      );
  },
);
it("cancelar ou Escape não exclui; confirmação exclui e retorna ao histórico", async () => {
  const input = props();
  render(<AnalysisResult analysis={analysis()} {...input} />);
  fireEvent.click(screen.getByRole("button", { name: "Excluir análise" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(input.service.remove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Excluir análise" }));
  fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  expect(input.service.remove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Excluir análise" }));
  fireEvent.click(
    within(screen.getByRole("alertdialog")).getByRole("button", {
      name: "Excluir análise",
    }),
  );
  await waitFor(() =>
    expect(input.service.remove).toHaveBeenCalledWith("analysis-1"),
  );
  expect(input.onDeleted).toHaveBeenCalledTimes(1);
});
it("resultado concluído mantém adaptação, versões e links de download", async () => {
  const data = {
    ...analysis(),
    status: "completed",
    score: 80,
    versions: [version],
    result: {
      summary: "Resumo",
      provisional: false,
      recommendations: [],
      questions: [],
      dimensions: [],
      requirements: [],
      readability: { words: 120, warnings: [] },
    },
  };
  const input = props();
  render(<AnalysisResult analysis={data} {...input} />);
  expect(screen.getByRole("link", { name: /PDF/ }).getAttribute("href")).toBe(
    "https://api.example.com/api/download/export-1",
  );
  fireEvent.click(
    screen.getByRole("button", { name: /Gerar versão adaptada/ }),
  );
  await waitFor(() =>
    expect(input.service.adapt).toHaveBeenCalledWith(data.id),
  );
  expect(input.refresh).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Revisar e editar" }));
  expect(screen.getByRole("textbox")).toBeTruthy();
});
it("status desconhecido mantém variante neutra", () => {
  expect(statusVariant("unknown")).toBe("secondary");
  expect(statusVariant("failed")).toBe("destructive");
});
