import { useEffect, type ReactNode } from 'react';
import { TechnologyNetworks } from '@/components/technology/TechnologyNetworks';
import { AudienceSection } from '@/components/pitch/AudienceSection';
import { PitchTokenomics } from '@/components/pitch/PitchTokenomics';
import { PitchFinalCommunity } from '@/components/pitch/PitchFinalCommunity';
import { PitchProblemSection } from '@/components/pitch/PitchProblemSection';
import { PitchMissionHero } from '@/components/pitch/PitchMissionHero';
import { PitchJourney, PitchStrategy } from '@/components/pitch/PitchNarrative';
import { useX } from '@/components/pitch/pitchCopy';
import './pitch.css';
import './pitch-compact.css';
import './pitch-solution.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const LEGACY_PITCH_SECTIONS: Record<string, { id: string }> = { tese: { id: 'visao' }, publico: { id: 'publico-pitch' } };

function Sec({ id, title, dark = false, summary, children, heading = 'h2', puppetBackground = false }: { id: string; n?: string; kicker?: string; title: ReactNode; dark?: boolean; summary?: ReactNode; hero?: string; children: ReactNode; heading?: 'h1' | 'h2'; puppetBackground?: boolean }) {
  const Heading = heading;
  return <section id={id} aria-labelledby={`${id}-t`} className={`slide slide--flow ${dark ? 'slide--dark bg-[#070B1F] text-[#F4F1E8]' : 'bg-[#F4F1E8] text-[#070B1F]'}`}>
    <div className="page-wrap slide__body slide__body--flow">
      <div className={puppetBackground ? 'pitch-solution__intro' : undefined}>
      <div>
      <Heading id={`${id}-t`} className={heading === 'h1' ? 'hero-title max-w-[1040px] text-[clamp(2.3rem,5.2vw,4.4rem)] font-extrabold' : 'display max-w-[860px] text-[clamp(1.7rem,3.6vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-.05em]'}>{title}</Heading>
      {summary ? <p className={`mt-3 max-w-[700px] text-base leading-7 ${dark ? 'text-[#e3eaff]' : 'text-[#183173]'}`}>{summary}</p> : null}
      </div>
      {puppetBackground && <img className="pitch-solution__art" src={`${BASE}/pitch-future/shared-prosperity-cutout.svg`} alt="" aria-hidden="true" width={80} height={80} loading="lazy" />}
      </div>
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
    <PitchMissionHero />

    <TechnologyNetworks label="Tecnologias" ethereum />

    <AudienceSection />

    <PitchProblemSection />

    <Sec id="solucao" puppetBackground title={<>{x('BETTEX é a solução.', 'BETTEX is the solution.', 'BETTEX es la solución.')} <span className="text-[#2B59FF]">{x('Seja dono da IA.', 'Own the AI.', 'Sé dueño de la IA.')}</span></>} summary={x('Em vez de depender do resultado de uma aposta, a proposta é ter BETTEX e participar dos lucros elegíveis de uma IA que opera cripto. Recebimento em reais previsto, sem lucro ou retorno garantido.', 'Instead of depending on a bet’s outcome, the proposal is to hold BETTEX and share in the eligible profits of an AI trading crypto. Payouts in reais are planned; profits and returns are not guaranteed.', 'En lugar de depender del resultado de una apuesta, la propuesta es tener BETTEX y participar en los beneficios elegibles de una IA que opera en cripto. Cobros en reales previstos, sin beneficio ni rentabilidad garantizados.')}>
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
