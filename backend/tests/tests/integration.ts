/** Integration harness: synthetic documents and a LOCAL CONTROLLED AI response. Never a provider validation. */
import dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_FILE ?? "../.env" });

import assert from "node:assert/strict";
import { type ChildProcess, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";

const [
  { db },
  { claimTask, recoverExhausted },
  { exportDocuments },
  { removeFile },
] = await Promise.all([
  import("@/infrastructure/database/db"),
  import("@/infrastructure/queue/queue"),
  import("@/infrastructure/export/documents"),
  import("@/infrastructure/storage/files"),
]);
const base = "http://localhost:3101";
const frontendOrigin = "http://localhost:3000";
const children: ChildProcess[] = [];
const emails: string[] = [];
let responseMode: "valid" | "blocked" = "valid";
const googleRequests: Record<string, unknown>[] = [];
const resume =
  "Pessoa Sintética\nsintetica@example.test\n\nResumo profissional\nAnalista com experiência em TypeScript, organização de processos e desenvolvimento de sistemas internos.\n\nExperiência profissional\nEmpresa Exemplo · Analista · janeiro de 2020 a dezembro de 2023.\nDesenvolvimento de sistemas com TypeScript e elaboração de relatórios.\n\nFormação\nGraduação em Sistemas de Informação.\n\nCompetências\nTypeScript e documentação de processos.";
const vacancy =
  "A Empresa Sintética procura Analista de Sistemas. TypeScript é obrigatório. Responsabilidades incluem desenvolvimento de sistemas internos, documentação e colaboração com a equipe. Experiência com relatórios é desejável.";
function start(args: string[], env: NodeJS.ProcessEnv) {
  const child = spawn(process.execPath, args, {
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.push(child);
  child.stderr?.on("data", (d) => process.stderr.write(d));
  return child;
}
async function waitFor<T>(
  fn: () => Promise<T>,
  valid: (r: T) => boolean,
  timeout = 90000,
) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try {
      const r = await fn();
      if (valid(r)) return r;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Tempo limite no teste de integração.");
}
async function request(
  path: string,
  method = "GET",
  body?: unknown,
  cookie = "",
  origin = frontendOrigin,
) {
  return fetch(base + path, {
    method,
    headers: {
      origin,
      ...(cookie ? { cookie } : {}),
      ...(body && !(body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
    },
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
}
async function account() {
  const email = `ats-test-${randomUUID()}@example.test`;
  emails.push(email);
  const response = await request("/api/auth/sign-up/email", "POST", {
    name: "Pessoa Sintética",
    email,
    password: "Synthetic-password-2026!",
  });
  assert.equal(response.status, 200, await response.clone().text());
  return {
    cookie: response.headers
      .getSetCookie()
      .map((s) => s.split(";")[0])
      .join("; "),
    email,
    id: (await response.json()).user.id,
  };
}
const mock = createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  const input = JSON.parse(body);
  googleRequests.push(input);
  if (responseMode === "blocked") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ promptFeedback: { blockReason: "SAFETY" } }));
    return;
  }
  const contents = input.contents as Array<{
    parts?: Array<{ text?: string }>;
  }>;
  const payload = JSON.parse(contents[0]?.parts?.[0]?.text ?? "");
  const data = payload.blocks
    ? {
        order: payload.blocks.map((_: unknown, i: number) => i),
        justification:
          "Preservar a ordem dos blocos mantém os fatos rastreáveis à fonte original.",
      }
    : {
        summary:
          "A experiência em TypeScript está evidenciada no currículo sintético.",
        requirements: [
          {
            description: "Conhecimento em TypeScript",
            dimension: "technical",
            mandatory: true,
            source: "TypeScript é obrigatório.",
            classification: "met",
            evidence:
              "Desenvolvimento de sistemas com TypeScript e elaboração de relatórios.",
            explanation: "O currículo informa uso direto da tecnologia.",
          },
        ],
        recommendations: [
          "Destaque a experiência já informada em desenvolvimento.",
        ],
        questions: [],
      };
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      candidates: [
        {
          content: { parts: [{ text: JSON.stringify(data) }] },
          finishReason: "STOP",
        },
      ],
    }),
  );
});
try {
  await new Promise<void>((r) => mock.listen(0, "127.0.0.1", r));
  const address = mock.address();
  assert.ok(address && typeof address !== "string");
  const env = {
    ...process.env,
    BETTER_AUTH_URL: base,
    FRONTEND_ORIGIN: frontendOrigin,
    GEMINI_API_KEY: "controlled-test-only",
    GEMINI_MODEL: "controlled-test-model",
    TEST_GEMINI_URL: `http://127.0.0.1:${address.port}/generateContent`,
    PORT: "3101",
  };
  const testPreload = "./tests/helpers/gemini-fetch-preload.ts";
  start(["--import", "tsx", "--import", testPreload, "src/server.ts"], env);
  await waitFor(
    () => fetch(`${base}/api/health`),
    (r) => r.ok,
  );
  const publicDashboard = await request("/api/dashboard");
  assert.equal(publicDashboard.status, 401);
  assert.equal(
    publicDashboard.headers.get("access-control-allow-origin"),
    frontendOrigin,
  );
  assert.equal(
    publicDashboard.headers.get("access-control-allow-credentials"),
    "true",
  );
  const preflight = await fetch(`${base}/api/auth/sign-in/email`, {
    method: "OPTIONS",
    headers: {
      origin: frontendOrigin,
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type",
    },
  });
  assert.equal(preflight.status, 204);
  const owner = await account(),
    other = await account();
  const queued = await db.task.create({
    data: { userId: owner.id, kind: "test" },
  });
  const claims = await Promise.all([claimTask(), claimTask()]);
  assert.equal(
    claims.filter((t) => t?.id === queued.id).length,
    1,
    "Atomic acquisition prevents duplicate ownership",
  );
  await db.task.update({
    where: { id: queued.id },
    data: { lockedAt: new Date(Date.now() - 400000) },
  });
  const recovered = await claimTask();
  assert.equal(recovered?.id, queued.id);
  assert.notEqual(recovered?.lockToken, claims.find((t) => t)?.lockToken);
  await db.task.update({
    where: { id: queued.id },
    data: { attempts: 3, lockedAt: new Date(Date.now() - 400000) },
  });
  await recoverExhausted();
  assert.equal(
    (await db.task.findUniqueOrThrow({ where: { id: queued.id } })).status,
    "failed",
  );
  await db.task.delete({ where: { id: queued.id } });
  console.log("PASS: authentication, atomic claim, interrupted-task recovery");
  start(
    ["--import", "tsx", "--import", testPreload, "src/worker/index.ts"],
    env,
  );
  const docs = await exportDocuments(resume);
  let resumeId = "";
  for (const format of ["pdf", "docx"] as const) {
    const form = new FormData();
    form.set(
      "file",
      new File([new Uint8Array(docs[format])], `sintetico.${format}`),
    );
    const response = await request("/api/resumes", "POST", form, owner.cookie);
    assert.equal(response.status, 201, await response.clone().text());
    const row = await response.json();
    assert.ok(row.extractedText.includes("TypeScript"));
    resumeId = row.id;
  }
  assert.equal(
    (await request(`/api/resumes/${resumeId}`, "GET", undefined, other.cookie))
      .status,
    404,
  );
  assert.equal(
    (
      await request(
        `/api/resumes/${resumeId}`,
        "PATCH",
        { text: resume, name: "Currículo sintético" },
        other.cookie,
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await request(
        `/api/resumes/${resumeId}`,
        "DELETE",
        undefined,
        other.cookie,
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await request(
        `/api/resumes/${resumeId}`,
        "PATCH",
        { text: resume, name: "Currículo sintético" },
        owner.cookie,
      )
    ).status,
    200,
  );
  const created = await request(
    "/api/analyses",
    "POST",
    {
      resumeId,
      text: vacancy,
      title: "Analista",
      company: "Empresa Sintética",
      consent: true,
    },
    owner.cookie,
  );
  assert.equal(created.status, 201, await created.clone().text());
  const { id } = await created.json();
  assert.equal(
    (
      await request(
        "/api/analyses",
        "POST",
        {},
        owner.cookie,
        "https://untrusted.example",
      )
    ).status,
    403,
    "Mutations reject untrusted browser origins",
  );
  const readAnalysis = async () => {
    const response = await request(
      `/api/analyses/${id}`,
      "GET",
      undefined,
      owner.cookie,
    );
    return response.json();
  };
  const analysis = await waitFor(
    readAnalysis,
    (a) => a.status === "completed" || a.status === "failed",
  );
  assert.equal(analysis.status, "completed", analysis.error);
  assert.equal(analysis.score, 100);
  assert.equal(analysis.model, "controlled-test-model");
  assert.ok(googleRequests.length > 0);
  assert.ok(Array.isArray(googleRequests[0].contents));
  assert.ok(googleRequests[0].systemInstruction);
  assert.equal(
    (googleRequests[0].generationConfig as { responseMimeType?: string })
      .responseMimeType,
    "application/json",
  );
  assert.equal(
    analysis.tasks.find((task: { kind: string }) => task.kind === "analyze")
      .stage,
    "completed",
  );
  assert.equal(
    (await request(`/api/analyses/${id}`, "GET", undefined, other.cookie))
      .status,
    404,
  );
  console.log(
    "PASS: PDF/DOCX upload, ownership, snapshot analysis with CONTROLLED AI",
  );
  assert.equal(
    (await request(`/api/analyses/${id}`, "POST", {}, owner.cookie)).status,
    202,
  );
  const adapted = await waitFor(readAnalysis, (a) => a.versions.length > 0);
  const version = adapted.versions[0];
  assert.equal(version.proposedText, resume);
  const edited = `${resume}\n\nProjetos\nDocumentação técnica de um sistema interno.`;
  assert.equal(
    (
      await request(
        `/api/versions/${version.id}`,
        "PATCH",
        { text: edited, accepted: true, revision: 0 },
        other.cookie,
      )
    ).status,
    409,
  );
  assert.equal(
    (
      await request(
        `/api/versions/${version.id}`,
        "PATCH",
        { text: edited, accepted: true, revision: 0 },
        owner.cookie,
      )
    ).status,
    202,
  );
  assert.equal(
    (
      await request(
        `/api/versions/${version.id}`,
        "PATCH",
        { text: edited, accepted: true, revision: 0 },
        owner.cookie,
      )
    ).status,
    409,
  );
  const exported = await waitFor(
    readAnalysis,
    (a) => a.versions[0].exports.length === 2,
  );
  for (const file of exported.versions[0].exports) {
    assert.equal(
      (
        await request(
          `/api/download/${file.id}`,
          "GET",
          undefined,
          other.cookie,
        )
      ).status,
      404,
    );
    const downloaded = await request(
      `/api/download/${file.id}`,
      "GET",
      undefined,
      owner.cookie,
    );
    assert.equal(downloaded.status, 200);
    assert.ok((await downloaded.arrayBuffer()).byteLength > 100);
  }
  console.log(
    "PASS: adaptation, revision conflict, worker export, protected downloads",
  );
  responseMode = "blocked";
  const failedCreated = await request(
    "/api/analyses",
    "POST",
    {
      resumeId,
      text: vacancy,
      title: "Analista com falha controlada",
      company: "Empresa Sintética",
      consent: true,
    },
    owner.cookie,
  );
  assert.equal(failedCreated.status, 201, await failedCreated.clone().text());
  const { id: failedId } = await failedCreated.json();
  const failed = await waitFor(
    async () =>
      (
        await request(
          `/api/analyses/${failedId}`,
          "GET",
          undefined,
          owner.cookie,
        )
      ).json(),
    (row) => row.status === "failed",
  );
  assert.equal(failed.status, "failed");
  assert.equal(failed.result, null);
  assert.equal(
    failed.tasks.find((task: { kind: string }) => task.kind === "analyze")
      .stage,
    "failed",
  );
  console.log(
    "PASS: resposta Gemini bloqueada esgota a tarefa sem resultado parcial",
  );
  assert.equal(
    (
      await request(
        "/api/account",
        "DELETE",
        { confirmation: owner.email },
        owner.cookie,
      )
    ).status,
    200,
  );
  assert.equal(
    (await request("/api/dashboard", "GET", undefined, owner.cookie)).status,
    401,
  );
  console.log("PASS: account deletion revokes sessions");
} finally {
  for (const child of children) child.kill("SIGTERM");
  await Promise.all(
    children.map(
      (child) =>
        new Promise<void>((resolve) => {
          if (child.exitCode !== null) return resolve();
          const fallback = setTimeout(() => {
            child.kill("SIGKILL");
            resolve();
          }, 5_000);
          child.once("exit", () => {
            clearTimeout(fallback);
            resolve();
          });
        }),
    ),
  );
  await new Promise<void>((r) => mock.close(() => r()));
  for (const email of emails) await db.user.deleteMany({ where: { email } });
  for (const file of await db.fileGarbage.findMany()) {
    await removeFile(file.key);
    await db.fileGarbage.delete({ where: { key: file.key } });
  }
  await db.$disconnect();
}
