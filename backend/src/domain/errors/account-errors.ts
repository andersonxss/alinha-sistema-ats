import { DomainError } from "./domain";

export class AccountConfirmationError extends DomainError {
  constructor() {
    super("ACCOUNT_CONFIRMATION_MISMATCH");
  }
}
