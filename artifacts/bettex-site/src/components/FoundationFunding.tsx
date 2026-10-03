import { DocFacts } from '@/components/DocFacts';

export function FoundationFunding() {
  return (
    <section id="documentacao-financiamento-fundacao" aria-labelledby="financiamento-fundacao-title">
      <h4 id="financiamento-fundacao-title" className="whitepaper__subhead">Financiamento institucional separado da tesouraria</h4>
      <DocFacts title="Fundação em resumo" cols={3} facts={[
        { label: 'ORÇAMENTO INICIAL', value: '50%', text: 'Dos aportes dos investidores, para capital inicial e desenvolvimento.' },
        { label: 'FINANCIAMENTO RECORRENTE', value: 'Taxas em BETTEX', text: 'Alvos líquidos de tributos: 1% na compra e 2% no saque.' },
        { label: 'SEPARAÇÃO', value: 'Fora da tesouraria', text: 'Carteira própria; fora do split 75% / 25%.' },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>A Fundação BETTEX, entidade a constituir, é responsável por financiar o desenvolvimento e as despesas recorrentes de infraestrutura, auditoria e administração com recursos próprios, segregados da tesouraria de investimentos.</strong> A parcela de 50% dos aportes dos investidores destinada a capital inicial e desenvolvimento integra esse orçamento separado; os outros 50% continuam destinados à tesouraria. A receita da venda pública permanece integralmente na tesouraria.</p>
        <p><strong>O financiamento recorrente vem das taxas de serviço pagas em BETTEX à Fundação.</strong> 1% nas compras do pool e 2% nos saques de USDC do staking são alvos líquidos de tributos, antes das demais despesas. A cobrança total inclui cobertura fiscal validada, inclusive dos tributos sobre lucro das taxas, discriminada e autorizada pelo usuário. A provisão fiscal não é orçamento livre: separar o valor para recolhimento da receita líquida-alvo e não financiá-lo novamente pela tesouraria ou por outro pagamento.</p>
        <p>Essa carteira institucional tem endereço próprio, distinto dos endereços da tesouraria de investimentos e das carteiras dos titulares. Os tokens nela recebidos como taxa pertencem à Fundação: não são queimados nem integram a tesouraria. O registro separa receitas de taxas, orçamento inicial, pagamentos de despesas e conversões efetivamente realizadas.</p>
        <p><strong>Despesas institucionais de desenvolvimento e operação permanecem no orçamento separado.</strong> A cobertura de todos os tributos segue a regra fiscal aprovada: custo embutido na cobrança do usuário e/ou deduções da tesouraria ou pagamentos, conforme fonte identificada e validada, sem exigir dinheiro próprio da Fundação para esse custo. Custos diretamente ligados aos investimentos continuam na apuração líquida. Contabilidade separada não exclui tributos nem permite duplicar sua cobertura. Seguir o <a href="#documentacao-tributos">tratamento fiscal</a>.</p>
        <p>Receber BETTEX não é receber caixa em USDC: para despesas nessa moeda, o orçamento considera a venda ou utilização efetiva dos tokens, com valores líquidos conciliados. A venda de tokens já recebidos como taxa é uma alienação de ativos institucionais da Fundação, não nova venda do estoque público nem aporte à tesouraria. Cotação estimada não é caixa disponível. O financiamento por serviços não altera o split do lucro elegível de 75% para a tesouraria e 25% para o staking.</p>
        <p>Se o orçamento institucional for insuficiente, a liderança da Fundação deve informar a insuficiência e definir as medidas de continuidade, sem transferir automaticamente o déficit à tesouraria. O financiamento separado não constitui garantia de operação ininterrupta.</p>
      </div>
    </section>
  );
}