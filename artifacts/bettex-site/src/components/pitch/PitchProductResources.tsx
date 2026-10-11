/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Commercial summary; authoritative mechanics remain in the documentation. */
export function PitchProductResources() {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  return <section data-i18n="translated" id="pitch-recursos-carteiras" className="mt-8" aria-labelledby="pitch-recursos-carteiras-title">
    <h3 id="pitch-recursos-carteiras-title" className="display text-2xl font-extrabold">{x('Participação, mercados e recursos das carteiras', 'Participation, markets and wallet features', 'Participación, mercados y recursos de las carteras')}</h3>
    <p className="mt-4 text-[15px] leading-7 text-[#183173]">{x('O staking segue um pool global: as abas por mercado não criam quatro pools nem percentuais extras. A interface disponível é uma demonstração visual de Cripto; Esportes, Predictions e Cassino aparecem como próximos recursos. Seus resultados ilustrativos não comprovam desempenho das estratégias.', 'Staking uses a global pool: market tabs do not create four pools or extra allocations. The available interface is a visual Crypto demonstration; Sports, Predictions and Casino are upcoming features. Illustrative results do not prove strategy performance.', 'El staking usa un pool global: las pestañas por mercado no crean cuatro pools ni porcentajes adicionales. La interfaz disponible es una demostración visual de Cripto; Deportes, Predicciones y Casino son próximos recursos. Los resultados ilustrativos no prueban el rendimiento de las estrategias.')}</p>
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <article className="rounded-2xl border border-[#070B1F]/15 bg-white/50 p-5">
        <h4 className="display text-xl font-extrabold">Burn Lottery</h4>
        <p className="mt-3 text-sm leading-7 text-[#183173]">{x('Um número gratuito por carteira em staking. Entradas extras são pagas em BETTEX e integralmente queimadas; não financiam o prêmio nem geram receita para o projeto. Esse pagamento é uma saída de BETTEX: cancela peso anterior e créditos ainda não pagos da rodada.', 'One free number per staking wallet. Extra entries are paid in BETTEX and fully burned; they do not fund the prize or generate project revenue. That payment is a BETTEX exit: it cancels prior weight and unpaid round credits.', 'Un número gratuito por cartera en staking. Las entradas extra se pagan en BETTEX y se queman íntegramente; no financian el premio ni generan ingresos para el proyecto. Este pago es una salida de BETTEX: cancela el peso anterior y los créditos aún no pagados de la ronda.')}</p>
        <a href={`${BASE}/documentacao#documentacao-loteria`} className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[#2B59FF] underline underline-offset-4">{x('Regras da loteria e efeitos no staking', 'Lottery rules and staking effects', 'Reglas de la lotería y efectos en staking')}</a>
      </article>
      <article className="rounded-2xl border border-[#070B1F]/15 bg-white/50 p-5">
        <h4 className="display text-xl font-extrabold">Double 2X</h4>
        <p className="mt-3 text-sm leading-7 text-[#183173]">{x('Jogo opcional vermelho ou preto com rendimentos em USDC já recebidos. Uma jogada por 24 horas corridas; vitória devolve 2× o valor jogado e derrota perde esse valor. RTP teórico de 100% não garante ganho individual nem elimina o risco. Não é rendimento de staking ou estratégia de investimento.', 'Optional red or black game using USDC earnings already received. One play per rolling 24 hours; a win returns 2× the stake and a loss forfeits it. A theoretical 100% RTP guarantees neither individual gains nor absence of risk. It is not staking yield or an investment strategy.', 'Juego opcional rojo o negro con rendimientos en USDC ya recibidos. Una jugada por cada 24 horas corridas; ganar devuelve 2× el valor jugado y perder implica perderlo. Un RTP teórico del 100% no garantiza ganancias individuales ni elimina el riesgo. No es rendimiento de staking ni estrategia de inversión.')}</p>
        <a href={`${BASE}/documentacao#documentacao-double-2x`} className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-[#2B59FF] underline underline-offset-4">{x('Regras do Double 2X e riscos', 'Double 2X rules and risks', 'Reglas del Double 2X y riesgos')}</a>
      </article>
    </div>
  </section>;
}
