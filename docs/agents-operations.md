# Manual operacional dos agentes BETTEX

## 1. O que foi ativado

The AI Center contains two separate layers: automatically executed rule-based operational checks and actual language-model reasoning, generated on request for the selected agent. Allora supplies real external inferences. The OpenAI reasoning layer interprets the latest captured evidence, retains model/provider provenance and persists its own reports; it never substitutes a scripted answer when inference fails. Neither layer grants permission to operate real funds. See [real agent reasoning](decisions/0016-real-agent-reasoning.md) for its boundaries and current on-demand scope.

O ciclo é iniciado pelo servidor, não por quem abre a página. A periodicidade nominal é 60 segundos. Se uma coleta exceder esse intervalo, não começa um ciclo concorrente: aguarda a conclusão e tenta novamente no próximo intervalo. Um bloqueio transacional PostgreSQL impede dois processos de gravarem ciclos sobrepostos. Cada rodada tem identificador próprio; cada relatório guarda o ciclo e os relatórios das dependências que alimentaram sua análise.

Os ciclos dependem do servidor em execução. Reinício não apaga o histórico e não cria atividade retroativa: a próxima avaliação registra sua execução real. A janela de três minutos mede frescor dos relatórios, não garante disponibilidade contínua da infraestrutura.

As leituras públicas Allora, Polymarket e os controles existentes alimentam uma avaliação ordenada pelas dependências. Primeiro são avaliados os controles e especialistas disponíveis; os agentes de mercado recebem seus resultados; BETTEX consolida a avaliação. Os relatórios e contadores são gravados na mesma transação. Abertura, recarregamento ou troca de idioma da tela não cria uma nova execução.

## 2. Estados diferentes, significados diferentes

| Campo | Significado |
|---|---|
| Serviço recente | Existe execução persistida nos últimos três minutos; não prova aprovação para operar |
| Atrasado | A última execução ultrapassou a janela; a tela não inventa um heartbeat |
| Não iniciado | Nenhuma execução persistida do serviço |
| Análise sem falha | O procedimento conseguiu analisar suas entradas; não é garantia de retorno ou modelo calibrado |
| Degradado | Existe impedimento ou entrada indisponível, vencida ou não configurada |
| Falho | Não foi possível completar a avaliação |
| Monitorar | Acompanhar controles; não significa reservar recursos |
| Manter/aguardar | Não avançar à operação com as evidências atuais |
| Bloquear | Uma dependência ou regra impede avanço |

O serviço pode estar rodando e sua decisão ser bloquear. Esse comportamento é esperado e não deve ser mascarado como agente desligado nem como operação pronta.

## 3. Manual por agente

| Serviço | Responsabilidade e entradas | Procedimento e saída | Limite |
|---|---|---|---|
| BETTEX | Coordenador de observação; análises de mercado, oportunidades, tesouraria e risco | Consolida dependências e contadores de oportunidades/seleções já registrados, verifica política/orçamento e registra impedimentos | Este relatório não seleciona novas candidatas, aprova política, assina ou cria orçamento |
| Tesouraria | Estado da tesouraria simulada, obrigações, reservas e posições | Verifica disponibilidade e integridade; publica controle financeiro agregado | Saldo simulado não é saldo pessoal USDC nem lucro distribuível |
| Governança | Registro de políticas efetivamente publicadas e ativas | Resolve as camadas global/estratégia/ativo; detecta ausência, mudança e pausa | Não transforma arquivo de proposta em regra aprovada |
| Risco | Políticas e controles da tesouraria | Verificação independente de pré-requisitos; bloqueia sem política/orçamento/estado reconciliado | O relatório não substitui a autorização/reserva indivisível do mecanismo financeiro |
| Execução | Ordens simuladas, políticas e pré-requisitos | Monitora pendências e avalia possibilidade de avanço; preserva a proibição de reenvio automático de ordem incerta | Não possui chave, conector de envio público nem autoridade financeira |
| Conciliação | Ledger, ordens, fills e posições simuladas | Verifica efeitos únicos, preenchimentos e identidade contábil | Não presume cancelamento, saldo externo ou conciliação da carteira pessoal |
| Mercado de previsões | Resultados dos especialistas e oportunidades Polymarket | Consolida disponibilidade da evidência e dos candidatos | Não escolhe investimento concorrendo com BETTEX |
| Bitcoin | Allora BTC/USD 8h, observação Polymarket BTC, governança | Registra preço previsto, bloco, produção, horizonte, disponibilidade e referências originais dos mercados | Não converte preço previsto em probabilidade de evento |
| Ethereum | Allora ETH/USD 8h, observação Polymarket ETH, governança | Mesmo procedimento com fonte e identidade próprias | Não reutiliza inferência BTC como ETH |
| Solana | Allora SOL/USD 8h, observação Polymarket SOL, governança | Mesmo procedimento com fonte e identidade próprias | Não reutiliza inferência BTC/ETH como SOL |
| Esportes | Descoberta pública de eventos esportivos Polymarket | Filtra eventos identificados como esportivos e com mercado aberto, preserva título/fonte e aponta modelo ausente | Descoberta não fornece preço executável, vantagem ou probabilidade validada |
| Cripto/meme coins | Disponibilidade dos provedores previstos | Diagnóstico explícito de fonte/conector não configurado | Não atribui dados Polymarket à Robinhood ou FOMO; identidade FOMO ainda precisa ser definida |
| Bônus | Disponibilidade de fonte e metodologia aprovadas | Diagnóstico explícito de ausência | Não inventa bônus, arbitragem, ROI ou integração com casas |

Os últimos dois serviços executam diagnóstico de prontidão; não estão conectados a provedores comerciais. A presença deles no inventário não muda esse fato.

As funções financeiras de seleção/risco/execução descritas na hierarquia não devem ser atribuídas aos relatórios de observação desta tabela. Contar seleções já registradas não executa uma nova seleção; registrar pré-requisitos não concede autorização.

## 4. Allora ligada aos especialistas

Rede: `allora-mainnet-1`. Tópicos: BTC 14, ETH 9 e SOL 10. A tarefa declarada precisa corresponder ao ativo e à previsão de preço USD em oito horas. Verificam-se tópico, atividade, bundle rotulado, valor positivo, bloco da inferência, rede e horário real de produção.

Gráfico e especialistas compartilham a mesma coleta e identidade persistida. Registro: rede + tópico + bloco. Uma resposta incompatível com a identidade já registrada não pode sobrescrevê-la. Chamadas concorrentes do gráfico e dos especialistas compartilham uma promessa de consulta; não fabricam observações distintas.

O horizonte conta a partir da produção do bloco, não da abertura da tela. O especialista verifica novamente o alvo na hora da análise: uma resposta anteriormente marcada atual não permanece atual se o horizonte encerrou. Falha não reutiliza um preço anterior como nova inferência. Histórico coletado não é histórico completo da rede.

A evidência de mercado é preservada separadamente. Um título original de evento não é tradução da interface, uma cotação atual ou prova de que a previsão Allora responde à condição contratual desse evento.

## 5. Regras, permissões e segurança

- Os serviços desta central podem ler fontes públicas, políticas e agregados simulados e escrever relatórios de análise.
- Não recebem senhas, chaves, vaults, tokens de sessão nem identificadores pessoais.
- Não assinam, movimentam saldos, fazem depósitos, autorizam orçamento, publicam políticas ou migram contratos.
- Não produzem probabilidade/confiança fictícia para ultrapassar os critérios da hierarquia existente.
- Não confundem funding, principal ou cotação de token com resultado operacional.
- Fonte sem horário confiável mantém esse campo ausente; horário de coleta não substitui produção.
- Ordem de resultado desconhecido mantém seu tratamento original. Repetir uma observação no ciclo seguinte não autoriza reenviar uma ordem.
- Falha de coleta produz diagnóstico explícito. Falha de SQL desfaz a captura até o savepoint antes de registrar a falha, sem deixar uma transação abortada com supostos relatórios saudáveis.
- Se nem a persistência funcionar, não há relatório novo; a interface mostra falha de leitura ou execução atrasada, não atividade inventada.

## 6. Como usar o dashboard

1. No painel, consultar o resumo dos serviços e abrir **operações completas**.
2. Na Central, selecionar o agente ou buscar pelo nome.
3. Comparar **estado do serviço**, **estado da análise** e **decisão** — não são equivalentes.
4. Consultar o último relatório, os fatos, impedimentos e links das fontes.
5. Expandir a documentação do agente para entradas, saídas, passos, regras, dependências e permissões.
6. Consultar o histórico, expandir uma execução e verificar ciclo e relatórios de origem.
7. Usar páginas anteriores para histórico persistido. Páginas históricas não ficam sendo substituídas pela atualização automática.

Tooltips funcionam por mouse, teclado e toque. A interface e a documentação embutida são localizadas em português, inglês e espanhol. Horários apresentados ao usuário usam São Paulo; instantes internos permanecem UTC.

O inventário, conteúdo e limites de cada ajuda estão em [helpers.md](helpers.md). Os botões de ajuda da Central abrem por clique/toque ou Enter/Espaço, não dependem de hover e fecham com Escape ou interação fora. No mobile, selecionar um agente leva ao detalhe; a seleção não dispara um ciclo nem uma operação.

## 7. API e diagnóstico

- `GET /api/agents/center`: inventário completo, estado recente de cada agente e 40 relatórios por página.
- `agentId`: filtra somente o histórico; o inventário permanece completo.
- `before`: cursor de sequência para registros mais antigos, sem arredondar timestamps ou duplicar fronteiras.
- `GET /api/agents/allora/BTC`, `ETH`, `SOL`: observação pública e histórico Allora.
- GET não inicia ciclos, não aceita ordens nem altera políticas.
- Filtros inválidos retornam 400; falta de evidência/persistência retorna 503, sem substituição emulada.

Diagnóstico: verificar execução recente, estado da fonte, validade de produção/alvo, política efetiva, orçamento simulado e conciliação. Não “resolver” uma falha marcando flag ativa, copiando um bloco antigo ou criando uma aprovação.

## 8. O que falta para submissão de operações

1. Modelo específico do evento, com metodologia, treinamento/avaliação, calibração e validação fora da amostra. Uma previsão central de preço não dá distribuição de probabilidades.
2. Dados de cotação executável, profundidade, custos, validade e liquidez do evento correto.
3. Política publicada e válida, orçamento simulado autorizado e controles reconciliados.
4. Para operação pública: identidade e conta do provedor, mandato limitado, governança/custódia, validação regulatória e auditoria independente.

Esses requisitos continuam impedimentos reais, não tarefas que se concluem trocando um rótulo. O trabalho técnico concluído nesta etapa é o plano, dashboard, agentes de análise e controle, consumo Allora nos especialistas, execução automática, documentação e histórico verificável. Não é prontidão financeira pública.
