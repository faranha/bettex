# BETTEX — receitas, caixa e financiamento da entidade privada

**Versão de trabalho 1 · 3 de outubro de 2026**

## 1. Decisões confirmadas

A entidade é uma **empresa comercial privada, administrada pelo fundador**. O token não representa ações nem voto societário. Não presumimos que o fundador seja o único sócio ou que a lei dispense órgãos e profissionais adicionais.

As taxas são fixas, denominadas em dólar e pagas em **USDC**:

| Serviço | Taxa institucional por operação |
|---|---:|
| Compra de BETTEX no fluxo primário do projeto | US$ 2,50 |
| Saque de rendimentos em USDC pelo aplicativo | US$ 2,50 |
| Envio de BETTEX para outra carteira pelo aplicativo | US$ 2,50 |

Não cobrar a tarifa de compra sobre toda revenda entre titulares. Não cobrar o envio novamente pela entrega de BETTEX que já faz parte da compra. O envio autônomo solicitado pelo usuário é outra operação. Exportar chaves não é saque e não gera taxa; movimentação direta fora do aplicativo não recebe taxa de serviço do aplicativo.

**Não há queima de BETTEX por essas cobranças nem necessidade de comprar BETTEX para pagar a tarifa.** O saldo enviado de BETTEX não é reduzido por uma taxa em tokens. Custos externos de rede ou intermediários são distintos, precisam ser discriminados e não podem virar uma segunda tarifa institucional oculta.

US$ 2,50 é o preço do serviço, não lucro líquido garantido. A moeda de liquidação é USDC; contabilidade, conversão e recolhimentos devem usar os critérios e cotações exigidos no regime escolhido. Não presumir paridade eterna entre USDC e dólar nem ausência de impostos.

### Exemplos de fluxo, sem tributos/rede adicionais

| Operação | Destinação |
|---|---|
| Compra primária de US$ 100 de BETTEX | US$ 100 destinados à tesouraria + US$ 2,50 de serviço ao caixa operacional. Total econômico do exemplo: US$ 102,50. |
| Saque solicitado de US$ 100 de rendimentos | US$ 97,50 ao titular + US$ 2,50 ao caixa operacional, se a taxa for deduzida da retirada com autorização. |
| Envio de BETTEX a outra carteira | Quantidade autorizada de BETTEX ao destinatário + taxa separada de US$ 2,50 liquidada em USDC. |

Os exemplos não incluem retenções obrigatórias nem custos externos. A apresentação final deve informar valor solicitado, taxa, demais encargos aplicáveis e líquido antes da autorização. Não executar com saldo insuficiente nem criar uma compra automática ou dívida de taxa não autorizada. Não instituímos um novo mínimo arbitrário de saque: o líquido e a disponibilidade precisam ser viáveis.

Cada operação tem identificador e efeito único. Uma tentativa ou consulta não é um novo serviço concluído. Falha, execução incerta e correção precisam de conciliação; não duplicar tarifa na repetição, cancelar créditos válidos ou prometer devolução antes de saber o que foi executado.

## 2. Receita: contar operações, não multiplicar usuários sem hipótese

**Receita bruta de serviços = 2,50 × (compras primárias tarifadas + saques tarifados de USDC + envios tarifados de BETTEX).**

| Cenário mensal ilustrativo | Compras | Saques USDC | Envios BETTEX | Receita bruta |
|---|---:|---:|---:|---:|
| Dez mil saques apenas | 0 | 10.000 | 0 | US$ 25.000 |
| Dez mil compras e dez mil saques | 10.000 | 10.000 | 0 | US$ 50.000 |
| Combinação para US$ 30 mil | 5.000 | 5.000 | 2.000 | US$ 30.000 |
| Combinação para US$ 40 mil | 6.000 | 8.000 | 2.000 | US$ 40.000 |
| Atividade menor | 1.000 | 2.000 | 500 | US$ 8.750 |

São hipóteses de volume, não previsões de demanda comprovada. A primeira compra não volta a gerar receita todo mês sem uma nova operação. Usuários ativos mensais, usuários que sacam e número de saques são métricas distintas.

Com 10 mil usuários ativos mensais, uma hipótese de 10% sacando uma vez em cada um de 20 dias gera **20 mil saques**, ou US$ 50 mil brutos. Com 1% nessa mesma frequência, são 2 mil saques e US$ 5 mil. Isso só é plausível se existirem rendimentos, saldo e disposição suficientes para pagar cada tarifa.

A taxa pode incentivar acúmulo, mas não comprova a frequência futura. Manter cenários mensais, semanais e diários. Não projetar a base final como presente desde o primeiro mês.

### Peso da tarifa no saque

| Valor solicitado | Tarifa | Peso da tarifa | Líquido antes de outros encargos |
|---|---:|---:|---:|
| US$ 5 | US$ 2,50 | 50% | US$ 2,50 |
| US$ 10 | US$ 2,50 | 25% | US$ 7,50 |
| US$ 25 | US$ 2,50 | 10% | US$ 22,50 |
| US$ 50 | US$ 2,50 | 5% | US$ 47,50 |
| US$ 100 | US$ 2,50 | 2,5% | US$ 97,50 |

Essa diferença deve aparecer claramente para o usuário. Não bloquear direitos existentes para forçar acúmulo nem prometer que todos aceitarão pagar.

## 3. Quatro controles de dinheiro na mesma entidade

| Controle | Origem/destino | Limite |
|---|---|---|
| **Caixa operacional** | Receitas de serviços em USDC e financiamento operacional aprovado; paga despesas da entidade. | Não é carteira pessoal do fundador. |
| **Provisões fiscais e trabalhistas** | Parcela identificada do caixa para obrigações da entidade, encargos e retenções. | Valor reservado não é lucro livre. Separação interna não elimina a obrigação legal. |
| **Tesouraria de investimentos** | Recursos de venda pública destinados a investimentos, reservas e obrigações do programa. | Preservar 100% dos recursos da venda pública nessa finalidade; não cobrir automaticamente déficit de salários. |
| **Créditos dos participantes** | USDC devido após split autorizado e obrigações individualizadas. | Não financiar a empresa com créditos já reconhecidos. |

O recebimento de uma compra deve identificar separadamente preço do ativo e tarifa. Exemplo: entrada conjunta de US$ 102,50 não permite registrar US$ 102,50 como caixa operacional nem enviar tudo à tesouraria. Cada destinação deve ser conciliada.

Carteiras e contas separadas organizam controles, mas não são pessoas jurídicas distintas nem blindagem patrimonial automática. Contabilidade e contratos devem reconhecer as obrigações da mesma sociedade.

## 4. Como administrar pagamentos

O fundador administra o orçamento e as decisões, com poderes documentados. Propõe-se um ciclo:

1. Identificar documento, beneficiário, serviço, moeda e categoria da despesa.
2. Conferir contrato, valor, vencimento, tributos e disponibilidade.
3. Autorizar pagamento conforme alçada registrada; transação com o próprio fundador deve ser identificada como parte relacionada.
4. Registrar reserva ou compromisso para evitar usar o mesmo dinheiro duas vezes.
5. Executar e conciliar confirmação, valor efetivo, custos e eventual diferença cambial.
6. Arquivar comprovante e atualizar obrigação/saldo uma única vez.

O fundador não deve ser tratado como automaticamente autorizado a retirar todo saldo institucional. Prestadores contábeis e verificações adicionais não mudam sua condição de administrador nem exigem uma segunda empresa própria.

### Orçamento mensal a fechar

| Categoria | Conteúdo |
|---|---|
| Pessoas | Remuneração do administrador, salários, prestadores e encargos. |
| Tecnologia | Desenvolvimento, manutenção, hospedagem, IA, dados, monitoramento e suporte. |
| Segurança | Revisões, proteção de chaves, auditorias e resposta a incidentes. |
| Institucional | Contabilidade, jurídico, sede/agente quando exigido, licenças e relatórios. |
| Financeiro | Rede, bancos, conversão de USDC, execução de pagamentos e custos por operação efetivamente suportados pela empresa. |
| Comercial | Marketing e aquisição de usuários, apenas se aprovados. |
| Tributos | Obrigações sobre serviços, folha, lucros, ativos e pagamentos conforme a regra aplicável. |
| Compromissos | Parcelas vencendo, juros e devolução de financiamento, distinguindo despesas de amortização de principal. |

O criador definiu **US$ 50 mil mensais como cenário equilibrado de custo total**, com referência superior de US$ 75 mil. O plano-base abaixo propõe uma distribuição para feedback: quatro salários, fundador zero, fornecedores, encargos, variáveis e provisão fiscal. Não é orçamento contratado ou tributação validada. O orçamento anterior a preencher e os alvos agregados permanecem como cenários separados; não somar os modelos ou cobrar provisões duas vezes.

## 5. Impostos: reservar, registrar e recolher

Sem país, regime e localização das pessoas definidos, não é possível afirmar alíquotas, isenção ou forma de remuneração. A operação em USDC não elimina tributação, folha ou comprovação de origem.

O contador local deve mapear: tributos sobre serviços; tributação do resultado da entidade; encargos/remuneração; resultados da tesouraria; retenções dos beneficiários; pagamentos transfronteiriços; e operações de conversão/alienação de ativos. A venda do token não deve ser automaticamente registrada como lucro livre sem validar sua natureza e obrigações.

**Fluxo proposto:** registrar a receita integral do serviço; reconhecer a obrigação fiscal pertinente; separar a provisão; controlar vencimentos; converter o necessário para a moeda aceita pelo fisco; pagar; conciliar; e baixar a obrigação. Diferenças e restituições fiscais exigem registro próprio.

A antiga hipótese de metas líquidas de 1%/2% e gross-up percentual não deve ser aplicada para transformar a tarifa confirmada em um preço variável. Não acrescentar automaticamente uma cobrança fiscal institucional sobre os US$ 2,50. O orçamento deve mostrar o impacto dos tributos na receita disponível. Retenções legais do rendimento do titular, quando devidas, são outra obrigação e precisam de base validada e informação própria.

Custos/tributos da tesouraria seguem a apuração antes do lucro elegível e do split; obrigações relacionadas aos serviços devem ter sua fonte identificada no caixa operacional. Não financiar o mesmo tributo duas vezes nem classificar todo imposto da empresa como imposto pessoal do usuário.

## 6. Equipe, remuneração e concessões do fundador

**O fundador não recebe salário, conforme a definição mais recente do criador, pois já tem sua alocação originária de tokens.** Isso não presume rendimento mensal dos tokens nem uma nova concessão. Validar o vínculo e as obrigações da administração sem salário na jurisdição escolhida. Os quatro colaboradores da proposta têm remuneração por trabalho, distinta de dividendos e concessões.

O orçamento deve incluir valor bruto, descontos pessoais, encargos da entidade, líquido, datas e moeda legal de pagamento. Pagamento em USDC não será presumido permitido para todo empregado ou país; quando necessário, converter para a moeda contratual.

As remunerações serão formalizadas conforme contratos e regras aplicáveis. A distribuição inicial proposta inclui o fundador no teto de cinco e reúne conteúdo/comunidade: fundador zero, conteúdo/comunidade US$ 4 mil, dev US$ 7 mil, trader US$ 5 mil e legal US$ 4 mil brutos/mês. Os US$ 20 mil de salários e US$ 4 mil de encargos hipotéticos são premissas para feedback, não contratação, pesquisa salarial ou alíquotas confirmadas. Não foram definidos percentuais de participação societária.

**As quatro posições remuneradas têm as taxas como fonte recorrente pretendida.** Na fase inicial, precisam de caixa operacional financiado e aprovado. Financiamento não equivale a geração de taxas. IA, dados, treinamento, ferramentas de suporte e fornecedores por escopo compõem o orçamento, sem criar pessoas adicionais disfarçadas ou retirar responsabilidade humana.

**Tokens são concessões individuais da parcela pessoal do fundador**, sem divisão automática dos 20%, quarta alocação ou emissão adicional. Entrega respeita tokens liberados e disponíveis no vesting; cada beneficiário, quantidade e condição tem registro próprio. O fundador conserva sua alocação originária, sem receber outra por ser administrador. Concessões não substituem salários nem geram ações; transferências pessoais não integram o multisig empresarial.

Salários e encargos vencidos são obrigações. A falta de receita exige ajuste de contratação, redução de gastos futuros permitida ou financiamento aprovado; não desaparece a dívida nem autoriza tomar o USDC dos participantes.

## 7. Lucro operacional, dividendos e antecipação

Há três conceitos distintos:

- **Receita bruta:** tarifas dos serviços, antes de custos e tributos.
- **Resultado operacional:** receita menos despesas/custos e tributos conforme a apuração contábil.
- **Caixa disponível:** dinheiro conciliado menos obrigações, compromissos e reservas; pode diferir do resultado contábil.

A receita de serviços fica fora do rateio de investimentos de 75%/25%. Seu eventual lucro pode ser objeto de destinação societária depois de apurado, observando a legislação, as participações societárias e a disponibilidade. Isso não transforma todos os tokens do fundador em ações nem transfere automaticamente os 75% da tesouraria para ele.

### Proposta de condições para distribuir ou antecipar lucro

1. Existir lucro **já apurado**, com balanço/balancete e base contábil adequada.
2. A legislação permitir a modalidade e o ato societário exigido estar registrado.
3. Estarem reconhecidos os tributos, salários, credores e créditos dos participantes.
4. Haver caixa operacional suficiente sem invadir a tesouraria vinculada ou recursos de terceiros.
5. Preservar a reserva operacional aprovada, inclusive obrigações futuras conhecidas.
6. Identificar beneficiário, participação, valor, competência e registro contábil.
7. Reconciliar com a apuração final e tratar ajustes/restituições quando devidos.

**Receita futura projetada não é lucro antecipável por si só.** Retirar dinheiro antes dessas condições não deve ser chamado de dividendo: pode exigir outro instrumento, tratamento contábil e aprovação. Não aprovar empréstimo ao fundador ou uso pessoal disfarçado de salário nesta estrutura.

## 8. Financiamento até a receita sustentar a entidade

Já existe uma fonte no desenho aprovado: **50% dos aportes ligados à parcela de investidores destinam-se a capital inicial/desenvolvimento; os outros 50% à tesouraria**. Preservar essa divisão, os direitos e o vesting. Não aplicar esse split aos recursos da venda pública.

Outras modalidades podem ser avaliadas, sem contratação ou mudança automática:

| Modalidade | Efeito e condições |
|---|---|
| Aporte de capital de sócio | Exige atos societários, integralização, origem e direitos claros; não é receita de taxas nem devolução automática. |
| Empréstimo de sócio/fundador | Passivo documentado, com moeda, prazo, juros se houver e condições aprovadas. Principal devolvido não é dividendo nem despesa operacional; juros têm tratamento próprio. |
| Crédito de terceiro | Avaliar custo, garantias, vencimentos, elegibilidade e impacto na liquidez. Não comprometer ativos vinculados sem análise e autorização. |
| Contratação por etapas | Priorizar itens indispensáveis e contratar de acordo com o caixa, respeitando obrigações já assumidas. |

Não presumir disponibilidade de novos aportes ou empréstimos. Separar o financiamento da entidade de uma eventual oferta pública adicional, que pode criar novas exigências.

**Necessidade de financiamento = despesas de implantação + maior déficit acumulado do plano + reserva operacional pretendida**, considerando o caixa inicial, as entradas aprovadas e o calendário real, sem somar novamente custos que já estejam no déficit.

Uma reserva equivalente a três meses de despesas é uma **hipótese de planejamento**, não decisão aprovada. Com orçamento ilustrativo de US$ 20 mil/mês, a referência seria US$ 60 mil, além de itens iniciais e déficits não cobertos. Essa reserva é distinta da reserva defensiva de 50% da tesouraria.

Se a entidade gastar US$ 20 mil e arrecadar US$ 8.750 de taxas, o déficit preliminar será US$ 11.250, antes de diferenças fiscais, variáveis e outras obrigações. Deve ser financiado por fonte aprovada ou reduzido por ações reais; não coberto automaticamente pelos investimentos.

## 9. Equilíbrio e capacidade de sustentar a operação

Com o custo total planejado e sem encargos adicionais fora dele, o piso aritmético de tarifas é:

| Orçamento mensal planejado | Operações de US$ 2,50 para cobrir o valor |
|---|---:|
| US$ 50.000 — cenário equilibrado | 20.000/mês; média 666,67/dia em 30 dias |
| US$ 75.000 — referência superior de custo | 30.000/mês; 1.000/dia em 30 dias |

O total de US$ 50 mil já inclui US$ 42 mil fixos, US$ 3 mil variáveis e US$ 5 mil de provisão no piso de 20 mil operações. A comparação de US$ 75 mil escala os fixos pela razão 75/50: US$ 63 mil fixos, US$ 4,5 mil variáveis e US$ 7,5 mil de provisão em 30 mil operações; não é outro orçamento aprovado. Sensibilidades preservam os fixos: acrescentar US$ 0,15/operação além do custo-base reduz a contribuição de US$ 2,10 para **US$ 1,95**, exigindo **21.539 operações**. Acrescentar também 10 pontos percentuais de provisão sobre a receita reduz a contribuição para **US$ 1,70**, exigindo **24.706 operações**. Não reutilizar todo o total de US$ 50 mil como se fosse fixo, nem recalibrar os fixos quando salários ou variáveis mudarem para esconder estouro da meta. Encargos são hipóteses, não valores ou alíquotas confirmados.

**Volume financeiro não é receita operacional.** Com 20 mil compras primárias e ticket médio de 50, 100 ou 200 USDC, entram respectivamente 1, 2 ou 4 milhões USDC na tesouraria, mais 50 mil USDC em tarifas no caixa operacional. O ticket é o preço dos tokens na compra, não uma cotação por token; a tarifa é adicional. Hipótese USDC/dólar 1:1 apenas na projeção.

**Saques diários:** 667 pessoas sacando uma vez por dia por 30 dias produzem 20.010 saques e US$ 50.025 brutos. Com exatamente 20 mil saques de 10 USDC, o solicitado soma 200 mil USDC, incluindo 50 mil em tarifas e 150 mil líquidos antes de outros encargos. Sem créditos anteriores nem retenções pessoais, o split de 25% exige ao menos 800 mil USDC de lucro elegível para criar esses créditos, sujeito às reservas e demais condições. Sem saldo disponível não há saque; sem operação efetiva não há tarifa.

Alternativamente, 5 mil pessoas fazendo quatro operações tarifadas no mês ou 10 mil fazendo duas alcançam 20 mil operações. Isso não converte automaticamente holders ou ativos diários em usuários pagantes. Envios BETTEX contam como operações tarifadas, mas não como nova captação de principal em USDC. Captação ou financiamento cobrem caixa temporariamente; não são receita de serviços nem o ponto de equilíbrio recorrente.

Se a captação mencionada de US$ 75 mil representar preço dos tokens vendidos no mês, com ticket médio ilustrativo de 100 USDC, serão 750 compras e US$ 1.875 em tarifas adicionais — apenas 3,75% do custo de US$ 50 mil. Faltariam 19.250 operações tarifadas para completar a cobertura bruta. Não confundir esse exemplo condicional de captação com a referência superior de US$ 75 mil de custo.

Portanto, dez mil saques são um motor potencial de US$ 25 mil **brutos**, não prova de que a entidade está sustentada. Sustentação exige custos, frequência de operações, capacidade de pagamento, tributos e liquidez verificados.

### Plano-base de lançamento e horizonte de equilíbrio

A proposta detalhada usa US$ 42 mil fixos por mês: salários 20 mil, encargos hipotéticos 4 mil, marketing 6 mil, IA/dados 2,5 mil, infraestrutura 1 mil, segurança recorrente 2,5 mil, outsourcing técnico 2,5 mil, contabilidade/assessoria local 1,5 mil, atendimento/localização 1 mil e administração/pagamentos 1 mil. Custos variáveis de US$ 0,15/operação e provisão gerencial de 10% sobre receita de serviços completam US$ 50 mil em 20 mil operações. Essa provisão não é alíquota confirmada; não aplicar novamente como encargo extra fora do orçamento.

Contribuição = 2,50 × (1 − 10%) − 0,15 = US$ 2,10; equilíbrio = 42.000/2,10 = 20.000 operações. A rampa proposta é 0, 0, 1.500, 3.000, 5.000, 8.000, 12.000, 16.000, 20.000, 24.000, 28.000 e 32.000 operações/mês. Preparação nos meses 1–2, piloto condicionado no mês 3, validação nos meses 4–6 e expansão condicionada nos meses 7–12. Atinge cobertura mensal no mês 9 apenas se os volumes, custos e liquidação ocorrerem; não significa recuperar a implantação ou os déficits anteriores.

Implantação pontual proposta: US$ 45 mil (auditoria inicial 20 mil; constituição/validação 10 mil; especialistas/testes 10 mil; materiais/localização 5 mil), separada das despesas recorrentes. O déficit máximo acumulado é US$ 285.450, incluindo implantação; somando três meses de fixos como reserva de caixa (US$ 126 mil), o financiamento operacional inicial desta hipótese é **US$ 411.450**. O resultado de caixa do ano é **−US$ 235.050**. Não descontar novamente a reserva como despesa. Se exclusivamente aportes vinculados aos investidores com split 50%/50% financiarem esse caixa, seriam US$ 822.900 de aporte total — hipótese, não captação aprovada.

O mix hipotético é 20% compras, 75% saques e 5% envios, com tickets de 100 USDC por compra e 10 USDC por saque solicitado. No equilíbrio, 15 mil saques exigem 150 mil USDC disponíveis; sem créditos anteriores ou retenções pessoais, gerar esses créditos exige pelo menos 600 mil USDC de lucro elegível pelo split de 25%. Isso não é previsão de retorno. Sem créditos e operações reais, não existe essa receita de saques. Cenários antigos de metas são comparações independentes, não receitas adicionais desta rampa.

Serviços Pro, IA ou B2B ainda não aprovados não entram no faturamento-base. Medir aquisição, retenção, operações reais, chamados, resolução correta por IA, tempo humano, incidentes, custo de inferência, caixa e capacidade antes de expandir. O calendário é relativo à implantação; não altera automaticamente o Roadmap ou o vesting.

### Distinções necessárias para interpretar o plano

- **Caixa livre:** os resultados e déficits acima representam variação disponível após separar provisões, antes dos aportes; não saldo bancário bruto ou lucro distribuível. Recolhimento de tributo já reservado baixa obrigação/reserva sem deduzir o mesmo valor novamente do livre. Diferenças e vencimentos devem ser conciliados. O financiamento é hipótese mensal, não prova de cobertura de atrasos, picos intramês ou juros/amortização de empréstimo ainda não contratado.
- **Saques:** 600 mil USDC é piso agregado extremo: pressupõe que 100% do rateio de 25% se torne crédito disponível aos sacadores, sem retenções/créditos anteriores. Com fração q do peso elegível, o requisito é solicitado /(25% × q). Usuários não determinam q; reservas, liquidação e saldo individual continuam obrigatórios.
- **Aquisição:** a rampa contém 29.900 operações de compra no ano, incluindo possíveis recompras, e termina em 24 mil MAU. Não demonstra 100 mil holders nem 5 mil DAU; não somar receitas dos cenários comparativos ou confundir operações com pessoas.
- **Estoque:** tickets em USDC não determinam quantidade de BETTEX. Sem preço e estoque liberado/disponível por mês, os volumes de compras permanecem condicionais; não constituem comprovação de capacidade de venda.
- **Atendimento:** o cálculo de 48 horas no mês 12 cobre somente escalonamentos da hipótese de 3 chamados/100 MAU, 60% corretamente automatizados e 10 minutos/caso. Não quantifica interessados sem conta, revisão de respostas automáticas, reaberturas, picos, ausências ou especialistas. Zero MAU na preparação não é zero trabalho. O teto teórico de 30 mil MAU não comprova cobertura global.
- **Coerência editável:** planilha e site preservam os custos fixos reais propostos quando salários, variáveis ou provisões mudam. O equilíbrio é calculado, não etiqueta permanente do mês 9. Dados incompletos/negativos, mix impossível ou operações com MAU zero impedem a rampa de produzir financiamento aparentemente válido. Verificação numérica não valida contratação, preços, tributos ou permissões.

## 10. Fechamento e indicadores

**Diariamente:** conciliar operações concluídas, tarifas, estornos/correções, carteiras, contas e obrigações; separar recebimento real de projeção.

**Mensalmente:** fechar receitas por serviço, orçamento realizado, folha, tributos, compromissos, empréstimos e saldo livre; produzir demonstrações adequadas e atualizar o plano de financiamento.

**Antes de qualquer retirada dos sócios:** verificar lucro apurado, rito legal, caixa, obrigações e reservas. O fundador administra, mas administração não se confunde com propriedade irrestrita do dinheiro.

Indicadores: compras tarifadas, saques, envios, usuários sacadores únicos, frequência por sacador, receita por serviço, custos por operação, margem, gastos fixos, provisões, déficit, saldo livre e meses de cobertura. Não utilizar volume de investimentos ou lucro ainda não realizado como receita de serviços.

## Entregáveis e alcance

- [Base da entidade](bettex-base-da-entidade.md): responsabilidades, governo e preparação do registro.
- `bettex-caixa-operacional.xlsx`: tarifas confirmadas, cenários, metas, cinco posições da equipe, concessões individuais, orçamento e plano mensal editável. Remunerações individuais alimentam o orçamento uma única vez; financiamento não é confundido com cobertura recorrente pelas taxas. Campos fiscais, custos e concessões sem informação são sinalizados, não presumidos zero.

Este documento distingue **decisões confirmadas** de **propostas de controles/planejamento**. Não constitui parecer tributário, autorização de distribuição ou contratação. A jurisdição segue aberta. A documentação e a planilha foram alinhadas; na homepage, apenas erros conceituais e seus exemplos são corrigidos, preservando o copy e o layout restantes. A prévia continua ilustrativa, sem implementação de cobranças, transferências, queima, captação ou contratação.