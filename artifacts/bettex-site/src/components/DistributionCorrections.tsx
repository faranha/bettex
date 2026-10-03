import { withdrawalPendingRule } from '@/lib/staking-withdrawal-policy';
import { distributionRemainderRule } from '@/lib/staking-rounding-policy';
import { independentRoundRule, closedRoundPaymentRule } from '@/lib/distribution-round-policy';

export function DistributionCorrections() {
  return (
    <section id="documentacao-correcoes" aria-labelledby="correcoes-title">
      <h3 id="correcoes-title" className="whitepaper__subhead">Correções após uma distribuição</h3>
      <div className="whitepaper__prose">
        <p><strong>{independentRoundRule}</strong></p>
        <p>{closedRoundPaymentRule}</p>
        <p>{withdrawalPendingRule}</p>
        <p>{distributionRemainderRule}</p>
        <p>Complementos e correções consideram apenas direitos ainda vigentes. Uma saída de BETTEX cancela os créditos anteriores ainda não pagos do ciclo; histórico preservado não autoriza restaurar esses direitos, executar complementos ou reenviar pagamentos cancelados.</p>
        <p><strong>Um erro de apuração ou de rateio é corrigido por ajuste identificado, vinculado à rodada original.</strong> O registro preserva o cálculo e os créditos anteriores, a causa do erro, as evidências, os valores corrigidos e os efeitos sobre R, P, B e as obrigações. O histórico não é apagado nem substituído silenciosamente. Cada ajuste e seu efeito financeiro são registrados uma única vez.</p>
        <p id="documentacao-excesso-pendente"><strong>Excesso de crédito comprovadamente não enviado é corrigido na obrigação pendente, não como pagamento a maior já realizado.</strong> O ajuste retira somente a parcela indevida, preserva o direito correto e identifica os valores anteriores, corrigidos, já liquidados e ainda pendentes da pessoa e rodada originais. Não autoriza debitar a carteira pessoal ou cancelar créditos por mera retenção. O valor antigo não pode continuar autorizando um envio incompatível com o direito corrigido. Parcelas vinculadas a envio iniciado, enviado ou incerto permanecem bloqueadas para conciliação; ausência de resposta não comprova não envio nem libera recursos.</p>
        <p>Em pagamento parcial, separar o excesso comprovadamente não enviado do excesso já recebido. Somente o primeiro reduz uma obrigação indevida ainda em execução. O excesso recebido é uma perda da tesouraria, sem cobrança automática do participante ou déficit a compensar com lucros futuros. Ajustar obrigações e patrimônio uma única vez, sem criar receita artificial em R.</p>
        <p><strong>Pagamento a maior não gera débito automático na Carteira USDC do participante.</strong> A perda comprovada é permanente e reduz o patrimônio uma única vez. Recursos já pagos não são caixa disponível. Rodadas posteriores continuam sujeitas à cobertura defensiva e à liquidez atualizadas, mas não assumem uma dívida de resultados anteriores.</p>
        <p id="documentacao-deficit-sucessivo"><strong>Correções sucessivas do mesmo fato registram somente a variação efetiva.</strong> Preservar origem, evidências, valores anteriores, ajustes e efeito patrimonial já reconhecido. Não repetir perdas ou pagamentos, apagar o histórico, criar receita fictícia ou transformar a correção em déficit acumulado para outra rodada.</p>
        <p>Corrigir um registro não comprova recuperação de ativos nem libera recursos incertos. A conciliação segue os fatos e os efeitos únicos em R, P, B e obrigações. Um erro histórico não entra como novo lucro realizado da rodada atual nem reabre uma distribuição encerrada.</p>
        <p><strong>Pagamento a menor pode ser ajustado somente enquanto a própria rodada estiver em execução.</strong> Conferir o valor executável correto e os pesos dessa rodada, descontando uma única vez recebimentos confirmados, reservas válidas e valores em conciliação. Não usar pesos atuais de outra rodada, incluir participantes novos, repetir o split ou substituir um envio incerto. Após o encerramento financeiro, corrigir o histórico não cria complemento, crédito acumulado ou direito a pagamento futuro.</p>
        <p>Durante a própria rodada, ajustes de pagamento exigem reservas, liquidez, tributos, custos e ausência de saída de BETTEX revalidados. Se o ajuste não puder ser executado antes do encerramento financeiro, não permanece como obrigação para uma rodada posterior. Seguir a <a href="#documentacao-retencao-creditos">regra de encerramento sem créditos futuros</a>; envios já iniciados ou incertos continuam apenas em conciliação.</p>
        <p><strong>Sem valores conciliados, não autorizar pagamentos.</strong> Uma rodada posterior toma sua própria decisão com dados confiáveis, reservas e liquidez verificadas. Não importa complementos, lucros ou pesos de rodadas encerradas, nem repete efeitos patrimoniais já registrados.</p>
        <p>Ajustes preservam as evidências da rodada original, sem alterar retroativamente suas regras ou reabri-la. Uma perda posterior pertence à apuração de sua própria rodada. Não há liberação futura de lucro retido, compensação acumulada de perdas ou recuperação de uma rodada sem pagamento.</p>
      </div>
    </section>
  );
}