import { retainedRoundProfitRule } from '@/lib/distribution-round-policy';
import { DocumentationConsistency } from './DocumentationConsistency';

export function ProfitAccounting() {
  return (
    <section id="documentacao-apuracao" aria-labelledby="apuracao-title">
      <h3 id="apuracao-title" className="whitepaper__subhead">Apuração do lucro e perdas nas posições abertas</h3>
      <DocumentationConsistency area="economics" />
      <div className="whitepaper__prose">
        <p>{retainedRoundProfitRule}</p>
        <p><strong>Lucro realizado positivo, isoladamente, não autoriza a distribuição.</strong> Antes do split, a apuração considera resultado líquido, posições abertas, custos e obrigações. Ganhos não realizados não são distribuíveis. Os registros são conciliados e expressos em USDC.</p>
        <p>Os custos dessa apuração são os diretamente relacionados às operações de investimento, incluindo execução, liquidação e custos de rede dessas operações. Também entram os custos operacionais efetivos suportados pela tesouraria em suas transferências e na liquidação das distribuições, registrados no dia UTC da realização comprovada, sem duplicidade. O custeio de desenvolvimento, infraestrutura, auditoria e administração permanece em aberto. Não constitui uma despesa presumida da rodada nem autoriza retirada automática da tesouraria. Orçamento reservado não antecipa despesa; pagar um custo já reconhecido não o desconta novamente.</p>
        <p><strong>Perdas são permanentes.</strong> Uma perda conciliada reduz o patrimônio uma única vez e não cria déficit a compensar com lucros de rodadas futuras. Resultados posteriores são apurados pela própria origem e período. A recomposição da reserva defensiva é um controle de cobertura patrimonial, não uma dívida de resultados antigos.</p>
        <p><strong>Capital, resultados e obrigações têm registros separados.</strong> O patrimônio líquido atualizado inclui reserva defensiva e posições abertas, descontando obrigações; carteiras pessoais ficam fora dele. Aportes e devolução do principal não são lucro. Registrar a obrigação de uma distribuição e depois pagá-la não pode reduzir o patrimônio duas vezes.</p>
        <p><strong>O split incide somente no lucro líquido realizado, conciliado e elegível da própria rodada.</strong> R contém o resultado realizado líquido dessa rodada, não lucro acumulado de rodadas anteriores. Custos, posições abertas e o limite patrimonial continuam sendo considerados. Lucros anteriores, distribuídos ou não, nunca entram no novo rateio; o histórico patrimonial não é apagado.</p>
        <p>Com reservas, liquidez, conciliação e pesos elegíveis atendidos antes e após todos os desembolsos, aplica o split de 50% para retenção na tesouraria, 25% para staking e 25% para a carteira exclusiva de recompra. Sem peso elegível, reserva ou liquidez suficientes, 100% permanece na tesouraria, sem split ou destinação à recompra. Novos participantes nunca recebem lucros anteriores e qualquer saída de BETTEX cancela os créditos anteriores ainda não pagos do ciclo e zera todo o peso acumulado.</p>
        <p id="documentacao-registro-split"><strong>Autorizar o split e registrar seus efeitos e créditos formam uma decisão indivisível e durável no livro compartilhado.</strong> Identifica rodada, origem e período dos resultados, revisão, regras, dados conciliados, pesos elegíveis, direitos, obrigações e efeitos patrimoniais antes e depois. Revalida o estado vigente antes do lançamento. Concorrência, repetição ou retomada não autorizam usar o mesmo lucro duas vezes; falha não deixa crédito isolado de seu efeito contábil. Erros e fatos tardios exigem ajustes identificados. Liberação posterior não troca a origem dos resultados nem inclui novos participantes em lucros anteriores.</p>
        <p>Resgatar o principal de uma aplicação defensiva movimenta recursos da tesouraria, sem criar lucro. Realizar um rendimento já refletido na avaliação patrimonial não aumenta o patrimônio novamente. Reinvestir um rendimento não cria um segundo resultado nem outro direito ao split.</p>
        <p>Exemplo na mesma apuração: patrimônio inicial de US$ 100.000, ganho realizado de US$ 1.000 e perda de US$ 5.000 nas posições abertas resultam em US$ 96.000, sem outros movimentos. A avaliação conjunta não autoriza distribuir o ganho isolado ignorando a perda. Isso não cria déficit a compensar com rodadas futuras.</p>
        <p id="apuracao-exemplo"><strong>Exemplo de perda permanente e novos lucros.</strong> Valores em USDC, após cada etapa, com aporte inicial de 100.000. As etapas de resultado representam apurações distintas, líquidas de custos, sem posições abertas ou outros movimentos. Cada split pressupõe reserva defensiva, liquidez e elegibilidade atendidas antes e após a distribuição.</p>
        <p>Neste exemplo, pagamentos aos stakers e transferências à carteira de recompra estão conciliados. Não houve execução de recompras; o saldo segregado continua em USDC.</p>
        <p className="whitepaper__table-scroll-hint">Deslize horizontalmente para comparar todas as colunas.</p>
        <div className="whitepaper__vesting-scroll whitepaper__comparison-scroll" role="region" aria-labelledby="apuracao-exemplo" tabIndex={0}>
          <table className="whitepaper__vesting-table">
            <caption>Patrimônio operacional e carteira de recompra separados · perda permanente · valores em USDC</caption>
            <thead>
              <tr><th scope="col">Etapa</th><th scope="col">Resultado da etapa</th><th scope="col">Patrimônio operacional</th><th scope="col">Carteira de recompra</th><th scope="col">Elegível restante</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row">1 · Aporte de 100.000</th><td>0</td><td>100.000</td><td>0</td><td>0</td></tr>
              <tr><th scope="row">2 · Lucro de 1.000</th><td>1.000</td><td>101.000</td><td>0</td><td>1.000</td></tr>
              <tr><th scope="row">3 · Split: 250 staking; 250 recompra; 500 retidos</th><td>0</td><td>100.500</td><td>250</td><td>0</td></tr>
              <tr><th scope="row">4 · Perda permanente de 500</th><td>−500</td><td>100.000</td><td>250</td><td>0</td></tr>
              <tr><th scope="row">5 · Novo lucro de 500</th><td>500</td><td>100.500</td><td>250</td><td>500</td></tr>
              <tr><th scope="row">6 · Split: 125 staking; 125 recompra; 250 retidos</th><td>0</td><td>100.250</td><td>375</td><td>0</td></tr>
              <tr><th scope="row">7 · Novo lucro de 200</th><td>200</td><td>100.450</td><td>375</td><td>200</td></tr>
              <tr><th scope="row">8 · Split: 50 staking; 50 recompra; 100 retidos</th><td>0</td><td>100.350</td><td>425</td><td>0</td></tr>
            </tbody>
          </table>
        </div>
        <p>Os lucros de 1.000, 500 e 200 entram uma única vez. A perda de 500 é permanente, sem déficit a pagar com lucro futuro. No exemplo, 425 foram destinados ao staking, 425 à carteira de recompra e o patrimônio operacional termina em 100.350; somado à carteira segregada, o patrimônio consolidado é 100.775. A segregação não é despesa do projeto, mas retira recursos da disponibilidade operacional. Os 50% retidos e o saldo de recompra não recebem outro split. Registrar obrigações e depois liquidá-las não reduz o patrimônio duas vezes. Reter 100% por falta de reserva ou liquidez impede ambas as destinações.</p>
        <p>Preservar a base patrimonial e os controles vigentes de reserva: uma transferência interna à carteira de recompra não reduz, por si só, o patrimônio consolidado nem a base exigida para sua proteção. O saldo segregado não cobre a reserva defensiva nem fica disponível para estratégias. P e B usam perímetros consistentes; a liquidez exclui recursos exclusivos e compromissos, considerando todos os desembolsos previstos. A carteira acumula destinações elegíveis, sem permitir acumular créditos, pesos ou lucros para stakers de rodadas encerradas.</p>
        <p><strong>Sem avaliação confiável e conciliação na decisão da rodada, ela não paga.</strong> Registrar fontes, horários, posições, custos e resultado da própria rodada. O split exige reservas conforme política vigente e liquidez antes e após os desembolsos. Se qualquer condição falhar, 100% do lucro fica na tesouraria, sem crédito residual, complemento ou liberação futura. Reconciliar o histórico depois não reabre essa rodada.</p>
      </div>
    </section>
  );
}