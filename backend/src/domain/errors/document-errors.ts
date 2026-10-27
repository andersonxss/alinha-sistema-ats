import { DomainError } from "./domain";

export class ExportNotFoundError extends DomainError {
  constructor() {
    super("EXPORT_NOT_FOUND");
  }
}

export class OriginalResumeFileNotFoundError extends DomainError {
  constructor() {
    super("ORIGINAL_RESUME_FILE_NOT_FOUND");
  }
}

export class VersionConflictError extends DomainError {
  constructor() {
    super("VERSION_CONFLICT");
  }
}

export class InvalidResumeFileError extends DomainError {
  constructor(message?: string) {
    super("INVALID_RESUME_FILE", message);
  }
}
