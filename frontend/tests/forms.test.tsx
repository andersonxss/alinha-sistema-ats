import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { VersionEditor } from "@/features/versions/ui/VersionEditor";
import { NewAnalysisForm } from "@/features/analysis/ui/NewAnalysisForm";
import { useResumeInput } from "@/features/resumes/hooks/use-resume-input";
import { resume, version } from "./fixtures";
const run = async (action: () => Promise<void>) => action();
function resumeService() {
  return {
    get: vi.fn().mockResolvedValue(resume),
    upload: vi.fn().mockResolvedValue(resume),
    update: vi.fn().mockResolvedValue({ ok: true }),
    remove: vi.fn().mockResolvedValue({ ok: true }),
    fileUrl: (id: string) => `/api/resumes/${id}/file`,
  };
}
it("editor exige confirmação, invalida aprovação ao editar e envia a revisão atual", async () => {
  const approve = vi.fn().mockResolvedValue({ ok: true });
  const onSaved = vi.fn();
  const service = { approve };
  const view = render(
    <VersionEditor
      version={version}
      service={service}
      busy={false}
      run={run}
      onSaved={onSaved}
    />,
  );
  const save = screen.getByRole("button", {
    name: "Aprovar e gerar PDF + DOCX",
  });
  expect((save as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(
    screen.getByRole("button", { name: "Aceitar reorganização" }),
  );
  fireEvent.click(screen.getByRole("checkbox"));
  expect((save as HTMLButtonElement).disabled).toBe(false);
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Texto editado. ".repeat(20) },
  });
  expect((save as HTMLButtonElement).disabled).toBe(true);
  view.rerender(
    <VersionEditor
      version={{ ...version, revision: 3 }}
      service={service}
      busy={false}
      run={run}
      onSaved={onSaved}
    />,
  );
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "Texto editado. ".repeat(20),
  );
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(save);
  await waitFor(() =>
    expect(approve).toHaveBeenCalledWith(version.id, {
      text: "Texto editado. ".repeat(20),
      accepted: true,
      revision: 3,
    }),
  );
  expect(onSaved).toHaveBeenCalledTimes(1);
});
it("currículo mantém revisão, upload, notificações e atualização após exclusão", async () => {
  const service = resumeService(),
    refresh = vi.fn().mockResolvedValue(undefined),
    notify = vi.fn();
  const view = renderHook(() => useResumeInput(service, run, refresh, notify));
  const file = new File(["pdf"], "cv.pdf");
  await act(async () => {
    await view.result.current.upload(file);
  });
  expect(service.upload).toHaveBeenCalledWith(file);
  expect(view.result.current.saved).toBe(false);
  await act(async () => {
    await view.result.current.save();
  });
  expect(service.update).toHaveBeenCalledWith(resume.id, {
    text: resume.reviewedText,
    name: resume.name,
  });
  expect(view.result.current.saved).toBe(true);
  expect(notify).toHaveBeenCalledWith("Currículo revisado e salvo.");
  act(() => view.result.current.changeText("Texto novo"));
  expect(view.result.current.saved).toBe(false);
  await act(async () => {
    await view.result.current.remove();
  });
  expect(view.result.current.resume).toBeNull();
  expect(refresh).toHaveBeenCalledTimes(3);
});
it("nova análise exige revisão e consentimento e preserva importação por URL", async () => {
  const resumes = resumeService(),
    create = vi.fn().mockResolvedValue({ id: "a1" }),
    importUrl = vi.fn().mockResolvedValue({ text: "Requisitos. ".repeat(20) }),
    refresh = vi.fn().mockResolvedValue(undefined),
    onCreated = vi.fn();
  render(
    <NewAnalysisForm
      resumes={[resume]}
      onlyResume={false}
      busy={false}
      run={run}
      refresh={refresh}
      onCreated={onCreated}
      notify={vi.fn()}
      resumeService={resumes}
      analysisService={{ create }}
      vacancyService={{ importUrl }}
    />,
  );
  const createButton = screen.getByRole("button", {
    name: /Analisar compatibilidade/,
  });
  expect((createButton as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: resume.id },
  });
  await screen.findByLabelText("Nome do currículo");
  fireEvent.click(screen.getByRole("button", { name: "Salvar revisão" }));
  await screen.findByRole("button", { name: "✓ Currículo revisado" });
  fireEvent.click(screen.getByRole("button", { name: "Informar link" }));
  fireEvent.change(screen.getByLabelText("Link público da vaga"), {
    target: { value: "https://example.com/job" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Importar descrição" }));
  await waitFor(() =>
    expect(importUrl).toHaveBeenCalledWith("https://example.com/job"),
  );
  fireEvent.change(screen.getByLabelText("Cargo"), {
    target: { value: "Analista" },
  });
  fireEvent.change(screen.getByLabelText("Empresa"), {
    target: { value: "Empresa" },
  });
  expect((createButton as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(createButton);
  await waitFor(() =>
    expect(create).toHaveBeenCalledWith({
      resumeId: resume.id,
      text: "Requisitos. ".repeat(20),
      title: "Analista",
      company: "Empresa",
      url: "https://example.com/job",
      consent: true,
    }),
  );
  expect(onCreated).toHaveBeenCalledWith("a1");
});
