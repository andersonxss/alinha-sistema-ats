import { DomainError } from "./domain";

export class UnauthenticatedError extends DomainError {
  constructor() {
    super("UNAUTHENTICATED");
  }
}
