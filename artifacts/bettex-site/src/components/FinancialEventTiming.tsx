export function FinancialEventTiming() {
  return (
    <section id="documentacao-dia-resultado" aria-labelledby="dia-resultado-title">
      <h4 id="dia-resultado-title" className="whitepaper__subhead">Dia UTC do resultado e confirmação tardia</h4>
      <div className="whitepaper__prose">
        <p><strong>Resultados realizados pertencem ao dia UTC da realização comprovada, não ao dia de chegada da mensagem.</strong> O registro preserva separadamente o instante do fato financeiro, o recebimento da informação e a conclusão da conciliação, com identificador e evidências da fonte. Horários com fuso explícito são convertidos para UTC. A abertura ou o envio de uma ordem não comprovam, por si só, realização de lucro ou perda.</p>
        <p><strong>Uma confirmação tardia adiciona ou corrige o resultado no dia original por registro identificado, sem duplicá-lo no dia atual.</strong> O histórico preserva os dados anteriores, a evidência, a causa e o efeito do ajuste. Resultados e custos conciliados têm efeito único nos controles global e por mercado e na apuração financeira; receber novamente a confirmação não gera outro resultado, custo ou ajuste. Corrigir o relatório histórico não apaga pausas já registradas nem desfaz operações executadas.</p>
        <p><strong>Sem horário confiável da realização, o evento permanece pendente de investigação e conciliação.</strong> Não se presume o horário local do servidor, a chegada da mensagem ou a autorização da ordem como substituto. Os bloqueios por falta de conciliação permanecem. A atribuição ao dia anterior também não equivale a saldo disponível antes de uma transferência confirmada e conciliada.</p>
        <p>Os novos compromissos continuam no dia UTC da autorização e reserva; resultados ficam no dia da realização comprovada. Essa atribuição não muda, por si só, a rodada de autorização do split, seus pesos ou créditos. Uma liberação de lucro retido e uma correção de distribuição já autorizada seguem suas regras próprias, preservando R, P, B e obrigações com efeito único. Confirmações tardias podem corrigir relatórios de dias anteriores; estes são requisitos do modelo, não conciliações financeiras já implementadas na demonstração.</p>
      </div>
    </section>
  );
}