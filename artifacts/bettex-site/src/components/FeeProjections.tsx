import { DocFacts, DocGroup } from '@/components/DocFacts';
import { feeProjections, purchaseRate, withdrawalRate } from '@/lib/fee-projections';

const count = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const money = (n: number) => `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
const percent = (n: number) => `${(n * 100).toLocaleString('pt-BR')}%`;
type Scenario = typeof feeProjections[number];

function ScenarioTable({ caption, rows }: {
  caption: string; rows: { label: string; value: (s: Scenario) => string }[];
}) {
  return (
    <div className="whitepaper__vesting-scroll whitepaper__projection-table" role="region" aria-label={caption} tabIndex={0}>
      <table className="whitepaper__vesting-table">
        <caption>{caption}</caption>
        <thead><tr><th scope="col">Indicador</th>{feeProjections.map(s => <th scope="col" key={s.name}>{s.name}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th>{feeProjections.map(s => <td key={s.name}>{row.value(s)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function FeeProjections() {
  const reference = feeProjections[0];
  return (
    <section id="documentacao-projecoes-taxas" aria-labelledby="projecoes-taxas-title">
      <h4 id="projecoes-taxas-title" className="whitepaper__subhead">Projeção do ano 1: 100 mil holders e 5 mil ativos diários</h4>
      <DocFacts title="Meta mínima do primeiro ano definida pelo criador" cols={3} facts={[
        { label: 'HOLDERS AO FINAL DO ANO', value: count(reference.targetHolders), text: 'Base de titulares, não quantidade de sacadores diários.' },
        { label: 'ATIVOS DIÁRIOS NA META', value: count(reference.targetDailyActiveUsers), text: `${percent(reference.activeShareOfHolders)} dos 100 mil holders.` },
        { label: 'PROJEÇÃO AMPLA DE USUÁRIOS', value: count(reference.projectedUsers), text: '1% dessa projeção corresponde a 10 mil ativos diários, no cenário separado.' },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>A meta do primeiro ano é 100.000 holders com pelo menos 5.000 usuários ativos por dia.</strong> O cenário alternativo usa 10.000 ativos por dia, equivalentes a 1% da projeção ampla de 1 milhão de usuários. Essa projeção ampla não significa 1 milhão de holders ou compradores do pool. Os dois cenários mantêm a meta de 100 mil holders; não confundem cadastros, titulares, atividade e saques.</p>
        <p><strong>Metas e hipóteses são separadas.</strong> Para calcular o ano, esta simulação parte de zero holders e zero ativos e cresce linearmente até a meta em 12 meses. Por isso, a média de ativos do ano é metade da meta final, não 5.000 pessoas ativas desde o primeiro dia. Os tickets de 200 USDC na primeira compra, 100 USDC em compras adicionais mensais, 3 USDC por saque diário, adesão de 20% às recompras e 40% aos saques são hipóteses de comportamento mantidas para comparação, não valores fornecidos pelo criador.</p>
        <p>A hipótese de aquisição considera 100% dos novos holders fazendo uma primeira compra no pool do projeto. <strong>Ser holder não gera essa taxa automaticamente:</strong> recebimento por transferência ou compra externa não é compra tributável pelo aplicativo. A participação de compradores do pool é editável na planilha. Essa receita de aquisição é contabilizada uma vez no ano, sem repetir a primeira compra a cada mês.</p>
      </div>
      <ScenarioTable caption="Metas de população e hipóteses de comportamento" rows={[
        { label: 'Projeção ampla de usuários', value: s => count(s.projectedUsers) },
        { label: 'Meta de holders ao final do ano', value: s => count(s.targetHolders) },
        { label: 'Ativos diários ao final do ano', value: s => count(s.targetDailyActiveUsers) },
        { label: 'Ativos finais / holders', value: s => percent(s.activeShareOfHolders) },
        { label: 'Ativos finais / projeção de usuários', value: s => percent(s.activeShareOfProjection) },
        { label: 'Média de ativos diários no ano linear', value: s => count(s.activeUsers) },
        { label: 'Primeiros compradores do pool no ano', value: s => count(s.annualNewBuyers) },
        { label: 'Ticket da primeira compra', value: s => money(s.firstPurchase) },
        { label: 'Parcela dos ativos que recompra', value: s => percent(s.repeatBuyerShare) },
        { label: 'Compras adicionais por comprador/mês', value: s => money(s.monthlyRepeatPurchase) },
        { label: 'Parcela dos ativos que saca diariamente', value: s => percent(s.withdrawerShare) },
        { label: 'Ticket por saque diário', value: s => money(s.dailyWithdrawal) },
        { label: 'Dias com saque por pessoa/mês', value: s => count(s.withdrawalDays) },
      ]} />
      <DocFacts title="Resultado do ano 1 nas hipóteses acima, líquido-alvo de tributos" cols={3} facts={[
        { label: 'PRIMEIRAS COMPRAS NO ANO', value: money(reference.acquisitionFees), text: `${count(reference.annualNewBuyers)} compras × ${money(reference.firstPurchase)} × ${percent(purchaseRate)}.` },
        { label: 'ALVO TOTAL DO ANO', value: money(reference.annualFees), text: 'Aquisição + recompras + saques, com crescimento linear.' },
        { label: 'MÉDIA MENSAL DO ANO', value: money(reference.monthlyFees), text: 'Total anual dividido por 12; não receita constante em todos os meses.' },
      ]} />
      <ScenarioTable caption="Alvos líquidos de tributos, antes de demais despesas; equivalentes nominais em USDC" rows={[
        { label: 'Aquisição: alvo líquido no ano · 1%', value: s => money(s.acquisitionFees) },
        { label: 'Recompras: alvo anual · 1%', value: s => money(s.repeatPurchaseVolume * purchaseRate * 12) },
        { label: 'Saques: alvo anual · 2%', value: s => money(s.withdrawalFees * 12) },
        { label: 'Total líquido-alvo no primeiro ano', value: s => money(s.annualFees) },
        { label: 'Média mensal incluindo aquisição', value: s => money(s.monthlyFees) },
        { label: 'Média mensal recorrente, sem aquisição', value: s => money(s.recurringMonthlyFees) },
        { label: 'Recorrente mensal com a atividade final', value: s => money(s.yearEndRecurringMonthlyFees) },
        { label: 'Média de saques concluídos por mês', value: s => count(s.withdrawalCount) },
        { label: 'Média de volume sacado por mês', value: s => money(s.withdrawalVolume) },
      ]} />
      <DocGroup title="Como os valores são calculados">
        <div className="whitepaper__prose">
          <p><strong>Aquisição anual = novos holders × parcela que compra no pool × ticket inicial × 1%.</strong> Recompras usam a média temporal dos ativos × adesão × ticket adicional × 12 meses × 1%. Saques usam média dos ativos × adesão diária × ticket diário × dias com saque × 12 meses × 2%. Somar esses três componentes uma única vez. Um primeiro comprador pode também recomprar e sacar; a primeira compra não entra novamente como recompra.</p>
          <p>Na meta mínima, aquisição contribui com {money(reference.acquisitionFees)}, recompras com {money(reference.repeatPurchaseVolume * purchaseRate * 12)} e saques com {money(reference.withdrawalFees * 12)} no ano: total de <strong>{money(reference.annualFees)}</strong>. Depois de atingir 5 mil ativos diários, as mesmas hipóteses geram {money(reference.yearEndRecurringMonthlyFees)} recorrentes por mês, sem novas primeiras compras presumidas. A média do ano inclui crescimento e aquisição e não deve ser confundida com esse valor recorrente.</p>
          <p>1% na compra e 2% no saque são receita líquida-alvo de tributos. O total cobrado inclui cobertura fiscal validada, não é igual aos alvos desta seção. A aba Cobertura fiscal separa alvo, provisão e total. Valores recebidos são em BETTEX; caixa usa conversões efetivas. Não financiar novamente pela tesouraria ou pagamentos um imposto já coberto na cobrança.</p>
        </div>
      </DocGroup>
      <ScenarioTable caption="Créditos necessários para os saques médios, sem créditos anteriores" rows={[
        { label: 'Volume médio de saque por dia ativo', value: s => money(s.dailyWithdrawalVolume) },
        { label: 'Piso líquido elegível/dia, sem retenção individual', value: s => money(s.minimumDailyEligibleProfit) },
        { label: 'Piso líquido elegível/mês, sem retenção individual', value: s => money(s.minimumEligibleProfit) },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>Atividade não é saldo para saque.</strong> Tickets são valores líquidos disponíveis depois de eventuais retenções, e os dias representam saques concluídos com crédito, liquidez e BETTEX para a cobrança disponíveis. O piso é após os tributos da entidade. Com retenções individuais: lucro elegível necessário = (saques líquidos + retenções) ÷ 25%. Lucro retido não cria crédito e o mesmo crédito não financia dois saques. Ver o <a href="#documentacao-tributos">tratamento fiscal</a>.</p>
        <p>Trinta saques de 3 USDC e um de 90 USDC geram o mesmo alvo líquido de 1,80 USDC. A cobrança bruta pode mudar com tributos por operação. Reposição de BETTEX depende de decisão do titular e inclui a cobertura fiscal da própria compra, sem receita adicional automática. Compras e saques contabilizam volumes distintos, não reutilizam a primeira compra.</p>
        <p><strong>O crescimento linear desde zero é uma hipótese editável, não uma trajetória aprovada.</strong> A planilha aceita bases iniciais de holders e ativos. Os 12 meses usam 30 dias de referência; não são calendário exato. A meta de holders, isoladamente, não comprova volume vendido pelo pool. Conferir estoque e vesting antes de tratar aquisição como executável; após esgotamento, primeiras compras do pool não continuam indefinidamente. Preservam-se reservas, split, taxas líquidas e separação da carteira da Fundação.</p>
        <p><a href={`${import.meta.env.BASE_URL}downloads/bettex-taxas-fundacao.xlsx`} download>Baixar a planilha com as metas do primeiro ano e as fórmulas</a></p>
      </div>
    </section>
  );
}