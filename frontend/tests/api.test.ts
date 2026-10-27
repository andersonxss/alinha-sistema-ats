import { beforeEach, expect, it, vi } from "vitest";
import { api, API_BASE } from "@/shared/api/client";
import { createDashboardService } from "@/features/dashboard/api/dashboard-api";
import { createResumesService } from "@/features/resumes/api/resumes-api";
import { createAnalysisService } from "@/features/analysis/api/analysis-api";
import { createVacancyService } from "@/features/analysis/api/vacancy-api";
import { createVersionsService } from "@/features/versions/api/versions-api";
import { createAccountService } from "@/features/account/api/account-api";
import { deleteAccount } from "@/features/account/application/delete-account";
const request = vi.fn();
beforeEach(() => {
  request
    .mockReset()
    .mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  vi.stubGlobal("fetch", request);
});
it("preserva rotas, métodos, credenciais e corpos JSON de todas as operações", async () => {
  const resumes = createResumesService(api);
  const analyses = createAnalysisService(api);
  const input = {
    resumeId: "r1",
    text: "Vaga",
    title: "Cargo",
    company: "Empresa",
    consent: true,
    url: "https://example.com/job",
  };
  const calls: [() => Promise<unknown>, string, string, unknown?][] = [
    [() => createDashboardService(api).get(), "/api/dashboard", "GET"],
    [() => resumes.get("r1"), "/api/resumes/r1", "GET"],
    [
      () => resumes.update("r1", { text: "Texto", name: "Nome" }),
      "/api/resumes/r1",
      "PATCH",
      { text: "Texto", name: "Nome" },
    ],
    [() => resumes.remove("r1"), "/api/resumes/r1", "DELETE"],
    [() => analyses.get("a1"), "/api/analyses/a1", "GET"],
    [() => analyses.create(input), "/api/analyses", "POST", input],
    [() => analyses.adapt("a1"), "/api/analyses/a1", "POST", {}],
    [() => analyses.remove("a1"), "/api/analyses/a1", "DELETE"],
    [
      () => createVacancyService(api).importUrl("https://example.com/job"),
      "/api/import",
      "POST",
      { url: "https://example.com/job" },
    ],
    [
      () =>
        createVersionsService(api).approve("v1", {
          text: "Final",
          accepted: true,
          revision: 2,
        }),
      "/api/versions/v1",
      "PATCH",
      { text: "Final", accepted: true, revision: 2 },
    ],
    [
      () => createAccountService(api).remove("teste@example.com"),
      "/api/account",
      "DELETE",
      { confirmation: "teste@example.com" },
    ],
  ];
  for (const [invoke, url, method, body] of calls) {
    await invoke();
    expect(request).toHaveBeenLastCalledWith(API_BASE + url, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  }
});
it("upload envia FormData sem fixar o boundary e downloads preservam a origem", async () => {
  const service = createResumesService(api, "https://api.example.com");
  const file = new File(["arquivo"], "cv.pdf");
  await service.upload(file);
  const [url, options] = request.mock.calls[0];
  expect(url).toBe(API_BASE + "/api/resumes");
  expect(options.headers).toEqual({});
  expect(options.credentials).toBe("include");
  expect(options.body.get("file")).toBe(file);
  expect(service.fileUrl("r1")).toBe(
    "https://api.example.com/api/resumes/r1/file",
  );
  expect(
    createVersionsService(api, "https://api.example.com").downloadUrl("e1"),
  ).toBe("https://api.example.com/api/download/e1");
});
it("propaga erro HTTP sem transformar falha em sucesso", async () => {
  request.mockResolvedValue({
    ok: false,
    json: async () => ({ error: "Revisão divergente" }),
  });
  await expect(
    createVersionsService(api).approve("v1", {
      text: "Texto",
      accepted: false,
      revision: 1,
    }),
  ).rejects.toThrow("Revisão divergente");
});
it("exclusão de conta só encerra sessão depois do sucesso", async () => {
  const order: string[] = [];
  const remove = vi.fn(async () => {
    order.push("remove");
  });
  const signOut = vi.fn(async () => {
    order.push("logout");
  });
  await deleteAccount({ remove }, { signOut }, "teste@example.com");
  expect(remove).toHaveBeenCalledWith("teste@example.com");
  expect(order).toEqual(["remove", "logout"]);
  remove.mockRejectedValue(new Error("Confirmação inválida"));
  signOut.mockClear();
  await expect(
    deleteAccount({ remove }, { signOut }, "outro@example.com"),
  ).rejects.toThrow();
  expect(signOut).not.toHaveBeenCalled();
});
