import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../../..");

test("@spec:AC-021 Compose entrega GEMINI_API_KEY e GEMINI_MODEL somente aos serviços backend", async () => {
  const directory = await mkdtemp(join(tmpdir(), "sistema-ats-compose-"));
  const envFile = join(directory, "synthetic.env");
  await writeFile(
    envFile,
    [
      "POSTGRES_USER=ats_test",
      "POSTGRES_PASSWORD=synthetic-postgres-password",
      "POSTGRES_DB=ats_test",
      "BETTER_AUTH_SECRET=synthetic-auth-secret-at-least-32-characters",
      "GEMINI_API_KEY=synthetic-gemini-key",
      "GEMINI_MODEL=gemini-synthetic-model",
    ].join("\n"),
  );
  try {
    const command = spawnSync(
      "docker",
      [
        "compose",
        "--env-file",
        envFile,
        "-f",
        join(root, "compose.yaml"),
        "config",
        "--format",
        "json",
      ],
      {
        cwd: root,
        encoding: "utf8",
        timeout: 30_000,
        env: {
          ...process.env,
          GEMINI_API_KEY: "synthetic-gemini-key",
          GEMINI_MODEL: "gemini-synthetic-model",
          POSTGRES_PASSWORD: "synthetic-postgres-password",
          BETTER_AUTH_SECRET: "synthetic-auth-secret-at-least-32-characters",
        },
      },
    );
    assert.equal(command.status, 0, command.stderr);
    const config = JSON.parse(command.stdout) as {
      services: Record<string, { environment?: Record<string, string> }>;
    };
    for (const name of ["api", "worker", "migrate"]) {
      const environment = config.services[name].environment ?? {};
      assert.equal(environment.GEMINI_API_KEY, "synthetic-gemini-key");
      assert.equal(environment.GEMINI_MODEL, "gemini-synthetic-model");
      assert.equal(environment.AI_API_KEY, undefined);
      assert.equal(environment.AI_BASE_URL, undefined);
      assert.equal(environment.AI_MODEL, undefined);
    }
    const frontend = config.services.app.environment ?? {};
    assert.equal(frontend.GEMINI_API_KEY, undefined);
    assert.equal(frontend.GEMINI_MODEL, undefined);

    const backendPackage = JSON.parse(
      await readFile(join(root, "backend/package.json"), "utf8"),
    ) as { dependencies: Record<string, string> };
    const lockfile = await readFile(join(root, "package-lock.json"), "utf8");
    assert.equal(backendPackage.dependencies["@google/genai"], "2.30.0");
    assert.match(lockfile, /"@google\/genai": "2\.30\.0"/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
