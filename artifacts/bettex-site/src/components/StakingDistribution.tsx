import { withdrawalCreditRule, withdrawalPendingRule, withdrawalPaidRule, withdrawalRestartRule } from '@/lib/staking-withdrawal-policy';
import { StakingSchematic } from './docs-diagrams/DocSchematics';
import { BettexFlow } from './architecture/BettexArchitecture';
import { distributionRemainderRule } from '@/lib/staking-rounding-policy';
import { independentRoundRule, retainedRoundProfitRule, closedRoundPaymentRule } from '@/lib/distribution-round-policy';
import { useLocale } from '@/lib/i18n';

export function StakingDistribution() {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  return <section id="documentacao-rateio" aria-labelledby="rateio-title">
    <h3 id="rateio-title" className="whitepaper__subhead">Elegibilidade, rodada e peso</h3>
    <div className="whitepaper__prose">
      <p id="documentacao-rodadas-independentes"><strong>{independentRoundRule}</strong></p>
      <p>A rodada diária vai de 00h00 até 00h00 do dia seguinte em UTC. O encerramento pertence à rodada seguinte, sem tempo contado duas vezes. Todo BETTEX disponível na carteira oficial acumula quantidade × tempo elegível desde a confirmação. Tokens não liberados e estoque institucional de venda não participam; fundador e investidores seguem os mesmos critérios dos demais titulares.</p>
      <p data-i18n="translated">{x('O corte UTC define a rodada do modelo operacional. O roteiro visual do demo vai de 16h a 16h de São Paulo, durante 24 horas reais: é um ciclo ilustrativo distinto, não uma conversão da meia-noite UTC nem alteração dos contratos. As abas de mercado apresentam contribuições para o mesmo pool global, não pools de staking independentes.', 'The UTC cutoff defines the operational-model round. The demo storyline runs from 16:00 to 16:00 São Paulo time over 24 real hours: it is a distinct illustrative cycle, not a conversion of UTC midnight or a change to contracts. Market tabs show contributions to the same global pool, not separate staking pools.', 'El corte UTC define la ronda del modelo operativo. El guion del demo va de las 16:00 a las 16:00 de São Paulo durante 24 horas reales: es un ciclo ilustrativo distinto, no una conversión de medianoche UTC ni un cambio de contratos. Las pestañas de mercados muestran contribuciones al mismo pool global, no pools de staking independientes.')}</p>
    </div>
    <StakingSchematic />
    <h4 className="whitepaper__subhead" id="documentacao-saida-bettex">Entradas e saídas de BETTEX</h4>
    <div className="whitepaper__prose"><p><strong>{withdrawalCreditRule}</strong></p><p>{withdrawalPendingRule}</p><p>{withdrawalPaidRule}</p><p>{withdrawalRestartRule}</p><p>USDC já recebido permanece do titular. Saque USDC não cancela staking. Exportar chaves não movimenta, por si só, BETTEX. Nenhuma entrada recupera direitos cancelados nem recebe lucros anteriores.</p></div>
    <h4 className="whitepaper__subhead" id="documentacao-formula-peso">Fórmula e exemplo por quantidade × tempo</h4>
    <div className="whitepaper__formula"><span>RATEIO DA PRÓPRIA RODADA</span><p>Peso individual = soma de (BETTEX disponível × tempo elegível)</p><p>Pagamento bruto = parcela de staking × peso individual ÷ soma dos pesos elegíveis</p></div>
    <div className="whitepaper__prose"><p>Todos usam a mesma unidade de tempo. O denominador é a soma dos pesos elegíveis da rodada, não a emissão nem o saldo final quando os tempos diferem. Exemplo: 1.000 tokens por 24 horas geram 24.000 token-horas; 1.000 por 12 horas geram 12.000. Pesos de ⅔ e ⅓, apesar de saldos iguais. Uma participação de 1% em parcela de 1.000 USDC corresponde a 10 USDC brutos, sujeitos a executabilidade, tributos e regras.</p></div>
    <h4 className="whitepaper__subhead" id="documentacao-origem-staking">Origem da parcela e ausência de elegíveis</h4>
    <div className="whitepaper__prose"><p>A parcela de staking corresponde a 25% do lucro elegível realizado e conciliado da própria rodada, após <a href="#documentacao-tributos">tributos da entidade</a>, com reservas e liquidez atendidas antes e depois dos desembolsos. Outros 50% ficam na tesouraria e 25% vão à <a href="#documentacao-recompras">recompra e queima</a>. A base é resultado, não capital aportado.</p><p id="documentacao-rodada-sem-pesos"><strong>Se a soma dos pesos elegíveis for zero, não há split.</strong> 100% permanece na tesouraria, sem parcela de staking ou recompra, crédito acumulado ou divisão por zero.</p><p><strong>{retainedRoundProfitRule}</strong></p></div>
    <h4 className="whitepaper__subhead" id="documentacao-fracoes-rateio">Precisão e frações não executáveis</h4>
    <div className="whitepaper__prose"><p><strong>{distributionRemainderRule}</strong></p><p>O cálculo usa precisão exata. A unidade executável validada do ativo e conector determina o ajuste para baixo; precisão de exibição não é regra financeira. Registrar cálculo, valor executável e fração por rodada, sem arredondar para cima, acumular ou redistribuir entre titulares. Retenções fiscais não são sobras livres.</p><p>A tesouraria conserva sua parcela e recebe frações não executáveis. Retorno de fração não é novo lucro nem permite novo split; registros, obrigações e retornos têm efeitos únicos em R, P e B.</p></div>
    <h4 className="whitepaper__subhead" id="documentacao-credito-usdc">Crédito líquido e encerramento</h4>
    <div className="whitepaper__prose"><p>O peso determina o direito bruto. Retenções aplicáveis são resolvidas antes do crédito líquido disponibilizado. Registro ou autorização não é saldo recebido: somente USDC confirmado e conciliado entra na Carteira USDC. <a href="#documentacao-liquidacao-distribuicao">Execução e confirmação</a> detalham a prevenção de duplicidade.</p><p id="documentacao-retencao-creditos">{closedRoundPaymentRule}</p></div>
    <BettexFlow figure="6" />
  </section>;
}