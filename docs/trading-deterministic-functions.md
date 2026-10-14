# BETTEX — funções determinísticas de apoio aos agentes

> **Leitura:** [guia demo/ALFA](documentation-map.md) · **Anterior:** [pacote de investimento](trading-proposal-contract.md) · **Próximo:** [relatórios por ciclo](trading-cycle-reports.md)

## 1. Escopo e fronteira da revisão

Este inventário documenta responsabilidades determinísticas relacionadas a **BETTEX, Cripto e especialistas BTC/ETH/SOL**. Não é uma certificação de todas as funções do repositório, não ativa serviços e não altera o demo.

Ele distingue **inteligência que interpreta e propõe**, **funções que calculam/validam** e **controles que autorizam ou impedem**. Código legado, regras candidatas e funcionalidades demonstradas não são tratados como o mesmo estado de implementação.

Referências: [decisão](trading-decision-logic.md), [pacote](trading-proposal-contract.md), [percurso](trading-spot-journey.md), [avaliação das estratégias](trading-strategy-validation.md), [execução](trading-execution-validation.md) e [geração de relatórios](trading-report-generation.md).

Carteiras, staking, elegibilidade, tributos e destinações aparecem aqui apenas em sua interface com o percurso dos agentes. Não se redefinem suas regras nem se afirma uma auditoria integral desses domínios.

## 2. O que a leitura do código confirmou

| Referência consultada | Capacidade observada | Limite para o novo percurso |
|---|---|---|
| [Definições operacionais](../artifacts/api-server/src/modules/agents/domain/operations.ts) | Trabalhadores, dependências, estados de atividade e registros de execução | Nomes/hierarquia incluem o domínio histórico de previsões; não definem a hierarquia spot atual |
| [Avaliação por regras](../artifacts/api-server/src/modules/agents/application/operations.ts) | `assessAgent`/`assessAllAgents` verificam fontes, políticas, estado paper e dependências | `healthy`, `hold` ou `block` não provam inteligência, proposta completa, autorização ou lucro |
| [Rodada técnica](../artifacts/api-server/src/routes/agent-operations-runtime.ts) | Uma rodada usa contexto, avaliações, vínculos entre execuções e registro de falha | `cycleId` da rodada técnica não é identificação suficiente do ciclo financeiro |
| [Armazenamento operacional](../artifacts/api-server/src/modules/agents/infrastructure/operations-store.ts) | Histórico, último registro, contagem, leitura paginada e identidade única de execução | Histórico de avaliações não comprova os oito relatórios financeiros completos |
| [Interpretação por modelo](../artifacts/api-server/src/modules/agents/application/reasoning.ts) | Inferência separada, validação da saída, evidências e proveniência do modelo | Relatório narrativo não calcula/aprova os fatos financeiros ausentes |
| [Composição de políticas](../artifacts/api-server/src/modules/risk/domain/policy-composition.ts) | Composição de restrições, versões efetivas e diferenças entre políticas | Domínio/escopos históricos não podem ser transferidos para spot sem revisão |
| [Execução paper](../artifacts/api-server/src/modules/execution/application/paper-trading.ts) | Validação de cotação, autorização, exposição e estados/reservas no domínio de previsões | Usa tipos `Prediction*` e restrição de preço até `MICRO`; não é validador genérico de preço BTC/ETH/SOL spot |
| [Projeção de auditoria do demo](../artifacts/bettex-site/src/components/interface-demo/central-audit-data.ts) | Converte amostras de pedidos/decisões/ordens/preenchimentos/posições em leituras do Histórico | Projeção de amostras não é novo movimento de caixa nem geração operacional dos relatórios spot |

Esta é leitura estática de referências selecionadas. Nenhum runtime, banco, API financeira ou integração foi acionado para comprovar funcionamento. Os documentos operacionais antigos permanecem evidência histórica, não autorização atual.

## 3. Inventário de responsabilidades

As linhas abaixo são **funções lógicas exigidas**, não alegações de que cada uma já está implementada. Podem compartilhar implementação; não são novos agentes ou serviços.

| # | Função determinística | Entrada e saída verificáveis | Relação com inteligência/controle |
|---|---|---|---|
| 1 | Captura e identificação de fonte | Origem, instrumento, instantes, resultado/erro e observação bruta | Fornece evidência; não produz tese nem probabilidade |
| 2 | Normalização | Unidade, moeda, precisão e instante → representação comparável, mantendo o original | Não converte ticker ou cotação de previsão em ativo spot |
| 3 | Qualidade/validade | Completude, idade, coerência, duplicidade e divergências → estado da evidência | Ausência não vira zero nem amostra real |
| 4 | Indicadores e medidas | Fórmula/versão e janela → retorno, faixa, dispersão e medidas de exposição | Indicador não é explicação inteligente nem vantagem validada |
| 5 | Registro de evidências | Versões/fontes → retrato identificável e vínculos causais | Permite ao especialista justificar o diagnóstico da época |
| 6 | Perfil de estratégia | Definições/parâmetros/estado permitido → perfil válido ou impedido | Não habilita estratégia por desempenho aparente |
| 7 | Contrato da proposta | Pacote → campos/unidades/relações válidos ou erros explícitos | Não cria alvo, stop ou risco faltante para o subagente |
| 8 | Economia por tamanho | Quantidade, preços, custos e desfechos → capital, resultado, risco planejado e expectativa quando sustentada | Não inventa probabilidades ou calibração |
| 9 | Recepção e identidade | Mensagem/proposta/versão → recibo único e histórico | Reenvio idêntico não cria nova oportunidade |
| 10 | Filas e vencimentos | Estado, validade e prioridade → posição na fila e eventos | Urgência de proteção não é maior expectativa de lucro |
| 11 | Coordenação de dependências | Rodadas, fontes e respostas → estado do trabalho, falhas e vínculos | Organiza trabalho; não transforma checagens em análise de IA |
| 12 | Invólucro da inferência | Contexto/versões e resposta → saída validada/proveniente ou erro | A chamada ao modelo não é determinística; validação e registro são apoio |
| 13 | Dependência das evidências | Fontes repetidas/relacionadas → relações e alertas de duplicação | Contagem não substitui interpretação de contrapontos |
| 14 | Planos candidatos | Propostas/tamanhos permitidos e posições → conjuntos possíveis e impedimentos | Enumeração/cálculo não concede seleção ou autorização por si |
| 15 | Comparação mensurável | Insumos econômicos sustentados, restrições e janela → resultados e critérios de desempate | BETTEX responde pela decisão e justificativa; não usar pontuação opaca como inteligência |
| 16 | Políticas e limites | Versões vigentes, ambiente e escopo → restrições efetivas e diferenças | Nenhum subagente pode afrouxar controle superior por argumento textual |
| 17 | Recursos/obrigações | Saldos, compromissos e reconciliação → disponibilidade por moeda | Projeção de ganho não financia obrigação |
| 18 | Autorização e reserva | Autoridade, decisão e condições → autorização/recusa e reserva formal | Seleção e acesso técnico não são permissão financeira |
| 19 | Registro de execução | Tentativas, efeitos e confirmações → estado único de ordem/preenchimento | Não repetir envio porque um modelo disse para tentar novamente |
| 20 | Acompanhamento de condições | Preço/prazo/limites e plano → alertas de alvo, stop, vencimento e proteção | Tocar nível não comprova saída; revisão da tese continua atribuída |
| 21 | Posição e resultado | Preenchimentos e custos → quantidade, custo carregado, realizado e não realizado | Narrativa não altera contabilização nem encerra saldo residual |
| 22 | Ciclos e relógios | Instantes e regras de corte → ciclo de cada fato e continuidade | Rodada de análise não vira ciclo financeiro |
| 23 | Geração de relatórios | Retratos e registros vinculados → famílias, métricas, versões e pendências | Conteúdo factual não é calculado pelo texto do modelo |
| 24 | Gráficos e apresentação | Séries verificadas, unidades e filtros → leitura consistente | Tradução/filtro não recalcula um novo lucro |
| 25 | Correção e auditoria | Original, motivo, responsável e alteração → versão corretiva rastreável | Não apagar erro/perda para melhorar desempenho aparente |
| 26 | Consulta/exportação | Escopo, autorização e corte → visualização/arquivo consistente quando previsto | Não incluir segredos nem usar exportação para operar; não criar botões de download na documentação pública |
| 27 | Telemetria e alertas | Atualidade, execução, erro e latência → estado técnico separado do financeiro | Serviço ativo não significa estratégia lucrativa ou capital disponível |
| 28 | Acesso e interface financeira | Papel/escopo e apuração vigente → leitura permitida e encaminhamento | Central somente consulta; staking, direitos e pagamentos mantêm contratos próprios |

## 4. Responsabilidade por ator

| Ator/área | O que recebe das funções | O que continua sob sua responsabilidade |
|---|---|---|
| BTC/ETH/SOL | Dados válidos, cálculos, contexto de posição/recursos, perfil e resultado posterior | Analisar, confrontar hipóteses e produzir proposta completa com risco próprio |
| Cripto | Todos os pacotes, vínculos, falhas, dependências e estado das filas | Consolidar domínio, verificar e pedir revisão; não esconder candidatas da BETTEX |
| BETTEX | Lote, planos, resultados calculáveis, retratos e impedimentos | Comparar e justificar seleção/espera/recusa dentro dos controles |
| Risco/Governança | Exposição, cenários, políticas, violações e autorizações | Pareceres e autoridade vigente; regras calculadas não substituem julgamento onde ele é exigido |
| Tesouraria | Recursos, reservas, obrigações, efeitos e reconciliação | Disponibilidade e controle financeiro; não confundir seleção com reserva |
| Funções de execução/registro | Termos e autorizações válidos, evidências de efeito | Garantir registro, recuperação e leitura consistente dentro da autoridade concedida |
| Usuário da Central | Relatórios, justificativas, estados e séries consultáveis | Acompanhar; não editar mandatos, aprovar ou operar manualmente |

Função de suporte não ganha nó no grafo só porque tem nome de trabalhador no código histórico. Preservar o grafo de agentes e os controles fora dele, conforme o percurso atual.

## 5. Contrato comum de entrada e saída

Cada função declara: identidade/versão, origem e instante das entradas, política/ambiente quando aplicável, unidade/precisão, saída, vínculos e estado. Distinguir **sucesso**, **parcial**, **indisponível**, **inconsistente** e **impedido por regra**.

Mesmas entradas e mesmas versões devem produzir o mesmo resultado calculável. Alteração de horário, fonte, política ou arredondamento é alteração de entrada/versão e precisa ser identificada; não é reprodução idêntica.

Guardar valores na precisão necessária ao domínio; arredondar apresentação sem reutilizar o valor arredondado como base silenciosa de cálculo. Comparações devem explicitar arredondamento/tolerância. Valor desconhecido é indisponível, não zero.

Funções de consulta não geram reserva, ordem, proposta ou apuração. Reexecução de cálculo/relatório não pode duplicar efeito financeiro. Registros tardios conservam instante do fato e de conhecimento/registro.

## 6. Dependências, falhas e comportamento seguro

| Falha | Comportamento exigido |
|---|---|
| Falta fonte/posição/retrato essencial | Propagar ausência e impedir a decisão afetada; não substituir silenciosamente por amostra |
| Falha do modelo com fatos disponíveis | Preservar fatos verificáveis; marcar análise indisponível; não chamar resumo fixo de IA |
| Falha no cálculo financeiro | Marcar métricas dependentes indisponíveis; narrativa não inventa resultado |
| Dependência circular ou não concluída | Registrar impedimento; não marcar análise composta como concluída |
| Atualização durante comparação | Preservar retrato comparado e revalidar mudança material antes da ação |
| Reserva/efeito incerto | Conservar compromisso e reconciliar, sem liberar por timeout |
| Repetição de mensagem/evento | Mesmo efeito/recibo, não duplicação de contadores financeiros |
| Controle mais restritivo | Reavaliar ações futuras e tratar posições existentes sem fingir cancelamento do passado |

Cada ausência é propagada somente às saídas que dependem dela. Um relatório de falha pode ser gerado mesmo sem dados para calcular retorno. A possibilidade de emitir esse relatório não libera uma nova entrada.

## 7. Critérios documentais de verificação

- Rastrear cada número do relatório até cálculo, registros e versões de origem.
- Separar avaliação fixa, inferência, decisão, autorização, efeito e apuração.
- Conferir o mesmo evento em histórico, posição, Tesouraria e ciclo sem multiplicar o dinheiro.
- Repetir entradas/versões e verificar identidade dos cálculos e ausência de efeitos duplicados.
- Introduzir ausência/atraso/conflito e verificar propagação explícita, sem números substitutos.
- Conferir precisão, unidades, fronteiras temporais, reservas e custos antes/depois de parcial/correção.
- Verificar que filtros, idiomas, gráficos e exportações não mudam o resultado financeiro de origem.
- Confirmar que permissões e consulta não oferecem edição/operação pela Central.

## 8. Estado da cobertura

**Revisado na documentação:** inventário funcional de apoio, fronteiras com os atores, referências legadas selecionadas e contratos de verificação. **Não demonstrado:** cobertura linha a linha de todas as funções do repositório, execução operacional, adaptação ao spot, consistência de todas as integrações ou certificação financeira.

A revisão de geração está detalhada em [geração de relatórios](trading-report-generation.md). Avaliar/habilitar futuramente cada função exige evidências no ambiente e escopo autorizados; não reativar o runtime antigo para preencher uma lacuna documental.
