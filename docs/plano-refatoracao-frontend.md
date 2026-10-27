# Plano de refatoração do frontend

Status: implementação executada em 17/10/2026; validação automatizada concluída. Inspeção visual em navegador pendente por falha do sandbox. Evidências em `docs/validacao-refatoracao-frontend.md`.

## Objetivo e escopo

Separar responsabilidades do frontend para facilitar leitura, testes e manutenção, preservando comportamento, aparência e contratos HTTP. O escopo considera a conversa sobre `frontend/`; não inclui refatorar o backend.

## Diagnóstico

- `features/workspace/ui/Workspace.tsx` concentra shell, navegação, sessão, dashboard, polling, formulários, requisições e componentes Access, NewAnalysis, Result e Editor.
- Há chamadas HTTP dentro de handlers de interface e dependência direta de autenticação no fluxo principal.
- A atualização do dashboard e da análise selecionada ocorre a cada quatro segundos. Extrações precisam preservar o ciclo de vida dos timers e o conteúdo em edição.
- `features/*/model` e `shared/ui` já oferecem uma base por funcionalidade: evoluir essa organização.
- Não foram encontrados testes no frontend. O script `test` da raiz executa apenas testes do backend; o Biome da raiz também exclui o frontend.
- `docs/architecture.md` já prevê separar análise, currículos, histórico e configurações.

## Decisões de arquitetura

1. `app` mantém entrada, layout e estilos globais. `workspace` compõe funcionalidades e controla navegação.
2. Cada funcionalidade contém apenas as pastas necessárias: `ui` para apresentação, `hooks` para estado e efeitos, `api` para adaptadores e `model` para tipos e funções puras.
3. Funções de aplicação com orquestração relevante ficam em `application`, recebendo dependências explícitas. Não criar um caso de uso para cada chamada HTTP simples.
4. Contratos pequenos das operações externas ficam junto ao consumidor em `application/ports.ts`, quando necessários para isolar orquestração. Adaptadores implementam esses contratos; a composição fornece as implementações concretas.
5. Modelos e funções puras não importam React, Next.js, autenticação ou transporte HTTP. `shared` não importa `features`; funcionalidades não importam `workspace`.
6. Dependências entre funcionalidades são explícitas e sem ciclos: dashboard pode agregar tipos de análise e currículo; criação de análise pode consumir operações públicas de currículo. Não mover regras específicas para `shared` apenas para evitar um import.
7. Preservar CSS, marcação relevante, navegação local e componentes compartilhados. Separar extração estrutural de correções funcionais identificadas durante o trabalho.

## SOLID e Clean Code na prática

| Princípio                | Aplicação                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Responsabilidade única   | Componentes apresentam dados; hooks coordenam estado/efeitos; adaptadores realizam transporte.                                      |
| Aberto/fechado           | Centralizar metadados de navegação e rótulos; permitir substituir serviços por composição, sem criar sistemas genéricos de plugins. |
| Substituição             | Adaptadores reais e substitutos de teste cumprem os mesmos contratos de resultado e erro. Não introduzir herança artificial.        |
| Segregação de interfaces | Props e contratos descrevem somente as operações exigidas pelo consumidor; evitar um serviço global com todas as funções.           |
| Inversão de dependência  | Orquestrações recebem operações tipadas e não conhecem `fetch`, URL base ou o cliente de autenticação.                              |

Usar nomes como `analysis`, `version`, `resume` e `refreshDashboard` no lugar de abreviações ambíguas. Extrair funções por responsabilidade, reduzir aninhamento e manter estado derivado como cálculo quando isso preservar a semântica. Não aplicar limites arbitrários de linhas, duplicar DTOs sem transformação necessária ou criar classes para funções simples.

## Organização pretendida

```text
frontend/src/
  app/                         entrada e estilos existentes
  composition/
    frontend-services.ts       montagem dos adaptadores e operações
  features/
    workspace/
      model/navigation.ts
      hooks/use-workspace.ts
      ui/Workspace.tsx
      ui/WorkspaceShell.tsx
      ui/WorkspaceNavigation.tsx
    auth/
      api/auth-client.ts
      api/auth-service.ts
      hooks/use-auth-form.ts
      ui/AccessForm.tsx
    dashboard/
      api/dashboard-api.ts
      hooks/use-dashboard.ts
      model/types.ts
      ui/DashboardOverview.tsx
      ui/StatCard.tsx
    resumes/
      api/resumes-api.ts
      model/types.ts
      ui/ResumeLibrary.tsx
      ui/ResumeInput.tsx
    analysis/
      api/analysis-api.ts
      api/vacancy-api.ts
      application/             orquestração e portas necessárias
      hooks/use-new-analysis.ts
      hooks/use-analysis.ts
      model/types.ts
      model/labels.ts
      ui/NewAnalysisForm.tsx
      ui/AnalysisResult.tsx
      ui/AnalysisList.tsx
      ui/AnalysisHistory.tsx
    versions/
      api/versions-api.ts
      hooks/use-version-editor.ts
      model/types.ts
      ui/VersionEditor.tsx
    account/
      api/account-api.ts
      ui/AccountSettings.tsx
  shared/
    api/client.ts
    lib/utils.ts
    ui/                        componentes existentes e ícones reutilizados
```

Estrutura proposta, não uma lista de pastas a criar antecipadamente. `Version` e `ExportFile` passam para `versions/model/types.ts`; análise importa esses tipos. Operações reutilizadas são expostas explicitamente, sem barrels globais.

## Tarefas e critérios de conclusão

F01–F09 implementadas e verificadas automaticamente. F10: revisão de código e documentação concluídas; inspeção visual manual em desktop/celular pendente por indisponibilidade do navegador. A navegação por rotas permanece em uma futura especificação.

| ID  | Entrega e arquivos principais                                                                                                                          | Depende de | Validação para concluir                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 | Registrar linha de base e matriz de fluxos em `docs/validacao-refatoracao-frontend.md`; revisar `docs/api-contract.md`.                                | —          | Registrar resultados reais de tipos/build, falhas anteriores, estados de tela e cenários abaixo.                                                                                            |
| F02 | Preparar testes de frontend em `frontend/tests/` e script próprio em `frontend/package.json`; definir infraestrutura mínima para componentes e timers. | F01        | Teste de caracterização executável de um fluxo crítico; testes não dependem de banco, IA ou credenciais reais. Documentar escolha de dependências antes de instalar.                        |
| F03 | Extrair adaptadores de dashboard, currículo, análise, importação de vaga, versão e conta; preservar `shared/api/client.ts`.                            | F02        | Testes verificam métodos, URLs, payloads, cookies, FormData e propagação dos erros existentes. Nenhuma rota alterada.                                                                       |
| F04 | Separar tipos de versão, navegação tipada, rótulos e funções puras de apresentação.                                                                    | F03        | Consumidores compilam; testes cobrem rótulos/fallbacks relevantes; ausência de ciclos e imports de infraestrutura nos modelos.                                                              |
| F05 | Extrair `WorkspaceShell`, navegação, visão geral, biblioteca de currículos e histórico; manter coordenação no Workspace temporariamente.               | F04        | Navegação e seleção de análise preservadas; mesma apresentação em desktop e celular; componentes de apresentação sem HTTP.                                                                  |
| F06 | Extrair `AccessForm`, adaptador/hook de autenticação e `AccountSettings`.                                                                              | F05        | Cadastro, login, logout, erros e exclusão de conta preservados; exclusão envia confirmação e só encerra sessão após sucesso.                                                                |
| F07 | Extrair `NewAnalysisForm`, `ResumeInput` e `use-new-analysis`; isolar orquestrações e dependências necessárias.                                        | F06        | Seleção/upload/revisão/exclusão de currículo, importação de vaga e criação de análise mantêm dados, consentimento e atualização das telas.                                                  |
| F08 | Extrair `AnalysisResult`, `VersionEditor` e hooks correspondentes.                                                                                     | F07        | Adaptação, comparação, edição, aprovação com revisão, links de download e exclusão de análise preservados.                                                                                  |
| F09 | Extrair carregamento/polling para hooks e montar dependências em `composition`; reduzir Workspace a sessão, navegação e composição.                    | F08        | Timer de quatro segundos com limpeza ao sair/desmontar; troca de análise sem conteúdo cruzado; atualização não perde edição. Falhas funcionais preexistentes são registradas separadamente. |
| F10 | Revisar dependências, nomes, props e resíduos; atualizar `frontend/README.md` e `docs/architecture.md`.                                                | F09        | Verificações finais passam, matriz de fluxos registrada, ausência de chamadas HTTP no JSX e de ciclos; nenhuma supressão de tipos introduzida.                                              |

## Plano de execução

1. **Preparação — F01–F02:** tornar regressões observáveis antes de movimentar estado e efeitos.
2. **Fronteiras — F03–F04:** estabilizar operações e tipos usados nas extrações.
3. **Extração incremental — F05–F08:** mover um conjunto de componentes por vez, preservando primeiro os handlers e o estado; depois isolá-los e verificar o fluxo correspondente.
4. **Composição — F09:** integrar os hooks e serviços após os componentes terem limites claros.
5. **Fechamento — F10:** revisão e validação integrada.

Recomendação inicial: execução sequencial. As extrações compartilham `Workspace.tsx`, estado e callbacks; paralelizar agora aumenta conflitos. Reavaliar divisão de trabalho somente após a extração física dos componentes. Cada tarefa corresponde a um conjunto de alterações revisável; commits somente quando solicitados. Preservar arquivos e alterações preexistentes.

## Matriz mínima de regressão

- Sessão pendente, visitante, cadastro, login com sucesso/erro e logout.
- Dashboard vazio/preenchido; navegação por todas as telas e abertura de análise.
- Upload e seleção de currículo; revisão e persistência do texto; cancelamento e confirmação de exclusão.
- Vaga por texto ou URL; importação com sucesso/erro; consentimento e criação da análise.
- Análise pendente, em processamento, concluída e com falha; atualização da selecionada.
- Pedido de adaptação; comparação original/proposta; edição; aprovação invalidada quando o texto muda; envio de `revision`; downloads.
- Exclusão de análise e retorno ao histórico; exclusão de conta com confirmação por e-mail; falha sem logout indevido.
- Erros visíveis, bloqueio de ações durante processamento, teclado/foco das confirmações, desktop e celular.
- Timers encerrados na desmontagem/saída; atualização não sobrescreve texto em edição nem troca o resultado de outra análise.

Testes devem observar resultados e efeitos externos. Não testar organização de arquivos como substituto de comportamento. Cenários que revelem defeitos anteriores devem ser documentados, sem transformá-los em comportamento desejado nem corrigi-los silenciosamente nesta refatoração.

## Verificações

Comandos já existentes, executados na raiz durante a implementação:

```powershell
npm.cmd run typecheck
npm.cmd run build --workspace @sistema-ats/frontend
npm.cmd test
```

Após F02, `npm test` passou a executar backend e frontend; `npm run test:frontend` executa a suíte dedicada. Executar testes afetados a cada tarefa; tipos/build nos marcos de integração e suíte completa no fechamento. Conferir formatação apenas nos arquivos alterados, sem correção global.

Execução: tipos, 63 testes de backend, 21 testes de frontend e build passaram. A comparação temporária da marcação original e refatorada passou em oito telas. A inspeção visual em navegador e a integração com serviços reais não foram executadas; consulte o relatório de validação.

## Limites, suposições e decisões pendentes

- Suposição: o pedido continua restrito ao frontend descrito anteriormente.
- Preservar textos, aparência, intervalos, payloads, regras de consentimento e revisão; regras de pontuação continuam no backend.
- Fora do escopo: novas funcionalidades, redesign, migração de rotas, nova biblioteca de estado, atualização generalizada de dependências e alterações de banco/API.
- Decisão executada em F02: Vitest, jsdom e Testing Library, somente como dependências de desenvolvimento, após consulta à documentação atual via Context7.

## Ajustes aplicados durante a execução

- F09 mantém uma união simples de telas e callbacks locais; não cria uma infraestrutura de navegação que seria descartada na migração para rotas.
- `use-resume-input` concentra o estado reutilizado entre currículos e criação de análise. `use-analysis-actions` separa os comandos do resultado; `use-analysis` cuida da seleção e atualização periódica.
- `ResumeLibrary` preserva o cabeçalho e a composição da revisão; `ResumeInput` contém a interface do currículo. O mesmo estado permanece montado ao alternar entre nova análise e currículos.
- `application` só contém contratos ou orquestração efetiva; chamadas HTTP simples não ganharam classes intermediárias.
- A composição preserva endpoints, cookies, FormData, consentimento e revisão. A limpeza de timers e a proteção contra respostas de uma seleção anterior fazem parte da validação de F09.
- Nenhuma migração de rotas, alteração de backend ou commit foi realizada.
- Falhas de concorrência e erros silenciosos eventualmente confirmados serão registrados com reprodução e proposta de correção separada.
- O repositório apresenta muitos arquivos não rastreados. Não fazer staging global nem misturar conteúdo preexistente com a refatoração.
