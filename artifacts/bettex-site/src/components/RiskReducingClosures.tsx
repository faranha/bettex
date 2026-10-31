export function RiskReducingClosures() {
  return (
    <section id="documentacao-reducao-na-pausa" aria-labelledby="reducao-na-pausa-title">
      <h3 id="reducao-na-pausa-title" className="whitepaper__subhead">Redução de posições durante a pausa por perda diária</h3>
      <div className="whitepaper__prose">
        <p><strong>A pausa por perda diária admite redução ou encerramento de posições existentes somente quando o núcleo independente comprovar redução do risco do conjunto.</strong> A decisão considera posições, compromissos e coberturas atuais, não apenas a diminuição do valor de uma ordem. Não permite abrir novas posições ou desmontar uma cobertura aumentando o risco das partes restantes. Sem essa comprovação, a operação não é autorizada.</p>
        <p><strong>A exceção é exclusiva da pausa por perda diária e não dispensa os demais controles.</strong> Caixa, reservas, orçamento de custos, limites aplicáveis, permissões, cotações válidas, condições de execução e conciliação continuam obrigatórios antes do envio. Pausas de emergência, divergências de saldo, perda de comunicação e outros bloqueios de segurança não são ultrapassados; esses controles ainda podem impedir o fechamento. Uma redução apenas planejada não libera recursos de uma posição nem de uma ordem incerta.</p>
        <p>Ganhos, perdas e custos efetivos do encerramento continuam na apuração única e no resultado diário conciliado. Fechar uma posição não zera perdas, não apaga o motivo da pausa nem antecipa seu término; ganhos posteriores também não a encerram. O principal recuperado não se torna lucro por ser recebido, e o caixa liberado não autoriza reinvestir durante a pausa.</p>
        <p>O registro preserva as evidências da redução de risco, a composição antes e depois, os controles verificados, a decisão e os estados posteriores. Execução parcial ou desconhecida mantém a conciliação e os compromissos correspondentes, sem cancelamento, liberação ou reenvio presumidos. Mantêm-se os percentuais e a duração da pausa até o próximo dia UTC.</p>
      </div>
    </section>
  );
}