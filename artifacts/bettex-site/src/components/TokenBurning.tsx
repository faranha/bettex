export function TokenBurning() {
  return (
    <section id="documentacao-burning" aria-labelledby="burning-title">
      <h4 id="burning-title" className="whitepaper__subhead">Taxas em BETTEX e burning</h4>
      <div className="whitepaper__prose">
        <p><strong>BETTEX tem duas funções: participação no staking e pagamento de taxas de serviço nas operações processadas pelo aplicativo oficial.</strong> As taxas são cobradas em BETTEX e os tokens utilizados nesse pagamento são queimados, retirados permanentemente da oferta. Não são ganhos distribuídos ao staking nem tokens transferidos à tesouraria.</p>
        <p>As taxas destinadas à queima não financiam a Fundação. Desenvolvimento, infraestrutura, auditoria e administração dependem de seu orçamento institucional separado da tesouraria de investimentos.</p>
      </div>
      <div className="whitepaper__rule-pair">
        <div><span>VENDAS POR SWAPPING NO APLICATIVO</span><p><strong>Vendas por swapping processadas pelo aplicativo oficial têm taxa de serviço em BETTEX.</strong> Antes da confirmação, o fluxo deve apresentar o valor da venda, a quantidade de BETTEX da taxa e o resultado líquido. Os tokens da taxa são destinados à queima.</p></div>
        <div><span>RETIRADAS PELO APLICATIVO</span><p><strong>Retiradas para carteira processadas pelo aplicativo oficial também têm taxa de serviço em BETTEX.</strong> O ativo retirado e a taxa ficam separados: por exemplo, um saque transfere USDC, enquanto a taxa é paga em BETTEX e queimada.</p></div>
      </div>
      <div className="whitepaper__prose">
        <p><strong>Exportar as chaves não movimenta os ativos nem gera taxa de retirada.</strong> Transferências realizadas diretamente pelo titular fora do aplicativo não estão sujeitas à taxa de serviço do aplicativo, mas continuam sujeitas aos custos da rede e às regras do contrato do token.</p>
        <p><strong>Os valores das taxas dependem das condições de mercado e podem variar.</strong> Não há percentual ou quantidade fixa definida nesta documentação. A regra vigente e a quantidade de BETTEX necessária devem ser informadas antes da autorização; se a cotação mudar, é necessária uma nova confirmação. Custos de rede e tarifas de provedores externos são identificados separadamente: a taxa do projeto em BETTEX não substitui automaticamente o gas da rede.</p>
        <p>O fluxo deve verificar saldo BETTEX suficiente para a taxa, reservar os valores e conciliar a operação antes de confirmar a cobrança e a queima. Uma solicitação repetida não pode cobrar ou queimar duas vezes; uma operação não concluída não deve aparecer como queima confirmada. O registro público identifica a operação, a regra aplicada, a quantidade cobrada, o estado da queima e sua referência verificável. A implementação e o mecanismo on-chain exigem validação e auditoria antes da operação.</p>
        <p><strong>A queima reduz a oferta existente, não altera o vesting.</strong> O teto de emissão bruta continua em 1 bilhão, com alocação de 65% / 20% / 15% e liberação em 36 meses. A oferta líquida considera os tokens efetivamente emitidos menos as queimas confirmadas; tokens queimados não participam do staking. O gráfico e a agenda mostram liberações brutas, não oferta líquida em circulação. Burning não autoriza emissão adicional nem garante valorização.</p>
        <p>A receita em USDC da venda pública pelo projeto, inclusive nas vendas diretas a corretoras, continua integralmente destinada à tesouraria. Numa revenda entre titulares, o pagamento vai ao vendedor, mesmo que os tokens tenham origem na parcela pública; não é nova captação. As taxas de serviço aplicáveis nas operações processadas pelo aplicativo continuam em BETTEX e destinadas à queima, sem transformar o pagamento da revenda em receita da tesouraria. A queima é um fluxo separado e não altera o split dos aportes dos investidores nem a liberdade dos tokens liberados do fundador.</p>
      </div>
    </section>
  );
}