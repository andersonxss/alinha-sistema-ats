import { describe, expect, it } from "vitest";
import {
  newAnalysisSchema,
  vacancyUrlSchema,
} from "@/features/analysis/model/schemas";

describe("@spec:AC-004 validação de nova análise", () => {
  it("valida cargo, empresa, descrição e consentimento", () => {
    const valid = {
      title: "Analista",
      company: "Empresa",
      vacancy: "x".repeat(100),
      consent: true,
    };
    expect(newAnalysisSchema.safeParse(valid).success).toBe(true);
    expect(newAnalysisSchema.safeParse({ ...valid, title: "A" }).success).toBe(
      false,
    );
    expect(
      newAnalysisSchema.safeParse({ ...valid, company: "A" }).success,
    ).toBe(false);
    expect(
      newAnalysisSchema.safeParse({ ...valid, vacancy: "x".repeat(99) })
        .success,
    ).toBe(false);
    expect(
      newAnalysisSchema.safeParse({ ...valid, vacancy: "x".repeat(30_001) })
        .success,
    ).toBe(false);
    expect(
      newAnalysisSchema.safeParse({ ...valid, consent: false }).success,
    ).toBe(false);
  });

  it("aceita somente URLs HTTP ou HTTPS válidas", () => {
    expect(
      vacancyUrlSchema.safeParse({ url: "https://example.com/job" }).success,
    ).toBe(true);
    expect(
      vacancyUrlSchema.safeParse({ url: "javascript:alert(1)" }).success,
    ).toBe(false);
    expect(vacancyUrlSchema.safeParse({ url: "inválida" }).success).toBe(false);
  });
});
