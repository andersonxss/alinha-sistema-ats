import { z } from "zod";
import { DomainError, type DomainErrorCode } from "@/domain/errors/domain";
import { HttpError } from "./http-error";

const domainStatus: Record<DomainErrorCode, number> = {
  RESUME_NOT_FOUND: 404,
  RESUME_NEEDS_REVIEW: 400,
  ANALYSIS_NOT_FOUND: 404,
  COMPLETED_ANALYSIS_NOT_FOUND: 404,
  ADAPTATION_ALREADY_QUEUED: 409,
  AI_NOT_CONFIGURED: 503,
  EXPORT_NOT_FOUND: 404,
  ORIGINAL_RESUME_FILE_NOT_FOUND: 404,
  VERSION_CONFLICT: 409,
  INVALID_RESUME_FILE: 400,
  ACCOUNT_CONFIRMATION_MISMATCH: 400,
  UNAUTHENTICATED: 401,
  VACANCY_IMPORT_FAILED: 400,
};

export function errorResponse(error: unknown) {
  if (error instanceof DomainError)
    return {
      status: domainStatus[error.code],
      body: { error: error.message, code: error.code },
    };
  if (error instanceof HttpError)
    return {
      status: error.status,
      body: { error: error.message, code: error.code },
    };
  if (error instanceof z.ZodError) {
    const details = error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    return {
      status: 400,
      body: { error: `Revise os campos: ${details}`, code: "VALIDATION_ERROR" },
    };
  }
  console.error({
    event: "request_failed",
    type: error instanceof Error ? error.name : "unknown",
  });
  return {
    status: 500,
    body: {
      error: "Não foi possível concluir. Confira os dados e tente novamente.",
      code: "INTERNAL_ERROR",
    },
  };
}
