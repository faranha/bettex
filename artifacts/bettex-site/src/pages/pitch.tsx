import { useEffect, type ReactNode } from 'react';
import { TechnologyNetworks } from '@/components/technology/TechnologyNetworks';
import { AudienceSection } from '@/components/pitch/AudienceSection';
import { EmploymentIncomeProblem } from '@/components/pitch/EmploymentIncomeProblem';
import { PitchTokenomics } from '@/components/pitch/PitchTokenomics';
import { PitchFinalCommunity } from '@/components/pitch/PitchFinalCommunity';
import { PitchHeroGraph } from '@/components/pitch/PitchHeroGraph';
import { PitchContext, PitchJourney, PitchStrategy } from '@/components/pitch/PitchNarrative';
import { useX } from '@/components/pitch/pitchCopy';
import { t } from '@/lib/i18n';
import './pitch.css';
import './pitch-compact.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;
const LEGACY_PITCH_SECTIONS: Record<string, { id: string }> = { tese: { id: 'visao' }, publico: { id: 'publico-pitch' } };

function Sec({ id, title, dark = false, summary, children }: { id: string; n?: string; kicker?: string; title: ReactNode; dark?: boolean; summary?: string; hero?: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-t`} className={`slide slide--flow ${dark ? 'slide--dark bg-[#070B1F] text-[#F4F1E8]' : 'bg-[#F4F1E8] text-[#070B1F]'}`}>
    <div className="page-wrap slide__body slide__body--flow">
      <h2 id={`${id}-t`} className="display max-w-[860px] text-[clamp(1.7rem,3.6vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-.05em]">{title}</h2>
      {summary ? <p className={`mt-3 max-w-[700px] text-base leading-7 ${dark ? 'text-[#e3eaff]' : 'text-[#183173]'}`}>{summary}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  </section>;
}

export function PitchPage() {
  const x = useX();
  useEffect(() => {
    let mounted = true;
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!mounted || !id) return;
      const targetId = LEGACY_PITCH_SECTIONS[id]?.id ?? id;
      if (targetId !== id) {
        window.history.replaceState(window.history.state, '', `#${targetId}`);
      }
      const el = document.getElementById(targetId);
      if (!el) return;
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    const frame = requestAnimationFrame(scrollToHash);
    void document.fonts.ready.then(scrollToHash);
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (anchor?.closest('.pitch')) requestAnimationFrame(scrollToHash);
    };
    document.addEventListener('click', onAnchorClick);
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      document.removeEventListener('click', onAnchorClick);
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, []);
  return <main className="pitch">
    <section id="visao" aria-label={x('Apresentação', 'Overview', 'Presentación')} className="cover relative overflow-hidden text-[#F4F1E8]">
      <div className="page-wrap relative pb-8 pt-8 sm:pb-12 sm:pt-14">
        <div className="cover__grid">
          <div className="cover__copy">
            <h1 className="hero-title max-w-[690px] text-[clamp(2.3rem,5.2vw,4.4rem)] font-extrabold">{x('Investir, não apostar.', 'Invest, not bet.', 'Invertir, no apostar.')} <span className="text-[#F2B632]">{x('Com IA operando em cripto.', 'With AI trading crypto.', 'Con IA operando en cripto.')}</span></h1>
            <p className="cover__market mt-4"><strong>{x('Compre BETTEX e participe dos lucros elegíveis da nossa IA. Recebimento em reais e saque TODOS OS DIAS via Pix previstos, sem precisar saber operar cripto.', 'Buy BETTEX and share in our AI’s eligible profits. Payouts in reais and withdrawals EVERY DAY via Pix are planned, with no need to know how to trade crypto.', 'Compra BETTEX y participa en los beneficios elegibles de nuestra IA. Cobros en reales y retiros TODOS LOS DÍAS por Pix previstos, sin tener que saber operar en cripto.')}</strong></p>
            <p className="cover__notice mt-4 text-[13px] leading-[1.55] text-[#c5d2f1]">{x('Demo visual disponível. Sem trading, pagamentos ou retornos garantidos. Há risco de perda.', 'Visual demo available. No trading, payments or guaranteed returns. There is a risk of loss.', 'Demo visual disponible. Sin trading, pagos ni retornos garantizados. Existe riesgo de pérdida.')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#solucao" className="tap inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2B59FF] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1E44D6]">{t('Conhecer a BETTEX')}</a>
              <a href={DOC} className="tap inline-flex min-h-11 items-center gap-2 px-1 py-2 text-sm font-bold underline underline-offset-4 hover:text-[#F2B632]">{t('Documentação')}</a>
            </div>
          </div>
          <PitchHeroGraph />
        </div>
      </div>
    </section>

    <TechnologyNetworks label="Tecnologias" ethereum />

    <AudienceSection />

    <Sec id="problema" title={x('Mas apostar para ter renda pode comprometer o essencial.', 'But betting for income can put essential money at risk.', 'Pero apostar para obtener ingresos puede poner en riesgo lo esencial.')} summary={x('Esse público pode enfrentar duas pressões: perdas que comprometem o orçamento de hoje e mudanças no trabalho que ameaçam a renda de amanhã.', 'This audience can face two pressures: losses that jeopardize today’s budget and changes in work that threaten tomorrow’s income.', 'Este público puede enfrentar dos presiones: pérdidas que comprometen el presupuesto de hoy y cambios en el trabajo que amenazan los ingresos de mañana.')}>
      <PitchContext />
      <div id="ambiente-externo"><EmploymentIncomeProblem /></div>
    </Sec>

    <Sec id="solucao" title={<>{x('BETTEX é a solução.', 'BETTEX is the solution.', 'BETTEX es la solución.')} <span className="text-[#2B59FF]">{x('Participação nos lucros da IA.', 'Sharing in AI’s profits.', 'Participación en los beneficios de la IA.')}</span></>} summary={x('Em vez de depender do resultado de uma aposta, a proposta é ter BETTEX e participar dos lucros elegíveis de uma IA que opera cripto. Recebimento em reais previsto, sem lucro ou retorno garantido.', 'Instead of depending on a bet’s outcome, the proposal is to hold BETTEX and share in the eligible profits of an AI trading crypto. Payouts in reais are planned; profits and returns are not guaranteed.', 'En lugar de depender del resultado de una apuesta, la propuesta es tener BETTEX y participar en los beneficios elegibles de una IA que opera en cripto. Cobros en reales previstos, sin beneficio ni rentabilidad garantizados.')}>
      <PitchJourney />
      <div id="estrategia" className="pitch-solution-engine" aria-labelledby="estrategia-t">
        <h3 id="estrategia-t" className="display">{x('Como a IA busca esses resultados.', 'How AI seeks these results.', 'Cómo la IA busca estos resultados.')}</h3>
        <PitchStrategy />
      </div>
    </Sec>

    <PitchTokenomics />
    <PitchFinalCommunity />

  </main>;
}
export default PitchPage;
