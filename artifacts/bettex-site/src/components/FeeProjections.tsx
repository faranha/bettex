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
    <div className="whitepaper__vesting-scroll" role="region" aria-label={caption} tabIndex={0}>
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
      <h4 id="projecoes-taxas-title" className="whitepaper__subhead">Projeções econômicas das taxas por comportamento do usuário</h4>
      <div className="whitepaper__prose">
        <p><strong>No cenário de referência, 5.000 usuários ativos geram taxas equivalentes a {money(reference.monthlyFees)} por mês, ou {money(reference.annualFees)} em 12 meses de operação constante.</strong> A projeção combina primeiras compras, compras adicionais e saques de USDC do staking. Os três cenários abaixo são hipóteses de planejamento, não métricas observadas da base; seus tickets e percentuais de atividade são premissas de simulação.</p>
        <p>Um usuário ativo é uma pessoa que utiliza o aplicativo no mês, não necessariamente alguém que compra ou saca. Novos compradores fazem a primeira compra naquele mês; compradores recorrentes já possuíam BETTEX antes dele. Esses dois grupos não se sobrepõem. Quem saca pode pertencer a qualquer um deles ou apenas manter tokens. Os tickets de recompra e saque representam o <strong>total mensal por pessoa</strong>, mesmo que dividido em várias operações.</p>
      </div>
      <ScenarioTable caption="Premissas mensais de comportamento · valores por pessoa em USDC" rows={[
        { label: 'Usuários ativos no mês', value: s => count(s.activeUsers) },
        { label: 'Primeira compra: parcela dos ativos', value: s => `${percent(s.newBuyerShare)} · ${count(s.newBuyers)} pessoas` },
        { label: 'Ticket da primeira compra', value: s => money(s.firstPurchase) },
        { label: 'Compra adicional: parcela dos ativos', value: s => `${percent(s.repeatBuyerShare)} · ${count(s.repeatBuyers)} pessoas` },
        { label: 'Compras adicionais por comprador/mês', value: s => money(s.monthlyRepeatPurchase) },
        { label: 'Saque do staking: parcela dos ativos', value: s => `${percent(s.withdrawerShare)} · ${count(s.withdrawers)} pessoas` },
        { label: 'USDC sacado por pessoa/mês', value: s => money(s.monthlyWithdrawal) },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>Volume de compras = ativos × parcela de novos compradores × ticket inicial + ativos × parcela de compradores recorrentes × ticket adicional.</strong> Volume de saques = ativos × parcela que saca × USDC sacado por pessoa no mês. Equivalente das taxas = volume de compras × {percent(purchaseRate)} + volume de saques × {percent(withdrawalRate)}.</p>
        <p>Na referência: 500 primeiras compras de 200 USDC + 1.000 compradores adicionais com 100 USDC no mês = <strong>200.000 USDC em compras</strong>. Já 2.000 pessoas sacando 25 USDC no mês = <strong>50.000 USDC em saques</strong>. As taxas equivalem a 2.000 USDC nas compras e 1.000 USDC nos saques.</p>
      </div>
      <ScenarioTable caption="Resultado projetado · equivalente nominal das taxas em USDC" rows={[
        { label: 'Volume mensal de compras do pool', value: s => money(s.purchaseVolume) },
        { label: 'Volume mensal de saques do staking', value: s => money(s.withdrawalVolume) },
        { label: 'Taxas de compra por mês · 1%', value: s => money(s.purchaseFees) },
        { label: 'Taxas de saque por mês · 2%', value: s => money(s.withdrawalFees) },
        { label: 'Total de taxas por mês', value: s => money(s.monthlyFees) },
        { label: 'Total em 12 meses constantes', value: s => money(s.annualFees) },
        { label: 'Taxas por usuário ativo/mês', value: s => money(s.feesPerActiveUser) },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>O valor acima é recebido em BETTEX na carteira própria da Fundação, não em USDC.</strong> A quantidade recebida é a soma da taxa de cada operação dividida pela cotação BETTEX/USDC daquela operação. Usando apenas a cotação ilustrativa constante de 0,20 USDC por BETTEX, o cenário de referência representa 15.000 BETTEX por mês. O caixa institucional depende da conversão efetivamente realizada, do preço de venda, da liquidez e dos custos. Os totais são receita bruta equivalente, não lucro líquido nem caixa já disponível.</p>
        <p><strong>A projeção de saques depende de créditos de staking disponíveis.</strong> Não se aplica 2% ao patrimônio da tesouraria, a depósitos, ao crédito automático do yield ou a lucros que ficaram retidos para recompor reservas. Se não houver créditos anteriores e todos os saques projetados vierem das distribuições do próprio mês, o staking precisa receber pelo menos o volume de saques; com sua parcela de 25%, isso exige os mínimos de lucro elegível abaixo. São requisitos matemáticos dos cenários, não premissas de rendimento das estratégias. Se parte das distribuições permanecer nas carteiras, a necessidade de lucro elegível é maior para sustentar o mesmo saque.</p>
      </div>
      <ScenarioTable caption="Condição para sustentar os saques somente com distribuições do mês" rows={[
        { label: 'Mínimo distribuído ao staking', value: s => money(s.withdrawalVolume) },
        { label: 'Mínimo de lucro elegível ao split 75% / 25%', value: s => money(s.minimumEligibleProfit) },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>O que mais muda a receita:</strong> mantendo o comportamento da referência, cada 1.000 usuários ativos adicionais acrescentam 600 USDC equivalentes em taxas mensais. A cada 10.000 USDC adicionais de compras processadas, entram 100 USDC equivalentes; a cada 10.000 USDC adicionais de saques do staking, entram 200 USDC equivalentes. Se os saques da referência forem zero, a projeção cai de 3.000 para 2.000 USDC equivalentes no mês. Dividir 25 USDC em dois saques de 12,50 USDC mantém a taxa nominal total em 0,50 USDC equivalente; a frequência isolada não aumenta a receita sobre o mesmo volume.</p>
        <p><strong>Leitura dos 12 meses:</strong> o total anual é o mensal multiplicado por 12, com base ativa, tickets e proporções constantes. Não é uma curva de crescimento: pressupõe entrada contínua de novos compradores compensando a saída de usuários da base ativa. Primeiras compras não são repetidas para a mesma pessoa. As compras do pool dependem do estoque disponível no vesting; após seu esgotamento, esse componente de receita não pode continuar sendo projetado da mesma forma.</p>
        <p>O modelo inclui somente as taxas aprovadas de compra no pool pelo aplicativo e saque de USDC do staking. Não presume a mesma taxa nas vendas diretas a corretoras e exclui swap, retirada de BETTEX, transferências externas e orçamento inicial. Compras para completar saldo de taxas, quando realizadas, entram no volume de compras uma única vez; não se soma uma receita adicional automática. Os 100% do USDC da venda pública continuam destinados à tesouraria, separados dos tokens pagos à Fundação.</p>
        <p><a href={`${import.meta.env.BASE_URL}downloads/bettex-taxas-fundacao.xlsx`} download>Baixar a planilha com os cenários e as fórmulas das projeções</a></p>
      </div>
    </section>
  );
}