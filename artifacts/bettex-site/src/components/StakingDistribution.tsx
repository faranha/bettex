export function StakingDistribution() {
  return (
    <section id="documentacao-rateio" aria-labelledby="rateio-title">
      <h4 id="rateio-title" className="whitepaper__subhead">Rateio diário por quantidade e tempo</h4>
      <div className="whitepaper__prose">
        <p><strong>Cada rodada diária considera o período de 00h00 até 00h00 do dia seguinte, em UTC.</strong> O peso de cada participante é a soma da quantidade de BETTEX disponível na carteira oficial multiplicada pelo tempo elegível em cada intervalo da rodada. Compras, vendas, transferências e queimas alteram o saldo elegível a partir de sua confirmação conciliada. O instante de encerramento de uma rodada pertence à seguinte, sem contagem duplicada.</p>
        <p><strong>Peso individual = soma de (BETTEX disponível × tempo elegível).</strong> Todos os participantes usam a mesma unidade de tempo. O denominador é a soma dos pesos elegíveis de todos os participantes na mesma rodada, não o teto de emissão nem o saldo total observado apenas no instante do pagamento.</p>
        <p><strong>Pagamento individual em USDC = parcela destinada ao staking × peso individual ÷ soma dos pesos da rodada.</strong> Essa parcela corresponde aos 25% do lucro elegível ao split, limitado pelo ganho patrimonial líquido acima da base de referência, considerando também as posições abertas. As condições de compensação de perdas, conciliação e reservas continuam obrigatórias. Não é um rendimento fixo sobre o investimento. Se não houver peso elegível, não há rateio nem divisão por zero.</p>
        <p>Tokens ainda não liberados, estoque de venda do projeto e tokens queimados não participam. Somente saldos disponíveis entram no cálculo, não os tokens reservados para taxas. Tokens do fundador e dos investidores seguem os mesmos critérios de elegibilidade dos demais titulares.</p>
        <p><strong>Quem vende ou retira deixa de acumular participação sobre a quantidade que saiu, mas conserva o peso do período em que ela esteve elegível.</strong> Não é necessário permanecer até o pagamento. Atrasos na apuração ou no crédito não apagam o peso da rodada nem acrescentam tempo a uma rodada encerrada. Entradas posteriores não recebem participação referente a períodos anteriores à confirmação de seu saldo.</p>
        <p>Exemplo com apenas dois participantes: 1.000 BETTEX por 24 horas produzem 24.000 token-horas; 1.000 BETTEX por 12 horas produzem 12.000 token-horas. As participações são, respectivamente, ⅔ e ⅓ da parcela distribuível. O exemplo demonstra a fórmula, não uma promessa de lucro.</p>
        <p>O registro da rodada deve permitir conferir os intervalos de saldo, o peso individual, a soma dos pesos, a parcela distribuível e o crédito único na Carteira USDC. Esses cálculos são requisitos do modelo, não funções financeiras já implementadas na demonstração.</p>
      </div>
    </section>
  );
}