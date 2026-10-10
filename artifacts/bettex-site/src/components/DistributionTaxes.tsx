import { useState } from 'react';
import { DocFacts, DocGroup } from '@/components/DocFacts';
import { calculateTaxIllustration } from '@/lib/distribution-tax-illustration';
import './DistributionTaxes.css';

const money = (value: number) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;

export function DistributionTaxes() {
  const [profit, setProfit] = useState('1000');
  const [taxes, setTaxes] = useState('');
  const [withholding, setWithholding] = useState('');
  const [conditions, setConditions] = useState(false);
  const [settled, setSettled] = useState(false);
  const result = calculateTaxIllustration({
    resultAfterCosts: profit.trim() === '' ? NaN : Number(profit),
    entityTaxes: taxes.trim() === '' ? null : Number(taxes),
    beneficiaryWithholding: withholding.trim() === '' ? null : Number(withholding),
    distributionConditionsMet: conditions,
    fiscalObligationsSettled: settled,
  });
  return (
    <section id="documentacao-tributos" aria-labelledby="tributos-title">
      <h3 id="tributos-title" className="whitepaper__subhead">Tributos antes do lucro distribuível e do pagamento</h3>
      <DocFacts title="Ordem fiscal da distribuição" cols={3} facts={[
        { label: 'ANTES DO SPLIT', value: 'Tributos do responsável jurídico', text: 'Apurados, descontados e recolhidos conforme obrigação aplicável antes do lucro elegível.' },
        { label: 'ANTES DO PAGAMENTO', value: 'Retenção individual', text: 'Resolvida e recolhida quando aplicável antes do crédito líquido disponibilizado.' },
        { label: 'SEM DUPLICIDADE', value: 'Obrigação identificada', text: 'Reconhecer e depois recolher o mesmo imposto não cria duas deduções.' },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>A tesouraria não distribui resultado bruto de impostos.</strong> Apurar, descontar e recolher tributos imputáveis a quem for juridicamente responsável conforme regime, jurisdição, natureza da receita, fato gerador e vigência, antes do lucro elegível e split. Uma provisão não prova pagamento: registrar obrigação, vencimento e comprovante conciliado. Atualizar R e P uma única vez, sem alterar artificialmente B ou deduzir novamente ao recolher. Depois conferir reservas, liquidez e pesos para o split 50%/25%/25%.</p>
        <p><strong>Custos tributários têm obrigação e fonte de cobertura identificadas.</strong> Tributos dos serviços entram no orçamento operacional; tributos dos investimentos entram na apuração correspondente; retenções legais identificam o beneficiário e pagamento aplicáveis. Contabilidade separada não exclui impostos nem financia a mesma obrigação duas vezes. Ver <a href="#documentacao-provisao-taxas">receita bruta, custos e tributos dos serviços</a>.</p>
        <p><strong>Retenções aplicáveis são resolvidas antes do crédito líquido disponibilizado.</strong> O rateio calcula direito bruto na parcela de 25%; separar tributo e líquido, identificar obrigação e comprovar recolhimento conforme o evento aplicável antes da liberação ao titular. Reserva fiscal não é recolhimento efetuado nem saldo pessoal disponível. Tributação pessoal depende de residência, natureza do pagamento e regime: não há isenção universal.</p>
        <p>Tributação do responsável jurídico e retenção do beneficiário podem coexistir por incidências distintas. Não são alternativas para evitar imposto nem autorização para cobrar duas vezes a mesma obrigação. Validar regime, residência fiscal, natureza do pagamento, base, alíquota ou método, isenção, responsável pelo recolhimento, fonte e vigência. Sem enquadramento fiscal validado, não autorizar o pagamento; se a rodada encerrar sem pagar, não conservar crédito do beneficiário para outra rodada. Isso não extingue tributos legalmente devidos nem libera recursos fiscais reservados. Ausência de configuração não significa imposto zero.</p>
        <p>O registro vincula apuração, responsável jurídico, beneficiário quando aplicável, regra fiscal, base, valor bruto, imposto, líquido, obrigação, vencimento e comprovante de recolhimento. Retenções e recolhimentos são conciliados com efeito único: bruto = líquido devido + tributo retido. Não manter simultaneamente o bruto inteiro a pagar ao usuário e uma segunda obrigação fiscal sobre a mesma parcela. Pagamento ou recolhimento de obrigação já registrada não reduz R, P ou B novamente. Correções seguem ajustes identificados, sem débito automático de carteiras ou repetição do split.</p>
        <p>As tarifas fixas de compra primária, saque USDC e envio autônomo BETTEX são pagas em USDC e permanecem separadas dos impostos. Retenção não é um saque nem nova operação tarifada. Créditos anteriores mantêm sua origem; tratamento fiscal não autoriza cancelamento retroativo ou nova cobrança sem obrigação comprovada.</p>
      </div>
      <DocGroup title="Simulação da ordem de dedução, em USDC">
        <p className="whitepaper__lead">Exemplo isolado, sem perdas anteriores ou posições abertas e com R = P − B antes dos tributos. Não substitui a apuração completa nem calcula alíquotas legais. Informe apenas tributos ainda não descontados do resultado; as retenções são o total da parcela de staking deste exemplo, não uma taxa universal por usuário.</p>
        <div className="distribution-tax__inputs">
          <label htmlFor="tax-profit">Resultado após custos, antes dos tributos
            <input id="tax-profit" type="number" step="any" value={profit} onChange={e => setProfit(e.target.value)} />
          </label>
          <label htmlFor="tax-entity">Tributos imputáveis à tesouraria
            <input id="tax-entity" type="number" min="0" step="any" placeholder="Informe o valor, inclusive zero" value={taxes} onChange={e => setTaxes(e.target.value)} />
          </label>
          <label htmlFor="tax-beneficiary">Retenções dos beneficiários
            <input id="tax-beneficiary" type="number" min="0" step="any" placeholder="Informe o valor, inclusive zero" value={withholding} onChange={e => setWithholding(e.target.value)} />
          </label>
        </div>
        <label className="distribution-tax__conditions">
          <input type="checkbox" checked={conditions} onChange={e => setConditions(e.target.checked)} />
          Neste exemplo, reservas, liquidez, conciliação e pesos elegíveis permitem o split antes e após todos os desembolsos.
        </label>
        <label className="distribution-tax__conditions"><input type="checkbox" checked={settled} onChange={e => setSettled(e.target.checked)} />Neste exemplo, tributos e retenções aplicáveis estão resolvidos e recolhidos; provisão isolada não permite disponibilização.</label>
        <div aria-live="polite">
          {result.status !== 'ready' ? <p role="status">{result.message}</p> : (
            <DocFacts title={conditions && settled ? 'Resultado ilustrativo após tributos' : 'Sem novo split: lucro líquido retido'} cols={3} facts={[
              { label: 'RESULTADO APÓS TRIBUTOS', value: money(result.netResult), text: 'Negativo ou zero não produz lucro elegível.' },
              { label: conditions && settled ? 'TESOURARIA · 50%' : 'TESOURARIA · RETENÇÃO', value: money(result.treasury), text: conditions && settled ? 'Parcela do lucro elegível líquido.' : 'Sem destinação a staking ou recompra nesta simulação.' },
              { label: 'CARTEIRA DE RECOMPRA · 25%', value: money(result.buyback), text: 'Destinação diária; compra depende de autorização da administração.' },
              { label: 'STAKING BRUTO · 25%', value: money(result.stakingGross), text: 'Direito bruto, antes da retenção fiscal.' },
              { label: 'IMPOSTO DOS BENEFICIÁRIOS', value: money(result.beneficiaryWithholding), text: 'Obrigação de recolhimento separada, não receita.' },
              { label: 'STAKING LÍQUIDO A PAGAR', value: money(result.stakingNet), text: 'Somente após as confirmações de pagamento entra no saldo disponível.' },
            ]} />
          )}
        </div>
        <p className="whitepaper__lead">A simulação não registra obrigações reais, recolhe impostos ou transfere recursos. Nenhuma alíquota foi presumida.</p>
      </DocGroup>
    </section>
  );
}