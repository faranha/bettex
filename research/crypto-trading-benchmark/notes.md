# Pesquisa — benchmark de bots e agentes cripto

**Status:** complete
**Profundidade:** Deep
**Data:** 14 de outubro de 2026

## Plano

- **Pergunta:** Como bots e agentes existentes estruturam estratégias, decisão, risco, execução, avaliação e relatórios para BTC/ETH/SOL, e quais práticas informam a lógica da BETTEX?
- **Escopo:** frameworks abertos, produtos comerciais, automação on-chain e agentes de IA; estratégias spot e referências fora do mandato explicitamente separadas.
- **Limites:** não escolher tecnologia, rede ou plataforma; não validar retorno, executar operações ou mudar o demo.
- **Público:** fundador e colaboradores da BETTEX.
- **Entrega:** benchmark documentado, matriz de referências, catálogo de estratégias, evidências arquivadas e relação com os contratos de proposta/decisão/relatórios.
- **Arquivo:** diretório próprio para preservar pesquisas anteriores em research/notes.md e research/sources.json.

## Áreas

| Área | Estado | Fontes |
|---|---|---|
| Frameworks abertos e arquitetura operacional | coletado e confrontado | Freqtrade, Hummingbot, Jesse, LEAN, OctoBot |
| Bots comerciais e estratégias oferecidas | coletado; limites de excertos identificados | nove fornecedores; declarações, não ranking de ROI |
| DEX/on-chain e particularidades BTC/ETH/SOL | coletado; versões conferidas | Jupiter, CoW, Uniswap e representações BTC |
| Agentes IA, modelos e estruturas multiagente | coletado; domínio dos experimentos conferido | FreqAI, FinRL, TradingAgents, FinMem; toolkits separados |
| Evidência quantitativa, risco, testes e relatórios | coletado e aprofundado | DRL, momentum, custos Uniswap, IOSCO; evidências arquivadas |

## Cobertura

- [x] Classes e referências: matrizes representativas; sem pretensão de censo. [@hummingbot-controllers] [@freqai] [@tradingagents]
- [x] Estratégias e falhas: catálogo analítico; regimes são hipóteses, não rentabilidade validada. [@binance-spot-grid] [@okx-spot-dca]
- [x] Separação de decisão/risco/execução: padrões confrontados com pesquisa de agentes e governança. [@hummingbot-controllers] [@tradingagents] [@iosco-ai]
- [x] Ativos e representações: identificação de instrumento; liquidez atual permanece limitação. [@wbtc-mint-burn] [@cbbtc-issuer] [@tbtc-august-2026]
- [x] IA/ML: distinguir pipeline, ações, experimento histórico e alegação comercial. [@freqai] [@tradingagents] [@agentkit-repository]
- [x] Testes e custos: especificar dados temporais, universo, tentativas e execução; sem testes novos nesta pesquisa. [@freqtrade-backtesting] [@drl-crypto-overfit-2023] [@uniswap-mev-slippage-arxiv]
- [x] Histórico: posição total, continuidade, versões e reinícios preservados; experimento separado do ciclo financeiro. [@3commas-grid-reporting]
- [x] BETTEX: síntese documental preserva spot sem alavancagem e deixa tecnologia/parâmetros sem aprovação.

## Achados

As referências serão identificadas por chaves [@fonte] no registro de fontes deste diretório.

### Frameworks e produtos

- Controlador/executor/ordens: separar responsabilidades; não copiar stack. [@hummingbot-controllers] [@hummingbot-gateway]
- Backtest: hipóteses em velas, taxas, exportação; não substitui dry-run. [@freqtrade-backtesting]
- DCA não é regra única: compras na queda, multiplicadores e capital reservado precisam de exposição máxima. [@okx-spot-dca]
- Grid: consolidar realizado e não realizado; preservar estatísticas antes/depois de mudanças. [@3commas-grid-reporting]

### IA e validade quantitativa

- TradingAgents: ações, simulação histórica de 2024; referência de organização, não validação cripto. [@tradingagents]
- FreqAI: retreinamento e avaliação; exemplo explicitamente não produtivo. [@freqai]
- DRL BTC/ETH/SOL em universo maior: teste de 2022, taxa simulada, slippage ignorado; tabela final negativa em todos os métodos. [@drl-crypto-overfit-2023]
- Momentum: NBER histórico favorável versus estudos com dependência de universo/custos; não selecionar um veredito universal. [@nber-liu-tsyvinski-2018] [@survivor-crypto-momentum-2026] [@crypto-momentum-illusion]
- Custos DEX: estudo histórico WETH/pools específicos não fornece taxa atual universal. [@uniswap-mev-slippage-arxiv]
- Ferramentas: AgentKit não impõe controles financeiros por padrão; GOAT snapshot arquivado; ElizaOS atual não confirmado. [@agentkit-repository] [@goat-readme] [@elizaos-solana-plugin]

### Vereditos da conferência

- Principais alegações de arquitetura, modelos, custos e estudos conferidas em páginas arquivadas; respostas em claim-verification.json.
- Conferência manual da tabela DRL confirmou todos os retornos acumulados negativos; resposta auxiliar continha formulação contraditória, não adotada.
- Conclusões transversais usam múltiplas fontes, incluindo acadêmicas/regulatórias. Features individuais permanecem declarações de fonte única sinalizadas.
- Excertos não foram promovidos a leitura integral; página nof1 /about com erro não foi aceita como evidência substantiva.

## Conflitos e questões abertas

- Documentação do fornecedor prova uma funcionalidade declarada, não rentabilidade independente.
- Resultados de experimentos acadêmicos não demonstram execução produtiva.
- “Tudo no mercado” não permite censo exaustivo: registrar cobertura representativa e exclusões.
- Jupiter: diferença parcial/total resolvida pela tabela V1/V2; V2 declara vault custodial, ordens privadas/off-chain e preenchimentos parciais. [@jupiter-trigger-v2]
- CoW: documento Safe versus anúncio/recap EOA não reconciliado tecnicamente; limitação preservada. [@cow-twap] [@cow-eoa-recap]
- Momentum “illusion”: data online corrigida de 2026 para 13/08/2025; apenas resumo/metadados. [@crypto-momentum-illusion]
- PR Newswire: comunicado do fornecedor classificado Tier 3; notícia de exchange não considerada validação independente. [@cow-eoa-announcement] [@alpha-arena-news]
- IOSCO: ano 2026 confirmado; dia exato não confirmado no texto; ferramentas não vinculantes, sem aplicação jurídica automática. [@iosco-ai]

## Lacunas

- Preenchida — evidência de estratégia/overfitting: dois aprofundamentos, com DRL e estudo de sobrevivência em texto completo.
- Preenchida — agente versus toolkit: repositório AgentKit lido após falhas nas páginas de documentação; controles ausentes explicitamente verificados.
- Preenchida — Jupiter V1/V2: comparação explícita na página arquivada.
- Movida a Limitações — CoW EOA: anúncio recente encontrado, mas requisito técnico não confirmado; sem insistir em buscas repetidas.
- Movida a Limitações — desempenho comum: nenhuma auditoria independente comparável dos produtos em BTC/ETH/SOL spot on-chain na coleta.
- Movida a Limitações — Alpha Arena e ElizaOS: estado/metodologia atual não confirmados.
- Movida a Limitações — custos, pares, custódia, liquidez, região e execução atuais: não medidos, não presumidos.
- Revisão crítica — sem ranking de ROI; sem tratar LLM de ações como cripto; sem transportar estudo CEX para DEX; sem retorno bruto vendido como líquido; sem aprovar os números dos rascunhos.
- Atualidade — buscas recentes nas frentes registraram mudanças e avisos por par/versão; relatório evita preços, taxas ou versões “mais recentes” sem confirmação.

## Entregas e verificação

- [Relatório completo](report.md): 25 referências, 13 famílias analíticas e 55 fontes citadas com numeração gerada do registro.
- [Síntese para BETTEX](../../docs/trading-market-benchmark.md): 22 fontes citadas; ligada à lógica, ao pacote e aos relatórios por ciclo.
- Registro: 81 URLs únicas com evidência salva; não confundir esse total com 55 fontes efetivamente citadas no relatório.
- Conferência de alegações: páginas principais e excertos revisados; auditoria final não identificou erro substantivo no rascunho.
- Verificação mecânica: chaves/URLs únicas, arquivos de evidência existentes, citações completas, nenhum marcador pendente nos dois documentos finais.
- Navegação: 108 links locais válidos nos cinco documentos envolvidos; verificador documental do repositório aprovado.
- Escopo preservado: sem código de aplicação, parâmetros financeiros, configuração de execução, homepage ou Pitch alterados.
