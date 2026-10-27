import assert from "node:assert/strict";
import test from "node:test";
import { createHandlers } from "@/modules/analysis/presentation/http/analysis.route";
import { createGET } from "@/modules/dashboard/presentation/http/dashboard.route";
import { handle } from "@/presentation/http/handle-http-error";
import { configureRateLimit } from "@/presentation/http/rate-limit";

const user = { id: "user-1", name: "Pessoa", email: "pessoa@example.test" };
const vacancy =
  "Vaga com detalhes suficientes para validar a criação de análise com o modelo configurado no ambiente Gemini.";
const initialEnvironment = Object.fromEntries(
  ["GEMINI_API_KEY", "GEMINI_MODEL", "AI_API_KEY", "AI_MODEL"].map((name) => [
    name,
    process.env[name],
  ]),
);

function handlers() {
  const inputs: Array<{ model: string }> = [];
  let queueCalls = 0;
  const service = {
    create: async (input: { model: string }) => {
      inputs.push(input);
      return { id: "analysis-1" };
    },
    get: async () => null,
    queueAdaptation: async () => {
      queueCalls++;
      return true;
    },
    delete: async () => true,
  };
  return {
    inputs,
    queueCalls: () => queueCalls,
    handlers: createHandlers(service as never, async () => user),
  };
}

function createRequest() {
  return new Request("http://localhost/api/analyses", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      resumeId: "resume-1",
      text: vacancy,
      title: "Analista",
      company: "Empresa",
      consent: true,
    }),
  });
}

test.afterEach(() => {
  for (const [name, value] of Object.entries(initialEnvironment)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

configureRateLimit(async () => true);

test("@spec:AC-017 rotas rejeitam chave ou modelo Gemini ausente com o contrato 503", async () => {
  for (const [key, model] of [
    [undefined, "gemini-test"],
    ["synthetic-key", undefined],
    ["   ", "gemini-test"],
    ["synthetic-key", "   "],
  ]) {
    if (key === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = key;
    if (model === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = model;
    const create = handlers();
    const createResponse = await handle(() =>
      create.handlers.CREATE(createRequest()),
    );
    assert.equal(createResponse.status, 503);
    assert.deepEqual(await createResponse.json(), {
      error: "Configuração pendente: informe a chave de IA no servidor.",
      code: "AI_NOT_CONFIGURED",
    });

    const adapt = handlers();
    const adaptResponse = await adapt.handlers.POST(
      new Request("http://localhost/api/analyses/analysis-1", {
        method: "POST",
      }),
      { params: Promise.resolve({ id: "analysis-1" }) },
    );
    assert.equal(adaptResponse.status, 503);
    assert.equal(adapt.queueCalls(), 0);
  }

  process.env.AI_API_KEY = "legacy-key";
  process.env.AI_MODEL = "legacy-model";
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL;
  const dashboard = createGET(
    { get: async () => ({ resumes: [], analyses: [], tasks: [] }) } as never,
    async () => user,
  );
  const body = await (
    await dashboard(new Request("http://localhost/api/dashboard"))
  ).json();
  assert.equal(body.aiConfigured, false);
  assert.equal(body.aiConfiguredModel, false);
});

test("@spec:AC-018 rotas usam o mesmo modelo Gemini e dashboard não expõe a chave", async () => {
  process.env.GEMINI_API_KEY = "synthetic-key";
  process.env.GEMINI_MODEL = " gemini-test-model ";
  const analysis = handlers();
  const created = await analysis.handlers.CREATE(createRequest());
  assert.equal(created.status, 201);
  assert.equal(analysis.inputs[0].model, "gemini-test-model");

  const dashboard = createGET(
    {
      get: async () => ({ resumes: [], analyses: [], tasks: [] }),
    } as never,
    async () => user,
  );
  const response = await dashboard(
    new Request("http://localhost/api/dashboard"),
  );
  const body = await response.json();
  assert.equal(body.aiConfigured, true);
  assert.equal(body.aiConfiguredModel, true);
  assert.doesNotMatch(JSON.stringify(body), /synthetic-key/);
});

test("@spec:AC-022 protocolo Gemini usa generationConfig, systemInstruction e contents sem rede real", async () => {
  process.env.GEMINI_API_KEY = "synthetic-key";
  process.env.GEMINI_MODEL = "gemini-test-model";
  const originalFetch = globalThis.fetch;
  const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
  globalThis.fetch = (async (input, init) => {
    requests.push({
      url: String(input),
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    });
    return new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    order: [0],
                    justification: "Mantém o bloco inicial sem alterar fatos.",
                  }),
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
      }),
      { headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const { structured } = await import("@/infrastructure/ai/client");
    const { adaptationSchema } = await import(
      "@/infrastructure/ai/schemas/analysis.schema"
    );
    await structured(adaptationSchema, "Responda JSON.", { blocks: [] });
    assert.match(requests[0].url, /generativelanguage\.googleapis\.com/);
    assert.ok(Array.isArray(requests[0].body.contents));
    assert.ok(requests[0].body.systemInstruction);
    assert.equal(
      (requests[0].body.generationConfig as Record<string, unknown>)
        .responseMimeType,
      "application/json",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
