# Dados, cálculos e correlações do demo

## Proveniência

Todos os valores e registros são ilustrativos. Identificadores de solicitações
ligam eventos da Central ao Histórico e aos detalhes da Tesouraria. Não são hashes
de transações, recibos de corretora nem provas de execução de IA.

O cenário usa geração determinística e snapshots para tornar a apresentação
repetível. Datas podem ser deslocadas para manter o exemplo legível no momento
da visita. Alteração de idioma não deve traduzir identificadores nem romper
correlações; apenas os rótulos e formatos exibidos são localizados.

## O significado de “conciliado”

Há consistência matemática dentro do cenário:

`saldo final = saldo inicial + entradas − saídas`

Entretanto, alguns saldos iniciais são calculados a partir do saldo final desejado
menos o movimento ilustrativo. Resultados agregados do snapshot também são
distribuídos entre registros gerados. Portanto, a marca de conciliação do modelo
**não é reconciliação independente entre ledger, corretora e blockchain**.

Ela não comprova que operações individuais produziram o lucro apresentado.
Não promover esses dados a evidência real, nem usar a geração visual como algoritmo
de contabilização futura.

## Regras de apresentação

- A distribuição de resultados é condicional às regras e ao lucro elegível.
- Saldos, pool e passivos não podem ser contados duas vezes.
- USDC reservado para recompra e BETTEX aguardando queima são saldos; total queimado é acumulado separado.
- Custos externos não são taxas de serviço. O demo não apresenta tarifas da BETTEX.
- Eventos pendentes, bloqueados e falhos devem manter seu estado explícito.
- Correlacionar uma solicitação não significa que ela foi aprovada ou executada.
- Português, inglês e espanhol devem preservar números, identificadores e condições.

## Evidência exigida para substituir fixtures

Uma integração futura precisa de origem identificada, identidade da rede,
contratos/endereços verificados, confirmação de efeitos, reconciliação independente,
isolamento por titular, autorização e testes de reexecução/recuperação.
Remover o aviso “ilustrativo” exige essa evidência e autorização específica.
