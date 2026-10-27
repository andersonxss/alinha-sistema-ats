import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import Workspace from "@/features/workspace/ui/Workspace";

const session = vi.hoisted(() => ({
  value: {
    data: null as null | { user: { id: string; name: string; email: string } },
    isPending: false,
  },
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
}));
vi.mock("@/features/auth/api/auth-client", () => ({
  auth: {
    useSession: () => session.value,
    signIn: { email: session.login },
    signUp: { email: session.signup },
    signOut: session.logout,
  },
}));

beforeEach(() => {
  session.value = { data: null, isPending: false };
  session.login.mockReset();
  session.signup.mockReset();
  session.logout.mockReset();
});

it("cadastro envia nome, e-mail e senha e comunica falha de conexão", async () => {
  session.signup.mockRejectedValue(new Error("offline"));
  render(<Workspace />);
  fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
  fireEvent.change(screen.getByLabelText("Seu nome"), {
    target: { value: "Pessoa Teste" },
  });
  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: "teste@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: "senha-de-teste" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: /Criar minha conta/ }).closest("form")!,
  );
  await waitFor(() =>
    expect(session.signup).toHaveBeenCalledWith({
      name: "Pessoa Teste",
      email: "teste@example.com",
      password: "senha-de-teste",
    }),
  );
  expect((await screen.findByRole("alert")).textContent).toContain(
    "Não foi possível conectar.",
  );
});

it("encerrar sessão remove os dados e os timers da área autenticada", async () => {
  vi.useFakeTimers();
  session.value.data = {
    user: { id: "user-1", name: "Pessoa Teste", email: "teste@example.com" },
  };
  const request = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      resumes: [],
      analyses: [],
      tasks: [],
      aiConfigured: true,
    }),
  });
  vi.stubGlobal("fetch", request);
  const view = render(<Workspace />);
  await act(async () => {});
  fireEvent.click(screen.getAllByRole("button", { name: "Sair" })[0]);
  expect(session.logout).toHaveBeenCalledTimes(1);
  session.value.data = null;
  view.rerender(<Workspace />);
  expect(screen.queryByRole("heading", { name: /Olá, Pessoa/ })).toBeNull();
  expect(
    screen.getByRole("button", { name: /Entrar no meu espaço/ }),
  ).toBeTruthy();
  const calls = request.mock.calls.length;
  await act(() => vi.advanceTimersByTimeAsync(8000));
  expect(request).toHaveBeenCalledTimes(calls);
  expect(vi.getTimerCount()).toBe(0);
});

it("mostra carregamento enquanto a sessão está pendente", () => {
  session.value.isPending = true;
  render(<Workspace />);
  expect(screen.getByRole("status").textContent).toContain("Carregando");
});

it("visitante entra e recebe a mensagem de credenciais inválidas", async () => {
  session.login.mockResolvedValue({
    error: { code: "INVALID_EMAIL_OR_PASSWORD" },
  });
  render(<Workspace />);
  fireEvent.change(screen.getByLabelText("E-mail"), {
    target: { value: "teste@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: "senha-invalida" },
  });
  fireEvent.submit(
    screen
      .getByRole("button", { name: /Entrar no meu espaço/ })
      .closest("form")!,
  );
  await waitFor(() =>
    expect(session.login).toHaveBeenCalledWith({
      email: "teste@example.com",
      password: "senha-invalida",
    }),
  );
  expect((await screen.findByRole("alert")).textContent).toContain(
    "E-mail ou senha incorretos.",
  );
});

it("usuário navega pelo painel, histórico, currículos e configurações", async () => {
  session.value.data = {
    user: { id: "user-1", name: "Pessoa Teste", email: "teste@example.com" },
  };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        resumes: [],
        analyses: [],
        tasks: [],
        aiConfigured: true,
      }),
    }),
  );
  render(<Workspace />);
  expect(screen.getByRole("heading", { name: /Olá, Pessoa/ })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Histórico" }));
  expect(
    screen.getByRole("heading", { name: "Histórico de análises" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Meus currículos" }));
  expect(screen.getByRole("heading", { name: "Meus currículos" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Configurações" }));
  expect(screen.getByRole("heading", { name: "Configurações" })).toBeTruthy();
  await waitFor(() => expect(fetch).toHaveBeenCalled());
});
