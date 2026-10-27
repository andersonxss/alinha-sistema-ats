import { describe, expect, it } from "vitest";
import { versionApprovalSchema } from "@/features/versions/model/schemas";

describe("@spec:AC-005 validação de aprovação de versão", () => {
  it("exige texto entre 150 e 60.000 caracteres e confirmação explícita", () => {
    expect(
      versionApprovalSchema.safeParse({ text: "x".repeat(150), approved: true })
        .success,
    ).toBe(true);
    expect(
      versionApprovalSchema.safeParse({ text: "x".repeat(149), approved: true })
        .success,
    ).toBe(false);
    expect(
      versionApprovalSchema.safeParse({
        text: "x".repeat(60_001),
        approved: true,
      }).success,
    ).toBe(false);
    expect(
      versionApprovalSchema.safeParse({
        text: "x".repeat(150),
        approved: false,
      }).success,
    ).toBe(false);
  });
});
