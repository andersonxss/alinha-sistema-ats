# Estrutura do frontend

O frontend usa Next.js App Router. Cada URL tem uma página pequena em `src/app` que compõe componentes de `src/features`; regras de negócio e validações permanecem dentro do domínio da funcionalidade. Layouts de autenticação e do workspace ficam em grupos de rotas, que organizam o código sem acrescentar segmentos à URL.

## Rotas

| URL                      | Arquivo da rota                                      | Feature/componente                                                           |
| ------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| `/`                      | `src/app/(workspace)/page.tsx`                       | `features/dashboard/ui/DashboardOverview`                                    |
| `/acesso`                | `src/app/(publico)/acesso/page.tsx`                  | `features/auth/ui/AccessForm`                                                |
| `/analises/nova`         | `src/app/(workspace)/analises/nova/page.tsx`         | `features/analysis/ui/NewAnalysisForm` e `features/resumes/ui/ResumeInput`   |
| `/curriculos`            | `src/app/(workspace)/curriculos/page.tsx`            | `features/resumes/ui/ResumeLibrary` e `features/resumes/ui/ResumeInput`      |
| `/historico`             | `src/app/(workspace)/historico/page.tsx`             | `features/analysis/ui/AnalysisHistory`                                       |
| `/analises/[analysisId]` | `src/app/(workspace)/analises/[analysisId]/page.tsx` | `features/analysis/ui/AnalysisResult` e `features/versions/ui/VersionEditor` |
| `/configuracoes`         | `src/app/(workspace)/configuracoes/page.tsx`         | `features/account/ui/AccountSettings`                                        |

## Pastas e responsabilidades

```text
frontend/src/
├── app/                         # roteamento Next.js e estilos globais
│   ├── (publico)/               # telas sem shell autenticado
│   │   └── acesso/page.tsx
│   ├── (workspace)/              # páginas autenticadas
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── analises/nova/page.tsx
│   │   ├── analises/[analysisId]/page.tsx
│   │   ├── curriculos/page.tsx
│   │   ├── historico/page.tsx
│   │   └── configuracoes/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── composition/                  # composição das implementações dos serviços
├── features/                     # módulos organizados por funcionalidade
│   └── <feature>/
│       ├── api/                   # adaptadores HTTP e clientes externos
│       ├── application/           # portas e casos de uso
│       ├── hooks/                 # estado e interação de tela
│       ├── model/                 # tipos, regras e schemas Zod
│       └── ui/                    # componentes da funcionalidade
└── shared/                       # infraestrutura visual e técnica reutilizável
    ├── api/
    ├── hooks/
    ├── lib/
    ├── model/
    └── ui/
```

Páginas de rota devem compor features e receber dependências da camada `composition`; schemas Zod devem ficar em `features/<feature>/model/schemas.ts`. Componentes genéricos ficam em `shared/ui` e não devem importar módulos de `features`.
