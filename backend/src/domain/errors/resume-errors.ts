import { DomainError } from "./domain";

export class ResumeNotFoundError extends DomainError {
  constructor() {
    super("RESUME_NOT_FOUND");
  }
}

export class ResumeNeedsReviewError extends DomainError {
  constructor() {
    super("RESUME_NEEDS_REVIEW");
  }
}
