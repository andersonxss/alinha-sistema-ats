import assert from "node:assert/strict";
import test from "node:test";
import { handle } from "@/presentation/http/handle-http-error";
import { formBody } from "@/presentation/http/read-form-body";
import { jsonBody } from "@/presentation/http/read-json-body";

function upload(body: BodyInit, contentType?: string) {
  return new Request("http://localhost/api/resumes", {
    method: "POST",
    body,
    ...(contentType ? { headers: { "Content-Type": contentType } } : {}),
  });
}

test("multipart válido preserva o arquivo dentro do limite", async () => {
  const form = new FormData();
  form.set(
    "file",
    new File(["currículo sintético"], "cv.pdf", { type: "application/pdf" }),
  );
  const result = await formBody(upload(form), 4096);
  const file = result.get("file");
  assert.ok(file instanceof File);
  assert.equal(file.name, "cv.pdf");
  assert.equal(await file.text(), "currículo sintético");
});

test("upload inválido usa status de cliente e o envelope de erro existente", async () => {
  const cases: [Request, number, number, string][] = [
    [
      upload("{}", "application/json"),
      4096,
      415,
      "Envie o arquivo como multipart/form-data.",
    ],
    [
      upload("broken", "multipart/form-data"),
      4096,
      400,
      "Formulário de upload inválido.",
    ],
    [
      upload("broken", "multipart/form-data; boundary=test"),
      4096,
      400,
      "Formulário de upload inválido.",
    ],
    [
      upload("too large", "multipart/form-data; boundary=test"),
      4,
      413,
      "Arquivo muito grande.",
    ],
  ];
  for (const [request, limit, status, error] of cases) {
    const response = await handle(async () => {
      await formBody(request, limit);
      return Response.json({ ok: true });
    });
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), {
      error,
      code:
        status === 415
          ? "UNSUPPORTED_MEDIA_TYPE"
          : status === 413
            ? "PAYLOAD_TOO_LARGE"
            : "BAD_REQUEST",
    });
  }
});

test("JSON malformado e acima do limite mantêm 400 e 413", async () => {
  for (const [body, limit, status] of [
    ["{", 10, 400],
    ['{"x":1}', 2, 413],
  ] as const) {
    const response = await handle(async () =>
      Response.json(await jsonBody(upload(body, "application/json"), limit)),
    );
    assert.equal(response.status, status);
    assert.equal(typeof (await response.json()).error, "string");
  }
});
