import assert from "node:assert/strict";
import test from "node:test";
import { mergedMonths } from "@/domain/resumes/merged-months";
import { readability } from "@/domain/resumes/readability";

test("períodos incluem os meses extremos e unem intervalos contidos ou adjacentes", () => {
  const periods = [
    { start: "2020-04", end: "2020-06" },
    { start: "2020-02", end: "2020-02" },
    { start: "2020-01", end: "2020-03" },
  ];
  const original = structuredClone(periods);
  assert.equal(mergedMonths(periods), 6);
  assert.deepEqual(periods, original);
  assert.equal(mergedMonths([{ start: "2020-01", end: "2020-01" }]), 1);
  assert.throws(
    () => mergedMonths([{ start: "2021-02", end: "2021-01" }]),
    /Período inválido/,
  );
});

test("legibilidade distingue texto curto, ausência de experiência e linhas longas", () => {
  const short = readability("Resumo profissional");
  assert.equal(short.characters, 19);
  assert.equal(short.words, 2);
  assert.equal(short.warnings.length, 2);
  const long = readability(`Experiência\n${"x".repeat(501)}`);
  assert.equal(long.warnings.length, 1);
  assert.match(long.warnings[0], /parágrafos longos/);
  const normal = readability(
    `Experiência\n${"Desenvolvimento de sistemas.\n".repeat(15)}`,
  );
  assert.deepEqual(normal.warnings, []);
});
