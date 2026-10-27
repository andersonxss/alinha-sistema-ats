import { DomainError } from "./domain";

export class VacancyImportError extends DomainError {
  constructor(message?: string) {
    super("VACANCY_IMPORT_FAILED", message);
  }
}
