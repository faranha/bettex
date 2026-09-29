# BETTEX

Site de apresentação da proposta BETTEX para brasileiros adultos, com quatro agentes ilustrados e uma demonstração local de tokens.

## Run & Operate

- `pnpm --filter @workspace/bettex-site run dev` — iniciar a página pelo workflow gerenciado
- `pnpm --filter @workspace/bettex-site run typecheck` — verificar o frontend
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/bettex-site/src/App.tsx` — página e simulador
- `artifacts/bettex-site/src/index.css` — identidade visual
- `artifacts/bettex-site/public/agents/` — artes próprias dos quatro agentes

## Architecture decisions

- Esta versão é somente uma demonstração no navegador; não conectar compra, carteira, apostas ou pagamentos reais sem solicitação e análise regulatória apropriada.

## Product

- Explica a proposta, apresenta PREDIX, SPORTIX, BETTIX e TRADIX e permite simular tokens, participação, retirada e venda.
- Distribuição proposta atual: 50% público, 25% investidores, 25% dono/criador do sistema. Números e resultados dos agentes são fictícios.

## User preferences

- Todo texto da interface deve ser português brasileiro simples, sem misturar inglês nem depender de termos técnicos como “staking” ou “leituras”.
- O visual deve ser bastante ilustrado, acolhedor e fácil de entender, quase lúdico, mas voltado a adultos. Cada agente precisa manter uma arte visual própria.
- O público é o apostador brasileiro; não normalizar apostar dinheiro do salário/contas nem confundir apostas com investimento. A BETTEX é apresentada como proposta de investimento ainda não disponível, sem promessa de retorno.
- Não colocar na interface blocos longos sobre transparência, governança, revisão regulatória ou agentes inativos. Usar apenas avisos curtos e objetivos para deixar claro que a demonstração não realiza transações.

## Gotchas

- Os saldos ficam apenas no armazenamento local do navegador e não provam propriedade de tokens.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
