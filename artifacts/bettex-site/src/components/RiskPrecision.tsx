export function RiskPrecision() {
  return (
    <section id="documentacao-precisao-risco" aria-labelledby="precisao-risco-title">
      <h3 id="precisao-risco-title" className="whitepaper__subhead">Precisão dos limites e das reservas em USDC</h3>
      <div className="whitepaper__prose">
        <p><strong>Os controles usam valores exatos e a precisão validada dos ativos e conectores, não números arredondados apenas para exibição.</strong> Tetos monetários de risco são convertidos para valores executáveis com arredondamento para baixo, sem aumentar os percentuais aprovados. Necessidades de reserva são arredondadas para cima, de modo que a quantidade reservada não fique abaixo do valor necessário. Não se presume uma quantidade universal de casas decimais para todas as plataformas.</p>
        <p><strong>Principal e teto de custos, após conversão para valores executáveis, precisam caber no orçamento, no caixa e nos limites vigentes.</strong> Não se arredonda o pedido ou a exposição para baixo apenas para fazê-los caber. Se não houver valor executável compatível, a proposta é recusada ou reavaliada; alterar quantidades ou condições exige registro e nova validação, nunca ajuste silencioso. Um teto convertido em zero não permite compromisso positivo; o arredondamento não cria resultado, perda realizada ou pausa por perda por si só.</p>
        <p>Em propostas coordenadas, as parcelas executáveis e a atribuição dos custos compartilhados devem fechar exatamente no total autorizado. Um custo comum não é reservado duas vezes por ser atribuído a dois mercados; diferenças de precisão não permitem duplicar recursos ou ultrapassar o teto do conjunto. O registro preserva precisão usada, base, percentual, teto calculado, teto executável e valores autorizados, permitindo conferir a decisão.</p>
        <p>O valor reservado e autorizado entra uma única vez no acumulado diário; eventual sobra comprovada segue a conciliação, sem devolver esse consumo. Arredondar a reserva prevista não reconhece despesa antecipada nem altera R, P ou B por si só. Custos efetivos seguem a apuração única. Esta regra limita-se aos controles de investimento em USDC, sem alterar quantidades de BETTEX, vesting ou staking.</p>
      </div>
    </section>
  );
}