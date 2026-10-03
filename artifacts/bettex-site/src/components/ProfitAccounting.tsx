import { independentRoundRule, retainedRoundProfitRule } from '@/lib/distribution-round-policy';

export function ProfitAccounting() {
  return (
    <section id="documentacao-apuracao" aria-labelledby="apuracao-title">
      <h3 id="apuracao-title" className="whitepaper__subhead">Apuração do lucro e perdas nas posições abertas</h3>
      <div className="whitepaper__prose">
        <p><strong>{independentRoundRule}</strong></p>
        <p>{retainedRoundProfitRule}</p>
        <p><strong>Lucro realizado positivo, isoladamente, não autoriza a distribuição.</strong> Antes do split, a apuração considera resultado líquido, posições abertas, custos, tributos e obrigações. Tributos da entidade são reconhecidos antes do lucro elegível, sem segunda dedução no recolhimento; rendimentos já líquidos não sofrem o mesmo desconto novamente. Seguir o <a href="#documentacao-tributos">tratamento fiscal por entidade e beneficiário</a>. Ganhos não realizados não são distribuíveis. Os registros são conciliados e expressos em USDC.</p>
        <p>Os custos dessa apuração são os diretamente relacionados às operações de investimento, incluindo execução, liquidação e custos de rede dessas operações. Também entram os custos operacionais efetivos suportados pela tesouraria em suas transferências e na liquidação das distribuições, registrados no dia UTC da realização comprovada, sem duplicidade. Despesas institucionais de desenvolvimento, infraestrutura, auditoria e administração são financiadas pelo orçamento separado da empresa, não pela tesouraria, e não são descontadas do resultado das estratégias. Orçamento reservado não antecipa despesa; pagar um custo já reconhecido não o desconta novamente.</p>
        <p><strong>Perdas são permanentes.</strong> Uma perda conciliada reduz o patrimônio uma única vez e não cria déficit a compensar com lucros de rodadas futuras. Resultados posteriores são apurados pela própria origem e período. A recomposição da reserva defensiva é um controle de cobertura patrimonial, não uma dívida de resultados antigos.</p>
        <p><strong>Capital, resultados e obrigações têm registros separados.</strong> O patrimônio líquido atualizado inclui reserva defensiva e posições abertas, descontando obrigações; carteiras pessoais ficam fora dele. Aportes e devolução do principal não são lucro. Registrar a obrigação de uma distribuição e depois pagá-la não pode reduzir o patrimônio duas vezes.</p>
        <p><strong>O split incide somente no lucro líquido realizado, conciliado e elegível da própria rodada.</strong> R contém o resultado realizado líquido dessa rodada, não lucro acumulado de rodadas anteriores. Custos, tributos, posições abertas e o limite patrimonial continuam sendo considerados. Lucros anteriores, distribuídos ou não, nunca entram no novo rateio; o histórico patrimonial não é apagado.</p>
        <p><strong>Reter para recompor reservas ou liquidez encerra a rodada sem pagamento.</strong> Não cria crédito individual ou estoque de lucro a distribuir depois. O valor fica na tesouraria e não volta a R de uma rodada futura. Perdas também não se acumulam como déficit a compensar em rodadas seguintes.</p>
        <p>Com reservas, liquidez, conciliação e pesos elegíveis atendidos, aplica o split de 75% para tesouraria e 25% para staking. Sem peso elegível, 100% permanece na tesouraria, sem split. A elegibilidade corresponde aos resultados distribuídos, não apenas à data da autorização: novos participantes nunca recebem lucros anteriores e qualquer saída de BETTEX cancela todos os créditos anteriores ainda não pagos do ciclo e zera o peso acumulado, mesmo quando parcial.</p>
        <p id="documentacao-registro-split"><strong>Autorizar o split e registrar seus efeitos e créditos formam uma decisão indivisível e durável no livro compartilhado.</strong> Identifica rodada, origem e período dos resultados, revisão, regras, dados conciliados, pesos elegíveis, direitos, obrigações e efeitos patrimoniais antes e depois. Revalida o estado vigente antes do lançamento. Concorrência, repetição ou retomada não autorizam usar o mesmo lucro duas vezes; falha não deixa crédito isolado de seu efeito contábil. Erros e fatos tardios exigem ajustes identificados. Liberação posterior não troca a origem dos resultados nem inclui novos participantes em lucros anteriores.</p>
        <p>A passagem de posição aberta para resultado realizado é conciliada sem duplicar perda ou ganho. Liquidar uma obrigação já reconhecida não é uma nova perda nem um novo split.</p>
        <p>Resgatar o principal de uma aplicação defensiva movimenta recursos da tesouraria, sem criar lucro. Realizar um rendimento já refletido na avaliação patrimonial não aumenta o patrimônio novamente. Reinvestir um rendimento não cria um segundo resultado nem outro direito ao split.</p>
        <p>Exemplo na mesma apuração: patrimônio inicial de US$ 100.000, ganho realizado de US$ 1.000 e perda de US$ 5.000 nas posições abertas resultam em US$ 96.000, sem outros movimentos. A avaliação conjunta não autoriza distribuir o ganho isolado ignorando a perda. Isso não cria déficit a compensar com rodadas futuras.</p>
        <p id="apuracao-exemplo"><strong>Exemplo de perda permanente e novos lucros.</strong> Valores em USDC, após cada etapa, com aporte inicial de 100.000. As etapas de resultado representam apurações distintas, líquidas de custos, sem posições abertas ou outros movimentos. Cada split pressupõe reserva defensiva, liquidez e elegibilidade atendidas antes e após a distribuição.</p>
        <div className="whitepaper__vesting-scroll" role="region" aria-labelledby="apuracao-exemplo" tabIndex={0}>
          <table className="whitepaper__vesting-table">
            <caption>Patrimônio e lucro após cada etapa · perda permanente, sem déficit acumulado · valores em USDC</caption>
            <thead>
              <tr><th scope="col">Etapa</th><th scope="col">Resultado da etapa</th><th scope="col">Patrimônio líquido</th><th scope="col">Elegível restante</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row">1 · Aporte de 100.000</th><td>0</td><td>100.000</td><td>0</td></tr>
              <tr><th scope="row">2 · Lucro de 1.000</th><td>1.000</td><td>101.000</td><td>1.000</td></tr>
              <tr><th scope="row">3 · Split: 250 ao staking; 750 retidos</th><td>0</td><td>100.750</td><td>0</td></tr>
              <tr><th scope="row">4 · Perda permanente de 500</th><td>−500</td><td>100.250</td><td>0</td></tr>
              <tr><th scope="row">5 · Novo lucro de 500</th><td>500</td><td>100.750</td><td>500</td></tr>
              <tr><th scope="row">6 · Split: 125 ao staking; 375 retidos</th><td>0</td><td>100.625</td><td>0</td></tr>
              <tr><th scope="row">7 · Novo lucro de 200</th><td>200</td><td>100.825</td><td>200</td></tr>
              <tr><th scope="row">8 · Split: 50 ao staking; 150 retidos</th><td>0</td><td>100.775</td><td>0</td></tr>
            </tbody>
          </table>
        </div>
        <p>Os lucros de 1.000, 500 e 200 são considerados uma única vez. A perda de 500 reduz permanentemente o patrimônio: o novo lucro de 500 não é destinado a pagar um déficit anterior. Os 75% de cada split permanecem na tesouraria e não recebem outro split. Registrar a obrigação dos 25% e depois liquidá-la não reduz o patrimônio duas vezes. Essa retenção dos 75% é diferente de reter 100% por insuficiência de reserva ou liquidez, sem split.</p>
        <p><strong>Sem avaliação confiável e conciliação na decisão da rodada, ela não paga.</strong> Registrar fontes, horários, posições, custos, tributos e resultado da própria rodada. O split exige reserva defensiva mínima inicial de 50% do patrimônio líquido atualizado e liquidez para obrigações e distribuição, antes e após seu efeito projetado. Se qualquer condição falhar, 100% do lucro fica na tesouraria, sem crédito residual, complemento ou liberação futura. Reconciliar o histórico depois não reabre essa rodada.</p>
      </div>
    </section>
  );
}