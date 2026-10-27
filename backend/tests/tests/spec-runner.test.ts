import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const runner = pathToFileURL(
  resolve(import.meta.dirname, "../../../scripts/spec-tests.mjs"),
).href;

function fixture(outputs: Array<{ output: string; code: number }>) {
  const suites = outputs.map(({ output, code }, index) => ({
    name: `suite-${index}`,
    args: [
      "-e",
      `process.stdout.write(${JSON.stringify(output)}); process.exitCode=${code}`,
    ],
  }));
  return spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `import {runSuites} from ${JSON.stringify(runner)}; process.exitCode=runSuites(${JSON.stringify(suites)});`,
    ],
    { encoding: "utf8", timeout: 15_000 },
  );
}

test("@spec:AC-023 runner preserva títulos anotados e diretivas sem concatenar planos TAP", () => {
  const result = fixture([
    { output: "TAP version 13\nok 1 - critério @spec:AC-023\n1..1\n", code: 0 },
    {
      output:
        "TAP version 13\n1..2\nok 1 - outro critério\nok 2 - pendente # SKIP motivo\n",
      code: 0,
    },
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal((result.stdout.match(/^TAP version/gm) ?? []).length, 1);
  assert.equal((result.stdout.match(/^1\.\./gm) ?? []).length, 1);
  assert.match(result.stdout, /critério @spec:AC-023/);
  assert.match(result.stdout, /pendente # SKIP motivo/);
  assert.match(result.stdout, /1\.\.5/);
});

test("@spec:AC-023 runner propaga falha de qualquer suíte, crash e relatório vazio", () => {
  for (const broken of [
    { output: "not ok 1 - falha @spec:AC-023\n", code: 1 },
    { output: "ok 1 - passou antes do crash\n", code: 1 },
    { output: "sem resultados\n", code: 0 },
  ]) {
    for (const index of [0, 1]) {
      const suites = [
        { output: "ok 1 - válido\n", code: 0 },
        { output: "ok 1 - válido\n", code: 0 },
      ];
      suites[index] = broken;
      const result = fixture(suites);
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stdout, /not ok/);
    }
  }
});
