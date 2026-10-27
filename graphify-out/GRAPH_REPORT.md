# Graph Report - sistema-ats  (2026-10-22)

## Corpus Check
- 379 files · ~239,295 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 24 file(s) not represented in the graph (top: .log 7, (none) 6, .toml 5)

## Summary
- 2170 nodes · 5614 edges · 102 communities (80 shown, 22 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 153 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Edição visual no navegador
- Controles da barra visual
- Captura de telas
- Documentos e armazenamento
- Variantes e parâmetros visuais
- Configuração da barra visual
- Arquitetura e contratos Alinha
- Dependências do frontend
- Chat e comandos visuais
- Composição e limites API
- Roteamento HTTP e adaptadores
- Migração Gemini e especificações
- Sessões e eventos visuais
- Formulários e acesso frontend
- Editor de design visual
- Recuperação de sessões visuais
- Captura e seleção visual
- Lições e configuração spec
- Eventos e registros spec
- Auditoria de especificações
- Dependências do backend
- Repositórios de currículos
- Adaptação de currículos
- Comandos de especificação
- Rotas de currículos
- Serviços de conta frontend
- Injeção de componentes Svelte
- Autenticação e sessões
- Schema e migrações iniciais
- Análises e erros domínio
- Planejamento de execução spec
- Dashboard e layout frontend
- Serviços de análise frontend
- Erros e gerenciamento conta
- Sessões e autorização usuário
- Execução da migração Gemini
- Execução das rotas frontend
- Formulários de novas análises
- Execução do release Docker
- Ferramentas de desenvolvimento backend
- Worker e manutenção
- Contratos de pontuação ATS
- Scripts de operação projeto
- Design frontend e acessibilidade
- Direção visual e plataformas
- Manipulação DOM visual
- Qualidade do código backend
- Aliases de componentes frontend
- Serviços de currículos frontend
- Configuração TypeScript frontend
- Persistência de sessão visual
- Listas e indicadores dashboard
- Anotações e pinos visuais
- Coordenação de alvos visuais
- Páginas e autenticação frontend
- Serviços de dashboard frontend
- Experiência e legibilidade ATS
- Componentes de diálogo
- Dependências do workspace
- Especificação das rotas frontend
- Configuração TypeScript backend
- Design e revisão API
- Verificação de qualidade visual
- Análise e evidências locais
- Cliente Gemini e respostas
- Documentação de design
- Verificação de critérios spec
- Importação URL e segurança
- Auditoria frontend automatizada
- Geração de testes spec
- Execução de testes spec
- Auditoria segurança e privacidade
- Especificação do release Docker
- Exclusões da edição visual
- Testes de documentação implantação
- Configuração Biome workspace
- Refatoração e testes pagamentos
- Testes do cliente Gemini
- Serviços Docker produção
- Planejamento de funcionalidades
- Inicialização e configuração Prisma
- Reprodução da auditoria frontend
- Configuração TypeScript testes
- Auditoria técnica de interfaces
- Textos e resiliência interface
- Crítica e simplificação visual
- Serviços Docker desenvolvimento
- Intensidade visual e escopo
- Estratégia de cores semânticas
- Aplicação atômica de edições
- Experiência e detalhes produto
- Extração de padrões reutilizáveis
- Lições apoiadas em evidências
- Interfaces para operação
- Aprimoramento técnico visual
- Seleção contextual de comandos
- Modelo de tarefas

## God Nodes (most connected - your core abstractions)
1. `connectSSE()` - 34 edges
2. `setLiveState()` - 33 edges
3. `resumeSession()` - 33 edges
4. `showToast()` - 31 edges
5. `Button()` - 31 edges
6. `initGlobalBar()` - 30 edges
7. `handle()` - 30 edges
8. `el()` - 29 edges
9. `buildInsertConfigureRow()` - 27 edges
10. `handleKeyDown()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `Specification Template` --semantically_similar_to--> `Google Gen AI Migration Specification`  [INFERRED] [semantically similar]
  .agents/skills/onp-spec-driven/scripts/lib/templates/spec.md → .spec/features/backend-google-genai/spec.md
- `Base Constitution Template` --semantically_similar_to--> `Project Constitution`  [INFERRED] [semantically similar]
  .agents/skills/onp-spec-driven/scripts/lib/templates/constituicao-base.md → .spec/constituicao.md
- `Executable Acceptance Proof` --semantically_similar_to--> `Executable Requirement Proof`  [INFERRED] [semantically similar]
  .agents/skills/onp-spec-driven/references/fluxo.md → .spec/constituicao.md
- `Polish whole user paths` --semantically_similar_to--> `Observable acceptance specifications`  [INFERRED] [semantically similar]
  .agents/skills/impeccable/reference/polish.md → .agents/skills/onp-spec-driven/references/escrevendo-specs.md
- `Feature route composition` --conceptually_related_to--> `Route access contract`  [INFERRED]
  docs/frontend-architecture.md → .spec/features/frontend-routes-zod/spec.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Persistent deployment startup** — compose_postgres_service, compose_migration_service, compose_api_service, compose_worker_service [EXTRACTED 1.00]

## Communities (102 total, 22 thin omitted)

### Community 0 - "Edição visual no navegador"
Cohesion: 0.03
Nodes (138): addManualContextText(), agentHasWorkInFlight(), applyEditing(), applyLiveBarPreference(), applyPlaceholderSizingStyles(), averageRgb01(), bindEditBadgeProxy(), bufferToBase64() (+130 more)

### Community 1 - "Controles da barra visual"
Cohesion: 0.09
Nodes (62): agentStatusText(), barPaletteForTheme(), beginNewLiveConfiguration(), brandMarkSvg(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanupAcceptedSession() (+54 more)

### Community 2 - "Captura de telas"
Cohesion: 0.09
Nodes (55): ae(), be(), bt(), Ce(), s(), Ct(), de(), dt() (+47 more)

### Community 3 - "Documentos e armazenamento"
Cohesion: 0.07
Nodes (31): app, ExportNotFoundError, InvalidResumeFileError, OriginalResumeFileNotFoundError, db, globalDb, claimTask(), recoverExhausted() (+23 more)

### Community 4 - "Variantes e parâmetros visuais"
Cohesion: 0.09
Nodes (50): applyParamDefaults(), applyParamValue(), applyPlaceholderDimensions(), buildCyclingRow(), buildParamsPanel(), closedClipPath(), commitAcceptedVariantToDom(), completeParameterGenerationIfReady() (+42 more)

### Community 5 - "Configuração da barra visual"
Cohesion: 0.08
Nodes (48): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+40 more)

### Community 6 - "Arquitetura e contratos Alinha"
Cohesion: 0.05
Nodes (9): Backend HTTP contract, System architecture, Frontend refactoring audit, ATS error codes, Frontend refactoring plan, Frontend refactoring validation, Frontend maintenance guide, Alinha product requirements (+1 more)

### Community 7 - "Dependências do frontend"
Cohesion: 0.04
Nodes (46): config, dependencies, axios, better-auth, class-variance-authority, cn, lucide-react, next (+38 more)

### Community 8 - "Chat e comandos visuais"
Cohesion: 0.09
Nodes (47): applyGlobalBarLabelState(), armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), buildSteerProcessingDots(), clearSteerAwaitTimer(), collapsePageChat(), configureVoiceContext() (+39 more)

### Community 9 - "Composição e limites API"
Cohesion: 0.08
Nodes (16): createRateLimiter(), composeApiRouter(), IAccountRepository, IDashboardRepository, IHealthRepository, IRateLimitRepository, auth, PrismaRateLimitRepository (+8 more)

### Community 10 - "Roteamento HTTP e adaptadores"
Cohesion: 0.13
Nodes (25): IAccountHandlers, IAnalysisHandlers, IDashboardHandlers, IDocumentsHandlers, IHealthHandlers, WebHandler, IImportVacancyHandlers, adapt() (+17 more)

### Community 11 - "Migração Gemini e especificações"
Cohesion: 0.07
Nodes (35): Spec Driven Workflow, Base Constitution Template, Specification Template, Project Constitution, Historical Global Audit Failure, Missing Docker Release Proof, Stale Frontend Routing Proof, Feature Implemented Global Audit Pending (+27 more)

### Community 12 - "Sessões e eventos visuais"
Cohesion: 0.09
Nodes (43): applySavedSessionMeta(), checkpointPayload(), clampVariantIndex(), clearSession(), connectSSE(), enterRecoveryWaitingForAnchor(), finalizeInsertSession(), findActiveSessionSummary() (+35 more)

### Community 13 - "Formulários e acesso frontend"
Cohesion: 0.17
Nodes (25): AccountSettings(), NewAnalysisForm(), AccessPanel(), AccessPanelProps, CredentialsForm(), CredentialsFormProps, ResumeInput(), ResumeLibrary() (+17 more)

### Community 14 - "Editor de design visual"
Cohesion: 0.07
Nodes (42): buildCollapsible(), buildColorModels(), buildDesignHeader(), buildListHtml(), buildRadiiModels(), buildTypographyModels(), cssSafe(), designEmptyMessage() (+34 more)

### Community 15 - "Recuperação de sessões visuais"
Cohesion: 0.10
Nodes (40): abandonForeignSession(), abandonSupersededGo(), clearStoredManualApplyState(), copyToClipboard(), discardOrphanedSession(), fetchPendingCount(), handleDiscard(), handleManualEditActivity() (+32 more)

### Community 16 - "Captura e seleção visual"
Cohesion: 0.08
Nodes (38): abortSvelteComponentInjection(), buildInsertPlaceholderSnapshotFromDom(), buildPickedAnchorSnapshot(), captureAndEmit(), cleanup(), clearHandled(), clearMountErrorCard(), clearScrollY() (+30 more)

### Community 17 - "Lições e configuração spec"
Cohesion: 0.13
Nodes (32): cmdLicoes(), linhaLicao(), DEFAULT_CONFIG, adicionarLicao(), agora(), caminhoRender(), caminhoStore(), campo() (+24 more)

### Community 18 - "Eventos e registros spec"
Cohesion: 0.12
Nodes (33): cmdEvento(), cmdResumo(), cmdStreamResumo(), caminhos(), caminhoStream(), corta(), ESTADOS_FAIXA, homeOnp() (+25 more)

### Community 19 - "Auditoria de especificações"
Cohesion: 0.12
Nodes (30): auditProject(), CI_ESCALATES, finding(), latestMtime(), loadProject(), grepPattern(), scanAnnotations(), staticDirOf() (+22 more)

### Community 20 - "Dependências do backend"
Cohesion: 0.06
Nodes (34): dependencies, better-auth, cheerio, docx, dotenv, express, @google/genai, ipaddr.js (+26 more)

### Community 21 - "Repositórios de currículos"
Cohesion: 0.11
Nodes (8): IResumeRepository, ResumeReview, IVersionRepository, VersionReview, ResumeService, VersionService, ResumeRepository, VersionRepository

### Community 22 - "Adaptação de currículos"
Cohesion: 0.11
Nodes (9): AdaptationAlreadyQueuedError, ResumeNeedsReviewError, ResumeNotFoundError, CreateAnalysisInput, IAnalysisRepository, ReviewedResume, AnalysisService, AnalysisRepository (+1 more)

### Community 23 - "Comandos de especificação"
Cohesion: 0.12
Nodes (27): cmdAssumptions(), cmdInit(), cmdNew(), cmdStatus(), cmdTarefa(), copyDirIfExists(), definirCampoTarefa(), detectarAgente() (+19 more)

### Community 24 - "Rotas de currículos"
Cohesion: 0.14
Nodes (18): VersionConflictError, HttpResourceContext, CREATE(), createHandlers(), DELETE(), GET(), PATCH(), updateResumeSchema (+10 more)

### Community 25 - "Serviços de conta frontend"
Cohesion: 0.13
Nodes (17): frontendServices, createAccountService(), deleteAccount(), AccountService, createAnalysisService(), createVacancyService(), VacancyService, useNewAnalysis() (+9 more)

### Community 26 - "Injeção de componentes Svelte"
Cohesion: 0.11
Nodes (30): acceptedDomAlreadyClean(), applyOriginalAttrsToSvelteAnchor(), clearHandledWrapperReloadStamp(), commitAcceptedSvelteComponentToDom(), componentModuleCandidates(), deferredRecoverySuperseded(), describeMountFailure(), detectDevServerBase() (+22 more)

### Community 27 - "Autenticação e sessões"
Cohesion: 0.13
Nodes (17): authenticate(), AuthenticationService, AuthService, useAuthForm(), submit(), AuthCredentials, AuthMode, validateAuthCredentials() (+9 more)

### Community 28 - "Schema e migrações iniciais"
Cohesion: 0.14
Nodes (28): "Account", Account_userId_idx, "Analysis", Analysis_userId_createdAt_idx, "Evaluation", Evaluation_requirementId_key, "Export", "FileGarbage" (+20 more)

### Community 29 - "Análises e erros domínio"
Cohesion: 0.13
Nodes (17): AiNotConfiguredError, AnalysisNotFoundError, CompletedAnalysisNotFoundError, RequireUser, aiConfigurationStatus(), getAiConfig(), value(), createHandlers() (+9 more)

### Community 30 - "Planejamento de execução spec"
Cohesion: 0.15
Nodes (26): cmdPlano(), gerarArtefatosPlano(), AGENTES, allowedTools(), descreveTarefa(), ehModeloClaude(), esc(), ESFORCO_CLI (+18 more)

### Community 31 - "Dashboard e layout frontend"
Cohesion: 0.13
Nodes (12): metadata, RootLayout(), DeleteAccountInput, deleteAccountSchema, Toaster(), analysis(), dashboard, resume (+4 more)

### Community 32 - "Serviços de análise frontend"
Cohesion: 0.17
Nodes (13): AnalysisService, CreateAnalysisInput, useAnalysisActions(), useAnalysisNotifications(), useAnalysis(), classificationLabels, dimensionLabels, statusLabels (+5 more)

### Community 33 - "Erros e gerenciamento conta"
Cohesion: 0.13
Nodes (11): AccountConfirmationError, DomainError, DomainErrorCode, domainErrorMessages, VacancyImportError, createDELETE(), deleteAccountSchema, createPOST() (+3 more)

### Community 34 - "Sessões e autorização usuário"
Cohesion: 0.17
Nodes (10): UnauthenticatedError, AuthenticatedUser, IUserSessionRepository, SessionCredentials, UserService, UserSessionRepository, assertTrustedMutationOrigin(), createRequireUser() (+2 more)

### Community 35 - "Execução da migração Gemini"
Cohesion: 0.29
Nodes (22): amarelo(), encerrar(), evento(), executar_seq_T_011(), executar_seq_T_012(), executar_seq_T_013(), executar_seq_T_014(), executar_tudo() (+14 more)

### Community 36 - "Execução das rotas frontend"
Cohesion: 0.28
Nodes (22): amarelo(), encerrar(), evento(), executar_faixa_1(), executar_faixa_2(), executar_faixa_3(), executar_faixa_4(), executar_tudo() (+14 more)

### Community 37 - "Formulários de novas análises"
Cohesion: 0.15
Nodes (10): NewAnalysisInput, newAnalysisSchema, vacancyUrlSchema, VersionsService, VersionApprovalInput, versionApprovalSchema, ExportFile, Version (+2 more)

### Community 38 - "Execução do release Docker"
Cohesion: 0.26
Nodes (20): amarelo(), encerrar(), evento(), executar_faixa_1(), executar_faixa_2(), executar_tudo(), falhar(), gerar_resumo() (+12 more)

### Community 39 - "Ferramentas de desenvolvimento backend"
Cohesion: 0.09
Nodes (21): devDependencies, @biomejs/biome, @types/express, @types/node, @types/pdfkit, @types/pg, better-auth, zod (+13 more)

### Community 40 - "Worker e manutenção"
Cohesion: 0.13
Nodes (4): runMaintenance(), runWorker(), WorkerDependencies, WorkerOptions

### Community 41 - "Contratos de pontuação ATS"
Cohesion: 0.16
Nodes (16): DimensionScore, Requirement, RequirementClassification, requirementClassifications, RequirementDimension, requirementDimensions, ScoredRequirement, ScoringResult (+8 more)

### Community 42 - "Scripts de operação projeto"
Cohesion: 0.10
Nodes (20): scripts, api, build, check:backend, db:generate, db:migrate, db:migrate:dev, dev (+12 more)

### Community 43 - "Design frontend e acessibilidade"
Cohesion: 0.13
Nodes (16): Frontend Design Anti-Patterns, Frontend Design Checklist, Frontend Design Examples, Frontend Design, WCAG 2.2 AA, Impeccable Agent Interface, Native Adaptation, Window Size Classes (+8 more)

### Community 44 - "Direção visual e plataformas"
Cohesion: 0.13
Nodes (19): iOS platform conventions, Layout hierarchy and rhythm, Interactive live variants, Live mode project setup, Operate visual direction, Persuade and Experience direction, Read visual direction, New visual work pipeline (+11 more)

### Community 45 - "Manipulação DOM visual"
Cohesion: 0.16
Nodes (13): createLiveBrowserDomHelpers(), cloneWithoutChrome(), cssId(), liveUiRoot(), makeFrozenAnchor(), raiseHitModal(), rectIsUsableAnchor(), syncTopLayerHost() (+5 more)

### Community 46 - "Qualidade do código backend"
Cohesion: 0.11
Nodes (18): source, assist, actions, files, includes, formatter, enabled, indentStyle (+10 more)

### Community 47 - "Aliases de componentes frontend"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 48 - "Serviços de currículos frontend"
Cohesion: 0.21
Nodes (7): ResumesService, ResumeInputState, useResumeInput(), ResumeReviewInput, resumeReviewSchema, resumeUploadSchema, Resume

### Community 49 - "Configuração TypeScript frontend"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 50 - "Persistência de sessão visual"
Cohesion: 0.22
Nodes (15): createLiveBrowserSessionState(), clearHandled(), clearScrollY(), clearSession(), isHandled(), loadSession(), markHandled(), nextCheckpointRevision() (+7 more)

### Community 51 - "Listas e indicadores dashboard"
Cohesion: 0.30
Nodes (10): AnalysisList(), DashboardOverview(), StatCard(), navigationItems, WorkspaceScreen, WorkspaceNavigation(), WorkspaceShell(), Badge() (+2 more)

### Community 52 - "Anotações e pinos visuais"
Cohesion: 0.20
Nodes (17): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), clampPlaceholderSize(), finalizeEditingPin(), initAnnotOverlay(), localCoords() (+9 more)

### Community 53 - "Coordenação de alvos visuais"
Cohesion: 0.31
Nodes (16): actOnAgentTarget(), agentTargetBusyReason(), agentTargetOverlayGone(), agentTargetTaken(), claimAgentTarget(), claimAndActOnAgentTarget(), declineAgentTargetBusy(), declineAgentTargetUnresolvable() (+8 more)

### Community 54 - "Páginas e autenticação frontend"
Cohesion: 0.23
Nodes (9): Page(), AnalysisHistory(), useSession, AccessBrand(), AccessForm(), AuthenticatedWorkspace(), Workspace(), renderAccessForm() (+1 more)

### Community 55 - "Serviços de dashboard frontend"
Cohesion: 0.30
Nodes (8): Task, DashboardService, useDashboard(), Dashboard, useWorkspace(), useActionFeedback(), useFeedbackMessage(), errorMessage()

### Community 56 - "Experiência e legibilidade ATS"
Cohesion: 0.21
Nodes (6): ExperiencePeriod, mergedMonths(), readability(), normalize(), validateEvidence(), analysisSchema

### Community 57 - "Componentes de diálogo"
Cohesion: 0.32
Nodes (12): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay() (+4 more)

### Community 58 - "Dependências do workspace"
Cohesion: 0.13
Nodes (14): devDependencies, prettier, prisma, typescript, engines, node, name, private (+6 more)

### Community 59 - "Especificação das rotas frontend"
Cohesion: 0.15
Nodes (5): Frontend routing execution plan, Frontend routing HTML plan, Frontend routes and Zod specification, Frontend routes and Zod tasks, Frontend route architecture

### Community 60 - "Configuração TypeScript backend"
Cohesion: 0.14
Nodes (13): compilerOptions, esModuleInterop, lib, module, moduleResolution, noEmit, paths, resolveJsonModule (+5 more)

### Community 61 - "Design e revisão API"
Cohesion: 0.17
Nodes (11): API Design Anti-Patterns, API Design Checklist, API Design Examples, Order Cancellation Contract, API Design, RFC 9457 Problem Details, Code Review Anti-Patterns, Code Review Checklist (+3 more)

### Community 62 - "Verificação de qualidade visual"
Cohesion: 0.17
Nodes (6): Plan and asset review, Craft quality floor, Raster asset producer, Finish fidelity reviewer, Live variant generation, Design detector hooks

### Community 63 - "Análise e evidências locais"
Cohesion: 0.27
Nodes (9): adapt(), analyze(), redact(), exportDocuments(), heading(), saveFile(), processTask(), docx (+1 more)

### Community 64 - "Cliente Gemini e respostas"
Cohesion: 0.38
Nodes (10): AiClientFailure, blockedResponseError(), delay(), invalidResponseError(), isTransient(), providerFailureMessage(), rejectUnsafeResponse(), retryDelaysMs (+2 more)

### Community 65 - "Documentação de design"
Cohesion: 0.24
Nodes (5): Deprecated craft alias, Design system documenter, Impeccable artifact maintenance, Design system documentation, Product truth initialization

### Community 66 - "Verificação de critérios spec"
Cohesion: 0.33
Nodes (8): extractTags(), gitRev(), parseJsonReport(), parseTap(), resultsByTag(), runVerify(), STATUS_RANK, allAcs()

### Community 67 - "Importação URL e segurança"
Cohesion: 0.31
Nodes (5): applyOrder(), importUrl(), publicAddress(), validateUrl(), ipaddr.js

### Community 68 - "Auditoria frontend automatizada"
Cohesion: 0.20
Nodes (9): collect(), commands, { createHash }, fs, hashes, path, results, root (+1 more)

### Community 69 - "Geração de testes spec"
Cohesion: 0.44
Nodes (8): detectStyle(), jsFail(), jsHeader(), renderJsPrinciple(), renderJsTest(), renderPyPrinciple(), renderPyTest(), scaffoldTests()

### Community 71 - "Auditoria segurança e privacidade"
Cohesion: 0.25
Nodes (5): LGPD Education Constitution Template, Security Audit Anti-Patterns, Security Audit Checklist, Security Audit Examples, Security Audit

### Community 72 - "Especificação do release Docker"
Cohesion: 0.25
Nodes (3): Docker release execution plan, Docker release specification, Docker release tasks

### Community 73 - "Exclusões da edição visual"
Cohesion: 0.52
Nodes (6): globToRegex(), matchesScope(), normalizeIgnoreRule(), normalizeIgnoreValue(), pageCandidates(), resolveDetectIgnores()

### Community 74 - "Testes de documentação implantação"
Cohesion: 0.29
Nodes (3): root, architecture, specification

### Community 75 - "Configuração Biome workspace"
Cohesion: 0.29
Nodes (6): extends, files, includes, root, $schema, ./backend/biome.json

### Community 76 - "Refatoração e testes pagamentos"
Cohesion: 0.33
Nodes (4): Refactoring Agent Interface, Payment System Refactoring, Unit Testing Agent Interface, Payment Unit Testing

### Community 78 - "Testes do cliente Gemini"
Cohesion: 0.40
Nodes (3): geminiResponse(), originalEnvironment, response()

### Community 80 - "Planejamento de funcionalidades"
Cohesion: 0.40
Nodes (5): Feature Planner Anti-Patterns, Feature Planner Checklist, Feature Planner Examples, Invoice CSV Export Plan, Feature Planner

### Community 82 - "Reprodução da auditoria frontend"
Cohesion: 0.40
Nodes (4): fs, path, result, { spawnSync }

### Community 83 - "Configuração TypeScript testes"
Cohesion: 0.40
Nodes (4): exclude, extends, include, ./tsconfig.json

## Knowledge Gaps
- **75 isolated node(s):** `@prisma/client`, `better-auth`, `pg`, `tsx`, `zod` (+70 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 486 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Dashboard e layout frontend` to `Serviços de análise frontend`, `Formulários de novas análises`, `Execução de testes spec`, `Dependências do frontend`, `Testes de documentação implantação`, `Serviços de currículos frontend`, `Páginas e autenticação frontend`, `Serviços de conta frontend`, `Autenticação e sessões`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `@prisma/client`, `better-auth`, `pg` to the rest of the system?**
  _75 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Edição visual no navegador` be split into smaller, more focused modules?**
  _Cohesion score 0.027282576578351227 - nodes in this community are weakly interconnected._
- **Why does `prisma` connect `Dependências do workspace` to `Inicialização e configuração Prisma`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `Controles da barra visual` be split into smaller, more focused modules?**
  _Cohesion score 0.09474206349206349 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `Scripts de operação projeto` to `Dependências do workspace`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Should `Captura de telas` be split into smaller, more focused modules?**
  _Cohesion score 0.08897243107769423 - nodes in this community are weakly interconnected._

Extraction notes: Host-agent token usage was not exposed by the orchestration tool. Token zeros are placeholders, not a measured zero cost. 23 code files yielded no symbols in the AST extractor.

`graphify-out/` was written into the working tree; unless ignored, it appears in `git status`. Add it to `.gitignore` or commit only the outputs the team should share.

Graph health warning: {"dangling_endpoint_edges": 21, "self_loop_edges": 21, "directed_same_endpoint_collapsed_edges": 140, "undirected_same_endpoint_collapsed_edges": 150}. Graph remains usable but can be incomplete; see graph-health.json.
