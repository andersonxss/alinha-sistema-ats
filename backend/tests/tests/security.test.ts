import assert from "node:assert/strict";
import test from "node:test";
import { applyOrder, redact } from "@/infrastructure/ai/client";
import { exportDocuments } from "@/infrastructure/export/documents";
import {
  importUrl,
  publicAddress,
  validateUrl,
} from "@/infrastructure/importer/import-url";
import {
  extractFile,
  filePath,
  validateFile,
} from "@/infrastructure/storage/files";

test("bloqueia redes privadas, metadados, loopback e IPv4 mapeado", () => {
  for (const address of [
    "127.0.0.1",
    "10.1.2.3",
    "192.168.0.1",
    "172.16.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "::1",
    "::ffff:127.0.0.1",
    "fe80::1",
    "fc00::1",
    "192.0.2.1",
  ])
    assert.equal(publicAddress(address), false, address);
  assert.equal(publicAddress("8.8.8.8"), true);
});
test("rejeita URLs com protocolo, porta e credenciais indevidos", () => {
  for (const url of [
    "file:///etc/passwd",
    "http://user:pass@example.com",
    "https://example.com:1234",
  ])
    assert.throws(() => validateUrl(url));
});
test("importação bloqueia endereço local após resolução DNS", async () => {
  await assert.rejects(importUrl("http://127.0.0.1"), /privado|reservado/);
});
test("formato real deve coincidir com extensão e caminho é restrito", () => {
  assert.throws(() => validateFile("cv.pdf", Buffer.from("falso")));
  assert.throws(() => validateFile("cv.docx", Buffer.from("%PDF-1.7")));
  assert.throws(() => filePath("../segredo.pdf"));
  assert.throws(() => validateFile("cv.pdf", Buffer.alloc(11 * 1024 * 1024)));
});
test("adaptação não pode adicionar, excluir nem duplicar blocos", () => {
  const blocks = ["Contato", "Formação", "Experiência"];
  assert.equal(
    applyOrder(blocks, [0, 2, 1]),
    "Contato\n\nExperiência\n\nFormação",
  );
  assert.throws(() => applyOrder(blocks, [0, 2, 2]));
  assert.throws(() => applyOrder(blocks, [0, 1]));
  assert.throws(() => applyOrder(blocks, [2, 1, 0]));
});
test("remove contatos antes de comparação", () => {
  const clean = redact(
    "Pessoa Exemplo\npessoa@example.com\n+55 (11) 99999-9999\nResumo profissional\nExperiência com TypeScript.",
    "Pessoa Exemplo",
  );
  assert.ok(!clean.includes("@"));
  assert.ok(!clean.includes("99999"));
  assert.ok(clean.includes("TypeScript"));
});
test("PDF e DOCX exportam texto real selecionável com acentos", async () => {
  const text =
    "Pessoa Sintética\n\nResumo profissional\nAtuação em análise de operações e criação de relatórios.\n\nExperiência profissional\nEmpresa Exemplo · Analista · 2020 a 2023\nDesenvolvimento de indicadores e organização de processos.";
  const output = await exportDocuments(text);
  assert.equal(validateFile("curriculo.pdf", output.pdf), "pdf");
  assert.equal(validateFile("curriculo.docx", output.docx), "docx");
  for (const format of ["pdf", "docx"] as const) {
    const extracted = await extractFile(`cv.${format}`, output[format]);
    assert.ok(extracted.text.includes("Atuação"));
    assert.ok(extracted.text.includes("organização de processos."));
  }
});
