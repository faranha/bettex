import { useState } from 'react';
import { DocFacts, DocGroup } from '@/components/DocFacts';
import { grossUpFee } from '@/lib/fee-tax-gross-up';
import { purchaseRate, withdrawalRate } from '@/lib/fee-projections';
import './DistributionTaxes.css';

const money = (n: number) => `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC`;

export function FeeTaxGrossUp() {
  const [operation, setOperation] = useState('purchase');
  const [amount, setAmount] = useState('100');
  const [taxRate, setTaxRate] = useState('');
  const [fixedTax, setFixedTax] = useState('');
  const [price, setPrice] = useState('0.20');
  const base = amount.trim() === '' ? NaN : Number(amount);
  const quote = price.trim() === '' ? NaN : Number(price);
  const netRate = operation === 'purchase' ? purchaseRate : withdrawalRate;
  const result = grossUpFee(base * netRate, taxRate.trim() === '' ? null : Number(taxRate) / 100, fixedTax.trim() === '' ? null : Number(fixedTax));
  const invalidQuote = !Number.isFinite(quote) || quote <= 0;
  const exceedsPurchase = result.status === 'ready' && operation === 'purchase' && result.total >= base;
  return (
    <section id="documentacao-gross-up" aria-labelledby="gross-up-title">
      <h4 id="gross-up-title" className="whitepaper__subhead">Cobrança total com cobertura dos tributos</h4>
      <DocGroup title="Simulação de receita líquida-alvo da Fundação">
        <p className="whitepaper__lead">1% na compra e 2% no saque são alvos líquidos de tributos, antes dos demais custos institucionais. O usuário paga o total, incluindo a provisão fiscal, em BETTEX. Valores em USDC são equivalentes nominais; a realização em caixa depende da conversão efetiva.</p>
        <div className="distribution-tax__inputs">
          <label htmlFor="gross-up-operation">Operação
            <select id="gross-up-operation" value={operation} onChange={e => setOperation(e.target.value)}>
              <option value="purchase">Compra do pool</option><option value="withdrawal">Saque de USDC do staking</option>
            </select>
          </label>
          <label htmlFor="gross-up-base">Valor-base em USDC
            <input id="gross-up-base" type="number" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value)} />
          </label>
          <label htmlFor="gross-up-price">Cotação USDC por BETTEX
            <input id="gross-up-price" type="number" min="0" step="any" value={price} onChange={e => setPrice(e.target.value)} />
          </label>
          <label htmlFor="gross-up-rate">Carga efetiva sobre o total cobrado (%)
            <input id="gross-up-rate" type="number" min="0" max="99.999999" step="any" placeholder="Hipótese explícita, não alíquota legal" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
          </label>
          <label htmlFor="gross-up-fixed">Outros tributos a cobrir nesta cobrança (USDC)
            <input id="gross-up-fixed" type="number" min="0" step="any" placeholder="Informe inclusive zero" value={fixedTax} onChange={e => setFixedTax(e.target.value)} />
          </label>
        </div>
        <div aria-live="polite">
          {result.status !== 'ready' ? <p role="status">{result.message}</p>
            : invalidQuote || exceedsPurchase ? <p role="status">{invalidQuote ? 'Informe uma cotação positiva e finita.' : 'A cobrança esgota a compra. Não há quantidade líquida positiva para o titular.'}</p>
            : <DocFacts title="Composição da cobrança ilustrativa" cols={3} facts={[
              { label: 'LÍQUIDO-ALVO DA FUNDAÇÃO', value: money(result.netTarget), text: `${netRate * 100}% do valor-base, após os tributos modelados.` },
              { label: 'PROVISÃO TRIBUTÁRIA', value: money(result.taxProvision), text: 'Parcela vinculada ao recolhimento, não receita livre.' },
              { label: 'TOTAL A PAGAR', value: money(result.total), text: `${(result.total / quote).toLocaleString('pt-BR', { maximumFractionDigits: 8 })} BETTEX pela cotação ilustrativa.` },
            ]} />}
        </div>
        <div className="whitepaper__prose">
          <p><strong>Total cobrado = (líquido-alvo + outros tributos atribuídos) ÷ (1 − carga efetiva sobre o total).</strong> Apenas adicionar a alíquota ao alvo não cobre a tributação do próprio acréscimo. Este modelo linear é uma hipótese de planejamento: imposto sobre lucro, bases diferentes, créditos, faixas e múltiplas incidências exigem cálculo fiscal próprio sobre a cobrança final, não uma alíquota universal sobre todas as operações.</p>
          <p>Incluir somente obrigações ainda não financiadas. Cada tributo tem identificador, entidade responsável, base, método, vigência, fonte de cobertura e conciliação. Não incluir o mesmo valor na carga proporcional e nos outros tributos, nem cobri-lo também por dedução da tesouraria ou de outro pagamento. Todo tributo da Fundação e subsidiárias deve ter cobertura econômica identificada, inclusive sobre o lucro das taxas; repasse econômico não transforma tributo da entidade em retenção legal do beneficiário.</p>
          <p>O recibo separa base, líquido-alvo, tributos, total, cotação, BETTEX exigido e líquido do titular. Alteração fiscal ou de preço exige nova cotação e autorização, respeitando o máximo aprovado. Tributos reservados não se tornam caixa livre, lucro distribuível ou financiamento de despesas. A simulação não cobra, transfere ou recolhe recursos.</p>
        </div>
      </DocGroup>
    </section>
  );
}