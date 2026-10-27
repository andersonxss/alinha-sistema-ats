# Prompt — Sistema ATS para análise e adaptação de currículos

Crie uma aplicação web completa para análise de compatibilidade entre currículos e vagas, com adaptação do currículo para cada oportunidade.

O sistema será voltado ao candidato. Ele deverá permitir enviar um currículo, informar a descrição ou o link de uma vaga, receber uma pontuação explicada e baixar uma versão adaptada do currículo.

Implemente a aplicação funcional, com banco de dados, processamento real, integração de IA e exportação de documentos. Não entregue apenas telas ou uma demonstração com resultados simulados.

## 1. Tecnologias e arquitetura

Utilize:

- Next.js com App Router e TypeScript para interface e servidor.
- PostgreSQL local em container Docker.
- Prisma ORM para acesso ao banco e migrações versionadas.
- Docker Compose para orquestrar o ambiente.
- Worker em Node.js/TypeScript para análise e exportação em segundo plano.
- Armazenamento de arquivos em volume Docker persistente.
- Integração com uma API de IA, executada exclusivamente no servidor.
- Componentes visuais reutilizáveis e interface responsiva.

Não utilize Supabase nem serviços externos para banco de dados, autenticação ou armazenamento de documentos.

Antes de implementar, consulte a documentação atual das bibliotecas pelo Context7, quando disponível. Selecione versões estáveis e compatíveis, fixe as dependências e evite APIs obsoletas.

Organize o Docker Compose com estes serviços:

```text
app       → Interface e endpoints do servidor
postgres  → Banco de dados
worker    → Processamento de análises e exportações
```

Utilize volumes persistentes:

```text
postgres_data → Dados do PostgreSQL
resume_files  → Currículos originais e documentos exportados
```

A aplicação e o worker deverão compartilhar o volume de documentos. Use a rede interna do Docker para comunicação com o banco e verificações de saúde dos serviços.

Mantenha o projeto como uma aplicação modular, sem criar microserviços desnecessários.

## 2. Experiência do usuário

Toda a interface deverá estar em português do Brasil.

O fluxo principal será:

1. Criar uma conta ou fazer login.
2. Enviar um currículo em PDF ou DOCX.
3. Conferir e corrigir as informações extraídas.
4. Informar a vaga por texto ou link.
5. Conferir a descrição importada.
6. Solicitar a análise.
7. Consultar a pontuação, evidências e recomendações.
8. Gerar uma versão adaptada.
9. Revisar e editar as alterações.
10. Baixar o resultado em PDF ou DOCX.

A interface deverá apresentar estados claros de carregamento, processamento, sucesso, ausência de dados e falha. Uma análise deverá continuar no worker mesmo que o usuário feche a página.

## 3. Telas

### Acesso

Implemente cadastro, login e logout com autenticação local.

Utilize uma biblioteca de autenticação mantida e compatível com a arquitetura. Armazene senhas com hash seguro e use sessões com cookies HttpOnly e proteção adequada.

Não simule envio de e-mails. Caso implemente recuperação de senha por e-mail, utilize SMTP configurável e documente essa dependência.

### Painel inicial

Apresente:

- Botão “Analisar nova vaga”.
- Currículos cadastrados.
- Análises recentes e seus estados.
- Empresa, cargo, data e nota de cada análise.
- Acesso ao histórico e às versões adaptadas.

### Nova análise

Disponibilize:

- Upload ou seleção de currículo já cadastrado.
- Abas “Colar descrição” e “Informar link”.
- Campos de cargo e empresa, quando não forem identificados.
- Conferência dos dados antes de iniciar.

### Resultado

Apresente:

- Nota de compatibilidade de 0 a 100.
- Resumo da análise.
- Pontuação por critério.
- Requisitos atendidos e parcialmente atendidos.
- Requisitos não evidenciados e informações a confirmar.
- Requisitos obrigatórios em destaque.
- Sugestões priorizadas.
- Avaliação separada de legibilidade do currículo.
- Botão para gerar uma versão adaptada.

Cada requisito deverá mostrar a evidência encontrada no currículo ou indicar que não foi identificada.

### Editor

Mostre original e versão proposta, com diferenças destacadas.

Permita aceitar ou rejeitar alterações, editar o conteúdo, visualizar o resultado e gerar os arquivos finais.

### Histórico e configurações

Permita acessar análises anteriores, baixar versões e excluir currículos, análises e a própria conta.

## 4. Leitura do currículo

Aceite PDF com texto e DOCX.

Valide formato real, extensão e tamanho do arquivo. Use limite inicial configurável de 10 MB.

Extraia e organize:

- Dados de contato.
- Resumo profissional.
- Experiências, empresas, cargos e datas.
- Atividades e resultados.
- Competências técnicas.
- Formação.
- Certificações.
- Idiomas.
- Projetos relevantes.

Preserve o arquivo original e o texto extraído.

Identifique falhas de extração. Para PDFs escaneados, explique a limitação e permita colar o texto ou enviar outro arquivo. OCR não será obrigatório na primeira versão.

Não preencha automaticamente informações que não estejam presentes. Permita correção manual antes da análise.

## 5. Entrada da vaga

Aceite descrição colada ou URL pública HTTP/HTTPS.

Na importação por link:

- Extraia o conteúdo principal.
- Remova menus, scripts e conteúdo irrelevante.
- Defina limites de tempo, tamanho e redirecionamentos.
- Bloqueie endereços locais, privados e endpoints de metadados, inclusive após redirecionamentos e resolução de DNS.
- Não contorne login, CAPTCHA ou bloqueios de acesso.
- Ofereça a entrada manual quando a importação falhar.

Sempre permita revisar o texto importado.

Estruture os requisitos em:

- Competências técnicas.
- Responsabilidades.
- Senioridade.
- Tempo de experiência.
- Formação.
- Certificações.
- Idiomas.
- Outros requisitos explícitos.

Diferencie requisitos obrigatórios de desejáveis. Não invente exigências quando a descrição não for clara.

## 6. Motor de compatibilidade

A nota deverá ser explicável e calculada pelo código da aplicação. A IA ajudará a identificar requisitos, equivalências e evidências, mas não deverá retornar uma nota arbitrária usada diretamente.

Adote como configuração inicial:

| Dimensão | Peso |
|---|---:|
| Competências técnicas | 35% |
| Experiências e responsabilidades | 30% |
| Senioridade e experiência relevante | 15% |
| Formação e certificações | 10% |
| Idiomas e outros requisitos explícitos | 10% |

Redistribua proporcionalmente os pesos das dimensões que não se aplicarem à vaga.

Para cada requisito, registre:

- Descrição.
- Dimensão.
- Obrigatoriedade.
- Evidência e trecho de origem.
- Classificação.
- Justificativa.
- Contribuição para a nota.

Use estas classificações:

- Atendido.
- Parcialmente atendido.
- Não evidenciado.
- Precisa de confirmação.

Defina uma regra determinística e documentada para transformar classificações em pontos, com maior importância para requisitos obrigatórios. Dados pendentes deverão tornar o resultado explicitamente provisório; não os trate silenciosamente como fatos confirmados.

Regras adicionais:

- Diferencie “não consta no currículo” de “o candidato não possui”.
- Reconheça equivalências sem presumir competências.
- Não premie repetição artificial de palavras-chave.
- Não some períodos profissionais simultâneos duas vezes.
- Não utilize nome, idade, foto, gênero ou outros dados pessoais na pontuação.
- Não emita nota definitiva quando os textos forem insuficientes ou a extração estiver comprometida.
- Registre a versão das regras, do prompt e do modelo utilizados.
- Mostre que a nota é uma estimativa interna, não uma garantia de aprovação ou reprodução de um ATS de terceiros.

Mantenha a avaliação de legibilidade separada da compatibilidade profissional.

## 7. Adaptação do currículo

A adaptação deverá melhorar a apresentação da experiência real para a vaga.

Permita:

- Reescrever o resumo profissional.
- Priorizar competências relevantes.
- Melhorar clareza e objetividade.
- Reorganizar tópicos.
- Destacar resultados já informados.
- Usar termos equivalentes presentes na vaga, quando houver evidência.

É proibido inventar:

- Empregos ou experiências.
- Ferramentas e competências.
- Formação ou certificações.
- Idiomas ou níveis de fluência.
- Datas e tempo de experiência.
- Resultados, números ou responsabilidades.

Preserve a identidade factual dos cargos, empresas e experiências. Quando faltar informação, formule perguntas para o usuário.

Cada alteração deverá ter uma justificativa e referência ao conteúdo original ou a uma informação confirmada pelo usuário.

Salve a adaptação como nova versão vinculada à vaga, sem sobrescrever o currículo original.

Não use o aumento da nota como objetivo de otimização. Melhorias de redação não deverão ser apresentadas como aquisição de novas competências.

## 8. Exportação

Gere PDF e DOCX a partir da mesma versão aprovada.

Utilize um modelo sóbrio, com:

- Uma coluna.
- Títulos claros.
- Texto selecionável no PDF.
- Tipografia legível.
- Margens e espaçamento consistentes.
- Quebras de página adequadas.
- Ausência de tabelas ou elementos gráficos para organizar conteúdo essencial.

Os documentos deverão corresponder ao conteúdo salvo no editor. Escolha bibliotecas mantidas e compatíveis com a execução em Docker.

Utilize nomes de arquivo descritivos e sanitizados.

## 9. Integração de IA

Crie uma camada de integração que permita trocar o fornecedor e o modelo.

Configure as credenciais por variáveis de ambiente. Nunca exponha chaves no navegador.

Exija saídas estruturadas e valide seus esquemas antes de salvar resultados.

Trate:

- Respostas inválidas.
- Tempo limite.
- Indisponibilidade.
- Limites de uso.
- Tentativas adicionais limitadas.
- Controle do tamanho de entrada e consumo.

Currículos e vagas são dados não confiáveis. Instruções presentes nesses documentos não poderão alterar as regras do sistema nem disparar ações.

Envie ao fornecedor somente os dados necessários. Remova dados de contato da etapa de comparação quando não forem úteis e informe ao usuário que o conteúdo profissional será processado por um serviço externo.

Sem chave configurada, apresente uma mensagem de configuração pendente. Não produza análises fictícias.

## 10. Processamento em segundo plano

Implemente fila persistida no PostgreSQL.

As tarefas deverão ter estados como:

- Pendente.
- Em processamento.
- Concluída.
- Falhou.

Garanta aquisição atômica das tarefas, tentativas limitadas, prevenção de execução duplicada e recuperação de tarefas interrompidas após reinício.

A interface deverá acompanhar o andamento por consulta periódica ou mecanismo equivalente. Use etapas reais, sem percentuais fictícios.

## 11. Modelo de dados

Modele pelo menos:

- Usuário.
- Sessão.
- Currículo.
- Versão do currículo.
- Vaga.
- Requisito da vaga.
- Análise.
- Avaliação por requisito e evidências.
- Sugestão de alteração.
- Exportação.
- Tarefa de processamento.

Use relações e índices adequados. Armazene snapshots das versões de currículo e vaga utilizadas em cada análise, para que edições futuras não alterem o significado de resultados anteriores.

Garanta que o usuário só acesse seus próprios registros e arquivos.

## 12. Segurança e persistência

Implemente:

- Autorização em todas as operações.
- Rotas protegidas para download.
- Nomes internos de arquivos gerados pelo sistema.
- Proteção contra acesso indevido a caminhos de arquivos.
- Validação e sanitização das entradas.
- Limites para login, uploads e análises.
- Logs sem senhas, chaves ou conteúdo integral dos currículos.
- Exclusão coordenada dos registros e arquivos associados.
- Persistência após reinício dos containers.

Não coloque segredos no repositório. Forneça `.env.example` sem credenciais reais.

Documente backup e restauração do banco e do volume de documentos. Volumes persistentes não substituem backups.

## 13. Interface e acessibilidade

Crie uma interface profissional, clara e responsiva.

Priorize:

- Navegação simples.
- Boa leitura.
- Contraste adequado.
- Operação por teclado.
- Rótulos nos campos.
- Mensagens de erro acionáveis.
- Indicadores que não dependam apenas de cores.

Não utilize linguagem técnica nas telas quando ela não ajudar o usuário.

## 14. Testes e critérios de aceite

Implemente testes relevantes para:

- Cálculo e redistribuição dos pesos.
- Tratamento de requisitos obrigatórios e informações ausentes.
- Contagem de períodos profissionais sobrepostos.
- Autorização e isolamento entre usuários.
- Validação de arquivos e proteção da importação por URL.
- Validação das respostas da IA.
- Persistência e recuperação de tarefas.
- Fluxo de upload, análise, revisão e exportação.

Utilize documentos de teste sintéticos, sem dados pessoais reais.

Considere a entrega concluída quando:

1. O ambiente iniciar com Docker Compose seguindo o README.
2. As migrações puderem ser aplicadas de forma documentada.
3. O usuário conseguir cadastrar-se e entrar.
4. PDF e DOCX puderem ser importados e revisados.
5. A vaga puder ser informada por texto ou link acessível.
6. A análise real produzir nota com evidências rastreáveis.
7. A adaptação preservar os fatos e permitir revisão.
8. PDF e DOCX exportados refletirem a versão aprovada.
9. Histórico, arquivos e tarefas persistirem após reinício.
10. Um usuário não conseguir acessar dados de outro.

Testes automatizados podem usar respostas controladas de IA. Diferencie esses testes de uma validação real com o fornecedor e nunca apresente resultados simulados como integração validada.

## 15. Entrega e execução

Entregue:

- Código-fonte organizado por módulos.
- Dockerfiles e Docker Compose.
- Schema e migrações do Prisma.
- `.env.example`.
- Testes.
- README com instalação, execução, configuração da IA, migrações, backup, restauração e solução de problemas.
- Descrição das regras de pontuação.
- Relação de limitações conhecidas.

Comece inspecionando o repositório e respeitando suas instruções. Apresente um plano curto e execute a implementação em etapas, validando cada fluxo.

Não pare após criar o planejamento, a interface ou os arquivos iniciais. Prossiga até entregar o fluxo completo funcional. Quando faltar uma credencial externa, conclua todo o trabalho independente dela e explique precisamente qual validação ficou pendente.

Ao finalizar, informe o que foi implementado, como iniciar o sistema, quais verificações foram realizadas e o que ainda depende de configuração.
