# Frontend

Next.js com Tailwind CSS v4 e shadcn/ui (estilo `new-york`).

## Organização e manutenção

`src/app` contém a entrada e os estilos. `features/workspace` compõe as telas
e mantém a navegação local temporária. A migração para URLs próprias será uma
etapa separada; não adicionar um novo mecanismo de navegação por estado.

Cada funcionalidade organiza apresentação em `ui`, estado e efeitos em `hooks`,
contratos em `application/ports.ts`, transporte em `api` e dados puros em `model`.
Criar apenas os diretórios necessários. `composition/frontend-services.ts` monta
os adaptadores e fornece as dependências usadas pelas telas e hooks.

- `auth`: sessão e formulário de acesso.
- `dashboard`: visão geral e atualização a cada quatro segundos.
- `resumes`: seleção, upload e revisão de currículo.
- `analysis`: criação, histórico, resultado e acompanhamento de análises.
- `versions`: edição, aprovação com revisão e URLs de download.
- `account`: configurações e exclusão seguida de logout após sucesso.
- `workspace`: shell, navegação e composição das funcionalidades.

Modelos não importam React ou transporte; `shared` não importa funcionalidades.
Componentes recebem operações tipadas e não constroem requisições HTTP no JSX.
Funções puras e hooks são preferidos a classes e camadas sem responsabilidade.

## Verificação

Na raiz:

```sh
npm run test:frontend
npm run typecheck
npm run build --workspace @sistema-ats/frontend
npm test
```

`npm test` executa backend e frontend. Vitest, jsdom e Testing Library cobrem
contratos HTTP, formulários, confirmações, sessão, editor e timers, com serviços
substitutos e sem banco ou IA reais. `tsconfig.test.json` inclui os testes na
checagem de tipos. A validação realizada e suas limitações estão em
[`docs/validacao-refatoracao-frontend.md`](../docs/validacao-refatoracao-frontend.md).

## Componentes

Execute os comandos abaixo na raiz do projeto:

```sh
npm exec --workspace @sistema-ats/frontend -- shadcn add input
npm run build --workspace @sistema-ats/frontend
npm run typecheck
```

O CLI usa `frontend/components.json` e instala componentes em
`src/shared/ui`. As telas usam Button, Input, Textarea, NativeSelect, Label,
Checkbox, Alert, Badge e AlertDialog. O helper `cn` fica em
`@/shared/lib/utils`.

```tsx
import { Button } from "@/shared/ui/button";

<Button variant="outline">Continuar</Button>;
```

## Estilos

- `postcss.config.mjs` conecta o Tailwind ao build do Next.js.
- `src/app/shadcn-theme.css` define os tokens semânticos da paleta atual.
- `src/app/globals.css` importa o tema, as utilities e as animações. O CSS
  anterior está na camada `legacy`, antes das utilities.
- Preflight está desativado para preservar as telas existentes. Ao adicionar
  componentes que dependam desse reset, declare os estilos necessários no
  componente (por exemplo, `border-solid`), sem ativar um reset global.
- O token antigo de texto secundário se chama `--ink-muted`; `--muted` é a
  superfície discreta do shadcn. A interface atual permanece em tema claro.

`ConfirmAction` compõe AlertDialog para as exclusões de currículo e análise.
Cancelar ou pressionar Escape não executa a ação; confirmar chama o handler
existente e os erros continuam sendo exibidos pelo fluxo da tela.

Os botões de formulário declaram `type="submit"`; Button usa `type="button"`
por padrão. Alert e Badge incluem variantes `success` e `warning` que preservam
a linguagem visual dos status. Textarea respeita `rows` para os editores longos.
