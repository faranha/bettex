import { DocFacts } from './DocFacts';
import { TechnicalDetails } from './TechnicalDetails';
import { operatingTargets as t, operatingTarget } from '@/lib/operating-targets';
import { purchaseFeeUsd, withdrawalFeeUsd } from '@/lib/fee-projections';

import { distributionRemainderProjectionRule } from '@/lib/staking-rounding-policy';

const count = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const usd = (n: number) => `US$ ${count(n)}`;

export function OperatingBreakEven() {
  const base = operatingTarget(t.monthlyBudgetUsd);
  const upper = operatingTarget(t.upperBudgetReferenceUsd);
  const dailyWithdrawers = Math.ceil(base.dailyAverage);
  const dailyOperations = dailyWithdrawers * t.daysPerMonth;
  return <section id="documentacao-equilibrio-operacional" aria-labelledby="equilibrio-operacional-title">
      <h3 id="equilibrio-operacional-title" className="whitepaper__subhead">Sustentar a operação: US$ 50 mil por mês</h3>
    <DocFacts title="Piso aritmético de cobertura do orçamento" cols={3} facts={[
      { label: 'CUSTO PROJETADO NO PISO', value: usd(base.recurringCostAtTarget), text: `Referência do criador: ${usd(t.monthlyBudgetUsd)}; pessoal, marketing, tecnologia e provisões.` },
      { label: 'OPERAÇÕES TARIFADAS / MÊS', value: count(base.operations), text: `Compras, saques e envios pelo app × ${usd(purchaseFeeUsd)}.` },
      { label: 'MÉDIA DIÁRIA', value: count(base.dailyAverage), text: `${t.daysPerMonth} dias; aproximadamente ${count(Math.ceil(base.dailyAverage))} operações por dia.` },
    ]} />
    <div className="whitepaper__prose">
      <p><strong>Operações necessárias = custos fixos ÷ contribuição por operação.</strong> O plano-base tem {usd(base.fixedBudgetUsd)} fixos e contribuição de {usd(base.contribution)} por operação. Assim, {count(base.operations)} operações geram {usd(base.grossFees)} brutos e sustentam {usd(base.recurringCostAtTarget)} de custos e provisão. A comparação superior escala os fixos pela razão entre as referências {usd(t.upperBudgetReferenceUsd)} e {usd(t.monthlyBudgetUsd)}: {usd(upper.fixedBudgetUsd)} fixos e {count(upper.operations)} operações/mês. É sensibilidade, não outro orçamento aprovado. Se as premissas mudarem, o custo calculado pode exceder a referência: não reduzir fixos artificialmente para manter a meta. Arredondamento pode deixar pequena sobra.</p>
      <p>O preço dos tokens vai à tesouraria, não paga salários ou marketing. A receita operacional vem da tarifa. Portanto, <strong>não existe um único volume financeiro necessário</strong>: ele depende dos tickets e do mix de compras, saques e envios. Financiamento ou captação não substituem receita recorrente; os US$ 75 mil acima são uma referência de custo, não uma meta de captação.</p>
    </div>
    <TechnicalDetails title="Cenários de uso, volume financeiro e custos adicionais">
      <div className="whitepaper__prose">
        <p>{count(Math.ceil(base.operations / 4))} pessoas fazendo quatro operações tarifadas no mês, ou {count(Math.ceil(base.operations / 2))} fazendo duas, alcançam o piso de {count(base.operations)} operações. São pessoas com operações tarifadas, não holders ou ativos diários automaticamente convertidos em pagadores.</p>
        <p><strong>Saques diários:</strong> {count(dailyWithdrawers)} pessoas sacando uma vez por dia, durante {t.daysPerMonth} dias, produzem {count(dailyOperations)} saques e {usd(dailyOperations * withdrawalFeeUsd)} brutos. O cenário depende de saldo disponível e adesão efetiva, não de um rendimento diário prometido.</p>
      </div>
      <div className="whitepaper__vesting-scroll" role="region" aria-label="Volumes ilustrativos no piso de vinte mil operações" tabIndex={0}>
        <table className="whitepaper__vesting-table">
          <caption>{count(base.operations)} compras primárias/mês · tickets hipotéticos, USDC/dólar 1:1</caption>
          <thead><tr><th scope="col">Preço médio pago pelos tokens</th><th scope="col">Capital à tesouraria</th><th scope="col">Tarifas ao caixa operacional</th><th scope="col">Total pago pelos compradores</th></tr></thead>
          <tbody>{t.purchaseTicketsUsdc.map(ticket => <tr key={ticket}>
            <th scope="row">{count(ticket)} USDC</th><td>{count(base.operations * ticket)} USDC</td><td>{count(base.grossFees)} USDC</td><td>{count(base.operations * ticket + base.grossFees)} USDC</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="whitepaper__prose">
        <p><strong>Se as vendas primárias captarem {count(t.illustrativeMonthlyPublicSaleUsdc)} USDC no mês</strong> em preço dos tokens, com ticket médio hipotético de 100 USDC, serão {count(t.illustrativeMonthlyPublicSaleUsdc / 100)} compras e apenas {usd(t.illustrativeMonthlyPublicSaleUsdc / 100 * purchaseFeeUsd)} em tarifas adicionais. Faltariam {count(base.operations - t.illustrativeMonthlyPublicSaleUsdc / 100)} outras operações tarifadas para cobrir o alvo bruto de {usd(t.monthlyBudgetUsd)}. Captação para investimentos e sustentação da empresa são metas diferentes.</p>
        <p>Se as {count(base.operations)} operações forem somente saques de {count(t.illustrativeWithdrawalUsdc)} USDC, o valor solicitado será {count(base.operations * t.illustrativeWithdrawalUsdc)} USDC: {count(base.grossFees)} em tarifas e {count(base.operations * (t.illustrativeWithdrawalUsdc - withdrawalFeeUsd))} líquidos antes de outros encargos. A tarifa já está incluída no solicitado. Sem créditos anteriores ou retenções individuais, seriam necessários ao menos {count(base.operations * t.illustrativeWithdrawalUsdc / 0.25)} USDC de lucro elegível para originar esses créditos pelo split de 25%, com reservas e demais condições atendidas.</p>
        <p>Os pisos de lucro pressupõem que 100% do rateio de 25% vire crédito disponível para os sacadores do período. Se esses titulares tiverem fração q do peso elegível, sem créditos anteriores ou retenções, o requisito é saques solicitados ÷ (25% × q), ainda sujeito às reservas e à liquidação. Quantidade de usuários não determina q; o piso agregado não comprova saldo individual.</p>
        <p>{distributionRemainderProjectionRule}</p>
        <p>Envios de BETTEX também geram tarifas, mas seu principal é medido em tokens, não equivale a nova captação em USDC. Não somar depósitos, compras e saques do mesmo recurso como capital novo. Compras dependem do estoque liberado e disponível; tráfego, login e transferências externas diretas não geram a tarifa do aplicativo.</p>
      </div>
      <div className="whitepaper__vesting-scroll" role="region" aria-label="Sensibilidade a encargos fora do orçamento" tabIndex={0}>
        <table className="whitepaper__vesting-table">
          <caption>Sensibilidade do mesmo plano-base · adicionais além dos encargos já orçados</caption>
          <thead><tr><th scope="col">Hipótese adicional</th><th scope="col">Contribuição por operação</th><th scope="col">Operações/mês</th></tr></thead>
          <tbody>{[
            { label: 'Nenhum encargo adicional', cost: 0, tax: 0 },
            { label: `Custo extra de ${usd(t.additionalVariableCostExampleUsd)}/operação`, cost: t.additionalVariableCostExampleUsd, tax: 0 },
            { label: 'Mesmo custo extra + 10 pontos percentuais de provisão sobre a receita', cost: t.additionalVariableCostExampleUsd, tax: t.additionalRevenueTaxExample },
          ].map(s => {
            const target = operatingTarget(t.monthlyBudgetUsd, s.cost, s.tax);
            return <tr key={s.label}><th scope="row">{s.label}</th><td>{usd(target.contribution)}</td><td>{count(target.operations)}</td></tr>;
          })}</tbody>
        </table>
      </div>
      <div className="whitepaper__prose"><p>Os adicionais aumentam variáveis ou provisão e mantêm os custos fixos do cenário; não tratar novamente o total de US$ 50 mil como se fosse todo fixo. A provisão adicional é somada em pontos percentuais, não aplicada como imposto sobre imposto. Sustentação exige tarifas recebidas, custos completos e caixa para vencimentos. <a href="#documentacao-entidade">Ver o orçamento discriminado em Identidade e negócios.</a> <a href={`${import.meta.env.BASE_URL}downloads/bettex-taxas-fundacao.xlsx`} download>Conferir as abas Equilíbrio mensal e Plano-base da planilha.</a></p></div>
    </TechnicalDetails>
  </section>;
}