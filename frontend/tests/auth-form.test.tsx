import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { authenticate } from "@/features/auth/application/authenticate";
import type { AuthService } from "@/features/auth/application/ports";
import { useAuthForm } from "@/features/auth/hooks/use-auth-form";
import { validateAuthCredentials } from "@/features/auth/model/auth-credentials";

const input = {
  name: "Pessoa Teste",
  email: "teste@example.com",
  password: "senha-de-teste",
};

function createService() {
  return {
    signIn: vi.fn<AuthService["signIn"]>().mockResolvedValue({}),
    signUp: vi.fn<AuthService["signUp"]>().mockResolvedValue({}),
    signOut: vi.fn<AuthService["signOut"]>(),
  };
}

function createForm(values = input) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

describe("preparação das credenciais", () => {
  it("envia somente e-mail e senha no login", () => {
    expect(validateAuthCredentials("signIn", input)).toEqual({
      success: true,
      credentials: {
        mode: "signIn",
        input: { email: input.email, password: input.password },
      },
    });
  });

  it("preserva nome no cadastro e rejeita nome vazio", () => {
    expect(validateAuthCredentials("signUp", input)).toEqual({
      success: true,
      credentials: { mode: "signUp", input },
    });
    expect(validateAuthCredentials("signUp", { ...input, name: "" })).toEqual({
      success: false,
      error: "Informe seu nome.",
    });
  });
});

describe("execução da autenticação", () => {
  it("executa cadastro sem chamar login", async () => {
    const service = createService();
    await expect(
      authenticate(service, { mode: "signUp", input }),
    ).resolves.toEqual({ error: "" });
    expect(service.signUp).toHaveBeenCalledWith(input);
    expect(service.signIn).not.toHaveBeenCalled();
  });

  it.each([
    ["INVALID_EMAIL_OR_PASSWORD", "E-mail ou senha incorretos."],
    [
      "UNKNOWN",
      "Não foi possível entrar ou cadastrar. Confira seus dados; a senha deve ter ao menos 12 caracteres.",
    ],
  ])("traduz o erro %s", async (code, message) => {
    const service = createService();
    service.signIn.mockResolvedValue({ error: { code } });
    await expect(
      authenticate(service, { mode: "signIn", input }),
    ).resolves.toEqual({ error: message });
  });

  it("traduz falhas de conexão", async () => {
    const service = createService();
    service.signIn.mockRejectedValue(new Error("offline"));
    await expect(
      authenticate(service, { mode: "signIn", input }),
    ).resolves.toEqual({
      error: "Não foi possível conectar. Tente novamente.",
    });
  });
});

describe("estado do formulário", () => {
  it("mantém busy durante a requisição e libera após a resposta", async () => {
    const service = createService();
    let complete!: (value: Awaited<ReturnType<AuthService["signIn"]>>) => void;
    service.signIn.mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    const { result } = renderHook(() => useAuthForm(service));
    let submission!: Promise<void>;
    act(() => {
      submission = result.current.submit(createForm());
    });
    expect(result.current.busy).toBe(true);
    await act(async () => {
      complete({});
      await submission;
    });
    expect(result.current.busy).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("limpa erros ao alternar modo e valida cadastro antes de chamar o serviço", async () => {
    const service = createService();
    const { result } = renderHook(() => useAuthForm(service));
    await act(() => result.current.submit(new FormData()));
    expect(result.current.error).not.toBe("");
    expect(result.current.busy).toBe(false);
    act(() => result.current.toggleMode());
    expect(result.current.signup).toBe(true);
    expect(result.current.error).toBe("");
    await act(() =>
      result.current.submit(createForm({ ...input, password: "curta" })),
    );
    expect(result.current.error).toBe(
      "A senha deve ter ao menos 12 caracteres.",
    );
    expect(service.signUp).not.toHaveBeenCalled();
    expect(service.signIn).not.toHaveBeenCalled();
    expect(result.current.busy).toBe(false);
  });

  it("libera busy e apresenta falha de conexão", async () => {
    const service = createService();
    service.signIn.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useAuthForm(service));
    await act(() => result.current.submit(createForm()));
    expect(result.current.busy).toBe(false);
    expect(result.current.error).toBe(
      "Não foi possível conectar. Tente novamente.",
    );
  });
});
