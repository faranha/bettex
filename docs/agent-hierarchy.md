# Hierarquia dos agentes BETTEX

Documento canônico complementar à [arquitetura](architecture.md) e ao [controle de Tesouraria](treasury-governance.md). Fonte: [instrução do criador](../attached_assets/Pasted-Replit-antes-de-aprofundar-o-desenvolvimento-dos-agente_1791181766428.txt).

## Responsabilidades e nomes

```text
BETTEX — orquestrador
└── Mercado de Previsões (predictions)
    ├── Especialista BTC (btc)
    ├── Especialista ETH (eth)
    └── Especialista SOL (sol)
```

BETTEX é a nomenclatura canônica desta instrução; BTEX, encontrado no material anterior e na emulação interna, é o mesmo papel, não outro agente. Trading de cripto (`crypto`), Apostas esportivas (`sports`) e o ramo de bônus legado (`bonus`) permanecem indisponíveis no alpha operacional. Não se criam serviços independentes nem uma segunda camada de seleção.

- Especialista: observa/anota evidências, estimativas e lacunas; encaminha ao mercado.
- Mercado: valida identidade, domínio, fontes, atualidade, preço, liquidez, custos, modelo, risco e horizonte; qualifica/prioriza apenas seu domínio.
- BETTEX: compara propostas qualificadas, considerando capital, custos líquidos, perda, prazo, liquidez, exposição e correlação; seleciona ou mantém o capital disponível. Pode exigir atualização ou rejeitar tudo.
- Tesouraria/Governança (`risk`): impõe política, pausa, reservas, obrigações, destino e permissões. Não procura oportunidades nem seleciona investimentos.
- Executor existente: exige autorização atual; confirmação local prova alocação de teste, não uma ordem Polymarket ou lucro.

Allora, Gamma, CLOB e oráculos são fontes/ferramentas, não níveis hierárquicos. Nenhum agente recebe chaves ou concede privilégios. Não alterar regras econômicas.

## Contrato comum e estados

`Opportunity` na API pública de `agents` é imutável por identificador de evidência. Contém origem, mercado/especialista, instrumento/intenção, fontes/horários/hash, metodologia/versão, preço/custos/liquidez, retorno/incerteza, riscos/perda/capital, horizonte/validade/invalidação e correlação. Cada dado é `observed`, `estimated` (com método) ou `missing` (com motivo). Não substituir ausência por zero.

Registros distinguem oportunidade, decisão BETTEX e proposta financeira. Estados: `needs_update`, `qualified`, `rejected`, `selected`, `awaiting_authorization`, `allocation_authorized`, `allocation_uncertain`, `allocation_confirmed`, `expired`. Especialista → mercado → BETTEX têm eventos próprios e a mesma correlação. Alocação usa `alpha:<opportunityId>` como ID de governança, vínculo durável com seus eventos/nonce/receipt.

Selecionar não autoriza nem reserva. O controlador existente reserva na aprovação humana segregada e revalida antes de enviar. Propostas alpha vencidas/incompletas ou sem decisão BETTEX persistida não podem ser aprovadas/executadas. Repetição recupera a mesma proposta financeira, não outra transação. Confirmação continua consultando o journal/receipt; não se usa o status do agente como prova.

O ramo **simulado**, documentado em [Estratégia de eventos e subledger](prediction-paper-trading.md), tem reserva própria, inteiramente separada: a seleção na comparação simulada pode reservar um orçamento *paper* previamente aprovado; jamais reserva a carteira nativa nem autoriza a operação financeira legada. BTC, ETH e SOL compartilham limite correlacionado. Na ausência de modelo calibrado, método de taxas e orçamento aprovado, a coleta continua observacional e nenhuma ordem é criada.

## Mapeamento e decisões técnicas

| Existente | Alinhamento |
|---|---|
| `modules/agents` | Contrato puro, especialista/mercado/BETTEX e portas; armazenamento/fonte na infraestrutura do próprio domínio |
| `lib/orchestrator.ts`, `demo-state.ts` | Emulação interna preservada, sem atividade no processo de produção |
| Agente de Tesouraria que alocava o máximo disponível | Substituído por observação de controles; seleção pertence exclusivamente ao BETTEX |
| `/treasury/governance` | `analyze` compara propostas do alpha e encaminha a seleção à API de risco; aprovar/executar continua segregado |
| `audit` | Eventos duráveis pela composição, sem dependência reversa ou novo histórico paralelo |
| Demo pública | Placeholders “Aplicativo em breve, em desenvolvimento”, incluindo subpáginas; nenhum fluxo operacional publicado na UI |

O contrato de oportunidades é público em `agents`; o contrato HTTP está no OpenAPI existente. A composição injeta armazenamento, auditoria e controle de risco. Tabelas de oportunidades não são ledger financeiro.

O Mercado prioriza as oportunidades qualificadas do lote; BETTEX reavalia o conjunto e o orçamento. O comparador técnico usa retorno líquido de custos dividido por perda potencial mais amplitude de incerteza e pelo horizonte, com inteiros e desempate por ID. Liquidez e exposição são filtros obrigatórios, não notas de confiança. Esse critério organiza propostas completas; não cria estimativas nem substitui a futura validação do modelo.

`GET /api/agents/alpha` disponibiliza registro de agentes, disponibilidade da fonte e até 50 oportunidades com estados/evidências, sem saldos pessoais. O worker coleta somente BTC via Gamma/CLOB no processo existente. A seleção é persistida antes do encaminhamento independente a risco; retomada usa os mesmos termos e ID. Aprovação e novo envio verificam validade e book/mercado atuais; reconciliação de envio já iniciado permanece no executor original.

**Justificativa:** a base permite qualificar/decidir sem inventar estratégia probabilística nem tratar um book como previsão. A primeira fonte utiliza Gamma para descoberta e CLOB para asks; preços indicativos Gamma não são preço executável. Fonte: [descoberta](https://docs.polymarket.com/market-data/discover-markets.md), [books](https://docs.polymarket.com/market-data/prices-order-books.md), [taxas](https://docs.polymarket.com/trading/fees.md).

## Primeiro alpha e falhas

Somente `predictions/btc` coleta dados reais. Sem asks, fonte válida, custos/modelo/estimativas/capital/correlação definidos, a oportunidade pede atualização e BETTEX não aloca. A observação inicial não inventa esses dados; não há modelo de probabilidade calibrado implementado. Preço/volume de book não bastam para estimar retorno.

Consulta periódica limitada, com timeout; falha de fonte é persistida, sem fallback fictício. Evidência tem timestamp de origem separado da coleta; repetir a mesma evidência não a renova. Falha preserva registros antigos identificados por idade/validade, nunca os apresenta como novos. Exposição externa não conciliada é informação ausente, não exposição zero.

Mocks ficam nas fixtures e na demonstração interna de desenvolvimento. Produção não inicia o timer demonstrativo e bloqueia sua API antes de gerar identidade, saldos ou operações. Não se apagam dados históricos existentes.

## Pendências concretas

- Estratégia/modelo BTC calibrado, custos completos, moeda/rede de liquidação, intenção e tamanho de ordem, correlação/exposição externa conciliada.
- Allora ainda não conectada ao fluxo: uma previsão BTC/USD não é probabilidade de resolução do mercado.
- Ordens Polymarket, assinatura/custódia, funding e confirmação de fills não implementados. Alocação USDC local não os comprova.
- Testnet pública e controle institucional mantêm as dependências documentadas em Tesouraria.

Essas lacunas bloqueiam operações, não são preenchidas com mocks. Consolidar o ramo antes de ampliar mercados/estratégias.

## Verificações realizadas

- Validação geral do workspace: arquitetura, contratos gerados, tipos, segurança, regras econômicas e builds backend/frontend aprovados.
- 11 testes específicos: encaminhamento, prioridade, comparação/rejeição, pausa/limites/capital/exposição, autorização, validade, duplicação, retomada e ausência de fontes/preço.
- HTTP/PostgreSQL/EVM em schema e cadeia descartáveis: controles financeiros, autorização segregada, pausa, alocação local confirmada, retomada sem outra transação e quarentena após reorg. Registros/eventos do alpha sobreviveram ao reinício sem repetir eventos; produção bloqueou a API/timer demonstrativos.
- A fixture EVM é chain ID 31337 e usa fontes de teste declaradas. Ela não comprova modelo BTC, ordem/fill Polymarket, lucro ou compra em testnet pública. Permissões, saldos e EVM do aplicativo principal não foram usados para esse teste.
- Coleta real confirmada em 05/10/2026 por `GET /api/agents/alpha`: HTTP 200, fonte `observed`, quatro observações Gamma/CLOB, todas `needs_update` com modelo/capital explicitamente ausentes. Somente Previsões/BTC ativo; nenhum encaminhamento financeiro ou lucro produzido.
