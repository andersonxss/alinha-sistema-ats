# Alinha — Sistema ATS para candidatos

Aplicação em português para importar currículos, revisar o texto, comparar oportunidades com evidências e produzir uma versão aprovada em PDF e DOCX. Implementação baseada em `PROMPT-SISTEMA-ATS.md`.

## Iniciar com Docker

Requisitos: Docker Desktop em execução com containers Linux, Docker Compose e portas locais 3000, 4000 e 5432 disponíveis.

1. Copie `.env.example` para `.env`.
2. Substitua `POSTGRES_PASSWORD` e `BETTER_AUTH_SECRET` por valores aleatórios. Use uma senha hexadecimal para evitar problemas de codificação na URL. Gere cada segredo com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
3. Atualize a senha em `DATABASE_URL` para execução fora dos containers. Dentro do Compose a URL é montada automaticamente.
4. Configure `GEMINI_API_KEY` e `GEMINI_MODEL` para a Gemini Developer API. O modelo é obrigatório e deve suportar saída JSON estruturada.
5. Execute `docker compose up --build -d`. O trabalho `migrate` aplica as migrações Prisma como tarefa temporária; a interface só inicia depois do sucesso. A API e o worker usam imagens de produção sem o CLI de migração.
6. Acesse <http://localhost:3000> e crie sua conta. A senha deve ter pelo menos 12 caracteres.

O trabalho `migrate` executa `prisma migrate deploy` e termina. O `app` depende da conclusão da migração, e o worker aguarda a saúde da aplicação. Arquivos ficam no volume `resume_files`; banco, no volume `postgres_data`. As portas são publicadas somente em loopback. Para disponibilizar na internet, configure proxy com HTTPS, `BETTER_AUTH_URL` com a origem pública e o encaminhamento confiável do IP de origem.

Ao migrar de `AI_API_KEY`, `AI_BASE_URL` e `AI_MODEL`, esvazie ou conclua antes a fila de análises e adaptações pendentes. A API registra o modelo configurado quando cria a análise, mas o worker lê o ambiente quando a executa; trocar provedor ou `GEMINI_MODEL` com tarefas em andamento pode associar o registro antigo a uma execução nova. Depois de atualizar as variáveis, recrie API e worker juntos com `docker compose up -d --force-recreate api worker`.

Não execute `docker compose down -v` para uma reinicialização: esse comando apaga os volumes. Use `docker compose restart` ou `docker compose down` seguido de `up -d`.

## Desenvolvimento

### Docker Watch

Com o `.env` configurado conforme a seção Docker, execute na raiz (Docker Compose 2.32+):

```sh
docker compose -f compose.yaml -f compose.dev.yaml up --build --watch
```

Mantenha o terminal aberto. A interface continua em <http://localhost:3000> e a API em <http://localhost:4000>. O frontend roda com `next dev` e recebe as alterações por sincronização; alterações no backend sincronizam os arquivos e reiniciam a API e o worker. O Watch reconstrói as imagens quando os manifests de dependências, o lockfile ou o Dockerfile mudam. Dependências, caches e o Prisma Client gerado ficam dentro dos containers.

O arquivo `compose.dev.yaml` seleciona o estágio de desenvolvimento; o comando Docker padrão continua usando produção. Ambos usam os mesmos volumes locais de banco e documentos. Para parar o ambiente, use `docker compose -f compose.yaml -f compose.dev.yaml down`.

Mudanças em `backend/prisma` regeneram o Prisma Client ao reconstruir API e worker, mas não aplicam migrações automaticamente. Depois de adicionar uma migração, execute:

```sh
docker compose -f compose.yaml -f compose.dev.yaml run --rm --build migrate
```

Após alterar `.env` ou os arquivos Compose, encerre o Watch e execute novamente o comando inicial. Esses arquivos não são sincronizados para os containers.

### Execução local

O monorepo agora separa `frontend/` (Next.js) de `backend/` (Express e worker). Para executar a API localmente, use `npm run dev:api` em outro terminal; `npm run worker` inicia o processamento. A configuração das origens e os limites de cada módulo estão em [docs/architecture.md](docs/architecture.md).

Node.js 24 LTS, dependências fixadas em `package.json` e `package-lock.json`.

```sh
npm ci
docker compose up -d postgres
npm run db:generate
npm run db:migrate
npm run dev
```

Em outros terminais: `npm run dev:api` e `npm run worker`. O Next.js não carrega `.env` no worker por conta própria; o processo usa `dotenv/config`. `STORAGE_PATH` precisa apontar para o mesmo diretório nos dois processos.

```sh
npm run typecheck
npm test
npm run build
npm run test:integration
```

O teste de integração exige banco migrado e porta 3101 livre. Ele inicia app e worker próprios, usa contas e documentos sintéticos e um servidor LOCAL de respostas de IA controladas. Não é uma validação da API do fornecedor. Não execute junto com outro worker usando o mesmo banco: o teste verifica a aquisição da fila. Para rodar em banco separado, configure `DATABASE_URL` no ambiente do comando e aplique as migrações nesse banco antes.

## Arquitetura

Veja [docs/architecture.md](docs/architecture.md) para o mapa frontend/backend, os limites HTTP preservados e as configurações de origem.

## Fluxo

- Cadastre-se e envie um PDF com texto ou DOCX.
- Confira o texto extraído, corrija e salve. A análise usa exatamente essa versão revisada.
- Cole a descrição da vaga ou importe uma URL pública e revise o resultado.
- Informe cargo e empresa; autorize o envio do conteúdo profissional para a IA.
- A análise continua no worker. A tela consulta seu andamento a cada quatro segundos.
- Confira requisitos, citações, justificativas, contribuição à nota, perguntas e legibilidade.
- Gere uma adaptação, compare os blocos movidos, aceite ou rejeite e edite o texto final.
- Confirme a veracidade e aprove a exportação. PDF e DOCX são produzidos juntos a partir do mesmo snapshot imutável, identificado pela revisão.

## IA e proteção dos fatos

O backend usa exclusivamente o SDK oficial `@google/genai` pela Gemini Developer API. Configure `GEMINI_API_KEY` e `GEMINI_MODEL` no servidor e no worker; não há modelo padrão. Escolha um modelo Gemini que suporte saída JSON estruturada e confirme disponibilidade e custos na sua conta. `AI_API_KEY`, `AI_BASE_URL` e `AI_MODEL` não são mais lidos e não há conversão automática dessas variáveis. Sem a configuração Gemini completa, upload e revisão funcionam; análise retorna uma mensagem de configuração pendente.

As saídas são validadas com Zod. Requisitos precisam ter citação literal da vaga. Evidências que não são encontradas no currículo se tornam pendências, não fatos confirmados. Nenhuma ferramenta é exposta ao modelo. As instruções definem currículos e vagas como dados não confiáveis. A integração tem timeout de 60 segundos, até três chamadas por tentativa e limite de saída de 10 mil tokens. Cada tarefa tem até três tentativas: até nove chamadas em caso de falhas. Currículo: 60 mil caracteres; vaga: 30 mil; até 60 requisitos.

A primeira adaptação é **conservadora e extrativa**: a IA reorganiza blocos completos; o servidor exige uma permutação sem adições, exclusões ou duplicação. O primeiro bloco é preservado. Isso impede que a IA invente empregos, números, competências ou datas. Melhorias de redação ficam disponíveis na edição manual. Separe blocos com uma linha em branco e mantenha cada experiência completa no mesmo bloco.

Os filtros removem contatos comuns e cabeçalhos pessoais antes da comparação. São heurísticos, não uma anonimização garantida: revise informações sensíveis. Dados não são enviados a um serviço de IA na importação ou exportação.

## Pontuação v1.0.0

| Dimensão                               | Peso inicial |
| -------------------------------------- | -----------: |
| Competências técnicas                  |           35 |
| Experiências e responsabilidades       |           30 |
| Senioridade e experiência              |           15 |
| Formação e certificações               |           10 |
| Idiomas e outros requisitos explícitos |           10 |

Dimensões ausentes são removidas; as restantes são normalizadas para somar 100. Dentro de cada dimensão, obrigatórios pesam 2 e desejáveis pesam 1. Atendido vale 1; parcial, 0,5; não evidenciado, 0; confirmação pendente, 0 provisório. A contribuição de cada requisito é seu peso proporcional multiplicado pelo valor de atendimento. Somam-se as contribuições e arredonda-se apenas a nota final. Pendências deixam toda a nota explicitamente provisória. Não há bônus por repetição de palavras. Duplicações literais de requisitos são rejeitadas.

O utilitário `mergedMonths` une intervalos mensais inclusivos sem contar sobreposições duas vezes. A duração não é calculada automaticamente a partir de datas em texto livre. Por segurança, requisitos de senioridade que especificam quantidades de anos ou meses permanecem como informação a confirmar, mesmo se o modelo indicar atendimento. Um editor estruturado de períodos relevantes é necessário para automatizar essa confirmação em uma próxima versão. Legibilidade é uma avaliação separada, sem impacto na nota.

## Arquitetura e segurança

- Next.js App Router + TypeScript, Prisma 7 com adaptador PostgreSQL, Better Auth com senhas hash e sessões locais HttpOnly, SameSite e verificação de origem.
- Cada operação consulta o usuário da sessão; parâmetros enviados pelo cliente não determinam o proprietário. Arquivos só saem por rota autenticada. Sessões têm validade de sete dias.
- Upload verifica extensão, assinatura, conteúdo DOCX e tamanho descompactado. PDF escaneado exige colagem manual; sem OCR.
- Auditoria npm (15/10/2026): Prisma CLI 7.10.0 reporta avisos altos em `deepmerge-ts` e `mysql2`; `mysql2` não é usado pela aplicação (conexão é PostgreSQL), e o CLI processa apenas o schema versionado local. Mammoth 1.13.0 reporta avisos moderados em `sprintf-js`; o arquivo compactado é limitado a 10 MB e os tamanhos declarados no diretório ZIP a 40 MB. Não aplique `npm audit fix --force`, pois o npm sugere Prisma 6, incompatível com o schema e o adaptador escolhidos. Reavalie após correção upstream, sobretudo antes de aceitar DOCX de usuários em um serviço público.
- URL valida esquema, porta, credenciais, DNS e todos os IPs resolvidos. A conexão fixa o IP validado mantendo hostname/TLS; revalida a cada redirecionamento. Até três redirecionamentos, 15 segundos e 2 MB. Não contorna login/CAPTCHA.
- Login/cadastro: 5 solicitações/minuto; upload/importação/análise/exportação: 5 por usuário/minuto; adaptação: 3 por usuário/minuto. Limites persistidos no banco.
- Fila PostgreSQL usa aquisição atômica `FOR UPDATE SKIP LOCKED`, lease de 5 minutos, heartbeat e token de execução. Commits de workers obsoletos são rejeitados. Falhas usam até três tentativas; tarefas abandonadas são retomadas. Exatamente uma execução externa de IA não é garantida em uma queda; resultados são protegidos contra commit duplicado.
- Exclusões registram arquivos em `FileGarbage` dentro da transação; o worker realiza a eliminação idempotente. Sem worker, a exclusão física fica pendente.
- Não há recuperação por e-mail nem envio fictício de mensagens. Não há credenciais reais no repositório.

## Migrações

Produção: `docker compose exec app npm run db:migrate`. Desenvolvimento de schema: `npx prisma migrate dev --name nome_da_alteracao`, seguido de `npm run db:generate`. Versione o schema e o SQL; não use `db push` como processo de implantação.

## Backup e restauração

Pare app e worker para uma cópia consistente e mantenha o PostgreSQL ativo. Execute na raiz do projeto. Os arquivos de backup contêm dados pessoais; proteja-os e teste restaurações.

```sh
docker compose stop app worker
docker compose exec postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f /tmp/ats.dump'
docker compose cp postgres:/tmp/ats.dump ./ats.dump
docker compose run --rm --no-deps --user root -v "./backups:/backup" --entrypoint tar worker czf /backup/ats-files.tar.gz -C /data/resumes .
docker compose up -d app worker
```

Crie a pasta `backups` antes. O arquivo de documentos fica em `backups/ats-files.tar.gz`; guarde-o junto de `ats.dump` e da configuração protegida do ambiente.

Restaure em um ambiente vazio ou previamente copiado, com app/worker parados:

```sh
docker compose up -d postgres
docker compose cp ./ats.dump postgres:/tmp/ats.dump
docker compose exec postgres sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner /tmp/ats.dump'
docker compose run --rm --no-deps --user root -v "./backups:/backup:ro" --entrypoint sh worker -c 'tar xzf /backup/ats-files.tar.gz -C /data/resumes && chown -R 1000:1000 /data/resumes'
docker compose up -d app worker
```

Restaure os arquivos em um volume vazio. Banco e documentos devem ser do mesmo backup. Volumes persistentes não substituem backups.

## Limitações conhecidas

- Não inclui OCR, recuperação de senha por e-mail, CAPTCHA, tradução nem inspeção visual automática do currículo original.
- Seções são identificadas por títulos comuns; texto livre e datas exigem revisão manual. Não há editor de experiências com campos individuais nesta versão.
- Adaptação automática reorganiza blocos; não reescreve o resumo nem propõe substituição de palavras. O editor permite ajustes manuais com aprovação.
- A avaliação semântica depende da IA. Verificações de citações não provam que uma inferência é correta. Duplicações semânticas não são eliminadas automaticamente.
- Legibilidade verifica texto e extensão de parágrafos; não pontua layout do arquivo original.
- O PDF usa Helvetica e preserva acentos latinos; caracteres fora do alfabeto latino e emojis podem não ser representados. DOCX usa Arial. Quebras de página variam entre renderizadores.
- O histórico apresenta até 100 análises recentes; paginação avançada e retenção automatizada ainda não estão implementadas.
- Arquivos criados imediatamente antes de uma queda abrupta podem ficar órfãos; backups e inspeção periódica do volume são recomendados. Exclusões normais têm coleta persistente.

## Solução de problemas

- **Docker indisponível**: abra o Docker Desktop e aguarde o mecanismo Linux iniciar.
- **Porta ocupada**: ajuste a porta publicada e `BETTER_AUTH_URL`; testes usam a porta 3101.
- **Banco rejeita senha**: alterar `.env` não altera a senha de um volume já criado. Use as credenciais originais ou altere a senha no PostgreSQL.
- **Configuração pendente**: defina `GEMINI_API_KEY` e `GEMINI_MODEL` e recrie API e worker com `docker compose up -d --force-recreate api worker`.
- **Análise na fila**: a tela acompanha preparação, comparação e validação da estimativa; as etapas refletem o worker e não representam uma porcentagem estimada. Veja também `docker compose ps` e `docker compose logs --tail=50 worker`.
- **Falha HTTP do Gemini**: a tela identifica chave recusada, permissão, modelo ausente, crédito ou limite e formato estruturado incompatível. Confira `GEMINI_MODEL`, a chave e os limites da conta. O aplicativo não retorna análise simulada em caso de erro.
- **PDF sem texto**: cole o conteúdo na revisão ou envie um DOCX.
- **Origem inválida**: use exatamente a origem em `BETTER_AUTH_URL`, inclusive protocolo e porta.
