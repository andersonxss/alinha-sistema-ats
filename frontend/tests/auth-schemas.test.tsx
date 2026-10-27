import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { signInSchema, signUpSchema } from "@/features/auth/model/schemas";
import { useAuthForm } from "@/features/auth/hooks/use-auth-form";

describe("@spec:AC-002 validação de acesso", () => {
  it("aceita credenciais válidas e rejeita e-mail ou senha inválidos", () => {
    expect(
      signInSchema.safeParse({ email: "pessoa@example.com", password: "x" })
        .success,
    ).toBe(true);
    expect(
      signInSchema.safeParse({ email: "invalido", password: "x" }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({
        name: "Pessoa",
        email: "pessoa@example.com",
        password: "curta",
      }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({
        name: " ",
        email: "pessoa@example.com",
        password: "senha-segura-123",
      }).success,
    ).toBe(false);
  });

  it("não chama o serviço quando as credenciais são inválidas", async () => {
    const signIn = vi.fn();
    const signUp = vi.fn();
    const { result } = renderHook(() =>
      useAuthForm({ signIn, signUp, signOut: vi.fn() }),
    );
    await act(async () => {
      await result.current.submit(new FormData());
    });
    expect(signIn).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  });
});
