export const domainErrorMessages = {
  RESUME_NOT_FOUND: "Currículo não encontrado.",
  RESUME_NEEDS_REVIEW: "Revise e salve o currículo antes de analisar.",
  ANALYSIS_NOT_FOUND: "Análise não encontrada.",
  COMPLETED_ANALYSIS_NOT_FOUND: "Análise concluída não encontrada.",
  ADAPTATION_ALREADY_QUEUED: "Já existe uma adaptação em andamento.",
  AI_NOT_CONFIGURED:
    "Configuração pendente: informe a chave de IA no servidor.",
  EXPORT_NOT_FOUND: "Arquivo não encontrado.",
  ORIGINAL_RESUME_FILE_NOT_FOUND: "Arquivo original não encontrado.",
  VERSION_CONFLICT:
    "A versão foi alterada ou não está disponível. Atualize a página.",
  INVALID_RESUME_FILE: "Selecione um PDF ou DOCX.",
  ACCOUNT_CONFIRMATION_MISMATCH: "Digite seu e-mail para confirmar.",
  UNAUTHENTICATED: "Entre na sua conta para continuar.",
  VACANCY_IMPORT_FAILED: "Não foi possível importar. Cole a descrição.",
} as const;
export type DomainErrorCode = keyof typeof domainErrorMessages;
export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string = domainErrorMessages[code],
  ) {
    super(message);
    this.name = new.target.name;
  }
}
