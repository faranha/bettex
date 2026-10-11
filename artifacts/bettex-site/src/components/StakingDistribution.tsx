import { withdrawalCreditRule, withdrawalPendingRule, withdrawalPaidRule, withdrawalRestartRule } from '@/lib/staking-withdrawal-policy';
import { StakingSchematic } from './docs-diagrams/DocSchematics';
import { BettexFlow } from './architecture/BettexArchitecture';
import { distributionRemainderRule } from '@/lib/staking-rounding-policy';
import { independentRoundRule, retainedRoundProfitRule, closedRoundPaymentRule } from '@/lib/distribution-round-policy';
import { useLocale } from '@/lib/i18n';
import { nextRoundEntryRule, openingEligibilityRule } from '@/lib/documentation-staking-entry-policy';

export function StakingDistribution() {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  return <section id="documentacao-rateio" aria-labelledby="rateio-title">
    <h3 id="rateio-title" className="whitepaper__subhead">Elegibilidade, rodada e peso</h3>
    <div className="whitepaper__prose">
      <p id="documentacao-rodadas-independentes"><strong>{independentRoundRule}</strong></p>
      <p>A rodada diária vai de 00h00 até 00h00 do dia seguinte em UTC. O encerramento pertence à rodada seguinte, sem tempo contado duas vezes. Fundador e investidores seguem os mesmos critérios dos demais titulares.</p>
      <p id="documentacao-entrada-proxima-rodada"><strong>{nextRoundEntryRule}</strong></p>
      <p>{openingEligibilityRule}</p>
      <p data-i18n="translated">{x('O corte UTC define a rodada do modelo operacional. As abas de mercado apresentam contribuições para o mesmo pool global, não pools de staking independentes.', 'The UTC cutoff defines the operational-model round. Market tabs show contributions to the same global pool, not separate staking pools.', 'El corte UTC define la ronda del modelo operativo. Las pestañas de mercados muestran contribuciones al mismo pool global, no pools de staking independientes.')}</p>
    </div>
    <StakingSchematic />
    <h4 className="whitepaper__subhead" id="documentacao-saida-bettex">Entradas e saídas de BETTEX</h4>
    <div className="whitepaper__prose"><p><strong>{withdrawalCreditRule}</strong></p><p>{withdrawalPendingRule}</p><p>{withdrawalPaidRule}</p><p>{withdrawalRestartRule}</p><p>USDC já recebido permanece do titular. Saque USDC não cancela staking. Exportar chaves não movimenta, por si só, BETTEX. Nenhuma entrada recupera direitos cancelados nem recebe lucros anteriores.</p></div>
    <h4 className="whitepaper__subhead" id="documentacao-formula-peso">Fórmula e exemplo por quantidade × tempo</h4>
    <div className="whitepaper__formula"><span>RATEIO DA PRÓPRIA RODADA</span><p>Peso individual = BETTEX elegível na abertura × duração integral da rodada, sem saída</p><p>Pagamento bruto = parcela de staking × peso individual ÷ soma dos pesos elegíveis</p></div>
    <div className="whitepaper__prose"><p>Novos participantes e saldos recebidos durante a rodada têm peso zero nela. Um acréscimo não altera o peso do saldo já elegível na abertura; qualquer saída zera todo o peso do titular. Todos usam a mesma unidade de tempo. O denominador soma apenas os pesos elegíveis, não a emissão nem o saldo final.</p><p>Exemplo: A tem 1.000 BETTEX elegíveis desde a abertura; B recebe 1.000 BETTEX às 12h UTC. Na rodada de 24 horas, A tem 24.000 token-horas e B tem zero. Com 1.000 USDC de lucro elegível e todas as condições atendidas, a parcela de staking é 250 USDC: A recebe 250 e B recebe zero, mesmo que o lucro tenha surgido depois das 12h. Não há crédito para B guardar.</p><p>Na rodada seguinte, se ambos tiverem 1.000 BETTEX elegíveis na abertura e nenhuma saída, cada um terá 24.000 token-horas. Com novo lucro elegível de 1.000 USDC, cada um recebe 125 USDC brutos da nova parcela de 250. Isso não paga nenhum lucro da rodada anterior.</p></div>
    <h4 className="whitepaper__subhead" id="documentacao-origem-staking">Origem da parcela e ausência de elegíveis</h4>
    <div className="whitepaper__prose"><p>A parcela de staking corresponde a 25% do lucro elegível realizado e conciliado da própria rodada, após os custos efetivos da rodada, com reservas e liquidez atendidas antes e depois dos desembolsos. Outros 50% ficam na tesouraria e 25% vão à <a href="#documentacao-recompras">recompra e queima</a>. A base é resultado, não capital aportado.</p><p id="documentacao-rodada-sem-pesos"><strong>Se a soma dos pesos elegíveis for zero, não há split.</strong> 100% permanece na tesouraria, sem parcela de staking ou recompra, crédito acumulado ou divisão por zero.</p><p><strong>{retainedRoundProfitRule}</strong></p></div>
    <h4 className="whitepaper__subhead" id="documentacao-fracoes-rateio">Precisão e frações não executáveis</h4>
    <div className="whitepaper__prose"><p><strong>{distributionRemainderRule}</strong></p><p>O cálculo usa precisão exata. A unidade executável validada do ativo e conector determina o ajuste para baixo; precisão de exibição não é regra financeira. Registrar cálculo, valor executável e fração por rodada, sem arredondar para cima, acumular ou redistribuir entre titulares. Recursos comprometidos não são sobras livres.</p><p>A tesouraria conserva sua parcela e recebe frações não executáveis. Retorno de fração não é novo lucro nem permite novo split; registros, obrigações e retornos têm efeitos únicos em R, P e B.</p></div>
    <h4 className="whitepaper__subhead" id="documentacao-credito-usdc">Crédito líquido e encerramento</h4>
    <div className="whitepaper__prose"><p>O peso determina o direito sobre a parcela distribuível da rodada. Registro ou autorização não é saldo recebido: somente USDC confirmado e conciliado entra na Carteira USDC. <a href="#documentacao-liquidacao-distribuicao">Execução e confirmação</a> detalham a prevenção de duplicidade.</p><p id="documentacao-retencao-creditos">{closedRoundPaymentRule}</p></div>
    <BettexFlow figure="6" />
  </section>;
}