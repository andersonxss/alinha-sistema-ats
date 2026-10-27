# Contrato HTTP do backend

## Convenções existentes

A API Express usa `/api`, sem versionamento de URL. As respostas JSON retornam o recurso diretamente, `{ id }` para criação de análise ou `{ ok: true }` para comandos. Erros dos endpoints da aplicação usam `{ "error": "mensagem", "code": "CODIGO_ESTAVEL" }`. O campo `error` foi preservado para os clientes existentes; `code` permite decisões sem comparar mensagens. Better Auth mantém seu próprio contrato em `/api/auth/*`. Health e preflight CORS mantêm suas respostas específicas.

Sessões são transmitidas por cookie. Todos os endpoints abaixo, exceto health, exigem sessão; mutações também exigem `Origin` igual a `FRONTEND_ORIGIN`. Consultas e alterações de recursos são filtradas pelo proprietário. Ausência de sessão produz 401; origem inválida produz 403. Como a origem é verificada primeiro, uma mutação sem origem válida pode retornar 403 antes da validação da sessão.

Zod valida os corpos JSON: campos desconhecidos são descartados pelos objetos atuais; erros de sintaxe e validação retornam 400. Não se introduz 422 nem um segundo envelope de erros nesta revisão. IDs são strings opacas. JSON tem limite padrão de 150.000 bytes; importação usa 4.096 e exclusão de conta usa 2.048. Excesso retorna 413. O leitor JSON existente não exige Content-Type, por compatibilidade; clientes devem enviar `application/json`.

Respostas recebem `Cache-Control: private, no-store`. CORS permite credenciais apenas para a origem configurada e expõe `Location`. Falhas inesperadas retornam 500 sem detalhes internos.

## Operações

| Método e caminho             | Entrada                                                                                                                        | Sucesso                                                                 | Condições específicas                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| GET `/api/health`            | Nenhuma                                                                                                                        | 200 `{ status: "ok" }`                                                  | 503 `{ status: "unavailable" }` se o banco estiver indisponível                                            |
| GET `/api/dashboard`         | Nenhuma                                                                                                                        | 200 com `user`, `resumes`, `analyses`, `tasks`, flags de IA e `uploads` | Resumo do usuário autenticado; limites abaixo                                                              |
| DELETE `/api/account`        | JSON `confirmation`: e-mail exato da sessão                                                                                    | 200 `{ ok: true }`                                                      | 400 se a confirmação divergir                                                                              |
| POST `/api/analyses`         | JSON `resumeId`, `text` (100–30.000 caracteres), `title` e `company` (2–160), `consent: true`; `url` opcional (URL, até 2.048) | 201 `{ id }`, `Location: /api/analyses/{id}`                            | 404 currículo ausente/de outro usuário; 400 revisão pendente; 503 IA não configurada                       |
| GET `/api/analyses/{id}`     | ID                                                                                                                             | 200 análise com vaga, versões e tarefas                                 | 404 ausente/de outro usuário                                                                               |
| POST `/api/analyses/{id}`    | ID; corpo não utilizado                                                                                                        | 202 `{ ok: true }`                                                      | Enfileira adaptação; 404 sem análise concluída própria; 409 adaptação em andamento; 503 IA não configurada |
| DELETE `/api/analyses/{id}`  | ID                                                                                                                             | 200 `{ ok: true }`                                                      | 404 ausente/de outro usuário                                                                               |
| POST `/api/import`           | JSON `url` (URL, até 2.048 caracteres)                                                                                         | 200 resultado da importação                                             | 400 URL/conteúdo recusado; restrições de rede aplicadas pelo importador                                    |
| POST `/api/resumes`          | Multipart com arquivo no campo `file`                                                                                          | 201 currículo, `Location: /api/resumes/{id}`                            | 415 mídia diferente de multipart; 400 formulário inválido/arquivo inválido; 413 tamanho excedido           |
| GET `/api/resumes/{id}`      | ID                                                                                                                             | 200 currículo                                                           | 404 ausente/de outro usuário                                                                               |
| PATCH `/api/resumes/{id}`    | JSON `text` (150–60.000 caracteres) e `name` (1–180), ambos obrigatórios                                                       | 200 `{ ok: true }`                                                      | Atualiza o subconjunto de revisão do currículo; 404 ausente/de outro usuário                               |
| DELETE `/api/resumes/{id}`   | ID                                                                                                                             | 200 `{ ok: true }`                                                      | 404 ausente/de outro usuário                                                                               |
| GET `/api/resumes/{id}/file` | ID do currículo                                                                                                                | 200 binário PDF/DOCX com `Content-Disposition: attachment`              | 404 sem arquivo próprio                                                                                    |
| GET `/api/download/{id}`     | ID da exportação                                                                                                               | 200 binário PDF/DOCX com `Content-Disposition: attachment`              | 404 sem exportação própria                                                                                 |
| PATCH `/api/versions/{id}`   | JSON `text` (150–60.000), `accepted` booleano e `revision` inteiro não negativo                                                | 202 `{ ok: true }`                                                      | Atualiza revisão e enfileira exportação; 409 revisão divergente ou recurso indisponível                    |

Limites por usuário/ação em janela de um minuto: análise, upload, importação e exportação, 5; adaptação, 3. Excesso retorna 429. Better Auth gerencia limites próprios. Uploads são lidos com orçamento de `MAX_UPLOAD_MB` (padrão 10 MiB) mais 65.536 bytes para o envelope multipart; o arquivo também passa pela validação de tamanho e formato do módulo de armazenamento.

## Repetição e processamento assíncrono

- Upload e criação de análise não possuem chave de idempotência: repetir POST pode criar outro recurso. Após timeout, consultar o dashboard antes de reenviar. Não há garantia de deduplicação por conteúdo.
- Adaptação bloqueia duplicatas pendentes/em processamento com 409, sob transação e lock. Após término, outro POST pode criar nova adaptação.
- Atualização de versão usa concorrência otimista: repetir a mesma revisão retorna 409 e não cria outra tarefa de exportação. O cliente deve recarregar a análise antes de decidir por uma nova alteração.
- DELETE de currículo/análise retorna 404 após a primeira remoção. O estado final continua sendo ausência do recurso. Após excluir a conta, a sessão deixa de permitir novas chamadas autenticadas.
- 201 de análise indica criação do recurso, não conclusão da IA. 202 indica trabalho enfileirado. O cliente acompanha análise/tarefas pelas consultas existentes.

## Achados e decisões de compatibilidade

Correções aplicadas nesta revisão: multipart inválido deixa de cair em 500; tipos de mídia incompatíveis retornam 415; criações incluem Location; cache privado é explícito. URLs, campos JSON e códigos de sucesso existentes foram mantidos.

Pendências que exigem evolução coordenada do contrato:

1. `DashboardRepository.getDashboardData` carrega todos os currículos. Análises são limitadas a 100 e tarefas a 20, sem continuação, e a consulta detalhada da análise também não pagina versões/tarefas. O frontend usa `resumes.length` como total e os arrays como listas completas. Adicionar apenas `take` ocultaria dados. A evolução deve incluir cursores, limites máximos, ordenação por data e ID, totais independentes e consumo das próximas páginas no frontend.
2. Criação de análise e upload não deduplicam retries. Uma garantia real exige persistir chave, identidade do usuário, fingerprint da requisição e resultado, com tratamento transacional de concorrência; não basta aceitar um header.
3. `PATCH /api/versions/{id}` agrupa ausência/recurso alheio e conflito de revisão em 409. Separar 404 de 409 exige manter a checagem de propriedade e a atualização atômica. O comportamento existente fica documentado nesta revisão.
4. Os endpoints de documentos e a consulta de análise serializam registros do ORM. DTOs explícitos devem definir a superfície pública antes de adicionar campos ao schema; remover campos já consumidos exige verificar os clientes.
5. `/api/import`, `/api/download/{id}` e POST no recurso de análise são convenções legadas. Renomeá-las apenas por estética quebraria os consumidores. Novas operações devem preferir recursos explícitos e prever transição quando substituírem esses caminhos.

## Verificação

Testes HTTP cobrem os métodos/caminhos existentes, parâmetros, query string, corpos, upload multipart, download, adaptador Node do Better Auth, CORS, cache, HEAD, 404 e 500. Testes do parser cobrem multipart válido, mídia incompatível, multipart malformado, tamanho excedido e erros JSON. São testes locais com handlers injetados; não comprovam autenticação completa, persistência ou concorrência no banco.
