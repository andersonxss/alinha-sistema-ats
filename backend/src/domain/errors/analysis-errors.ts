import { DomainError } from "./domain";

export class AnalysisNotFoundError extends DomainError {
  constructor() {
    super("ANALYSIS_NOT_FOUND");
  }
}

export class CompletedAnalysisNotFoundError extends DomainError {
  constructor() {
    super("COMPLETED_ANALYSIS_NOT_FOUND");
  }
}

export class AdaptationAlreadyQueuedError extends DomainError {
  constructor() {
    super("ADAPTATION_ALREADY_QUEUED");
  }
}

export class AiNotConfiguredError extends DomainError {
  constructor() {
    super("AI_NOT_CONFIGURED");
  }
}
