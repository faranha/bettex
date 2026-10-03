import { withdrawalCreditRule, withdrawalPendingRule, withdrawalPaidRule, withdrawalRestartRule } from '@/lib/staking-withdrawal-policy';
import { StakingSchematic } from '@/components/docs-diagrams/DocSchematics';
import { BettexFlow } from '@/components/architecture/BettexArchitecture';
import { distributionRemainderRule } from '@/lib/staking-rounding-policy';
import { independentRoundRule, retainedRoundProfitRule, closedRoundPaymentRule } from '@/lib/distribution-round-policy';

export function StakingDistribution() {
  return (
    <section id="documentacao-rateio" aria-labelledby="rateio-title">
      <h3 id="rateio-title" className="whitepaper__subhead">Rateio diário por quantidade e tempo</h3>
      <div className="whitepaper__prose">
        <p id="documentacao-rodadas-independentes"><strong>{independentRoundRule}</strong></p>
        <p><strong>O rateio usa a parcela de staking do lucro elegível após os tributos da entidade.</strong> A proporção por peso determina o direito bruto individual; retenções fiscais exigidas pelo regime aplicável são separadas antes do pagamento ou da disponibilização, com líquido e obrigação fiscal identificados. Não alterar pesos ou o split de 25% para descontar impostos. Seguir o <a href="#documentacao-tributos">tratamento fiscal</a>, sem disponibilizar o imposto retido como saldo livre do titular.</p>
        <p><strong>Cada rodada diária considera o período de 00h00 até 00h00 do dia seguinte, em UTC.</strong> O peso de cada participante é a soma da quantidade de BETTEX disponível na carteira oficial multiplicada pelo tempo elegível em cada intervalo da rodada. Compras, vendas, transferências e concessões confirmadas de BETTEX alteram o saldo elegível a partir da confirmação conciliada. Taxas pagas em USDC não alteram a quantidade ou o peso de BETTEX. O instante de encerramento de uma rodada pertence à seguinte, sem contagem duplicada.</p>
      </div>
      <StakingSchematic />
      <div className="whitepaper__prose">
        <p>A apuração final usa a janela encerrada e os pesos elegíveis conciliados. O registro distingue a rodada, a origem e o período dos resultados, o instante de autorização e o recebimento. Atraso ou retenção não tornam lucros anteriores elegíveis para novos participantes.</p>
        <p><strong>Peso individual = soma de (BETTEX disponível × tempo elegível).</strong> Todos os participantes usam a mesma unidade de tempo. O denominador é a soma dos pesos elegíveis de todos os participantes na mesma rodada, não o teto de emissão nem o saldo total observado apenas no instante do pagamento.</p>
        <p><strong>Parcela proporcional individual em USDC = parcela destinada ao staking × peso individual elegível ÷ soma dos pesos elegíveis correspondentes.</strong> A parcela corresponde aos 25% do lucro líquido elegível. Cada resultado mantém sua origem e período: novos participantes não recebem lucros anteriores. A apuração considera posições abertas, custos e tributos; reservas, liquidez e conciliação continuam obrigatórias. Perdas são permanentes, sem déficit a compensar com lucros futuros. Sem peso elegível, não há rateio nem divisão por zero.</p>
      </div>
      <BettexFlow figure="3" />
      <div className="whitepaper__prose">
        <p id="documentacao-fracoes-rateio"><strong>{distributionRemainderRule}</strong></p>
        <p>O cálculo proporcional usa precisão exata. A precisão validada do ativo e do conector determina a unidade executável; a parcela pagável é ajustada para baixo, sem arredondar para cima nem usar a precisão de exibição como regra financeira. O registro identifica o cálculo, o valor executável e a fração retornada à tesouraria por rodada, sem criar obrigação com o beneficiário sobre essa diferença. Retenções tributárias são separadas: não são sobras livres do rateio.</p>
        <p>Os 25% continuam sendo a parcela nominal destinada ao rateio. O pagamento efetivo exclui as frações não executáveis e os créditos cancelados por saída de BETTEX; a tesouraria conserva os 75% e recebe também as frações não pagas. O retorno dessas frações não é novo lucro realizado, novo aporte ou autorização para aplicar outro split ao mesmo resultado. Histórico, obrigações vigentes e retornos são conciliados sem sobreposição nem efeito duplicado em R, P ou B.</p>
        <p>{closedRoundPaymentRule}</p>
        <p>Durante a execução da própria rodada, somente valores executáveis e autorizados podem ser pagos. Não consolidar parcelas de rodadas diferentes. Frações retornadas à tesouraria não entram em pagamentos. Envios incertos continuam comprometidos para conciliação, sem presumir recursos recuperados ou liberar reenvio; segurança, reservas, liquidez, custos e tributos permanecem obrigatórios.</p>
        <p id="documentacao-rodada-sem-pesos"><strong>Se a soma dos pesos elegíveis for zero, não há split.</strong> Mesmo com lucro, reservas e liquidez atendidas, 100% permanece na tesouraria, sem separar 25% para destinatários inexistentes nem criar créditos individuais. Reter não cria um novo resultado nem muda a origem do lucro.</p>
        <p id="documentacao-saida-bettex"><strong>{withdrawalCreditRule}</strong></p>
        <p>{withdrawalPendingRule}</p>
        <p>{withdrawalPaidRule}</p>
        <p><strong>{retainedRoundProfitRule}</strong></p>
        <p>Tokens ainda não liberados e estoque institucional de venda não participam. Somente saldos pessoais disponíveis entram no cálculo. Taxas pagas em USDC não reservam BETTEX nem reduzem seu peso; saídas efetivas de BETTEX seguem quantidade e tempo. Tokens do fundador e dos investidores têm os mesmos critérios de elegibilidade dos demais titulares.</p>
        <p>{withdrawalRestartRule}</p>
        <p>Exemplo em uma única rodada, com dois participantes elegíveis aos mesmos resultados e sem saída de BETTEX: 1.000 BETTEX por 24 horas produzem 24.000 token-horas; 500 BETTEX por 24 horas produzem 12.000 token-horas. As participações são ⅔ e ⅓ da parcela executável dessa rodada, se ela pagar. Se não pagar, nenhum deles conserva crédito ou peso para outra rodada. O exemplo demonstra a fórmula, não uma promessa de lucro.</p>
        <p>O registro identifica os intervalos de saldo, os pesos elegíveis, a parcela executável, os pagamentos e o encerramento de uma única rodada. Durante a execução, valores ainda não recebidos não são saldo disponível na Carteira USDC. Após o encerramento, o histórico não é crédito pendente, obrigação de complemento ou direito sobre lucros futuros. Confirmações de envios já realizados apenas conciliam o fato original, sem criar outro crédito, repetir efeitos patrimoniais ou reabrir o rateio, conforme a <a href="#documentacao-liquidacao-distribuicao">regra de liquidação da distribuição</a>.</p>
      </div>
      <BettexFlow figure="6" />
      <div className="whitepaper__prose">
        <p>Correções de pagamento só podem ser executadas dentro da própria rodada ainda em execução, com origem, beneficiários, valores executáveis e pagamentos anteriores identificados. Uma rodada encerrada não gera complementos ou créditos futuros. Pagamentos a maior não geram débito automático na carteira; perdas são permanentes, sem déficit a compensar com lucros futuros. Conciliação, reservas e liquidez continuam obrigatórias.</p>
      </div>
    </section>
  );
}