# Demo visual BETTEX

## Por que existe

Apresentar o percurso do produto sem exigir conta, saldo, carteira, banco,
RPC, inferência externa ou autorização para operar. Também permite revisar
navegação, linguagem, transparência e hierarquia antes de desenvolver a operação.

## Percurso de leitura

Comece pelo [guia do demo e da ALFA](../documentation-map.md), que apresenta o caso prático, os atores e a ordem de aprofundamento.

O painel apresenta a posição fictícia e acesso às áreas. A Central permite acompanhar
**BETTEX → Cripto → BTC/ETH/SOL**; BTC, ETH e SOL são especialistas internos de Cripto,
não três setores públicos independentes. Controles, execução e registros ficam fora
do grafo. Tesouraria e Histórico permitem investigar o mesmo cenário e seus vínculos.

O grafo é a experiência principal da Central, não um desenho separado dos painéis.
Inspeção, filtros e atalhos devem funcionar também no celular e no idioma selecionado.
A Central é somente consulta: não oferece edição de mandatos ou operação manual.

## Relação com a especificação da ALFA

O [percurso spot](../trading-spot-journey.md) descreve o funcionamento previsto e um
exemplo documental; não é uma descrição de uma nova operação ativada no aplicativo.
As [oito famílias de relatório](../trading-cycle-reports.md) e sua
[geração](../trading-report-generation.md) ligam análises, decisões, posições e ciclos.

Representação visual, regra especificada, validação e habilitação são estados distintos.
Os exemplos históricos de cotas de previsão não são compra de BTC/ETH/SOL spot.

## Organização técnica de referência

- `src/App.tsx`: escolhe a experiência pública e monta o provedor visual.
- `src/components/interface-demo/InterfaceDemoPage.tsx`: composição das áreas.
- `src/components/interface-demo/runtime.ts`: respostas locais e bloqueio de solicitações operacionais.
- `src/components/interface-demo/demo-snapshot.ts`: montagem e atualização temporal do cenário.
- `src/components/interface-demo/complete-demo-data.ts`: cenário completo do produto.
- `src/components/interface-demo/central-graph-model.ts`: modelo do grafo.
- `src/components/interface-demo/central-audit-data.ts`: eventos ilustrativos correlacionados.
- `src/components/interface-demo/history-demo-data.ts`: leitura de histórico.
- `src/components/interface-demo/treasury-demo-data.ts`: extratos e movimentos ilustrativos.
- `src/components/demo/`: componentes e modelos compartilhados, inclusive material de fases anteriores.
- `src/components/history/`: filtros, seleção de extrato e apresentação reutilizáveis.

Os caminhos acima são relativos a `artifacts/bettex-site/`.
Não mover componentes compartilhados sem verificar imports, traduções, aliases e testes.

## Limites de persistência

Seleção e navegação podem guardar estado de interface no navegador. Isso não é
um registro financeiro persistido. O cenário é reconstituído e ajustado no tempo
ao carregar; não representa uma cadeia de transações confirmadas desde a última visita.
Nenhum dado de conta real deve ser copiado para fixtures ou memória do demo.

## Ações e isolamento

Ações operacionais exibem aviso da demonstração e convite à comunidade.
Não efetuam compras, saques, apostas, aprovações, uploads ou assinatura de transações.
O bloqueio de transporte no navegador melhora a experiência, mas **não substitui
autorização da API**. A API atual bloqueia mutações e não importa os roteadores
operacionais nem inicializa banco/RPC por causa de uma visita ao demo.

Confira [dados e auditoria](data-and-audit.md), [estado atual](../project-status.md)
e [testes](../testing.md) antes de atribuir significado financeiro aos valores.
