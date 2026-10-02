export function ExecutionConditions() {
  return (
    <section id="documentacao-condicoes-execucao" aria-labelledby="condicoes-execucao-title">
      <h4 id="condicoes-execucao-title" className="whitepaper__subhead">Condições de preço e odds na execução</h4>
      <div className="whitepaper__prose">
        <p><strong>A ordem enviada deve levar condições verificáveis pela plataforma, vinculadas à proposta autorizada e ao teto de gasto.</strong> Conforme a operação, isso inclui preço máximo de compra, preço mínimo de venda, odds mínimas ou mecanismo equivalente. As condições são registradas por ordem e parte da proposta; não se inventa um preço, percentual de variação ou odds universais.</p>
        <p><strong>O conector deve comprovar que a plataforma suporta e respeita as condições essenciais da ordem.</strong> Conferir uma cotação local antes do envio não substitui um mecanismo aplicado na execução externa. Sem essa capacidade verificável, não enviar. Não se troca silenciosamente para uma ordem sem proteção nem se habilita aceitação de condições desfavoráveis fora da autorização. As condições complementam a validade da cotação, o risco independente e a reserva de principal e custos, sem ampliar o orçamento autorizado.</p>
        <p>O registro preserva os parâmetros autorizados, os enviados e as respostas da plataforma, permitindo conferir preços ou odds efetivos, valores executados e custos na conciliação. Uma resposta de aceite não comprova execução integral. Execuções parciais têm efeito único; a parte incerta continua comprometida, e eventual divergência segue os bloqueios e a conciliação existentes, sem tratar uma execução comprovada como se não tivesse ocorrido.</p>
        <p><strong>Condições por ordem não tornam simultânea ou indivisível a execução de todas as partes de uma proposta coordenada.</strong> Não comprovam cancelamento nem liberam capital em resposta inconclusiva; preserva-se a consulta da operação original, sem reenvio automático. Mantêm-se percentuais, acumulados e apuração financeira única. Estas são exigências do modelo, não ordens protegidas ou conectores de negociação já implementados na demonstração.</p>
      </div>
    </section>
  );
}