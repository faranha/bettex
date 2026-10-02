export function ProfitAccounting() {
  return (
    <section id="documentacao-apuracao" aria-labelledby="apuracao-title">
      <h4 id="apuracao-title" className="whitepaper__subhead">Apuração do lucro e perdas nas posições abertas</h4>
      <div className="whitepaper__prose">
        <p><strong>Lucro realizado positivo, isoladamente, não autoriza a distribuição.</strong> Antes do split, a apuração considera o resultado realizado líquido e o valor atualizado das posições abertas, descontando custos e obrigações. Ganhos não realizados não são, por si só, distribuíveis. Todas as grandezas são conciliadas e expressas em USDC.</p>
        <p>Os custos dessa apuração são os diretamente relacionados às operações de investimento, incluindo execução, liquidação e custos de rede dessas operações. Despesas institucionais de desenvolvimento, infraestrutura, auditoria e administração são financiadas pelo orçamento separado da Fundação, não pela tesouraria, e não são descontadas do resultado das estratégias.</p>
        <p><strong>R</strong> é o lucro realizado líquido acumulado, após custos e compensação de perdas anteriores, ainda não considerado em splits anteriores. Inclui os resultados realizados líquidos das estratégias e das aplicações da reserva defensiva, sem apurações separadas para distribuição. <strong>P</strong> é o patrimônio líquido atualizado da tesouraria, incluindo os ativos da reserva defensiva e as posições abertas, descontando obrigações. Carteiras pessoais não são patrimônio da tesouraria.</p>
        <p><strong>B</strong> é a base patrimonial de referência: acompanha os aportes efetivos à tesouraria e os lucros já considerados no split, descontando os pagamentos aos participantes. Aportes não são lucro; registrar novamente o mesmo aporte, lucro, perda ou pagamento não pode alterar a base uma segunda vez. Custos e obrigações não podem ser descontados duas vezes.</p>
        <p><strong>Lucro elegível ao split = máximo entre zero e o menor valor entre R e (P − B).</strong> Se R ou P − B for zero ou negativo, não há distribuição. O cálculo limita o lucro realizado pelo ganho patrimonial líquido acima da base de referência; uma venda com lucro não permite ignorar perdas nas posições ainda abertas.</p>
        <p><strong>A retenção para recompor reservas ou liquidez é temporária e não é um split.</strong> R e B não são alterados apenas pela retenção, e P não aumenta por registrar novamente recursos que já estavam na tesouraria. Novos resultados, custos e perdas continuam atualizando a apuração. O lucro retido não constitui crédito individual nem pagamento garantido.</p>
        <p>Quando as condições forem atendidas e a soma dos pesos elegíveis da rodada for positiva, o lucro elegível é recalculado e recebe o split de 75% / 25%. Com soma zero, 100% permanece temporariamente na tesouraria, sem split; a retenção não consome R nem altera B ou aumenta P por si só. Somente o valor efetivamente considerado nesse split é retirado de R e incorporado a B, descontada a parcela atribuída aos participantes de forma consistente com seu reconhecimento em P. O crédito ou a obrigação e sua posterior liquidação não podem consumir o lucro nem reduzir P e B duas vezes. O rateio usa os pesos da <strong>rodada diária UTC em cuja apuração o split é autorizado</strong>, não os pesos da rodada em que o lucro foi originalmente obtido.</p>
        <p>A apuração deve reconciliar a passagem de uma posição aberta para um resultado realizado, sem duplicar a perda ou o ganho. A contabilização dos pagamentos e das obrigações correspondentes deve ser consistente entre P e B, sem considerar a liquidação de uma obrigação já registrada como uma nova perda.</p>
        <p>O resgate do principal de uma aplicação defensiva é movimentação de recursos já pertencentes à tesouraria, não lucro nem novo aporte à base B. A realização de um rendimento já refletido na avaliação de P atualiza R sem aumentar P novamente pelo mesmo ganho. Reinvestir um rendimento já reconhecido não cria um segundo resultado nem um segundo direito a split.</p>
        <p>Exemplo: com base de US$ 100.000, ganho realizado de US$ 1.000 e perda de US$ 5.000 nas posições abertas, o patrimônio líquido é US$ 96.000, supondo ausência de outros movimentos. Como P − B é negativo, não há lucro elegível ao split, apesar do ganho realizado.</p>
        <p id="apuracao-exemplo"><strong>Exemplo sequencial de compensação de perdas.</strong> Os valores abaixo estão em USDC, após cada etapa, partindo de um aporte efetivo de 100.000 à tesouraria. Todos os resultados são realizados e líquidos de custos, sem outros movimentos ou posições abertas. Nos dois splits, a reserva defensiva mínima e a liquidez estão atendidas antes e após a distribuição projetada.</p>
        <div className="whitepaper__vesting-scroll" role="region" aria-labelledby="apuracao-exemplo" tabIndex={0}>
          <table className="whitepaper__vesting-table">
            <caption>R, P e B após cada etapa · elegível = max(0, min(R, P − B)) · valores em USDC</caption>
            <thead>
              <tr><th scope="col">Etapa</th><th scope="col">R</th><th scope="col">P</th><th scope="col">B</th><th scope="col">Elegível restante</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row">1 · Aporte de 100.000</th><td>0</td><td>100.000</td><td>100.000</td><td>0</td></tr>
              <tr><th scope="row">2 · Lucro de 1.000</th><td>1.000</td><td>101.000</td><td>100.000</td><td>1.000</td></tr>
              <tr><th scope="row">3 · Split: 250 ao staking; 750 retidos</th><td>0</td><td>100.750</td><td>100.750</td><td>0</td></tr>
              <tr><th scope="row">4 · Perda de 500</th><td>−500</td><td>100.250</td><td>100.750</td><td>0</td></tr>
              <tr><th scope="row">5 · Recuperação de 500</th><td>0</td><td>100.750</td><td>100.750</td><td>0</td></tr>
              <tr><th scope="row">6 · Novo lucro de 200</th><td>200</td><td>100.950</td><td>100.750</td><td>200</td></tr>
              <tr><th scope="row">7 · Split: 50 ao staking; 150 retidos</th><td>0</td><td>100.900</td><td>100.900</td><td>0</td></tr>
            </tbody>
          </table>
        </div>
        <p>Os splits consomem uma única vez os lucros elegíveis de 1.000 e 200. Os 750 e 150 mantidos na tesouraria já foram considerados nesses splits e não voltam a ser distribuídos. A perda reduz R e P, sem reduzir B; recuperar os 500 apenas recompõe a perda, sem gerar lucro elegível. Os valores pós-split de P e B já descontam a parcela do staking: registrar sua obrigação e depois liquidá-la não gera uma segunda redução. Isso difere da retenção temporária por falta de reserva ou liquidez, que não realiza split nem consome R.</p>
        <p><strong>Sem avaliação confiável das posições, a distribuição fica suspensa até conciliação.</strong> A apuração registra fontes de preço, horários, posições, custos, obrigações, R, P, B e o valor elegível. O split exige reserva defensiva mínima inicial de 50% do patrimônio líquido atualizado e liquidez suficiente para obrigações exigíveis e para a distribuição, verificadas antes e após seu efeito projetado. Se qualquer condição falhar, 100% do lucro líquido permanece na tesouraria para recomposição, sem pagamento ao staking nem saldo restante distribuído na mesma apuração. A possibilidade de split futuro depende de nova apuração e das condições então vigentes. Estes são requisitos a validar antes da operação, não cálculos financeiros já implementados na demonstração.</p>
      </div>
    </section>
  );
}