import { DocFacts, DocGroup } from '@/components/DocFacts';
import proposal from '@/lib/service-fee-proposal.json';
import { FeeTaxGrossUp } from '@/components/FeeTaxGrossUp';

const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });

export function ServiceFees() {
  return (
    <section id="documentacao-taxas" aria-labelledby="taxas-title">
      <span id="documentacao-burning" aria-hidden="true" />
      <h4 id="taxas-title" className="whitepaper__subhead">Taxas em BETTEX e financiamento da Fundação</h4>
      <DocFacts title="Taxas definidas em resumo" tone="accent" facts={[
        { label: 'COMPRA NO POOL', value: '1% líquido', text: 'Alvo após tributos. Cobrança total inclui cobertura fiscal.' },
        { label: 'SAQUE DE USDC DO STAKING', value: '2% líquido', text: 'Alvo após tributos. Cobrança total paga em BETTEX.' },
        { label: 'DESTINO', value: 'Fundação', text: 'Carteira separada, de propriedade da Fundação.' },
      ]} />
      <div className="whitepaper__prose">
        <p><strong>As taxas são pagamentos à Fundação BETTEX, não queima de tokens.</strong> Na compra do pool, <strong>1%</strong> é a receita líquida-alvo após tributos; no saque de USDC do staking pelo aplicativo, o alvo é <strong>2%</strong>. Não são tetos da cobrança total. Acrescentar a cobertura fiscal validada para preservar esses alvos, inclusive a incidência sobre o próprio acréscimo. O total é pago em BETTEX pela cotação e composição informadas antes da autorização.</p>
        <p><strong>Os tokens cobrados vão para uma carteira separada, destinada à Fundação e de propriedade dela.</strong> O endereço é distinto da tesouraria de investimentos e das carteiras dos titulares. Separar a provisão fiscal vinculada ao recolhimento da receita líquida-alvo que financia a operação, fora do split 75% / 25%; o recebimento bruto não é inteiro orçamento livre.</p>
      </div>
      <DocGroup title="Como calcular a taxa">
        <div className="whitepaper__prose">
          <p><strong>Alvo líquido = valor-base em USDC × 1% ou 2%. Cobrança em BETTEX = total após recomposição tributária ÷ cotação BETTEX/USDC.</strong> A cotação indica quantos USDC valem um BETTEX, com fonte, horário e validade. O recibo informa base, alvo líquido, provisão fiscal, total, cotação, quantidade exigida, custos externos e líquido do titular. Dados fiscais ausentes impedem calcular o total; não significam isenção. Mudança relevante exige nova cotação e autorização.</p>
        </div>
      </DocGroup>
      <div className="whitepaper__vesting-scroll" role="region" aria-label="Percentuais definidos e sugestões adicionais de taxas" tabIndex={0}>
        <table className="whitepaper__vesting-table">
          <caption>Taxas definidas e sugestões adicionais · cobrança não implementada na demonstração</caption>
          <thead><tr><th scope="col">Operação</th><th scope="col">Percentual</th><th scope="col">Base de cálculo</th><th scope="col">Situação</th></tr></thead>
          <tbody>
            {proposal.fees.map(fee => <tr key={fee.operation}><th scope="row">{fee.operation}</th><td>{percent.format(fee.rate)}</td><td>{fee.basis}</td><td>{fee.scope}</td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="whitepaper__prose">
        <p><a href="#documentacao-projecoes-taxas">Ver as projeções econômicas por comportamento do usuário</a> · <a href={`${import.meta.env.BASE_URL}downloads/bettex-taxas-fundacao.xlsx`} download>Baixar a planilha de taxas, projeções e orçamento mensal da Fundação</a></p>
        <p><strong>1% na compra e 2% no saque são alvos líquidos de tributos definidos pelo criador.</strong> O total pode ser maior para cobrir os tributos validados; não definir acréscimo universal. Swap e retirada de BETTEX continuam como sugestões, sem mudança de escopo. A demonstração não cobra; regras e composição fiscal exigem versão, vigência e autorização. Não há segunda taxa de serviço no crédito automático do yield ou no depósito simples.</p>
        <p><strong>Na primeira compra, a cobrança total pode sair dos próprios tokens adquiridos.</strong> Discriminar quantidade bruta, líquido-alvo da Fundação, provisão fiscal e quantidade líquida do titular; somente esta participa do staking. Em uma compra ilustrativa de 100 USDC a 0,20 USDC por BETTEX, são 500 BETTEX brutos e alvo de 5 BETTEX líquidos de tributos para a Fundação. A dedução total e o saldo do titular dependem da cobertura fiscal, não são presumidos como 5 e 495 BETTEX. Se a cobrança esgotar a compra, não autorizar. Todo USDC da venda pública permanece na tesouraria, sem emissão adicional.</p>
        <p><strong>No saque, a cobrança total é paga em BETTEX e não descontada novamente do yield.</strong> Um saque ilustrativo de 100 USDC a 0,20 USDC por BETTEX tem alvo de 10 BETTEX líquidos de tributos para a Fundação; a quantidade total exigida depende do cálculo fiscal validado. Saldo insuficiente impede concluir o serviço, mas não cancela créditos nem autoriza compra automática. Reposição de BETTEX exige cotação fiscal própria da compra: a quantidade líquida adquirida deve cobrir a cobrança total do saque, incluindo também a cobrança total da compra, sem presumir o mesmo regime ou uma dedução fixa de 1%.</p>
        <p>A autorização vincula serviço, titular, ativos, destinos, percentual e versão, cotação, valores máximos e quantidade líquida. A precisão executável deve ser validada; arredondamento não aumenta silenciosamente a taxa. Reserva não é cobrança concluída: transferência da taxa e operação têm referências vinculadas e efeito único. Falha comprovada exige corrigir eventual taxa de serviço cobrada por operação não realizada, com devolução identificada em BETTEX; custos externos efetivamente incorridos ficam separados. Incerteza exige conciliação, não repetição da cobrança nem devolução presumida.</p>
        <p><strong>Autocustódia permanece preservada.</strong> Exportar chaves não movimenta ativos nem gera taxa. Uma transferência feita diretamente pelo titular fora do aplicativo não paga taxa de serviço à Fundação; a cobrança de operações do aplicativo não se estende automaticamente a transferências externas de USDC.</p>
        <p>Transferir BETTEX como taxa não reduz a oferta, altera o vesting ou concede participação societária. O teto continua em 1 bilhão, com 65% / 20% / 15% e 36 meses de liberação. O saldo pago deixa de estar disponível ao titular após confirmação conciliada, preservando seu peso anterior na rodada. Tokens institucionais não se confundem com saldos pessoais elegíveis ao staking.</p>
      </div>
      <FeeTaxGrossUp />
    </section>
  );
}