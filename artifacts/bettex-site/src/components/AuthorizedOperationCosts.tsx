export function AuthorizedOperationCosts() {
  return (
    <section id="documentacao-custos-autorizados" aria-labelledby="custos-autorizados-title">
      <h3 id="custos-autorizados-title" className="whitepaper__subhead">Principal e teto de custos no valor autorizado</h3>
      <div className="whitepaper__prose">
        <p><strong>Valor autorizado e reservado = principal comprometido + teto dos custos operacionais da proposta, em USDC.</strong> O registro discrimina principal, comissões, custos de execução, liquidação e rede aplicáveis, suas fontes e o teto verificável de gasto. Os limites individual e de novos compromissos consideram essa soma, não apenas o principal. Sem estimativa confiável e teto de gasto verificável, a proposta não é autorizada; tarifas não são presumidas nem inventadas.</p>
        <p>O núcleo de risco verifica os limites, o caixa necessário e registra a reserva integral antes do envio, conforme a <a href="#documentacao-precisao-risco">precisão dos tetos e das necessidades de reserva</a>. Em propostas coordenadas, custos próprios das partes e custos compartilhados compõem o total uma única vez; sua atribuição aos mercados permite conferir as parcelas sem duplicar a despesa comum. A revalidação antes do envio também confere se o gasto continua dentro do valor autorizado. Uma mudança de custo não permite aumentar silenciosamente o orçamento nem executar além do teto aprovado pelo risco.</p>
        <p><strong>A reserva de um custo previsto não é uma despesa realizada nem um desconto adicional em P, R ou B.</strong> Custos efetivos e obrigações seguem a apuração única, com evidências e conciliação; um custo já reconhecido não é descontado novamente ao ser pago. Valores pagos em custos não se transformam em posições abertas, e reservas, pagamentos e posições não duplicam o mesmo recurso nos controles de caixa e exposição.</p>
        <p>O acumulado diário conserva o valor integral autorizado, incluindo o teto de custos, no dia UTC da autorização e reserva. Uma sobra comprovadamente livre pode ser liberada após conciliação, mas não devolve capacidade diária; incerteza mantém o valor comprometido. O custeio operacional geral permanece em aberto e não autoriza despesas presumidas ou retiradas automáticas da tesouraria. Preservam-se percentuais e regras econômicas.</p>
      </div>
    </section>
  );
}