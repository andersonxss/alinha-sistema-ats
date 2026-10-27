# Códigos de erro do ATS

O domínio não contém status HTTP. A coluna HTTP descreve o mapeamento em `presentation/http/error-response.ts`.

| Classe | Código | HTTP | Mensagem padrão |
| --- | --- | --- | --- |
| `ResumeNotFoundError` | `RESUME_NOT_FOUND` | 404 | Currículo não encontrado. |
| `ResumeNeedsReviewError` | `RESUME_NEEDS_REVIEW` | 400 | Revise e salve o currículo antes de analisar. |
| `AnalysisNotFoundError` | `ANALYSIS_NOT_FOUND` | 404 | Análise não encontrada. |
| `CompletedAnalysisNotFoundError` | `COMPLETED_ANALYSIS_NOT_FOUND` | 404 | Análise concluída não encontrada. |
| `AdaptationAlreadyQueuedError` | `ADAPTATION_ALREADY_QUEUED` | 409 | Já existe uma adaptação em andamento. |
| `AiNotConfiguredError` | `AI_NOT_CONFIGURED` | 503 | Configuração pendente: informe a chave de IA no servidor. |
| `ExportNotFoundError` | `EXPORT_NOT_FOUND` | 404 | Arquivo não encontrado. |
| `OriginalResumeFileNotFoundError` | `ORIGINAL_RESUME_FILE_NOT_FOUND` | 404 | Arquivo original não encontrado. |
| `VersionConflictError` | `VERSION_CONFLICT` | 409 | A versão foi alterada ou não está disponível. Atualize a página. |
| `InvalidResumeFileError` | `INVALID_RESUME_FILE` | 400 | Selecione um PDF ou DOCX. |
| `AccountConfirmationError` | `ACCOUNT_CONFIRMATION_MISMATCH` | 400 | Digite seu e-mail para confirmar. |
| `UnauthenticatedError` | `UNAUTHENTICATED` | 401 | Entre na sua conta para continuar. |
| `VacancyImportError` | `VACANCY_IMPORT_FAILED` | 400 | Não foi possível importar. Cole a descrição. |

Erros de arquivo inválido e importação podem preservar a descrição específica da validação, mantendo o mesmo código. A indicação de IA não configurada foi padronizada entre criação e adaptação de análises.

Erros HTTP gerais usam `BAD_REQUEST`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `PAYLOAD_TOO_LARGE`, `UNSUPPORTED_MEDIA_TYPE`, `RATE_LIMIT_EXCEEDED` ou `SERVICE_UNAVAILABLE`. Rotas inexistentes usam `ROUTE_NOT_FOUND`; Zod usa `VALIDATION_ERROR`; falhas inesperadas usam `INTERNAL_ERROR`, sem expor detalhes internos.

Recursos ausentes ou pertencentes a outro usuário continuam indistinguíveis. O conflito de versão mantém 409 tanto para revisão divergente quanto para recurso indisponível. Respostas de sucesso e autorizações não foram alteradas. O frontend existente lê `error` e pode ignorar o campo adicional `code`.

