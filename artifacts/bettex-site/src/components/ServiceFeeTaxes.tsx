import { useState } from 'react';
import proposal from '@/lib/service-fee-proposal.json';
import { serviceFeeBalance } from '@/lib/service-fee-taxes';
import { DocFacts, DocGroup } from '@/components/DocFacts';
import './DistributionTaxes.css';

const money = (value: number) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC`;
const inputNumber = (value: string) => value.trim() === '' ? null : Number(value);

export function ServiceFeeTaxes() {
  const [operation, setOperation] = useState(0);
  const [quote, setQuote] = useState('1');
  const [tax, setTax] = useState('');
  const [cost, setCost] = useState('');
  const result = serviceFeeBalance(proposal.fees[operation].amountUsd, inputNumber(quote) ?? NaN,
    inputNumber(tax), inputNumber(cost));
  return <section id="documentacao-provisao-taxas" aria-labelledby="provisao-taxas-title">
    <span id="documentacao-gross-up" aria-hidden="true" />
      <h3 id="provisao-taxas-title" className="whitepaper__subhead">Provisões dentro da receita de serviço</h3>
    <DocGroup title="Simulação de disponibilidade, sem aumentar a tarifa">
      <div className="whitepaper__prose"><p>A tarifa continua US$ 2,50. Provisões e custos reduzem o saldo disponível da entidade, não geram gross-up automático cobrado do usuário. Esta simulação usa valores informados, não calcula alíquotas legais nem imposto sobre lucro.</p></div>
      <div className="distribution-tax__inputs">
        <label htmlFor="fee-provision-operation">Serviço<select id="fee-provision-operation" value={operation} onChange={event => setOperation(Number(event.target.value))}>{proposal.fees.map((fee, index) => <option key={fee.operation} value={index}>{fee.operation}</option>)}</select></label>
        <label htmlFor="fee-provision-quote">USDC por dólar — hipótese<input id="fee-provision-quote" type="number" min="0" step="any" value={quote} onChange={event => setQuote(event.target.value)} /></label>
        <label htmlFor="fee-provision-tax">Provisão tributária informada (USDC)<input id="fee-provision-tax" type="number" min="0" step="any" placeholder="Informe inclusive zero" value={tax} onChange={event => setTax(event.target.value)} /></label>
        <label htmlFor="fee-provision-cost">Custo operacional informado (USDC)<input id="fee-provision-cost" type="number" min="0" step="any" placeholder="Informe inclusive zero" value={cost} onChange={event => setCost(event.target.value)} /></label>
      </div>
      <div aria-live="polite">{result.status !== 'ready' ? <p role="status">{result.message}</p> : <DocFacts title="Composição ilustrativa da receita" facts={[
        { label: 'RECEBIMENTO', value: money(result.received), text: 'US$ 2,50 liquidados pela referência informada.' },
        { label: 'PROVISÃO + CUSTO', value: money(result.taxProvision + result.operatingCost), text: 'Não financiar a mesma obrigação duas vezes.' },
        { label: 'SALDO APÓS DEDUÇÕES', value: money(result.balance), text: 'Saldo simulado; não é autorização para dividendos. Valor negativo indica insuficiência.' },
      ]} />}</div>
      <div className="whitepaper__prose"><p>O perfil fiscal deve identificar contribuinte, obrigação, base, moeda, vencimento e fonte de cobertura. Retenção legal dos rendimentos do participante não é receita de serviço.</p></div>
    </DocGroup>
  </section>;
}