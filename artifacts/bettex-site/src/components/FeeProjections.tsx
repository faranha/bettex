import { DocFacts, DocGroup } from '@/components/DocFacts';
import { feeProjections, purchaseRate, withdrawalRate } from '@/lib/fee-projections';

const count = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
const money = (value: number) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
const percent = (value: number) => `${(value * 100).toLocaleString('pt-BR')}%`;
type Scenario = typeof feeProjections[number];

function ScenarioTable({ caption, rows }: {
  caption: string;
  rows: { label: string; value: (scenario: Scenario) => string }[];
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
  const reference = feeProjections[1];
  return (
    <section id="documentacao-projecoes-taxas" aria-labelledby="projecoes-taxas-title">
      <h4 id="projecoes-taxas-title" className="whitepaper__subhead">Receita líquida-alvo das taxas por comportamento do usuário</h4>
      <DocFacts title="Saques diários · cenário de referência hipotético" cols={3} facts={[
        { label: 'PESSOAS SACANDO TODO DIA', value: count(reference.withdrawers), text: `${money(reference.dailyWithdrawal)} por pessoa, em ${reference.withdrawalDays} dias do mês.` },
        { label: 'ALVO LÍQUIDO POR MÊS', value: money(reference.monthlyFees), text: 'Após tributos modelados, antes dos demais custos. Equivalente nominal em BETTEX.' },
        { label: 'ALVO EM 12 MESES', value: money(reference.annualFees), text: 'Operação constante, hipotética; não cobrança bruta.' },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>O comportamento central deste modelo é sacar dinheiro todos os dias.</strong> No cenário de referência, {count(reference.activeUsers)} usuários ativos, dos quais {count(reference.withdrawers)} sacam {money(reference.dailyWithdrawal)} por dia em {reference.withdrawalDays} dias do mês, geram taxas equivalentes a {money(reference.monthlyFees)} por mês, ou {money(reference.annualFees)} em 12 meses constantes. A projeção combina esse hábito com primeiras compras e compras adicionais.</p>
        <p>Os percentuais de adesão e os tickets diários de 1, 3 e 5 USDC são <strong>hipóteses de comportamento, não dados observados nem rendimentos atribuídos ao investimento</strong>. Cada participante do grupo de saque faz um saque por dia com saldo disponível. Os demais usuários ativos não têm saques contabilizados naquele cenário; podem comprar ou manter tokens. Novos compradores e compradores recorrentes são grupos distintos, enquanto quem saca pode pertencer a qualquer um deles. A recompra é um total mensal; o ticket de saque agora é um valor <strong>por dia</strong>.</p>
      </div>
      <ScenarioTable caption="Premissas mensais de comportamento · valores por pessoa em USDC" rows={[
        { label: 'Usuários ativos no mês', value: s => count(s.activeUsers) },
        { label: 'Primeira compra: parcela dos ativos', value: s => `${percent(s.newBuyerShare)} · ${count(s.newBuyers)} pessoas` },
        { label: 'Ticket da primeira compra', value: s => money(s.firstPurchase) },
        { label: 'Compra adicional: parcela dos ativos', value: s => `${percent(s.repeatBuyerShare)} · ${count(s.repeatBuyers)} pessoas` },
        { label: 'Compras adicionais por comprador/mês', value: s => money(s.monthlyRepeatPurchase) },
        { label: 'Sacadores diários: parcela dos ativos', value: s => `${percent(s.withdrawerShare)} · ${count(s.withdrawers)} pessoas` },
        { label: 'Dias com saque por pessoa/mês', value: s => count(s.withdrawalDays) },
        { label: 'Ticket por saque diário', value: s => money(s.dailyWithdrawal) },
        { label: 'USDC sacado por pessoa/mês', value: s => money(s.monthlyWithdrawal) },
        { label: 'Quantidade de saques concluídos/mês', value: s => count(s.withdrawalCount) },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>Volume de compras = ativos × parcela de novos compradores × ticket inicial + ativos × parcela de compradores recorrentes × ticket adicional.</strong> Volume mensal de saques = ativos × parcela que saca diariamente × dias com saque × ticket por saque diário. Equivalente das taxas = volume de compras × {percent(purchaseRate)} + volume de saques × {percent(withdrawalRate)}.</p>
        <p>Na referência: {count(reference.newBuyers)} primeiras compras de {money(reference.firstPurchase)} + {count(reference.repeatBuyers)} compradores adicionais com {money(reference.monthlyRepeatPurchase)} no mês = <strong>{money(reference.purchaseVolume)} em compras</strong>. Já {count(reference.withdrawers)} pessoas × {reference.withdrawalDays} dias × {money(reference.dailyWithdrawal)} = <strong>{money(reference.withdrawalVolume)} em saques</strong>, distribuídos em {count(reference.withdrawalCount)} operações. As taxas equivalem a {money(reference.purchaseFees)} nas compras e {money(reference.withdrawalFees)} nos saques, sendo {money(reference.dailyWithdrawalFees)} de taxas de saque por dia ativo.</p>
      </div>
      <ScenarioTable caption="Alvos após tributos · equivalentes nominais em USDC, não cobrança total" rows={[
        { label: 'Volume mensal de compras do pool', value: s => money(s.purchaseVolume) },
        { label: 'Volume mensal de saques do staking', value: s => money(s.withdrawalVolume) },
        { label: 'Alvo líquido de compra/mês · 1%', value: s => money(s.purchaseFees) },
        { label: 'Alvo líquido de saque/mês · 2%', value: s => money(s.withdrawalFees) },
        { label: 'Alvo líquido de saque/dia · 2%', value: s => money(s.dailyWithdrawalFees) },
        { label: 'Total líquido-alvo por mês', value: s => money(s.monthlyFees) },
        { label: 'Alvo em 12 meses constantes', value: s => money(s.annualFees) },
        { label: 'Alvo por usuário ativo/mês', value: s => money(s.feesPerActiveUser) },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>Todos os valores de taxas desta seção são alvos líquidos dos tributos modelados, não cobranças brutas.</strong> A referência mantém {money(reference.monthlyFees)} por mês e {money(reference.annualFees)} em 12 meses como alvos, antes dos demais custos institucionais. A cobrança total inclui a cobertura fiscal e depende das regras validadas por operação. A planilha separa compra e saque na aba Cobertura fiscal, sem presumir alíquotas. Não cobrar novamente na tesouraria ou no pagamento um tributo já financiado nesse acréscimo.</p>
        <p>A cobrança é recebida em BETTEX na carteira da Fundação, não em USDC. A 0,20 USDC por BETTEX, apenas o alvo de referência equivale a {count(reference.monthlyFees / 0.20)} BETTEX por mês; o recebimento bruto inclui ainda a provisão fiscal. O caixa institucional usa os valores da conversão efetiva, a liquidez e os custos registrados. Receita líquida de tributos não é lucro líquido após todas as despesas.</p>
        <p><strong>A projeção de saques depende de créditos de staking disponíveis.</strong> Os tickets representam USDC disponível para saque depois de eventuais retenções fiscais. Não se aplica 2% ao patrimônio da tesouraria, a depósitos, ao crédito automático do yield, ao tributo retido ou a lucros que ficaram retidos para recompor reservas. Sem créditos anteriores, os mínimos abaixo são pisos de lucro elegível <strong>após os tributos da entidade e antes de acrescentar as retenções dos beneficiários</strong>. São requisitos matemáticos dos cenários, não premissas de rendimento das estratégias. Se parte das distribuições permanecer nas carteiras, a necessidade de lucro elegível é maior para sustentar o mesmo saque.</p>
        <p><strong>Com retenções, lucro líquido elegível necessário = (volume líquido de saques + retenções dos beneficiários) ÷ 25%.</strong> Na referência, o piso de {money(reference.minimumEligibleProfit)} cresce conforme as retenções aplicáveis; o resultado antes dos tributos da entidade precisa cobrir ainda esses tributos. Não presumir imposto zero ou uma alíquota comum para Fundação, subsidiárias e titulares. A aba Tributos da planilha permite informar esses valores separadamente. Seguir a <a href="#documentacao-tributos">ordem fiscal da distribuição</a>.</p>
      </div>
      <ScenarioTable caption="Condição para sustentar os saques somente com distribuições do mês" rows={[
        { label: 'USDC necessário para os saques de cada dia', value: s => money(s.dailyWithdrawalVolume) },
        { label: 'Piso líquido elegível/dia · sem retenções individuais', value: s => money(s.minimumDailyEligibleProfit) },
        { label: 'Mínimo distribuído ao staking', value: s => money(s.withdrawalVolume) },
        { label: 'Piso líquido elegível/mês · sem retenções individuais', value: s => money(s.minimumEligibleProfit) },
      ]} />
      <DocGroup title="Relação entre lucro elegível, staking e receita de saque">
        <div className="whitepaper__prose">
          <p>Sem retenções individuais, se todo o USDC distribuído ao staking no período for sacado, sem créditos anteriores, o alvo líquido de serviço é <strong>lucro elegível após tributos da entidade × 25% × 2% = 0,5% desse lucro elegível</strong>. Com retenções, o alvo passa a ser <strong>(lucro elegível × 25% − retenções) × 2%</strong>, se todo o líquido for sacado. Retirada parcial reduz o alvo proporcionalmente. Os 2% representam a receita líquida-alvo, não a cobrança total: o usuário paga também a cobertura fiscal validada em BETTEX. A frequência não cria lucro adicional para sustentar o volume.</p>
        </div>
      </DocGroup>
      <div className="whitepaper__prose">
        <p><strong>Frequência e volume são variáveis diferentes.</strong> Trinta saques de 3 USDC e um saque de 90 USDC produzem o mesmo alvo líquido de 1,80 USDC para a Fundação. A cobrança bruta depende dos tributos, inclusive custos fiscais por operação quando aplicáveis; não deve ser presumida como 1,80 USDC nos dois casos. Multiplicar operações sobre o mesmo volume não aumenta o alvo líquido de serviço, embora possa mudar a provisão fiscal e os custos externos.</p>
        <p><strong>Sensibilidade da referência:</strong> cada 1.000 usuários ativos adicionais, mantendo as premissas, acrescentam {money(reference.feesPerActiveUser * 1000)} equivalentes em taxas mensais. Cada 1 USDC adicional no ticket diário dos {count(reference.withdrawers)} sacadores, em {reference.withdrawalDays} dias, acrescenta {money(reference.withdrawers * reference.withdrawalDays * withdrawalRate)} equivalentes no mês. Se os dias com saldo para sacar caírem de 30 para 15, a parcela das taxas de saque cai pela metade; se não houver saques, restam somente {money(reference.purchaseFees)} equivalentes nas compras.</p>
        <p><strong>Saldo disponível e sustentação diária:</strong> desejar sacar todo dia não cria crédito de staking. Os 30 dias representam saques concluídos na hipótese de saldo, liquidez, tratamento fiscal validado e pagamento da taxa disponíveis. Sem crédito anterior nem retenções individuais, o piso da referência é {money(reference.minimumDailyEligibleProfit)} de lucro elegível após tributos da entidade em cada dia de saque, para distribuir os {money(reference.dailyWithdrawalVolume)} utilizados naquele dia; o piso mensal é {money(reference.minimumEligibleProfit)}. Retenções aumentam esse requisito pela fórmula acima. Se os ganhos se concentrarem em outros dias, créditos já disponíveis podem sustentar os saques; o mínimo diário não descreve essa alternativa. Lucros retidos para recomposição não entram como créditos sacáveis, e o valor efetivamente sacado fica limitado aos créditos disponíveis, sem contar o mesmo crédito novamente.</p>
        <p>Pagar a cobrança total diariamente consome BETTEX disponível na carteira. Recompras dependem de decisão do titular e descontam sua própria cobrança total, com alvo de 1% mais cobertura fiscal; não são automáticas nem receita adicional presumida. O modelo mantém as recompras na premissa mensal, sem duplicar volume. Custos externos por operação ficam separados da receita líquida-alvo.</p>
        <p><strong>Leitura dos 12 meses:</strong> o total anual é o mensal multiplicado por 12, com meses de referência de 30 dias, base ativa, tickets e proporções constantes; não é uma contagem exata dos dias do calendário. Não é uma curva de crescimento: pressupõe entrada contínua de novos compradores compensando a saída de usuários da base ativa. Primeiras compras não são repetidas para a mesma pessoa. As compras do pool dependem do estoque disponível no vesting; após seu esgotamento, esse componente de receita não pode continuar sendo projetado da mesma forma.</p>
        <p>O modelo inclui somente as taxas aprovadas de compra no pool pelo aplicativo e saque de USDC do staking. Não presume a mesma taxa nas vendas diretas a corretoras e exclui swap, retirada de BETTEX, transferências externas e orçamento inicial. Compras para completar saldo de taxas, quando realizadas, entram no volume de compras uma única vez; não se soma uma receita adicional automática. Os 100% do USDC da venda pública continuam destinados à tesouraria, separados dos tokens pagos à Fundação.</p>
        <p><a href={`${import.meta.env.BASE_URL}downloads/bettex-taxas-fundacao.xlsx`} download>Baixar a planilha com os cenários e as fórmulas das projeções</a></p>
      </div>
    </section>
  );
}