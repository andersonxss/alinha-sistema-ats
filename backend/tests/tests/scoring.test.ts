import assert from "node:assert/strict";
import test from "node:test";
import type { Requirement } from "@/domain/repositories/scoring.contract";
import { mergedMonths } from "@/domain/resumes/merged-months";
import { scoreRequirements } from "@/domain/scoring/score-requirements";
import { validateEvidence } from "@/domain/scoring/validate-evidence";
import { analysisSchema } from "@/infrastructure/ai/schemas/analysis.schema";

const requirement = (overrides: Partial<Requirement> = {}): Requirement => ({
  description: "TypeScript",
  dimension: "technical",
  mandatory: false,
  source: "TypeScript",
  classification: "met",
  evidence: "TypeScript",
  explanation: "Evidência explícita.",
  ...overrides,
});
test("redistribui dimensões ausentes e explica cada contribuição", () => {
  const r = scoreRequirements([
    requirement(),
    requirement({
      description: "Responsabilidade",
      dimension: "responsibilities",
      classification: "partial",
    }),
  ]);
  assert.equal(r.score, 77);
  assert.equal(r.dimensions[0].weight, (35 / 65) * 100);
  assert.equal(
    Math.round(r.requirements.reduce((n, r) => n + r.contribution, 0)),
    r.score,
  );
});
test("obrigatório pesa o dobro e pendência produz estimativa provisória", () => {
  const r = scoreRequirements([
    requirement({ mandatory: true, classification: "confirm" }),
    requirement({ description: "SQL" }),
  ]);
  assert.equal(r.score, 33);
  assert.equal(r.provisional, true);
});
test("não evidenciado pontua zero sem afirmar ausência de competência", () => {
  assert.equal(
    scoreRequirements([
      requirement({ classification: "missing", evidence: null }),
    ]).score,
    0,
  );
});
test("períodos simultâneos não são contados duas vezes", () => {
  assert.equal(
    mergedMonths([
      { start: "2020-01", end: "2021-12" },
      { start: "2021-01", end: "2022-12" },
    ]),
    36,
  );
  assert.equal(mergedMonths([]), 0);
  assert.throws(() => mergedMonths([{ start: "2021-15", end: "2022-01" }]));
});
test("evidência inventada vira informação a confirmar", () => {
  const [r] = validateEvidence(
    [requirement({ evidence: "Sou especialista em TypeScript" })],
    "Conheço TypeScript",
    "TypeScript",
  );
  assert.equal(r.classification, "confirm");
  assert.equal(r.evidence, null);
});
test("requisito inventado e duplicação literal são rejeitados", () => {
  assert.throws(() =>
    validateEvidence([requirement()], "TypeScript", "Python"),
  );
  assert.throws(() =>
    validateEvidence(
      [requirement(), requirement()],
      "TypeScript",
      "TypeScript",
    ),
  );
});
test("saída arbitrária de IA não passa pelo esquema", () => {
  assert.equal(
    analysisSchema.safeParse({ score: 99, summary: "Aprovado" }).success,
    false,
  );
  assert.equal(
    analysisSchema.safeParse({
      summary: "Resumo de análise.",
      requirements: [requirement({ classification: "inventado" as never })],
      recommendations: [],
      questions: [],
    }).success,
    false,
  );
});
test("tempo exigido não ganha pontos sem confirmação de períodos relevantes", () => {
  const [r] = validateEvidence(
    [requirement({ dimension: "seniority", source: "3 anos de experiência" })],
    "TypeScript",
    "3 anos de experiência",
  );
  assert.equal(r.classification, "confirm");
  assert.equal(scoreRequirements([r]).provisional, true);
});

test("rejeita cálculo sem requisitos e mantém entrada intacta", () => {
  assert.throws(() => scoreRequirements([]), /requisitos suficientes/);
  const input = [
    requirement(),
    requirement({ description: "SQL", classification: "partial" }),
  ];
  const original = structuredClone(input);
  const scored = scoreRequirements(input);
  assert.equal(scored.score, 75);
  assert.equal(scored.provisional, false);
  assert.deepEqual(input, original);
});

test("evidências normalizadas mantêm correspondência sem modificar os requisitos", () => {
  const input = [requirement({ source: "TypeScript", evidence: "TypeScript" })];
  const original = structuredClone(input);
  assert.equal(
    validateEvidence(input, "  TYPESCRIPT\n", "  typescript ")[0]
      .classification,
    "met",
  );
  assert.deepEqual(input, original);
  assert.throws(
    () =>
      validateEvidence(
        [
          requirement({ description: " TypeScript " }),
          requirement({ description: "TYPESCRIPT" }),
        ],
        "TypeScript",
        "TypeScript",
      ),
    /duplicado/,
  );
});
