import { withdrawalPendingRule } from '@/lib/staking-withdrawal-policy';
import { independentRoundRule, retainedRoundProfitRule, closedRoundPaymentRule } from '@/lib/distribution-round-policy';

export function ReservePolicy() {
  return (
    <section id="documentacao-reservas" aria-labelledby="reservas-title">
      <h3 id="reservas-title" className="whitepaper__subhead">Reserva defensiva antes de investir e distribuir</h3>
      <div className="whitepaper__prose">
        <p><strong>{independentRoundRule}</strong></p>
        <p><strong>Reservas e liquidez precedem a distribuição.</strong> A cobertura considera posições, compromissos e recursos disponíveis, sem dupla contagem. Recursos comprometidos não são caixa livre. Sem conciliação e controles atendidos, a rodada não distribui.</p>
        <p><strong>A reserva defensiva segue os parâmetros da política aprovada, com vigência e versão registradas.</strong> Não existe reserva geral obrigatória de 50% nem divisão fixa entre recursos defensivos e investíveis. A cobertura usa patrimônio líquido atualizado, ativos segregados, obrigações e liquidez conciliados. O piloto de US$ 100 mil não define esse parâmetro.</p>
        <p><strong>Cobertura defensiva = valor atualizado dos ativos efetivamente segregados para a reserva defensiva.</strong> Carteiras pessoais e capital comprometido nas estratégias não entram nessa cobertura. Os ativos defensivos podem ser aplicados em baixo risco, com objetivo de gerar yield mensal, sem taxa de rendimento definida nem garantia de retorno.</p>
        <p id="documentacao-reserva-investimentos"><strong>A cobertura defensiva mínima vigente também é obrigatória antes de novos investimentos.</strong> O núcleo independente confere patrimônio, ativos efetivamente segregados, avaliações e conciliação atuais antes da autorização e novamente antes do envio. Cobertura insuficiente bloqueia novos investimentos até recomposição comprovada; uma base investível positiva não dispensa esse controle. Recomposição planejada não conta como reserva já atendida. A insuficiência não cancela posições nem ordena vendas automáticas; reduções e encerramentos seguem os controles já aprovados. Sem dados confiáveis, não se presume cobertura suficiente.</p>
        <p id="documentacao-rendimentos-reserva"><strong>Os rendimentos realizados líquidos da reserva defensiva entram na mesma apuração da tesouraria.</strong> Custos e perdas dessas aplicações são considerados uma única vez, junto dos resultados das estratégias. Perdas são permanentes, sem déficit para rodadas futuras. O lucro elegível recebe o split de 50% tesouraria, 25% staking e 25% carteira de recompra, preservando origem, período e beneficiários elegíveis. Não há distribuição paralela da reserva nem pagamento mensal automático.</p>
        <p>O capital aplicado não é lucro. Rendimentos estimados ou ainda não realizados podem refletir a avaliação dos ativos em P, mas não aumentam o resultado realizado R da rodada nem autorizam distribuição por si só. Receber ou reinvestir rendimentos não significa ter caixa livre. Se cobertura defensiva, liquidez ou outra condição falhar na decisão da rodada, ela não paga: o lucro permanece na tesouraria e não é liberado para staking em uma rodada posterior.</p>
        <p><strong>Reserva atendida exige cobertura conforme a política vigente.</strong> Antes de distribuir, a tesouraria confere recursos líquidos para obrigações exigíveis e desembolsos propostos, sem valores comprometidos. Aplicação defensiva não equivale automaticamente a caixa imediato. Sem parâmetro aprovado e dados confiáveis, a verificação não presume cobertura.</p>
        <p>O núcleo de controle registra os ativos segregados, seus valores e fontes de avaliação, os recursos líquidos disponíveis, as obrigações exigíveis, os compromissos existentes e a distribuição proposta. Valores comprometidos não podem ser contados como caixa livre; a apuração deve evitar duplicidade de ativos, obrigações e pagamentos.</p>
        <p><strong>O split só é permitido se a reserva mínima e a liquidez estiverem atendidas antes e permanecerem atendidas após a distribuição projetada.</strong> A simulação considera o efeito do crédito ou pagamento ao staking sobre o patrimônio, a cobertura defensiva e o caixa disponível, sem contar a posterior liquidação de uma obrigação já registrada como nova redução patrimonial.</p>
        <p><strong>{retainedRoundProfitRule}</strong></p>
        <p>{closedRoundPaymentRule}</p>
        <p>{withdrawalPendingRule}</p>
        <p>Se a soma dos pesos elegíveis da rodada for zero, ela não paga e 100% do lucro fica na tesouraria. Não há parcela de staking, crédito acumulado ou liberação futura. Uma rodada posterior com pesos positivos usa somente seus próprios resultados, conforme a <a href="#documentacao-rodada-sem-pesos">regra para rodada sem pesos elegíveis</a>.</p>
        <p>Alterações nesses parâmetros seguem a fila de sugestões da IA e a aprovação da administração do projeto, com registro de vigência e sem mudança retroativa de rodadas já apuradas. Sem avaliação ou conciliação confiável, a distribuição não é autorizada.</p>
      </div>
    </section>
  );
}