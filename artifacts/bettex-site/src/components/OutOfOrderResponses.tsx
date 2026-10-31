export function OutOfOrderResponses() {
  return (
    <section id="documentacao-respostas-fora-de-ordem" aria-labelledby="respostas-fora-de-ordem-title">
      <h3 id="respostas-fora-de-ordem-title" className="whitepaper__subhead">Respostas obsoletas e confirmações fora de ordem</h3>
      <div className="whitepaper__prose">
        <p><strong>A ordem de chegada das respostas não determina, por si só, o estado da operação.</strong> Uma mensagem de estado comprovadamente obsoleta não desfaz execução confirmada, não recria reserva já conciliada e não libera capital indevidamente. Um aceite antigo recebido depois da execução não transforma a ordem em apenas aceita; uma resposta antiga de cancelamento não substitui a conferência das execuções e dos recursos efetivamente disponíveis.</p>
        <p><strong>Divergências são conferidas com a operação original e evidências confiáveis da plataforma.</strong> O registro vincula fonte, referências da ordem e fatos confirmados, preservando separadamente os horários do fato, do recebimento e da conciliação. Não basta escolher a última mensagem recebida ou presumir uma sequência universal entre plataformas. Sem comprovação suficiente, o estado permanece pendente de conciliação, com os bloqueios existentes e sem reenvio ou liberação presumidos.</p>
        <p>Uma confirmação tardia de execução ou resultado válido não é descartada apenas por ser antiga ou chegar depois de outra resposta. Seus fatos entram uma única vez, com custos e exposição correspondentes; resultados realizados seguem o <a href="#documentacao-dia-resultado">dia UTC da realização comprovada</a>. Correções comprovadas continuam permitidas por ajuste identificado, vinculado ao registro original, com causa, evidências e efeitos conciliados, sem apagar o histórico.</p>
        <p>Mensagens repetidas não duplicam execução, reserva, custo, liberação ou resultado; correções não registram novamente efeitos já reconhecidos. Preservam-se compromissos diários, pausas e controles atuais. Esta regra complementa a conciliação de ordens incertas e a apuração única, sem alterar percentuais ou autorizar novas ordens.</p>
      </div>
    </section>
  );
}