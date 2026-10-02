export function CoordinatedContinuation() {
  return (
    <section id="documentacao-continuacao-proposta" aria-labelledby="continuacao-proposta-title">
      <h4 id="continuacao-proposta-title" className="whitepaper__subhead">Reavaliação após execução parcial ou recusa</h4>
      <div className="whitepaper__prose">
        <p><strong>Após execução parcial ou recusa de uma parte, o conjunto é reavaliado antes de enviar partes restantes.</strong> A decisão usa quantidades e valores efetivamente executados, custos, estados conciliados das ordens e cotações atuais das partes ainda não enviadas. Não se considera executada uma quantidade apenas planejada nem se presume que a cobertura originalmente calculada já exista.</p>
        <p><strong>A continuação exige nova validação automática pelo núcleo independente de risco, dentro do orçamento e das condições autorizadas.</strong> A verificação considera a composição atual da proposta e a viabilidade de suas condições, além da base investível, caixa, reservas, exposição global, por mercado e correlacionada, pausas, permissões e condições externas de execução. A autorização inicial não basta para continuar uma composição desatualizada. Se a reavaliação falhar, as partes ainda não enviadas ficam bloqueadas.</p>
        <p>Uma parte com resultado desconhecido não permite completar o conjunto por suposição: consulta-se e concilia-se a operação original, preservando os bloqueios existentes. Posições executadas não são canceladas retroativamente, e capital incerto permanece comprometido. Partes já enviadas não são tratadas como se estivessem apenas aguardando envio; seus estados seguem a conciliação própria, sem reenvio ou liberação presumidos.</p>
        <p>O registro vincula a reavaliação à proposta e às partes, preservando a autorização anterior, evidências, horários, composição atual e decisão. Revalidar uma parte ainda não enviada e já autorizada não duplica reserva nem acumulado diário. Uma nova ordem de substituição segue as regras de novos compromissos, sem apagar o consumo anterior. Mantêm-se percentuais, apuração única e execução automática autorizada, sem aprovação humana por investimento; estes são requisitos do modelo, não operações financeiras reais implementadas na demonstração.</p>
      </div>
    </section>
  );
}