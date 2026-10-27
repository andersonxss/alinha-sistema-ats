import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { Toaster } from "@/shared/ui/sonner";
import { notifications } from "@/shared/lib/notifications";
import { AccessForm } from "@/features/auth/ui/AccessForm";
import { AccountSettings } from "@/features/account/ui/AccountSettings";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
});
afterEach(() => {
  toast.dismiss();
});

it("renderiza sucesso e erro no topo central com botão de fechar em português", async () => {
  render(<Toaster />);
  act(() => {
    notifications.success("Dados salvos.");
    notifications.error("Falha de conexão.");
  });
  const success = await screen.findByText("Dados salvos.");
  const error = await screen.findByText("Falha de conexão.");
  expect(
    success.closest("[data-sonner-toast]")?.getAttribute("data-type"),
  ).toBe("success");
  expect(error.closest("[data-sonner-toast]")?.getAttribute("data-type")).toBe(
    "error",
  );
  const list = error.closest("[data-sonner-toaster]");
  expect(list?.getAttribute("data-x-position")).toBe("center");
  expect(list?.getAttribute("data-y-position")).toBe("top");
  expect(
    screen.getAllByRole("button", { name: "Fechar notificação" }),
  ).toHaveLength(2);
});

it("validação de acesso dispara um toast real e permite repetir o envio", async () => {
  render(
    <>
      <Toaster />
      <AccessForm
        service={{ signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }}
      />
    </>,
  );
  const submit = screen.getByRole("button", { name: /Entrar no meu espaço/ });
  fireEvent.click(submit);
  await waitFor(() =>
    expect(
      document.querySelectorAll('[data-sonner-toast][data-type="error"]'),
    ).toHaveLength(1),
  );
  fireEvent.click(submit);
  await waitFor(() =>
    expect(
      document.querySelectorAll('[data-sonner-toast][data-type="error"]'),
    ).toHaveLength(1),
  );
  expect(document.querySelector("[data-sonner-toast]")?.textContent).toContain(
    "Informe um e-mail válido.",
  );
});

it("validação de exclusão da conta usa a notificação sem executar a exclusão", async () => {
  const onDelete = vi.fn();
  render(
    <>
      <Toaster />
      <AccountSettings
        email="pessoa@example.com"
        busy={false}
        onDelete={onDelete}
      />
    </>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Excluir conta e todos os dados" }),
  );
  await waitFor(() =>
    expect(
      document.querySelector("[data-sonner-toast]")?.textContent,
    ).toContain("Informe um e-mail válido para confirmar."),
  );
  expect(onDelete).not.toHaveBeenCalled();
});
