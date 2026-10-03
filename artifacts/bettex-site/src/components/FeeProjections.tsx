import { DocFacts } from '@/components/DocFacts';
import { feeProjections, purchaseFeeUsd, withdrawalFeeUsd, transferFeeUsd } from '@/lib/fee-projections';

import { distributionRemainderProjectionRule } from '@/lib/staking-rounding-policy';

const count = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const money = (n: number) => `US$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const usdc = (n: number) => `${count(n)} USDC`;
const percent = (n: number) => `${(n * 100).toLocaleString('pt-BR')}%`;
type Scenario = typeof feeProjections[number];

function ScenarioTable({ caption, rows }: {
  caption: string; rows: { label: string; value: (s: Scenario) => string }[];
}) {
  return <div className="whitepaper__vesting-scroll whitepaper__projection-table" role="region" aria-label={caption} tabIndex={0}>
    <table className="whitepaper__vesting-table"><caption>{caption}</caption>
      <thead><tr><th scope="col">Indicador</th>{feeProjections.map(s => <th scope="col" key={s.name}>{s.name}</th>)}</tr></thead>
      <tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th>{feeProjections.map(s => <td key={s.name}>{row.value(s)}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

export function FeeProjections() {
  const reference = feeProjections[0];
  return <section id="documentacao-projecoes-taxas" aria-labelledby="projecoes-taxas-title">
      <h3 id="projecoes-taxas-title" className="whitepaper__subhead">Projeção por operações: primeiro ano</h3>
    <DocFacts title="Metas de população, distintas do volume de operações" facts={[
      { label: 'HOLDERS AO FINAL DO ANO', value: count(reference.targetHolders), text: 'Meta do criador; não número de sacadores.' },
      { label: 'ATIVOS DIÁRIOS NA META', value: count(reference.targetDailyActiveUsers), text: `${percent(reference.activeShareOfHolders)} da meta de holders.` },
      { label: 'PROJEÇÃO AMPLA', value: count(reference.projectedUsers), text: '1% corresponde a 10 mil ativos diários no cenário alternativo.' },
    ]} />
    <div className="whitepaper__prose">
      <p>As metas de 100 mil holders e pelo menos 5 mil ativos diários não comprovam compras ou saques. O modelo ilustrativo cresce linearmente desde zero em 12 meses, usando uma coorte estável simplificada; a média de ativos é metade da meta final. Ativos diários não são usuários mensais únicos.</p>
      <p>As hipóteses mantêm primeira compra de 200 USDC, 20% dos ativos realizando uma compra adicional por mês de 100 USDC e 40% sacando 3 USDC em cada um de 30 dias. Esses são valores de comparação, não comportamento comprovado. Envios são parametrizados e têm hipótese inicial explícita de zero, não ausência comprovada de atividade.</p>
      <p>Tarifas fixas: compra {money(purchaseFeeUsd)}, saque {money(withdrawalFeeUsd)} e envio {money(transferFeeUsd)}. A receita depende do número de operações. Tickets determinam capital movimentado e capacidade de saque, não o preço do serviço. Os exemplos assumem USDC/dólar 1:1 apenas para projeção.</p>
    </div>
    <ScenarioTable caption="População, frequência e operações médias" rows={[
      { label: 'Holders finais', value: s => count(s.targetHolders) },
      { label: 'Ativos diários finais', value: s => count(s.targetDailyActiveUsers) },
      { label: 'Média de ativos diários no crescimento linear', value: s => count(s.activeUsers) },
      { label: 'Primeiros compradores primários no ano', value: s => count(s.annualNewBuyers) },
      { label: 'Compras adicionais por comprador/mês', value: s => count(s.repeatPurchasesPerBuyerPerMonth) },
      { label: 'Compras adicionais médias/mês', value: s => count(s.repeatPurchaseCount) },
      { label: 'Dias de saque por pessoa/mês', value: s => count(s.withdrawalDays) },
      { label: 'Saques médios/mês', value: s => count(s.withdrawalCount) },
      { label: 'Envios BETTEX médios/mês', value: s => count(s.transferCount) },
      { label: 'Valor solicitado por saque', value: s => usdc(s.dailyWithdrawal) },
      { label: 'Líquido por saque antes de outros encargos', value: s => usdc(s.netWithdrawalPerOperation) },
    ]} />
    <DocFacts title="Receita bruta de serviços nas hipóteses acima" facts={[
      { label: 'PRIMEIRAS COMPRAS NO ANO', value: money(reference.acquisitionFees), text: `${count(reference.annualNewBuyers)} operações × ${money(purchaseFeeUsd)}.` },
      { label: 'RECEITA BRUTA NO ANO', value: money(reference.annualFees), text: 'Aquisição + compras adicionais + saques + envios.' },
      { label: 'MÉDIA MENSAL DO ANO', value: money(reference.monthlyFees), text: 'Não é receita constante desde o primeiro mês nem lucro líquido.' },
    ]} />
    <ScenarioTable caption="Receita bruta, antes de custos e tributos" rows={[
      { label: 'Primeiras compras: receita anual', value: s => money(s.acquisitionFees) },
      { label: 'Compras adicionais: receita anual', value: s => money(s.repeatPurchaseCount * purchaseFeeUsd * 12) },
      { label: 'Saques: receita anual', value: s => money(s.withdrawalFees * 12) },
      { label: 'Envios: receita anual', value: s => money(s.transferFees * 12) },
      { label: 'Total bruto no ano', value: s => money(s.annualFees) },
      { label: 'Média mensal do ano', value: s => money(s.monthlyFees) },
      { label: 'Recorrência mensal sem aquisição anual', value: s => money(s.recurringMonthlyFees) },
      { label: 'Recorrência após atingir a meta final', value: s => money(s.yearEndRecurringMonthlyFees) },
    ]} />
    <div className="whitepaper__prose">
      <p><strong>Receita = compras tarifadas × US$ 2,50 + saques tarifados × US$ 2,50 + envios tarifados × US$ 2,50.</strong> Primeira compra entra uma vez; titular que recebeu tokens por transferência ou revenda externa não é automaticamente comprador primário. Cada compra adicional tem contagem própria.</p>
      <p>Trinta saques de 3 USDC geram 75 USDC de tarifas e deixam 15 USDC líquidos no total, antes de outros encargos. Um saque de 90 USDC gera 2,50 USDC de tarifa e deixa 87,50 USDC. A tarifa fixa altera o peso da frequência; considerar também cenários semanais e mensais, sem presumir mudança garantida de hábitos.</p>
    </div>
    <ScenarioTable caption="Créditos necessários para os saques, sem créditos anteriores" rows={[
      { label: 'Saques solicitados por dia ativo', value: s => usdc(s.dailyWithdrawalVolume) },
      { label: 'Piso elegível/dia após tributos da tesouraria', value: s => usdc(s.minimumDailyEligibleProfit) },
      { label: 'Piso elegível/mês após tributos da tesouraria', value: s => usdc(s.minimumEligibleProfit) },
    ]} />
    <div className="whitepaper__prose">
      <p>O valor solicitado já inclui a tarifa deduzida; não somá-la novamente ao crédito necessário. Os pisos agregados usam saques solicitados ÷ 25%, sem créditos anteriores ou retenções individuais, supondo que 100% do rateio esteja disponível aos sacadores. Se o grupo tiver fração q do peso elegível, o requisito é saques solicitados ÷ (25% × q). Não inferir q da quantidade de ativos ou holders. Retenções exigem incluir o tributo correspondente; reservas, liquidação e saldo individual precisam ser atendidos. O mesmo crédito não financia dois saques.</p>
      <p>{distributionRemainderProjectionRule}</p>
      <p>A receita de serviços fica fora do split de investimentos. Custo, orçamento e perfil fiscal precisam de apuração antes de apresentar lucro disponível. Conferir estoque e vesting para a aquisição primária; não extrapolar compras indefinidamente após esgotamento do estoque.</p>
      <p><a href={`${import.meta.env.BASE_URL}downloads/bettex-taxas-fundacao.xlsx`} download>Baixar a planilha atual de tarifas, metas e caixa operacional</a></p>
    </div>
  </section>;
}