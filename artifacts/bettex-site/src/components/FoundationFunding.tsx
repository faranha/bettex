import { DocFacts } from '@/components/DocFacts';

export function FoundationFunding() {
  return <section id="documentacao-financiamento-fundacao" aria-labelledby="financiamento-fundacao-title">
    <h3 id="financiamento-fundacao-title" className="whitepaper__subhead">Financiamento institucional separado da tesouraria</h3>
    <DocFacts title="Entidade em resumo" facts={[
      { label: 'ORÇAMENTO INICIAL', value: '50%', text: 'Dos aportes ligados aos investidores, para capital inicial e desenvolvimento.' },
      { label: 'RECEITA RECORRENTE', value: 'Taxas em USDC', text: 'US$ 2,50 por compra, saque USDC ou envio autônomo BETTEX tarifado.' },
      { label: 'SEPARAÇÃO', value: 'Caixa operacional', text: 'Carteira própria; fora da tesouraria e do split 75%/25%.' },
    ]} />
    <div className="whitepaper__prose">
      <p>A entidade BETTEX é organizada como uma empresa privada, administrada pelo fundador. Seu orçamento operacional financia desenvolvimento, infraestrutura, auditoria, administração e obrigações correspondentes.</p>
      <p>Os 50% dos aportes dos investidores destinados a capital inicial/desenvolvimento alimentam esse orçamento; os outros 50% vão à tesouraria. A venda pública primária destina integralmente o preço dos tokens à tesouraria, com a tarifa de serviço registrada separadamente.</p>
      <p>As receitas recorrentes são tarifas fixas pagas em USDC, não recebimento ou venda de BETTEX para custear a empresa. A carteira operacional pertence à entidade e tem endereço distinto da tesouraria e das carteiras pessoais. Tributos e custos precisam de provisão; receita bruta não é toda caixa livre.</p>
      <p>O fundador não recebe salário, conforme decisão do criador. A proposta inicial reúne seis funções em cinco pessoas, com quatro posições remuneradas e conteúdo/comunidade juntos. As taxas sustentam a remuneração recorrente; financiamento operacional aprovado cobre a implantação e a fase inicial quando necessário. Concessões individuais de tokens vêm da parcela pessoal do fundador, respeitam o vesting e não criam receita de serviços ou alocação adicional.</p>
      <p>Despesas institucionais não geram desconto automático na tesouraria nem nova taxa administrativa sobre o split. Custos efetivos e tributos dos investimentos seguem sua apuração própria. Uma mesma obrigação não recebe cobertura fiscal duplicada.</p>
      <p>Insuficiência operacional exige ajuste do orçamento ou financiamento documentado e aprovado, sem consumir créditos dos participantes. Remuneração por trabalho, amortização de empréstimos e dividendos têm registros diferentes. <a href="#documentacao-entidade">A área Entidade reúne administração, financiamento e condições de destinação do lucro.</a></p>
    </div>
  </section>;
}