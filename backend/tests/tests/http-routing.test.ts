import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { toNodeHandler } from "better-auth/node";
import { ResumeNotFoundError } from "@/domain/errors/resume-errors";
import type { WebHandler } from "@/domain/repositories/http-handler.contract";
import {
  type ApiHandlers,
  createApiRouter,
} from "@/presentation/http/api-router";
import { createApp } from "@/presentation/http/create-app";

const origin = "http://localhost:3000";
const echo: WebHandler = async (request, context) =>
  Response.json({
    path: new URL(request.url).pathname,
    query: new URL(request.url).search,
    id: (await context.params).id,
    method: request.method,
    body: await request.text(),
    forwarded: request.headers.get("x-forwarded-for"),
  });

function handlers(): ApiHandlers {
  return {
    auth: async (req, res) => {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      res.json({
        url: req.url,
        originalUrl: req.originalUrl,
        body: Buffer.concat(chunks).toString(),
      });
    },
    account: { deleteAccount: echo },
    dashboard: { getDashboard: echo },
    health: { getHealth: echo },
    analysis: {
      createAnalysis: echo,
      getAnalysis: echo,
      adaptAnalysis: echo,
      deleteAnalysis: echo,
    },
    importVacancy: { importVacancy: echo },
    documents: {
      createResume: echo,
      getResume: echo,
      updateResume: echo,
      deleteResume: echo,
      getResumeFile: echo,
      download: echo,
      updateVersion: echo,
    },
  };
}

async function serve(t: test.TestContext, dependencies = handlers()) {
  const server = createApp(createApiRouter(dependencies), origin).listen(
    0,
    "127.0.0.1",
  );
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  );
  await once(server, "listening");
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

test("routers preservam métodos, caminhos, query, parâmetros e corpo", async (t) => {
  const base = await serve(t);
  const routes = [
    ["GET", "/health"],
    ["GET", "/dashboard"],
    ["DELETE", "/account"],
    ["POST", "/analyses"],
    ["GET", "/analyses/item"],
    ["POST", "/analyses/item"],
    ["DELETE", "/analyses/item"],
    ["POST", "/import"],
    ["POST", "/resumes"],
    ["GET", "/resumes/item"],
    ["PATCH", "/resumes/item"],
    ["DELETE", "/resumes/item"],
    ["GET", "/resumes/item/file"],
    ["GET", "/download/item"],
    ["PATCH", "/versions/item"],
  ];
  for (const [method, path] of routes) {
    const body = method === "GET" ? undefined : '{"text":"ação"}';
    const response = await fetch(`${base}/api${path}?format=pdf`, {
      method,
      body,
    });
    assert.equal(response.status, 200, `${method} ${path}`);
    const data = await response.json();
    assert.equal(data.path, `/api${path}`);
    assert.equal(data.query, "?format=pdf");
    assert.equal(data.id, path.includes("item") ? "item" : "");
    assert.equal(data.method, method);
    assert.equal(data.body, body ?? "");
  }
});

test("autenticação recebe corpo bruto e URL original com prefixo /api", async (t) => {
  const dependencies = handlers();
  dependencies.auth = toNodeHandler(async (request) =>
    Response.json({
      path: new URL(request.url).pathname,
      body: await request.text(),
    }),
  );
  const base = await serve(t, dependencies);
  const body = '{ "email": "synthetic@example.test" }';
  const response = await fetch(`${base}/api/auth/sign-in/email`, {
    method: "POST",
    body,
  });
  assert.deepEqual(await response.json(), {
    path: "/api/auth/sign-in/email",
    body,
  });
});

test("upload multipart e download binário atravessam os routers", async (t) => {
  const dependencies = handlers();
  dependencies.documents.createResume = async (request) => {
    const file = (await request.formData()).get("file");
    assert.ok(file instanceof File);
    return Response.json(
      { name: file.name, content: await file.text() },
      { status: 201 },
    );
  };
  const bytes = new Uint8Array([0, 255, 1, 128]);
  dependencies.documents.download = async () =>
    new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="cv.pdf"',
      },
    });
  const base = await serve(t, dependencies);
  const form = new FormData();
  form.set(
    "file",
    new File(["conteúdo sintético"], "cv.pdf", { type: "application/pdf" }),
  );
  const upload = await fetch(`${base}/api/resumes`, {
    method: "POST",
    body: form,
  });
  assert.equal(upload.status, 201);
  assert.deepEqual(await upload.json(), {
    name: "cv.pdf",
    content: "conteúdo sintético",
  });
  const download = await fetch(`${base}/api/download/item`);
  assert.equal(
    download.headers.get("content-disposition"),
    'attachment; filename="cv.pdf"',
  );
  assert.deepEqual(new Uint8Array(await download.arrayBuffer()), bytes);
});

test("middlewares preservam CORS, segurança, HEAD e 404", async (t) => {
  const base = await serve(t);
  const response = await fetch(`${base}/api/health`, {
    headers: { origin, "x-forwarded-for": "1.2.3.4" },
  });
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(
    response.headers.get("access-control-allow-credentials"),
    "true",
  );
  assert.equal(response.headers.get("x-powered-by"), null);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(
    response.headers.get("access-control-expose-headers"),
    "Location",
  );
  assert.equal((await response.json()).forwarded, "127.0.0.1");
  for (const [requestOrigin, status] of [
    [origin, 204],
    ["https://invalid.test", 403],
  ] as const) {
    const preflight = await fetch(`${base}/api/resumes`, {
      method: "OPTIONS",
      headers: { origin: requestOrigin },
    });
    assert.equal(preflight.status, status);
  }
  const head = await fetch(`${base}/api/health`, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  for (const path of ["/api/missing", "/health", "/api/resumes/item/extra"]) {
    const missing = await fetch(base + path);
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), {
      error: "Rota não encontrada.",
      code: "ROUTE_NOT_FOUND",
    });
  }
});

test("middleware Express traduz erros de domínio pelo mesmo contrato", async (t) => {
  const dependencies = handlers();
  dependencies.health.getHealth = async () => {
    throw new ResumeNotFoundError();
  };
  const base = await serve(t, dependencies);
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: "Currículo não encontrado.",
    code: "RESUME_NOT_FOUND",
  });
});

test("erros de handlers chegam ao middleware sem expor detalhes internos", async (t) => {
  const dependencies = handlers();
  dependencies.health.getHealth = async () => {
    throw new Error("internal detail");
  };
  const base = await serve(t, dependencies);
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    code: "INTERNAL_ERROR",
    error: "Não foi possível concluir. Confira os dados e tente novamente.",
  });
});
