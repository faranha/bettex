import proposal from '@/lib/service-fee-proposal.json';

const percent = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });

export function ServiceFees() {
  return (
    <section id="documentacao-taxas" aria-labelledby="taxas-title">
      <span id="documentacao-burning" aria-hidden="true" />
      <h4 id="taxas-title" className="whitepaper__subhead">Taxas em BETTEX e financiamento da Fundação</h4>
      <div className="whitepaper__prose">
        <p><strong>As taxas são pagamentos à Fundação BETTEX, não queima de tokens.</strong> A compra de BETTEX do pool do projeto tem taxa de <strong>1%</strong> e o saque de USDC do pool de staking pelo aplicativo tem taxa de <strong>2%</strong>. Ambas são pagas em BETTEX, pela cotação informada antes da autorização.</p>
        <p><strong>Os tokens pagos como taxas vão para uma carteira separada, destinada à Fundação e de propriedade da Fundação.</strong> Essa carteira tem endereço próprio, distinto da tesouraria de investimentos e das carteiras pessoais dos titulares; a separação não é apenas contábil. Os valores recebidos pertencem à Fundação e financiam sua operação, fora do split de 75% / 25%.</p>
        <p><strong>Taxa em BETTEX = valor-base em USDC × percentual vigente ÷ cotação BETTEX/USDC.</strong> A cotação indica quantos USDC valem um BETTEX, com fonte, horário e validade. O recibo informa base, percentual, cotação, quantidade exigida, custos externos e resultado líquido. Percentual de serviço e cotação do token são grandezas distintas; uma mudança relevante exige nova cotação e autorização, sem cobrança silenciosa.</p>
      </div>
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
        <p><a href={`${import.meta.env.BASE_URL}downloads/bettex-taxas-fundacao.xlsx`} download>Baixar a planilha de taxas, calculadora e orçamento mensal da Fundação</a></p>
        <p><strong>Compra a 1% e saque de USDC do staking a 2% são percentuais definidos pelo criador.</strong> As taxas de swap e retirada de BETTEX continuam como sugestões adicionais, não percentuais aprovados. A demonstração não executa cobranças; antes da operação, as regras precisam de versão e vigência registradas. Recomenda-se não cobrar uma segunda taxa no crédito automático do yield nem no depósito simples de USDC: a taxa de saque incide quando o titular solicita a retirada pelo aplicativo.</p>
        <p><strong>Na primeira compra, a taxa pode sair dos próprios tokens adquiridos.</strong> O registro conjunto discrimina quantidade bruta comprada, taxa transferida à Fundação e quantidade líquida creditada ao titular; somente esta fica disponível para staking. Isso permite comprar sem saldo BETTEX anterior. Exemplo ilustrativo: compra de 100 USDC, cotação de 0,20 USDC por BETTEX e taxa de 1% resultam em 500 BETTEX brutos, 5 BETTEX para a Fundação e 495 BETTEX para o titular. Todo o USDC da venda pública continua na tesouraria; a taxa não cria emissão adicional.</p>
        <p><strong>No saque de USDC do pool de staking, a taxa de 2% é paga em BETTEX, não descontada novamente do yield.</strong> Exemplo ilustrativo: saque de 100 USDC do staking e cotação de 0,20 USDC por BETTEX exigem 10 BETTEX. O saque continua denominado em USDC, com custos externos discriminados. Saldo BETTEX insuficiente impede concluir o serviço até a regularização, mas não cancela os créditos de yield ou debita USDC para comprar tokens sem autorização. Uma compra para completar o saldo deve considerar também sua própria taxa de 1% e a quantidade líquida recebida.</p>
        <p>A autorização vincula serviço, titular, ativos, destinos, percentual e versão, cotação, valores máximos e quantidade líquida. A precisão executável deve ser validada; arredondamento não aumenta silenciosamente a taxa. Reserva não é cobrança concluída: transferência da taxa e operação têm referências vinculadas e efeito único. Falha comprovada exige corrigir eventual taxa de serviço cobrada por operação não realizada, com devolução identificada em BETTEX; custos externos efetivamente incorridos ficam separados. Incerteza exige conciliação, não repetição da cobrança nem devolução presumida.</p>
        <p><strong>Autocustódia permanece preservada.</strong> Exportar chaves não movimenta ativos nem gera taxa. Uma transferência feita diretamente pelo titular fora do aplicativo não paga taxa de serviço à Fundação; a cobrança de operações do aplicativo não se estende automaticamente a transferências externas de USDC.</p>
        <p>Transferir BETTEX como taxa não reduz a oferta, altera o vesting ou concede participação societária. O teto continua em 1 bilhão, com 65% / 20% / 15% e 36 meses de liberação. O saldo pago deixa de estar disponível ao titular após confirmação conciliada, preservando seu peso anterior na rodada. Tokens institucionais não se confundem com saldos pessoais elegíveis ao staking.</p>
      </div>
    </section>
  );
}