# BETTEX

Site da BETTEX, negócio de investimento com agentes de IA voltado ao apostador brasileiro adulto. A página inicial é uma landing page de apresentação; a seção de demonstração usa saldos locais de exemplo.

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

- O produto BETTEX existe, PREDIX opera na Polymarket e TRADIX opera na Robinhood. Apenas os controles da seção de demonstração são simulados. A compra real e o acesso do investidor devem ser conectados ao serviço apropriado, sem confundir o visitante com os saldos de exemplo.
- Não apresentar um botão que pareça efetuar compra ou dar acesso ao sistema do investidor sem um destino real e um controle de acesso apropriado.

## Product

- Apresenta BETTEX como alternativa para quem quer parar de apostar e começar a investir em um projeto de IA, com foco na proposta do token e nos benefícios de participar; não transformar a landing em uma campanha sobre vício, contas pessoais ou recuperação de perdas. Não prometer retorno.
- PREDIX opera na Polymarket e TRADIX opera na Robinhood; ambos utilizam o serviço da Allora. Mostrar as marcas das plataformas nos cartões desses agentes. SPORTIX e BETTIX estão em desenvolvimento. Não inventar implementação, resultados nem status de operação não confirmado.
- Os quatro agentes fazem parte de um único ecossistema BETTEX, não são investimentos autônomos. O investimento total é repartido entre os quatro; cada um recebe uma parte, sem percentuais individuais informados. Todos integram o ecossistema, mas apenas PREDIX e TRADIX já executam operações de mercado. Mostrar os dois que operam em cima e os dois em desenvolvimento embaixo, dentro do mesmo grupo BETTEX. É investimento de alto risco.
- Os tokens BETTEX são perpétuos; o sistema completo é voltado aos investidores, que acompanham operações e tecnologia. A seção de demonstração simula movimentações com saldos locais; não representa os tokens efetivamente adquiridos. O preço do token BETTEX é R$ 5, o total é de 2 milhões de unidades e a distribuição é 50% público, 25% investidores, 25% dono/criador do sistema.
- Na fase de pré-lançamento, a parcela pública de 1 milhão de tokens está destinada à compra, conforme disponibilidade. Esse é o tamanho da oferta, não um saldo remanescente atualizado em tempo real. Quem adquire é titular do token e poderá optar por vendê-lo futuramente em corretoras parceiras quando houver negociação disponível; não inventar corretoras, listagem já ativa, preço futuro nem liquidez garantida. Os controles de teste não reservam nem vendem tokens reais.
- O token é apresentado pelo criador como ser dono de uma parte do projeto de IA BETTEX, não de um bot isolado. Quando as operações geram lucro, ele é distribuído diariamente entre os titulares; isso não significa lucro positivo garantido a cada dia. Titulares também participam da comunidade que decide a evolução do projeto e acompanham no sistema do investidor a movimentação dos agentes em tempo real. A landing explica esse modelo, mas não inventa extratos de lucros, votação ou feed ao vivo. Não afirmar participação societária legal ou percentuais individuais sem documentação.
- Na seção de tecnologia, BETTEX e a participação do token no sistema inteiro vêm antes da explicação da Allora. BETTEX Core é a arquitetura proposta de orquestração, risco, execução e resultados por agente; não apresentar controles, integrações ou staking único ainda não implementados como operacionais. Allora é uma rede externa que apoia PREDIX e TRADIX, não o nome da tecnologia própria BETTEX.

## User preferences

- Todo texto da interface deve ser português brasileiro simples, sem misturar inglês nem depender de termos técnicos como “staking” ou “leituras”.
- O visual deve ser bastante ilustrado, acolhedor e fácil de entender, quase lúdico, mas voltado a adultos. Cada agente precisa manter uma arte visual própria.
- As artes e os ícones devem comunicar a função de cada agente mesmo em tamanho pequeno: PREDIX previsões/cenários, SPORTIX esportes/futebol, BETTIX cassino/dados, TRADIX negociação de cripto/gráficos.
- O público é o apostador brasileiro adulto que quer parar de apostar e começar a investir. A abertura deve contrastar a aposta do salário e do dinheiro do mês com a compra de tokens e a participação na tecnologia, como solicitado pelo usuário. Não ampliar essa narrativa para vício, aluguel, comida, contas, aconselhamento pessoal ou recuperação de perdas. Usar avisos financeiros objetivos e curtos, sem promessa de retorno.
- Não apresentar a BETTEX, o preço ou a distribuição do token como ideia, visão, plano ou proposta. O negócio existe; isso não significa que todos os bots já operam. Distinguir a existência do produto das ações de exemplo dentro da área de demonstração.
- Não colocar na interface blocos longos sobre transparência, governança ou revisão regulatória. Mostrar o estágio de cada bot de forma direta e usar avisos curtos para identificar transações simuladas.
- Não usar uma faixa global de demonstração. Identificar apenas os controles locais do simulador como teste, sem atribuir a simulação ao produto BETTEX inteiro.
- A página inicial é uma landing page focada na participação no projeto de IA. Após o hero, explicar o que é a BTEX, o token perpétuo e o retorno condicionado ao lucro; apresentar os quatro agentes antes de explicar a tecnologia Allora. Não colocar uma carteira ou painel de tokens no topo; a demonstração fica separada e identificada. Usar imagens sem inventar números ou prometer retorno.

## Gotchas

- Os saldos ficam apenas no armazenamento local do navegador e não provam propriedade de tokens.
- As marcas foram obtidas dos materiais oficiais de Polymarket e Robinhood. A página de imprensa da Robinhood informa que o uso da marca exige autorização prévia; confirmar isso antes de publicar.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
