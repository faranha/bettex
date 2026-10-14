# BETTEX — guia do demo e da especificação da ALFA

## 1. O que a BETTEX apresenta

A proposta da BETTEX é transformar apostadores em investidores por meio de um projeto DeFAI. **DeFAI** combina inteligência artificial e finanças descentralizadas; não significa rendimento garantido.

O [demo visual](demo/README.md) permite conhecer carteiras, participação, agentes, Tesouraria e histórico sem conta, dinheiro real ou autorização para operar. Os saldos, movimentos e análises apresentados são ilustrativos. A especificação da ALFA descreve as regras previstas, não funcionalidades já entregues ou habilitadas.

Para conhecer a experiência, abra o aplicativo pela navegação do site. Depois, use este guia para relacionar o que aparece no demo ao funcionamento documentado.

## 2. Um percurso simples pelo demo

1. **Painel e carteiras:** observe os saldos fictícios de USDC e BETTEX. USDC é a unidade monetária usada nos exemplos; BETTEX é o token comunitário. Ver um saldo não comprova fundos disponíveis ou transações reais.
2. **Participação:** consulte o staking, isto é, a destinação de tokens à participação conforme as regras do produto. Participação e eventual direito a resultado não são a mesma coisa; dependem de elegibilidade, ciclo e apuração.
3. **Central da IA:** acompanhe quem analisa, as propostas, as decisões e as posições ilustrativas. A Central é somente consulta: não inicia análise real nem permite editar mandatos ou operar manualmente.
4. **Tesouraria:** veja a origem e a destinação ilustrativa dos recursos, distinguindo disponível, reservado e comprometido. Proposta selecionada não é compra.
5. **Histórico e relatórios:** siga os vínculos entre os registros e os ciclos. O mesmo fato visto em várias áreas não representa dinheiro ou lucro adicional.

As ações operacionais abrem o aviso da demonstração e o convite à comunidade. Não fazem compras, saques, apostas ou assinaturas. Recursos opcionais, como Loteria e Double 2X, não constituem evidência de desempenho dos agentes de Cripto.

O [caso spot completo](trading-spot-journey.md) aprofunda esse percurso com um exemplo hipotético. Seus números não são os saldos do aplicativo nem uma operação já realizada.

## 3. Quem faz o quê

**Spot** é a compra e venda do ativo, não de uma aposta sobre seu preço. A especificação inicial de Cripto cobre BTC, ETH e SOL sem alavancagem, isto é, sem ampliar a posição com capital emprestado. Negociação **on-chain** registra efeitos em uma rede blockchain; priorizá-la não escolhe rede ou garante segurança.

| Ator/área | Papel no percurso | Leitura de aprofundamento |
|---|---|---|
| BETTEX | Inteligência principal que compara propostas e justifica selecionar, aguardar ou recusar | [Análise e decisão](trading-decision-logic.md) |
| Cripto | Coordena o domínio, confronta análises e qualifica os pacotes sem selecionar no lugar da BETTEX | [Passagem entre etapas](trading-spot-journey.md#3-responsáveis-e-passagem-entre-etapas) |
| BTC/ETH/SOL | Especialistas internos que analisam e entregam tese, contrapontos e risco próprio | [Estratégias e evidências](trading-strategy-validation.md) |
| Risco, Governança e Tesouraria | Pareceres, restrições, autoridade e recursos; não outra camada de seleção financeira | [Pacote e controles](trading-proposal-contract.md) |
| Funções determinísticas | Calculam e validam por regras explícitas; não substituem inteligência nem concedem autoridade | [Inventário de apoio](trading-deterministic-functions.md) |
| Participante | Consulta a Central, os registros e seus vínculos; não edita mandatos ou opera manualmente pela Central | [Papel do usuário](trading-spot-journey.md#papel-do-usuário-e-organização-da-central) |

O grafo mantém **BETTEX → Cripto → BTC/ETH/SOL**. Controles, execução e registros ficam fora do grafo, mas seus pareceres e eventos continuam ligados à leitura.

## 4. Demo, ALFA e evidência histórica

| Tema | Demo visual | Especificação da ALFA |
|---|---|---|
| Dados e valores | Cenário ilustrativo e navegação local | Evidências identificadas, válidas e reconciliadas |
| Análise | Exemplos de leitura, sem inferência real ativada | Inteligência com proveniência, contrapontos e avaliação posterior |
| Propostas e decisões | Representação de estados; exemplos antigos podem usar cotas de previsão | Pacote spot completo, comparação e justificativas |
| Operações | Aviso; nenhuma movimentação financeira | Autoridade, reservas, execução e recuperação conforme regras definidas |
| Relatórios | Leituras de amostras; não comprovação da geração integrada | Oito famílias vinculadas aos fatos e aos responsáveis |
| Relógios | Roteiro de 24 horas, de 16h a 16h em São Paulo | Relógios identificados e regras vigentes; sem mudar períodos nativos por analogia |
| Prontidão | Serve para conhecer e avaliar a experiência | Especificado não significa implementado, validado ou habilitado |

Código e documentos históricos ajudam a compreender decisões anteriores. Não limitam a especificação nem comprovam que a ALFA esteja pronta. Nenhum destes guias escolhe tecnologia, rede, plataforma, modelo ou fornecedor.

## 5. Ordem de leitura e responsabilidade de cada documento

Leia o caso e as regras principais antes das fórmulas e referências. Cada documento é responsável por um assunto; os links levam aos detalhes sem criar versões concorrentes da mesma regra.

| Ordem | Documento | Pergunta que responde |
|---|---|---|
| 1 | [Demo visual](demo/README.md) e [origem dos dados](demo/data-and-audit.md) | O que posso conhecer e o que esses dados não comprovam? |
| 2 | [Análise e decisão](trading-decision-logic.md) | Como os atores investigam e tomam decisões? |
| 3 | [Percurso spot](trading-spot-journey.md) | Como as etapas se conectam num caso ilustrativo? |
| 4 | [Pacote de investimento](trading-proposal-contract.md) | O que uma proposta precisa conter e como entra na comparação? |
| 5 | [Funções determinísticas](trading-deterministic-functions.md) | Que cálculos e controles apoiam cada ator? |
| 6 | [Relatórios por ciclo](trading-cycle-reports.md) | O que os relatórios mostram e como evitam dupla contagem? |
| 7 | [Geração dos relatórios](trading-report-generation.md) | De onde vem cada conteúdo e como tratar falhas e revisões? |
| 8 | [Avaliação das estratégias](trading-strategy-validation.md) | Como definir e avaliar uma hipótese sem usar informação futura? |
| 9 | [Custos e execução](trading-execution-validation.md) | Como tratar liquidez, autorização, efeitos incertos e resultados? |
| Consulta | [Benchmark de mercado](trading-market-benchmark.md) | Que referências apoiam a investigação, sem aprovar parâmetros? |

**Regra de leitura:** as [instruções atuais](../replit.md) e regras aprovadas prevalecem sobre exemplos, hipóteses e material histórico. Valores candidatos não viram política porque aparecem numa fórmula.

As pesquisas anteriores sobre [base spot](trading-spot-base.md) e [DEX/on-chain](trading-spot-dex.md), assim como os registros de [políticas de previsões](trading-policies.md) e [provedores](trading-provider-model.md), são referências de contexto. Não substituem esta ordem nem ampliam a oferta do demo/ALFA.

## 6. Distinções que acompanham toda a leitura

- **Analisar ≠ propor ≠ selecionar ≠ autorizar ≠ executar.**
- **Alvo** é objetivo; **expectativa** depende de desfechos, probabilidades sustentadas e custos.
- **Stop** é condição de proteção, não garantia de preço ou limite absoluto de perda.
- **Resultado realizado** vem das saídas confirmadas; **não realizado** é a marcação da posição restante.
- **Lucro apurado** não é automaticamente distribuível, elegível ou pago.
- **Rodada de análise** não é **ciclo financeiro**; uma posição pode atravessar vários ciclos.
- **Indisponível** não é zero; repetição da mesma fonte não é confirmação independente.
- **Especificado**, **avaliado**, **implementado** e **habilitado** são estados distintos.

O conjunto permite entender o demo e consultar as regras previstas para a ALFA. Não constitui aprovação de estratégias, operação real ou certificação de prontidão.

**Próxima leitura:** [análise e decisão](trading-decision-logic.md). **Índice geral:** [documentação e evidências](README.md).
