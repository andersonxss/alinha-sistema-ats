# Arquitetura do SistemaATS

## Aplicações

- `frontend/`: interface Next.js App Router e recursos organizados por funcionalidade em `src/features/`.
- `backend/`: API Express 5, worker e persistência Prisma; permanecem no mesmo deploy modular, sem novos microserviços além dos processos API e worker já existentes.

## Backend por camada

Os imports do backend usam o alias `@/`, que aponta para `backend/src/`, por exemplo `@/domain/repositories/account.repository`. Imports entre arquivos da mesma pasta podem continuar relativos (`./`). O alias está definido no `backend/tsconfig.json` e é resolvido pelo `tsx` na execução da API, do worker e dos testes. As configurações do VS Code na raiz e no backend priorizam imports não relativos.

```text
backend/src/
  modules/                 adaptadores HTTP separados por domínio
  modules/*/application/   serviços e casos de uso
  modules/*/infrastructure/implementações de portas por adaptador
  domain/                  regras puras de avaliação e pontuação
  domain/scoring/          política de pesos, cálculo e conferência de evidências
  domain/resumes/          legibilidade e contagem de meses de experiência
  domain/repositories/     contratos de persistência e seus tipos de entrada/saída
  infrastructure/          Prisma, autenticação, IA, storage, importação e fila
  presentation/http/       sessão, parsing limitado e contrato de erro
  worker/                  execução de tarefas persistidas
  composition/             montagem concreta de serviços, repositórios e handlers
  modules/*/presentation/http/router.ts  rotas Express de cada módulo
  presentation/http/api-router.ts       montagem dos routers sob /api
  presentation/http/middleware/         segurança, CORS e respostas de erro
  app.ts                   inicialização da aplicação com suas dependências
  server.ts                ciclo de vida do servidor
  bootstrap.ts             configuração de ambiente e inicialização
```

Os arquivos `<recurso>.route.ts` são controllers/adaptadores: tratam autenticação, validação HTTP e serialização. Cada módulo registra seus métodos e caminhos em `presentation/http/router.ts`, com uma função `<Módulo>Router` que recebe os handlers por injeção. Serviços usam `<recurso>.service.ts` e classes `<Recurso>Service`; implementações usam `<recurso>.repository.ts` e classes `<Recurso>Repository`, sem prefixo do provedor. A composição concreta fica em `composition/api.ts`. Os serviços importam os contratos de `src/domain/repositories/`; as implementações permanecem em `modules/*/infrastructure/`.

Os contratos de persistência centralizados são `IAccountRepository`, `IAnalysisRepository`, `IDashboardRepository`, `IHealthRepository`, `IResumeRepository` e `IVersionRepository`; sessões usam `IUserSessionRepository`. Seus tipos de entrada/saída ficam junto às interfaces, sem importar serviços, Prisma ou Express. O contrato de análise reúne criação, consulta, adaptação e exclusão em `analysis.repository.ts`.

Por convenção deste projeto, `domain/repositories` também centraliza os contratos HTTP dos módulos: as interfaces `I*Handlers` ficam no respectivo `<recurso>.repository.ts`, e `WebHandler` e `HttpResourceContext` em `http-handler.contract.ts`. `documents.repository.ts` agrega os handlers de documentos, enquanto os contratos de persistência de currículo e versão permanecem separados. Portanto, o diretório reúne contratos de persistência e de transporte, não apenas repositórios de domínio. Os contratos HTTP usam os tipos Web `Request`/`Response`, sem depender do adaptador de infraestrutura. Routers, controllers e o adaptador importam esses contratos; os schemas Zod permanecem na apresentação.

Schemas Zod de entrada ficam em `modules/<módulo>/presentation/http/schemas/<recurso>.schema.ts`, com nomes de exports que identificam a operação. Os controllers fazem a leitura limitada do corpo e chamam o schema correspondente. A confirmação de exclusão de conta continua sendo comparada com o e-mail da sessão no controller. Módulos sem schemas de entrada não precisam de uma pasta vazia.

`presentation/http/create-app.ts` aplica os middlewares de segurança, monta o router da API e instala os handlers de 404 e erro, nessa ordem. O router central define os prefixos dos módulos. O módulo `documents` mantém os caminhos públicos `/resumes`, `/download` e `/versions`. A autenticação é registrada antes dos módulos e recebe o corpo bruto, sem parser global. O adaptador HTTP usa `originalUrl` para preservar o caminho completo nos handlers Web Request. Os testes de roteamento executam requisições HTTP com handlers injetados, sem banco ou serviços externos.

No módulo `documents`, consulta, revisão e exclusão de currículos usam `ResumeService` e `ResumeRepository`. Aprovação de versões usa `VersionService` e `VersionRepository`. Os controllers mantêm autenticação, validação e respostas HTTP; a composição injeta os serviços e o parser de seções. Exclusão com registro de arquivos para limpeza e aprovação com enfileiramento de exportação mantêm suas transações nos repositórios, incluindo os filtros de proprietário e revisão.

**Migração incompleta:** upload e downloads do módulo `documents` ainda acessam Prisma diretamente. Sua extração continua pendente. Os testes dos serviços usam repositórios substitutos e não comprovam rollback ou concorrência real no PostgreSQL.

## Pontuação e qualidade de currículo

O antigo `domain/scoring.ts` foi separado por responsabilidade:

- `domain/scoring/scoring-policy.ts`: pesos, valores de classificação e vocabulário usado no resultado.
- `domain/scoring/score-requirements.ts`: cálculo de dimensões, contribuições e nota final.
- `domain/scoring/validate-evidence.ts`: rastreabilidade na vaga e no currículo, duplicatas e confirmação de experiência.
- `domain/resumes/merged-months.ts`: união de períodos sem contar sobreposição duas vezes.
- `domain/resumes/readability.ts`: métricas e avisos de legibilidade.
- `domain/repositories/scoring.contract.ts` e `experience-period.contract.ts`: contratos TypeScript independentes de bibliotecas, seguindo a centralização adotada neste projeto.
- `infrastructure/ai/schemas/analysis.schema.ts`: validação Zod da resposta externa da IA.

A infraestrutura importa os contratos e as regras de domínio, nunca o contrário. O worker consome diretamente as funções de pontuação e legibilidade. Os schemas da IA pertencem à infraestrutura porque validam dados do provedor, não uma entrada HTTP da aplicação. Os pesos, ordem das dimensões, mensagens e formato persistido do resultado foram preservados. Funções puras mantêm as responsabilidades separadas sem classes ou interfaces de estratégia que o fluxo atual não exige.

## Frontend por funcionalidade

```text
frontend/src/
  app/                      layout global e ponto de entrada
  composition/              montagem dos serviços concretos
  features/
    workspace/              shell, composição e navegação temporária
    auth/                   sessão e formulário de acesso
    dashboard/              painel e atualização periódica
    resumes/                upload, seleção e revisão de currículos
    analysis/               criação, histórico e resultado de análises
    versions/               edição, aprovação e downloads
    account/                configurações e exclusão da conta
  shared/                   transporte, feedback e componentes reutilizáveis
```

`Workspace` compõe telas independentes, preservando a navegação local por estado até uma migração específica para rotas. `WorkspaceShell` e `WorkspaceNavigation` mantêm a estrutura visual. Cada funcionalidade separa `ui`, `hooks`, `api`, `application` e `model` conforme necessário. Os modelos não dependem de React ou HTTP; os contratos em `application/ports.ts` permitem substituir os serviços nos testes. `composition/frontend-services.ts` conecta esses contratos ao transporte compartilhado. A exclusão de conta é uma operação de aplicação que aguarda a remoção antes de encerrar a sessão.

Os hooks de dashboard e análise cuidam da atualização a cada quatro segundos e da limpeza de timers. A área autenticada desmonta ao encerrar a sessão e é identificada pelo usuário; respostas antigas não substituem outra seleção. O editor mantém o texto local durante atualizações da mesma versão e envia a revisão atual na aprovação. Essas garantias têm testes com serviços substitutos e timers controlados; não comprovam integração com banco ou IA reais.

### Tailwind CSS e shadcn/ui

O frontend usa Tailwind CSS 4 pelo plugin `@tailwindcss/postcss` em `frontend/postcss.config.mjs`. A configuração do shadcn/ui está em `frontend/components.json`, com estilo `new-york`, componentes em `src/shared/ui/` e o utilitário `cn` em `src/shared/lib/utils.ts`. Execute o CLI a partir de `frontend/` para respeitar esses caminhos.

`app/shadcn-theme.css` centraliza as cores e os raios dos componentes e os expõe ao Tailwind com `@theme inline`. A paleta verde e as fontes DM Sans e Manrope seguem a identidade existente. `app/globals.css` mantém o layout na camada `legacy`, antes de `utilities`, permitindo ajustes por classes Tailwind.

O Preflight está intencionalmente desabilitado para preservar os estilos existentes. Por isso, os componentes compartilhados declaram explicitamente bordas, fundos e margens quando necessário. Ao adicionar componentes, verifique essas propriedades em desktop e celular. Botões, campos, seleção nativa, checkboxes, rótulos, alertas, badges e confirmações já usam os componentes compartilhados. `Button` assume `type="button"`; ações de envio de formulário devem declarar `type="submit"`.

## API e autenticação

Os erros conhecidos do ATS são definidos em `domain/errors`, agrupados por assunto: currículos, análises, documentos, conta, usuário e importação. A classe base `DomainError` contém `code`, `message` e o nome da classe, sem códigos HTTP. `presentation/http/error-response.ts` centraliza a tradução para status e `{ error, code }`, usada tanto por `handle` quanto pelo middleware Express. Erros inesperados recebem `INTERNAL_ERROR` e mensagem genérica; erros de validação recebem `VALIDATION_ERROR`. A adaptação já enfileirada usa `AdaptationAlreadyQueuedError`, sem comparação de mensagens. `HttpError` permanece reservado a falhas de transporte, como corpo inválido, tamanho, origem e limite de requisições.

O [contrato HTTP](api-contract.md) documenta métodos, entradas, respostas, erros, repetição de operações e pendências de evolução da API.

A API mantém os caminhos existentes em `/api/*` e os mesmos formatos de resposta. A autenticação Better Auth está em `/api/auth/*`. A interface envia cookies com credenciais para a API; o Express permite CORS somente para `FRONTEND_ORIGIN`, e mutações autenticadas verificam a origem configurada. Downloads continuam protegidos por sessão e autorização por proprietário.

`modules/user/application/user.service.ts` expõe `UserService.authenticate`, que resolve o usuário autenticado usando o contrato `domain/repositories/user-session.repository.ts`. A aplicação recebe um registro simples com as credenciais e o contexto da requisição e lança `UnauthenticatedError` quando o repositório não retorna usuário. Não depende de Express, Better Auth, `Request`, `Headers` ou variáveis de ambiente.

`modules/user/infrastructure/user-session.repository.ts` expõe `UserSessionRepository`, que adapta a API de sessões do Better Auth e mantém a validação de sessão, assinatura e expiração no provedor. O adaptador devolve apenas `id`, `name` e `email`, usados pelos módulos atuais. Erros do provedor são propagados, sem serem convertidos em ausência de sessão.

`presentation/http/require-user.ts` fornece `createRequireUser`: verifica a origem antes da consulta de sessão, extrai os valores dos headers e converte `UnauthenticatedError` em HTTP 401. Origem inválida mantém HTTP 403. `composition/api.ts` monta as dependências e injeta a função nas fábricas de controllers de conta, dashboard, análises, documentos e importação. Não há um autenticador global mutável. Os filtros de proprietário continuam sendo aplicados nos casos de uso/repositórios existentes.

Configure:

- `FRONTEND_ORIGIN`: origem completa da interface (desenvolvimento: `http://localhost:3000`).
- `BETTER_AUTH_URL`: origem pública da API (desenvolvimento: `http://localhost:4000`).
- `NEXT_PUBLIC_API_BASE_URL`: URL da API embutida no bundle do frontend (desenvolvimento: `http://localhost:4000`).
- `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL` e `STORAGE_PATH` no servidor e worker. A integração usa Gemini Developer API via `@google/genai`; modelo e chave são obrigatórios, não há padrão, e as variáveis `AI_API_KEY`, `AI_BASE_URL` e `AI_MODEL` não são lidas.

Antes de trocar de provedor ou de `GEMINI_MODEL`, a operação deve concluir ou remover tarefas de análise e adaptação pendentes. A API persiste o modelo na criação, enquanto o worker lê as variáveis no processamento; por isso API e worker devem ser recriados juntos após a fila estar drenada.

O `.env.example` lista a configuração local. Em produção, use HTTPS e um proxy confiável com cabeçalhos de encaminhamento definidos por esse proxy.

## Comandos

### Qualidade do backend

No VS Code, `.vscode/settings.json` habilita formatação, correções seguras e organização de imports ao salvar. O Auto Save usa `onFocusChange`: trocar de arquivo ou sair do editor dispara o salvamento. `Ctrl+S` também aplica as ações. A extensão necessária é `biomejs.biome`, recomendada em `extensions.json`. Há configuração equivalente em `backend/.vscode` para quem abre apenas essa pasta. O `biome.json` da raiz reutiliza as regras do backend para descoberta pelo editor; `backend/biome.json` é uma configuração aninhada (`root: false`). O frontend fica excluído dessa configuração do Biome.

O backend usa Biome 2.5.15, configurado em `backend/biome.json`, com o preset recomendado de lint, organização de imports e formatação com dois espaços e LF. O código gerado pelo Prisma, dependências, cobertura e saída de build são excluídos. Prettier permanece responsável pelo frontend e documentação; ignora o backend para evitar conflitos entre formatadores. Arquivos `.prisma` devem ser formatados com `npm exec --workspace @sistema-ats/backend -- prisma format`, pois não são suportados pelo Biome.

Dentro de `backend/`:

- `npm run format` / `npm run format:check`: aplicar ou verificar formatação.
- `npm run lint` / `npm run lint:fix`: verificar lint ou aplicar correções seguras.
- `npm run check` / `npm run check:fix`: verificar ou corrigir formatação, lint e imports.
- `npm run ci:check`: verificação sem escrita, adequada para CI; avisos também fazem o comando falhar.

Na raiz, `npm run check:backend` e `npm run lint:backend` delegam ao backend. Os comandos globais `format` e `format:check` executam Prettier nas demais áreas e Biome no backend.

- `npm run dev`: Next.js em `:3000`.
- `npm run dev:api`: Express em `:4000`.
- `npm run worker`: worker persistente.
- `npm run typecheck`, `npm test`, `npm run test:integration`, `npm run build`.

O teste de integração inicia API e worker próprios e deve rodar sem outro worker consumindo a mesma fila.
