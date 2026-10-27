import { describe, expect, it } from "vitest";
import { deleteAccountSchema } from "@/features/account/model/schemas";

describe("@spec:AC-005 validação de exclusão de conta", () => {
  it("aceita apenas e-mail válido como confirmação", () => {
    expect(
      deleteAccountSchema.safeParse({ confirmation: "pessoa@example.com" })
        .success,
    ).toBe(true);
    expect(
      deleteAccountSchema.safeParse({ confirmation: "email-inválido" }).success,
    ).toBe(false);
    expect(deleteAccountSchema.safeParse({ confirmation: "" }).success).toBe(
      false,
    );
  });
});
