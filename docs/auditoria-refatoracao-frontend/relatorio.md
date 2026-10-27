# Auditoria da refatoração do frontend

Data: 17/10/2026. Veredito: **não aprovado para fechamento**.

Referência de requisitos: `docs/plano-refatoracao-frontend.md`, incluindo a decisão de manter rotas fora desta etapa. Não existe uma spec desta refatoração em `.spec/features/`: o diretório contém zero features. A auditoria não criou critérios retroativos nem alterou a implementação para produzir um resultado favorável.

## Achados

### 1. Bloqueador funcional: dashboard pode permanecer vazio com API lenta (F09)

Arquivo: `frontend/src/features/dashboard/hooks/use-dashboard.ts`, linhas 13, 16 e 25.

Cada chamada de `refresh` incrementa `request.current`; uma resposta só é aceita quando seu número ainda é o mais recente. O intervalo dispara outra chamada a cada 4 segundos, mesmo com uma requisição em andamento. Se todas as consultas levam 5 segundos, cada resposta chega depois do início da seguinte e é descartada. O mesmo filtro pode esconder os erros nessas condições.

Reprodução com timers controlados: 20 segundos de execução, 6 consultas iniciadas, 4 respostas bem-sucedidas entregues, nenhum erro de serviço. Resultado observado: `dashboard === null`. O teste esperava os dados retornados pela API e falhou. A linha de base anterior fazia `setDashboard(await api(...))`, sem essa condição de descarte; o filtro foi introduzido na extração.

Prova: [teste isolado](dashboard-lento.test.tsx), [saída completa](dashboard-lento.log), [código de saída 1](dashboard-lento-resultado.json).

Correção recomendada: coordenar consultas em andamento para que o tick não invalide toda resposta válida; manter a proteção de desmontagem/troca de sessão. Incorporar a reprodução à suíte normal quando corrigir. Não foi aplicada correção nesta auditoria.

### 2. Bloqueador de comprovação: não há rastreabilidade mecânica da refatoração

- `.spec/features/` está vazio; não existem `spec.md` e `tasks.md` desta entrega.
- Nenhum dos testes do frontend contém `@spec:AC-...`.
- `onpspec.config.json` usa `node --test` e globs sob `src/`, `tests/`, `test/` e `__tests__/` na raiz. Não inclui `frontend/src` ou `frontend/tests` nem configura o runner Vitest desta entrega.
- `verify refatoracao-frontend` encerrou com **exit 2**: feature não encontrada.
- `audit --ci` encerrou com **exit 0**, mas examinou **0 features, 0 histórias, 0 critérios e 0 provas**. Também avisou que a verificação do princípio P-002 não alcança nenhum arquivo.

Esse exit 0 é uma verificação vazia; não é prova de aderência da refatoração. Provas: [verify.log](verify.log), [audit.log](audit.log), [resultados.json](resultados.json).

Correção recomendada: registrar os requisitos do plano sem reduzi-los, mapear tarefas e testes a critérios explícitos, configurar os caminhos/runner e só então gerar prova com `verify`. Os critérios ainda não atendidos devem continuar pendentes.

### 3. Cobertura parcial e status de conclusão exagerado

O plano afirma na linha 100 que F01–F09 foram verificadas automaticamente. Essa afirmação não é sustentada pela cobertura disponível e é contrariada pela reprodução de F09.

Exemplos de cenários pedidos que não têm asserção correspondente na suíte persistida:

- Login e cadastro com sucesso: `workspace.test.tsx` cobre credenciais inválidas, falha de conexão e uma sessão previamente simulada, não a transição de sucesso dos formulários.
- Importação de vaga com erro e criação por texto sem URL: o fluxo integrado em `forms.test.tsx` cobre importação por URL com sucesso.
- Cancelamento de exclusão de currículo: a confirmação/Escape é exercitada para análise; a exclusão de currículo é testada diretamente pelo hook.
- Foco e comportamento visual em desktop/celular: não há prova de navegador; a limitação já estava registrada.

Isso não demonstra que esses fluxos estão quebrados; demonstra ausência de prova suficiente para declará-los integralmente verificados. A comparação temporária de oito telas foi relatada na execução anterior, mas seu teste e os artefatos anteriores não foram mantidos no repositório. Ela não foi reexecutada nesta auditoria nem substitui inspeção visual.

## Matriz contra o plano

**PROVA FRACA (auditoria manual)** para o mapeamento abaixo: os vínculos entre tarefas e testes foram inspecionados manualmente, pois não existem critérios anotados. As execuções dos testes e os códigos de saída, por sua vez, são provas automatizadas reais.

| Tarefa | Evidência atual | Resultado da auditoria |
| --- | --- | --- |
| F01 — linha de base | Relatório anterior; novos logs disponíveis nesta auditoria | Documentada; execução histórica não revalidável por logs persistidos anteriores |
| F02 — ambiente de testes | Vitest/jsdom/Testing Library, cinco arquivos, 21 testes | Ambiente executável confirmado |
| F03 — adaptadores HTTP | `api.test.ts`, fábricas de serviços e cliente compartilhado | Contratos exercitados passaram |
| F04 — tipos e modelos | Tipos separados, navegação tipada, teste de fallback e typecheck | Estrutura observada; verificação arquitetural anterior não integra o gate |
| F05 — extração das telas | Componentes extraídos e teste de navegação | Parcial; apresentação desktop/celular não comprovada |
| F06 — autenticação e conta | Formulário, adaptador, `delete-account`; testes de falha/logout/ordem | Parcial; faltam cenários de sucesso dos formulários |
| F07 — nova análise/currículo | Hooks e testes de revisão/upload/consentimento/importação por URL | Parcial; faltam cenários negativos e criação por texto |
| F08 — resultado/editor | Testes de adaptação, confirmação, revisão, preservação de texto e links | Casos exercitados passaram; comparação visual/arquivo real não comprovados |
| F09 — atualização e composição | Testes existentes passaram; reprodução com API lenta falhou | **Reprovada: regressão reproduzida** |
| F10 — fechamento | Tipos/build/suítes passaram; documentação existe | **Não concluída**: F09, rastreabilidade e validações pendentes |

## Provas executadas nesta auditoria

| Comando | Resultado |
| --- | --- |
| `npm.cmd run typecheck` | exit 0 |
| `npm.cmd run test:backend` | 63 passaram; exit 0 |
| `npm.cmd run test:frontend` | 21 passaram; exit 0 |
| `npm.cmd run build --workspace @sistema-ats/frontend` | exit 0 |
| `onp-spec verify refatoracao-frontend` | exit 2; feature ausente |
| `onp-spec audit --ci` | exit 0; 0 critérios avaliados, 1 aviso |
| Reprodução isolada de API lenta | 1 teste falhou; exit 1 |

[resultados.json](resultados.json) registra comandos, horários e códigos de saída. Os logs `tipos.log`, `backend.log`, `frontend.log` e `build.log` contêm as saídas integrais. [sha256.json](sha256.json) identifica o conteúdo auditado de código, testes e configurações; hashes identificam a versão dos arquivos, não garantem a correção por si mesmos.

Reprodução a partir da raiz:

```powershell
node docs/auditoria-refatoracao-frontend/executar.cjs
node docs/auditoria-refatoracao-frontend/reproduzir.cjs
```

O segundo comando deve falhar no estado auditado, evidenciando o defeito. O teste de reprodução está fora da suíte normal e tem configuração isolada para não alterar a contagem dos 21 testes existentes.

Nenhum código de produção, teste existente ou requisito foi alterado nesta auditoria. Foram adicionados este relatório, os executores, a reprodução e os logs. O motor também registra sinais em `.spec/verification/sinais.json`.
