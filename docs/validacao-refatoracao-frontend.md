# Validação da refatoração do frontend

Data: 17/10/2026. Escopo: `frontend`, scripts de verificação e documentação.

## Linha de base

Antes das extrações, `npm run typecheck`, build do frontend e 63 testes do backend passaram. Três testes novos caracterizaram carregamento de sessão, falha de login e navegação sobre o componente original e passaram antes das mudanças.

O contrato em `docs/api-contract.md` foi conferido: métodos e caminhos, cookies, upload multipart, confirmação de conta, consentimento e aprovação por revisão foram preservados.

## Verificações executadas

| Verificação                         | Resultado                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| Tipos do backend, frontend e testes | PASS                                                                                            |
| Testes de backend                   | 63 PASS                                                                                         |
| Testes de frontend                  | 21 PASS, em cinco arquivos                                                                      |
| Build de produção do frontend       | PASS; rotas continuam `/` e `/_not-found`                                                       |
| Comparação temporária da marcação   | 8 PASS: login, cadastro, painel, histórico, nova análise, currículos, configurações e resultado |
| Inspeção de imports locais          | 64 arquivos, sem ciclos ou violações das fronteiras de modelos/shared/features                  |

A comparação renderizou a cópia anterior e os novos componentes com os mesmos dados e verificou igualdade do HTML, normalizando espaços e IDs gerados pelo Radix. As cópias temporárias foram removidas da árvore do projeto após a execução. Essa comparação não substitui inspeção visual em navegador.

## Cobertura dos fluxos

- `workspace.test.tsx`: sessão pendente, credenciais inválidas, cadastro com falha de conexão, navegação e logout com remoção dos dados/timers.
- `api.test.ts`: métodos, URLs, JSON, cookies, multipart sem boundary manual, links de download, propagação de erro e exclusão de conta sem logout em falha.
- `forms.test.tsx`: revisão/upload/exclusão de currículo, invalidação da revisão ao editar, consentimento, importação de vaga, criação da análise e editor com texto preservado durante atualização da revisão.
- `polling.test.tsx`: intervalo de quatro segundos, limpeza, erro do dashboard e proteção contra resposta de uma análise selecionada anteriormente.
- `results.test.tsx`: fila/processamento/falha, cancelamento/Escape/confirmação da exclusão, adaptação, versão e links de exportação, fallback de status.

Os testes usam dados fictícios, serviços substitutos e `fetch` simulado. Não acessam banco, contas reais, arquivos privados ou fornecedores de IA.

## Limitações e comportamento preexistente

- A inspeção visual em desktop/celular foi tentada pelo navegador integrado, mas o processo não iniciou: `helper_sandbox_lock_failed`, erro de permissão 5. Portanto, F10 ainda tem essa verificação manual pendente.
- Integração completa de autenticação, upload/download binário e processamento por worker não foi executada nesta etapa. Os testes locais cobrem os contratos e as interações, não infraestrutura real.
- Falhas de polling da análise continuam silenciosas e são tentadas novamente no próximo intervalo, como antes. Mudar essa comunicação requer uma decisão funcional separada.
- `busy` continua sendo compartilhado pelo workspace; o comportamento diante de múltiplas ações simultâneas não foi redesenhado.
- Não há novas URLs. A separação por rotas será especificada sobre os componentes extraídos.
- O repositório já estava com arquivos não rastreados antes do trabalho. Não houve staging global ou commit.

## Execução local

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build --workspace @sistema-ats/frontend
```

`npm run test:frontend` executa apenas a suíte nova; `npm run test:backend` mantém a execução isolada da suíte existente.
