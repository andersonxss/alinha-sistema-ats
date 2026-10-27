import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { AccountConfirmationError } from "@/domain/errors/account-errors";
import {
  AdaptationAlreadyQueuedError,
  AiNotConfiguredError,
  AnalysisNotFoundError,
  CompletedAnalysisNotFoundError,
} from "@/domain/errors/analysis-errors";
import {
  ExportNotFoundError,
  InvalidResumeFileError,
  OriginalResumeFileNotFoundError,
  VersionConflictError,
} from "@/domain/errors/document-errors";
import { VacancyImportError } from "@/domain/errors/import-errors";
import {
  ResumeNeedsReviewError,
  ResumeNotFoundError,
} from "@/domain/errors/resume-errors";
import { UnauthenticatedError } from "@/domain/errors/user-errors";
import { handle } from "@/presentation/http/handle-http-error";

const cases = [
  [
    new ResumeNotFoundError(),
    404,
    "RESUME_NOT_FOUND",
    "Currículo não encontrado.",
  ],
  [
    new ResumeNeedsReviewError(),
    400,
    "RESUME_NEEDS_REVIEW",
    "Revise e salve o currículo antes de analisar.",
  ],
  [
    new AnalysisNotFoundError(),
    404,
    "ANALYSIS_NOT_FOUND",
    "Análise não encontrada.",
  ],
  [
    new CompletedAnalysisNotFoundError(),
    404,
    "COMPLETED_ANALYSIS_NOT_FOUND",
    "Análise concluída não encontrada.",
  ],
  [
    new AdaptationAlreadyQueuedError(),
    409,
    "ADAPTATION_ALREADY_QUEUED",
    "Já existe uma adaptação em andamento.",
  ],
  [
    new AiNotConfiguredError(),
    503,
    "AI_NOT_CONFIGURED",
    "Configuração pendente: informe a chave de IA no servidor.",
  ],
  [
    new ExportNotFoundError(),
    404,
    "EXPORT_NOT_FOUND",
    "Arquivo não encontrado.",
  ],
  [
    new OriginalResumeFileNotFoundError(),
    404,
    "ORIGINAL_RESUME_FILE_NOT_FOUND",
    "Arquivo original não encontrado.",
  ],
  [
    new VersionConflictError(),
    409,
    "VERSION_CONFLICT",
    "A versão foi alterada ou não está disponível. Atualize a página.",
  ],
  [
    new InvalidResumeFileError(),
    400,
    "INVALID_RESUME_FILE",
    "Selecione um PDF ou DOCX.",
  ],
  [
    new AccountConfirmationError(),
    400,
    "ACCOUNT_CONFIRMATION_MISMATCH",
    "Digite seu e-mail para confirmar.",
  ],
  [
    new UnauthenticatedError(),
    401,
    "UNAUTHENTICATED",
    "Entre na sua conta para continuar.",
  ],
  [
    new VacancyImportError(),
    400,
    "VACANCY_IMPORT_FAILED",
    "Não foi possível importar. Cole a descrição.",
  ],
] as const;

for (const [error, status, code, message] of cases) {
  test(`erro ${code} retorna status e contrato público corretos`, async () => {
    const response = await handle(async () => {
      throw error;
    });
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { error: message, code });
  });
}

test("validação de entrada expõe código estável e caminho do campo", async () => {
  const response = await handle(async () => {
    z.object({ name: z.string() }).parse({ name: 42 });
    return Response.json({ ok: true });
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.code, "VALIDATION_ERROR");
  assert.match(body.error, /name/);
});
