# BETTEX — custos, liquidez, controles e validação de execução

> **Leitura:** [guia demo/ALFA](documentation-map.md) · **Anterior:** [avaliação das estratégias](trading-strategy-validation.md) · **Consulta:** [benchmark de mercado](trading-market-benchmark.md)

## 1. Estado e relação com o percurso

**Especificação documental, sem execução.** Complementa o [percurso spot](trading-spot-journey.md), o [pacote](trading-proposal-contract.md) e a [avaliação de estratégias](trading-strategy-validation.md). Não seleciona rede, DEX, custódia, carteira, fornecedor ou biblioteca e não altera o demo/ALFA.

Uma tese economicamente favorável não qualifica uma operação cuja entrada/saída, custos, autoridade ou recursos não possam ser verificados. “On-chain” não garante ausência de custódia, intermediários, componentes externos ou riscos do ativo representado.

## 2. Instrumento e evidência executável

| Bloco | Registro exigido |
|---|---|
| Identidade | Ativo, representação, rede/contrato quando aplicável, mercado/par e cotação; ticker sozinho não basta |
| Custódia/permissão | Quem controla fundos, aprovações necessárias, limites vigentes e dependências; acesso técnico não é autoridade financeira |
| Cotação | Origem, instante, prazo, lado, quantidade, preço médio executável estimado, limites e condições |
| Entrada e saída | Evidência para o tamanho, rota elegível e restrições; leitura pública de preço não prova capacidade de negociar |
| Custos | Moeda nativa de cada cobrança, quantidade, conversão de referência e instante; desconhecido não é zero |
| Dependências | Emissor/bridge, disponibilidade, reservas quando necessárias, falhas de fonte, finalidade e reversibilidade |
| Estado financeiro | Saldo/posição/obrigações reconciliados e instante do retrato usado; equivalência monetária não cria saldo de pagamento |

Uma mudança de representação, rota, custódia ou permissão pode invalidar a avaliação, mesmo sem mudar o ticker. Ausência de informação essencial impede nova entrada. Este documento define o que medir depois, não afirma que algum mercado atual passou.

## 3. Custos completos por tamanho

Separar **estimativa**, **provisão** e **despesa efetivamente incorrida**. Registrar o responsável pela cobrança, moeda, fato gerador e evento para impedir duplicação.

| Componente | Tratamento |
|---|---|
| Taxa de negociação/protocolo | Identificar se já está embutida na quantidade/preço recebido |
| Rede/prioridade | Cobrança na moeda exigida; conversão para comparação não substitui saldo nativo |
| Spread/impacto/slippage | Separar preço de referência de preço executável/realizado; não cobrar outra vez impacto já contido no preço usado |
| Autorização, depósito, retirada e conversão | Incluir quando necessários ao percurso; não atribuir gasto comum integralmente a várias posições |
| Tentativas falhas/cancelamento | Reconhecer cobranças incorridas mesmo sem preenchimento; não inventar taxa onde o efeito é desconhecido |
| Saída/proteção | Provisionar necessidade plausível e estressada; custos de entrada baixos não comprovam saída barata |
| Custos operacionais atribuíveis | Método de rateio documentado, quando pertencem à avaliação/apuração; não deduzir indiscriminadamente o mesmo custo em duas bases |

Para quantidade q, usando preço médio executável: `custo de entrada = q × preço executável + cobranças adicionais não embutidas`. Recebimento líquido de saída = `q × preço executável de saída − cobranças adicionais não embutidas`. Resultado realizado = recebimento líquido − custo carregado da parcela vendida.

Exemplo fictício: comprar 0,10 a referência 2.000,00, mas executar a preço médio 2.005,00, custa 200,50 antes de taxas adicionais. O impacto de 0,50 já está no custo; não somá-lo de novo. Com cobrança adicional de 0,10, custo carregado = 200,60.

Provisão de saída não vira despesa ao reservar. Na execução, consumir o valor efetivo e liberar somente sobra reconciliada; se a necessidade aumentar, registrar insuficiência/reavaliação, não esconder o custo.

## 4. Liquidez de entrada e de saída

Qualificar cada tamanho mínimo/recomendado/máximo separadamente. Não extrapolar proporcionalmente o resultado de uma ordem pequena para outra maior.

| Medição | Pergunta respondida |
|---|---|
| Quantidade e preço médio executável | Quanto seria obtido/vendido para esse tamanho, e a que custo? |
| Profundidade/impacto | Quanto piora a execução ao consumir níveis/liquidez? |
| Limite e desvio tolerado | O resultado ainda cabe na faixa/condições do pacote? |
| Parcial e restante | Existe risco de exposição incompleta, resíduo sem saída ou tamanho abaixo do mínimo útil? |
| Idade/validade | A cotação ainda serve ao instante de decidir e executar? |
| Estresse e disponibilidade | Como se comporta a saída se preços caem, liquidez some, fonte falha ou rede atrasa? |

Volume histórico e saldo de um pool não equivalem a saída executável para q. Uma cotação favorável também não garante preenchimento. Registrar metodologia e limitações, incluindo diferenças entre liquidez estimada e efeito confirmado.

Condição candidata: para cada tamanho, demonstrar entrada dentro do limite, saída plausível e capital para custos/proteção. Os limiares de impacto, idade e liquidez precisam de perfil justificado; sem eles, concluir “não qualificado”, não assumir valores padrão.

## 5. Reserva, planejamento e exposição

BETTEX seleciona um plano; a seleção ocupa intenção e afeta o planejamento, mas não reserva caixa. Autorização válida produz a reserva formal sob controles vigentes.

- Necessidade inclui pagamento, custos de entrada e recursos de saída/proteção, nas moedas efetivamente exigidas.
- Caixa reservado continua dentro do caixa total. Caixa livre exclui reservas/obrigações sem descontar o mesmo compromisso novamente.
- Cada preenchimento consome reserva e aumenta a posição pelo efeito confirmado. Restante pendente conserva os recursos necessários.
- Intenção, ordem incerta e posição parcial contam no risco conjunto; incerteza não abre uma vaga artificial.
- Saída parcial libera somente quantidade/recursos confirmados. Cancelar o saldo de entrada não vende a parcela já adquirida.
- Rotação só utiliza caixa liberado após confirmação; revalidar a nova entrada e os compromissos antes de prosseguir.

Insuficiência para taxas/proteção exige alerta e tratamento autorizado. Não retirar de outras destinações automaticamente nem presumir conversão disponível.

## 6. Condições de autorização e transições

| Verificação antes de nova entrada | Impedimento |
|---|---|
| Proposta/versão e decisão identificadas | Termos ausentes, substituídos ou decisão não correspondente |
| Mandato, instrumento e tamanho elegíveis | Outro instrumento, tamanho fora do pacote ou operação não permitida |
| Dados e preço atuais | Vencimento, faixa ultrapassada ou mudança material |
| Orçamento, moedas e exposição reconciliados | Recursos insuficientes, compromisso desconhecido ou limite excedido |
| Autoridade e política vigentes | Sem autorização, revogação, pausa ou conflito de atribuições |
| Capacidade de entrada/saída | Liquidez, custos ou meios de proteção não demonstrados |

Revogação/expiração impede ações futuras não cobertas; **não apaga um envio ou preenchimento anterior**. Operação já em trânsito exige reconciliação e tratamento de seus efeitos. Separar pausa de novas entradas das restrições reais de proteção/saída; não criar poderes de emergência implícitos.

| Transição | Evidência/ação exigida |
|---|---|
| Selecionada → aguardando autorização | Registrar plano e condição, sem débito ou reserva automática |
| Autorizada → reservada | Autoridade válida e recursos efetivos; registrar reserva uma única vez |
| Reservada → enviada | Revalidação e identidade única da tentativa; envio não confirma aquisição |
| Enviada → parcial/concluída | Evidência do efeito, quantidade, preço/custos e posição reconciliados |
| Enviada → efeito incerto | Conservar compromissos; buscar evidência, sem repetir por timeout |
| Cancelamento solicitado → cancelado | Confirmar efeito e tratar preenchimentos concorrentes; liberar só o restante conhecido |
| Saída parcial → posição restante | Carregar custo proporcional e risco; não marcar investimento encerrado |
| Resultado confirmado → encerrado | Quantidade residual tratada, custos e saldos reconciliados |

A fonte e o critério de confirmação/finalidade são definidos no perfil de execução depois da escolha de infraestrutura. Não presumir que recibo local, resposta de API ou saldo ilustrativo comprovem execução externa.

## 7. Duplicidade, recuperação e correções

| Situação | Regra lógica |
|---|---|
| Mesmo pacote/mensagem reenviado | Mesmo reconhecimento; nenhuma nova intenção |
| Mesma autorização solicitada novamente | Recuperar estado original; não duplicar reserva |
| Timeout após envio | Procurar o efeito da mesma tentativa; ausência de resposta não prova ausência de efeito |
| Reinício no meio do percurso | Retomar pelos registros e reconciliar; não reconstruir como operação nova |
| Cancelamento e preenchimento concorrentes | Reconhecer o preenchimento válido antes de calcular restante/recurso liberável |
| Evento fora de ordem | Relacionar instante do fato e registro; recompor leitura sem autorização retrospectiva |
| Confirmação invalidada/revertida | Destacar incerteza e reavaliar saldo/exposição; não manter sucesso fictício nem reenviar automaticamente |
| Divergência entre fontes | Mostrar conflito e impedir nova ação baseada no recurso duvidoso |

Correção conserva origem, justificativa, responsável, versão anterior/nova e ciclos afetados. Não apagar ordens, perdas ou relatórios anteriores. Nenhuma alteração de narrativa elimina o fato financeiro.

Acesso a ferramenta de carteira não permite contornar essas regras. Texto externo, prompt, memória ou consenso entre agentes não muda destinatário, tamanho, limites ou permissões autorizadas.

## 8. Reconciliação e resultado

Antes de reconhecer efeito, comparar autorização/ordem, preenchimentos, quantidade de ativo, caixa, custos e reservas. Identificar origem e instante de cada evidência; estados desconhecidos continuam explícitos.

Vínculos mínimos: análise → proposta/versão → lote/decisão → autorização → reserva → tentativa/ordem → preenchimentos → posição → saída → apuração. Uma ordem pode ter vários preenchimentos; uma posição pode atravessar ciclos.

Não somar valores de mercado a caixa como se fossem ambos líquidos. Não usar seleção como investimento ativo, envio como compra, alvo tocado como venda ou realizado como lucro distribuível.

Para conferir uma subcarteira na mesma base: `resultado econômico = patrimônio final − patrimônio inicial − entradas externas + saídas externas`. A classificação de fluxo depende da base: aporte da Tesouraria à subcarteira não é ganho da subcarteira, mas também não é novo patrimônio da Tesouraria consolidada. Transferência entre contas da mesma base não cria fluxo externo.

Exemplo fictício: patrimônio inicial 230,00; depósito externo 50,00; final 289,80; sem retirada. Resultado = `289,80 − 230,00 − 50,00 = 9,80`, não 59,80. Com retirada de 20,00 e final 269,80, o mesmo resultado é `269,80 − 230,00 − 50,00 + 20,00 = 9,80`.

### Comparabilidade de retorno e drawdown

Método candidato para comparação, **sem substituir bases de risco já aprovadas**: retorno ponderado pelo tempo, separando o período em cada aporte/retirada externa. Registrar patrimônio imediatamente antes e depois do fluxo.

Para cada subperíodo sem fluxo externo, `r(j) = patrimônio final / patrimônio inicial − 1`. Encadear `retorno = produto de (1 + r(j)) − 1`. Custos e resultados já refletidos no patrimônio não são deduzidos novamente; não usar a soma simples dos retornos.

Exemplo fictício: 230,00 antes de aporte de 50,00; 280,00 depois do aporte; 289,80 no fim do subperíodo seguinte. Sem mudança de patrimônio antes do aporte, o retorno encadeado é `289,80 / 280,00 − 1 = 3,5%`. Retirada de 20,00 depois dessa marcação, deixando 269,80, não é perda de 20,00 nem modifica o retorno já medido.

Para drawdown comparável, formar um índice encadeado a partir desses retornos e comparar cada valor ao maior valor anterior: `drawdown = índice atual / pico anterior − 1`. Depósitos não reiniciam artificialmente o pico nem retiradas criam perdas fictícias. Registrar período, custos, fontes e frequência das marcações.

Sem valor antes/depois do fluxo, denominador positivo ou marcação confiável, declarar retorno/drawdown indisponíveis nesse método; não supor zero. Resultado monetário reconciliado e retorno percentual são medidas distintas. Critérios de perda diária/drawdown operacionais continuam exigindo base e política vigentes explícitas.

O [relatório por ciclo](trading-cycle-reports.md) define cortes e continuidade. Despesas/impostos, obrigações, elegibilidade e destinações seguem regras financeiras próprias; não aplicar automaticamente distribuição a estes exemplos.

## 9. Plano documental de verificação

Nenhum teste operacional é executado por este plano.

| Cenário a verificar em trabalho autorizado futuro | Critério de resultado |
|---|---|
| Entrada normal e saída normal | Quantidade, custo, reserva e resultado reconciliados; um investimento |
| Faixa/preço muda antes do envio | Não executar fora dos termos; motivo e revisão preservados |
| Custo só é viável no menor tamanho | Comparar apenas alternativas sustentadas; não escalar linearmente |
| Falta moeda de taxa apesar de valor equivalente em USDC | Impedir entrada; equivalência não supre saldo nativo |
| Entrada parcial seguida de vencimento | Gerir posição adquirida e cancelar/reconciliar saldo; prazo da posição não reinicia |
| Stop e saída parcial com queda posterior | Registrar perda além do planejado, restante e alerta, como na variante do percurso |
| Timeout/reinício/duplicidade | Mesmo efeito reconhecido uma única vez, sem reserva ou envio duplicados |
| Pausa/revogação com operação em trânsito | Impedir novas ações incompatíveis e reconciliar o que já foi enviado |
| Divergência/reversão da confirmação | Bloquear recurso incerto e recompor estado; nenhum sucesso ou saldo presumido |
| Virada das 16h, evento atrasado e correção | Ciclo pelo fato, versão corretiva e investimento único; sem dupla contagem |
| Depósito/retirada | Fluxo externo separado de desempenho; bases de retorno declaradas |
| Usuário da Central consulta | Sem edição/ordens/aprovação manual; demo mantém aviso e escopo visual |

O dossiê de verificação registra versão das regras, ambiente/classificação, cenário, entradas, resultado esperado, evidências efetivas, resultado observado e divergências. “Não testado”, “falhou” e “inconclusivo” não viram “aprovado” porque a interface parece correta.

## 10. Prontidão e limites desta entrega

**Detalhado:** campos de instrumento/cotação, cálculo e atribuição de custos, liquidez por tamanho, reservas, impedimentos, transições, recuperação, reconciliação e cenários de verificação.

**Pendente:** escolher infraestrutura em etapa própria, preencher seus critérios reais, obter evidências de custo/liquidez/segurança, implementar sob escopo autorizado e verificar os cenários. Nada disso é certificado pelo roteiro fictício.

Habilitar o novo fluxo requer evidência de estratégia e execução, controles vigentes e autorização específica do ambiente. Nenhuma aprovação de fundos reais, autoridade nova ou ativação de agente decorre desta documentação.
