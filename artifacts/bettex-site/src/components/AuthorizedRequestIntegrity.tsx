export function AuthorizedRequestIntegrity() {
  return (
    <section id="documentacao-integridade-pedido" aria-labelledby="integridade-pedido-title">
      <h4 id="integridade-pedido-title" className="whitepaper__subhead">Autorização vinculada à versão do pedido</h4>
      <div className="whitepaper__prose">
        <p><strong>Cada autorização de risco fica vinculada ao identificador e à versão registrada do conteúdo do pedido.</strong> O registro preserva proposta e partes, ativo, mercado, conector, direção, quantidades, valores, teto de custos e condições de execução autorizadas. A versão do pedido é distinta da versão das regras de risco: ambas acompanham a decisão, sem permitir que o conteúdo aprovado seja substituído no histórico.</p>
        <p><strong>Repetir o mesmo identificador e a mesma versão só reutiliza o registro quando o conteúdo autorizado coincide.</strong> Divergência nos campos da operação bloqueia o envio para conferência; não modifica a autorização existente, não cria outra reserva e não legitima uma ordem diferente sob o identificador anterior. Antes do envio, o núcleo confere que o pedido corresponde à revisão autorizada aplicável e que todos os controles atuais continuam atendidos.</p>
        <p>Atualizações legítimas de cotações, custos ou condições produzem revisão identificada, com vínculo à anterior, motivo, evidências e nova validação independente de risco. Preservam-se a autorização original e o histórico. Revalidar uma parte já autorizada e ainda não enviada não duplica reserva nem acumulado diário e não aumenta silenciosamente o orçamento. Uma revisão que falhe permanece sem autorização de envio.</p>
        <p>Nova revisão não transforma ordem enviada ou incerta em ordem ainda não enviada: consulta e conciliação continuam vinculadas à operação original, sem reenvio ou cancelamento presumidos. Uma nova ordem de substituição segue as regras de novos compromissos, preservando o consumo anterior. Mantêm-se percentuais, apuração única e execução automática autorizada, sem aprovação humana por investimento; este é um requisito do modelo, não validação de pedidos financeiros reais implementada na demonstração.</p>
      </div>
    </section>
  );
}