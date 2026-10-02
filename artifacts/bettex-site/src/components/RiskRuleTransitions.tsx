export function RiskRuleTransitions() {
  return (
    <section id="documentacao-vigencia-risco" aria-labelledby="vigencia-risco-title">
      <h4 id="vigencia-risco-title" className="whitepaper__subhead">Vigência das regras e revalidação antes do envio</h4>
      <div className="whitepaper__prose">
        <p><strong>Cada conjunto de regras de risco tem versão identificada e instante UTC de vigência.</strong> Uma mudança exige proposta, justificativa, aprovação da liderança da Fundação BETTEX e execução registrada. Proposta ou aprovação isolada não tornam novos parâmetros vigentes. As decisões guardam versão, horário, base patrimonial e critérios usados; o histórico não é reclassificado pelas regras mais recentes.</p>
        <p><strong>Uma ordem reservada, mas ainda não enviada, deve ser revalidada pelas regras vigentes antes do envio.</strong> O núcleo independente confere a base atualizada, caixa, compromissos, exposições, pausas e permissões. A própria reserva e sua exposição entram uma única vez; revalidar não exige reservar novamente o mesmo capital nem somar de novo o compromisso ao acumulado diário. O registro preserva a autorização original e acrescenta a versão, o horário e o resultado da revalidação.</p>
        <p>Se a ordem não atender às regras vigentes, não é enviada. Uma autorização anterior não permite contornar limites novos; uma leitura desatualizada da versão não autoriza o envio. Se o envio já ocorreu ou seu estado for inconclusivo, aplica-se a regra de resultado desconhecido e conciliação, sem presumir cancelamento ou liberar recursos. Qualquer liberação comprovada segue os controles existentes e não devolve o acumulado diário consumido.</p>
        <p><strong>Operações já executadas não são desfeitas retroativamente por uma mudança de regra.</strong> Suas posições e compromissos continuam nos controles atuais de exposição e caixa; nenhuma versão nova os torna invisíveis. Preservam-se pausas já acionadas, o histórico das decisões e a conciliação de confirmações tardias. A revalidação continua automática pelo risco, sem aprovação humana por investimento. Este registro de vigência não altera os percentuais apresentados, o vesting ou as regras econômicas fora do escopo aprovado; é requisito do modelo, não um controle de negociação real implementado na demonstração.</p>
      </div>
    </section>
  );
}