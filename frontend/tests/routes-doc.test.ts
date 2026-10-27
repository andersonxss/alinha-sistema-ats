import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const architecture = readFileSync(
  resolve(process.cwd(), "../docs/frontend-architecture.md"),
  "utf8",
);
const specification = readFileSync(
  resolve(process.cwd(), "../.spec/features/frontend-routes-zod/spec.md"),
  "utf8",
);

describe("@spec:AC-001 mapa de rotas e estrutura por tela", () => {
  it("documenta cada rota, página e feature correspondente", () => {
    for (const route of [
      "`/`",
      "`/acesso`",
      "`/analises/nova`",
      "`/curriculos`",
      "`/historico`",
      "`/analises/[analysisId]`",
      "`/configuracoes`",
    ]) {
      expect(architecture).toContain(route);
    }
    expect(architecture).toContain("src/app/(workspace)/page.tsx");
    expect(architecture).toContain("features/analysis/ui/AnalysisResult");
    expect(architecture).toContain("features/account/ui/AccountSettings");
    expect(architecture).toContain("model/schemas.ts");
  });

  it("registra na própria especificação os caminhos, layouts e regras de acesso", () => {
    for (const route of [
      "`/acesso`",
      "`/`",
      "`/analises/nova`",
      "`/curriculos`",
      "`/historico`",
      "`/analises/[analysisId]`",
      "`/configuracoes`",
    ]) {
      expect(specification).toContain(route);
    }
    expect(specification).toContain("frontend/src/app/(workspace)/layout.tsx");
    expect(specification).toContain("sem sessão redireciona para `/acesso`");
    expect(specification).toContain(
      "`analysisId` é o identificador da análise",
    );
  });
});
