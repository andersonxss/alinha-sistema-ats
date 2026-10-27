import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AuthService } from "@/features/auth/application/ports";
import { AccessForm } from "@/features/auth/ui/AccessForm";

function renderAccessForm() {
  const service = {
    signIn: vi.fn<AuthService["signIn"]>().mockResolvedValue({}),
    signUp: vi.fn<AuthService["signUp"]>().mockResolvedValue({}),
    signOut: vi.fn<AuthService["signOut"]>(),
  };
  render(<AccessForm service={service} />);
  return service;
}

function fillField(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("alertas de validação no formulário de acesso", () => {
  it.each([
    ["", "", "Informe um e-mail válido."],
    ["email-invalido", "senha", "Informe um e-mail válido."],
    ["pessoa@example.com", "", "Informe sua senha."],
  ])(
    "mostra o alerta ao clicar em entrar com e-mail '%s' e senha '%s'",
    async (email, password, message) => {
      const service = renderAccessForm();
      fillField("E-mail", email);
      fillField("Senha", password);
      fireEvent.click(
        screen.getByRole("button", { name: /Entrar no meu espaço/ }),
      );
      expect((await screen.findByRole("alert")).textContent).toContain(message);
      expect(service.signIn).not.toHaveBeenCalled();
      expect(service.signUp).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["", "senha-segura-123", "Informe seu nome."],
    ["Pessoa", "curta", "A senha deve ter ao menos 12 caracteres."],
  ])(
    "mostra a validação do cadastro para nome '%s' e senha '%s'",
    async (name, password, message) => {
      const service = renderAccessForm();
      fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
      fillField("Seu nome", name);
      fillField("E-mail", "pessoa@example.com");
      fillField("Senha", password);
      fireEvent.click(
        screen.getByRole("button", { name: /Criar minha conta/ }),
      );
      expect((await screen.findByRole("alert")).textContent).toContain(message);
      expect(service.signUp).not.toHaveBeenCalled();
      expect(service.signIn).not.toHaveBeenCalled();
    },
  );

  it("limpa o alerta após corrigir os dados e envia as credenciais", async () => {
    const service = renderAccessForm();
    fireEvent.click(
      screen.getByRole("button", { name: /Entrar no meu espaço/ }),
    );
    expect(await screen.findByRole("alert")).toBeTruthy();
    fillField("E-mail", "pessoa@example.com");
    fillField("Senha", "senha-segura-123");
    fireEvent.click(
      screen.getByRole("button", { name: /Entrar no meu espaço/ }),
    );
    await waitFor(() =>
      expect(service.signIn).toHaveBeenCalledWith({
        email: "pessoa@example.com",
        password: "senha-segura-123",
      }),
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("remove o alerta ao alternar de login para cadastro", async () => {
    renderAccessForm();
    fireEvent.click(
      screen.getByRole("button", { name: /Entrar no meu espaço/ }),
    );
    expect(await screen.findByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByLabelText("Seu nome")).toBeTruthy();
  });
});
