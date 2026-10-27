import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Normalize both runners into one TAP stream, with fresh numbering and an
// explicit suite failure when a child crashes after emitting passing tests.
export function runSuites(
  suites,
  write = (line) => process.stdout.write(line),
) {
  let count = 0;
  let failed = false;
  write("TAP version 13\n");
  for (const suite of suites) {
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    delete env.NODE_OPTIONS;
    const result = spawnSync(process.execPath, suite.args, {
      cwd: suite.cwd ?? root,
      env,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      timeout: 180_000,
    });
    let parsed = 0;
    let suiteFailed = result.status !== 0;
    for (const line of (result.stdout ?? "").split(/\r?\n/)) {
      const match = line.match(/^\s*(not )?ok\s+\d+\s*-?\s*(.*)$/);
      if (!match) continue;
      parsed++;
      const title = match[2].replace(/\s*\{\s*$/, "");
      if (match[1]) suiteFailed = true;
      write(`${match[1] ?? ""}ok ${++count} - ${suite.name}: ${title}\n`);
    }
    if (!parsed) suiteFailed = true;
    write(
      `${suiteFailed ? "not " : ""}ok ${++count} - ${suite.name}: processo e relatório\n`,
    );
    if (suiteFailed) {
      failed = true;
      const details = [result.error?.message, result.stdout, result.stderr]
        .filter(Boolean)
        .join("\n");
      for (const line of details.split(/\r?\n/)) write(`# ${line}\n`);
    }
  }
  write(`1..${count}\n`);
  return failed ? 1 : 0;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const backend = resolve(root, "backend");
  const files = readdirSync(resolve(backend, "tests/tests"))
    .filter((name) => name.endsWith(".test.ts"))
    .map((name) => `tests/tests/${name}`);
  process.exitCode = runSuites([
    {
      name: "backend",
      cwd: backend,
      args: ["--import", "tsx", "--test", "--test-reporter=tap", ...files],
    },
    {
      name: "frontend",
      cwd: resolve(root, "frontend"),
      args: [
        resolve(root, "node_modules/vitest/vitest.mjs"),
        "run",
        "--reporter=tap",
      ],
    },
  ]);
}
