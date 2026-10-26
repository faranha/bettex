import { useEffect, type ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';
import { TechnologyNetworks } from '@/components/technology/TechnologyNetworks';
import { AudienceSection } from '@/components/pitch/AudienceSection';
import { PitchTokenomics } from '@/components/pitch/PitchTokenomics';
import { PitchFinalCommunity } from '@/components/pitch/PitchFinalCommunity';
import { PitchProblemSection } from '@/components/pitch/PitchProblemSection';
import { PitchJourney, PitchStrategy } from '@/components/pitch/PitchNarrative';
import { useX } from '@/components/pitch/pitchCopy';
import { t } from '@/lib/i18n';
import './pitch.css';
import './pitch-compact.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;
const LEGACY_PITCH_SECTIONS: Record<string, { id: string }> = { tese: { id: 'visao' }, publico: { id: 'publico-pitch' } };

function Sec({ id, title, dark = false, summary, children, heading = 'h2', puppetBackground = false }: { id: string; n?: string; kicker?: string; title: ReactNode; dark?: boolean; summary?: ReactNode; hero?: string; children: ReactNode; heading?: 'h1' | 'h2'; puppetBackground?: boolean }) {
  const Heading = heading;
  return <section id={id} aria-labelledby={`${id}-t`} className={`slide slide--flow ${dark ? 'slide--dark bg-[#070B1F] text-[#F4F1E8]' : 'bg-[#F4F1E8] text-[#070B1F]'}`}>
    {puppetBackground && <img className="slide__illustration" src={`${BASE}/pitch-future/shared-prosperity-cutout.svg`} alt="" aria-hidden="true" loading="lazy" />}
    <div className="page-wrap slide__body slide__body--flow">
      <Heading id={`${id}-t`} className={heading === 'h1' ? 'hero-title max-w-[1040px] text-[clamp(2.3rem,5.2vw,4.4rem)] font-extrabold' : 'display max-w-[860px] text-[clamp(1.7rem,3.6vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-.05em]'}>{title}</Heading>
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
    <section id="visao" aria-labelledby="pitch-mission-title" aria-label={x('Missão e visão BETTEX', 'BETTEX mission and vision', 'Misión y visión de BETTEX')} className="cover cover--hero pitch-mission-hero relative overflow-hidden text-[#F4F1E8]">
      <div className="page-wrap relative z-10 grid min-h-[580px] items-center py-14 sm:min-h-[620px] sm:py-16 xl:min-h-[680px]">
        <div className="pitch-mission-copy mx-auto w-full max-w-[1040px] text-center">
          <h1 id="pitch-mission-title" className="hero-title mx-auto max-w-[920px] text-[clamp(2.3rem,5.2vw,4.4rem)] font-extrabold leading-[1.04] tracking-[-.05em] text-balance">
            {x('Transformar apostadores em investidores.', 'Turn bettors into investors.', 'Transformar apostadores en inversores.')}
          </h1>
          <p className="mx-auto mt-4 max-w-[800px] text-[clamp(1.05rem,1.6vw,1.3rem)] font-bold leading-[1.45] text-[#F2B632]">
            {x('Sem transformar apostas em investimento.', 'Without turning betting into an investment.', 'Sin convertir las apuestas en una inversión.')}
          </p>
          <h2 className="mx-auto mt-7 max-w-[850px] text-[clamp(1.45rem,2.4vw,2rem)] font-extrabold leading-[1.2]">
            {x('Resgatar pessoas de um futuro incerto.', 'Rescue people from an uncertain future.', 'Rescatar a las personas de un futuro incierto.')}
          </h2>
          <p className="mx-auto mt-4 max-w-[900px] text-[clamp(1rem,1.45vw,1.15rem)] leading-[1.65] text-[#D5DDF1]">
            {x('A visão da BETTEX é resgatar pessoas de um futuro incerto, usando IA para lhes dar uma participação na era de ouro da humanidade. Enquanto o Estado não organiza soluções sociais para o desaparecimento do emprego como o conhecemos, o projeto busca proteger o capital de quem hoje trata apostas como investimento.',
              'BETTEX’s vision is to rescue people from an uncertain future, using AI to give them a stake in humanity’s golden age. While the state has yet to put social solutions in place for the disappearance of employment as we know it, the project seeks to protect the capital of people who currently treat betting as an investment.',
              'La visión de BETTEX es rescatar a las personas de un futuro incierto, usando IA para darles una participación en la edad de oro de la humanidad. Mientras el Estado no organiza soluciones sociales ante la desaparición del empleo tal como lo conocemos, el proyecto busca proteger el capital de quienes hoy tratan las apuestas como inversión.')}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#solucao" className="tap inline-flex min-h-[56px] w-full max-w-[320px] items-center justify-between gap-5 rounded-full border border-[#7390ff]/40 bg-[#2B59FF] py-2 pl-6 pr-2 text-base font-bold text-white shadow-[0_10px_30px_rgba(43,89,255,0.25)] transition-colors hover:bg-[#1E44D6] focus-visible:outline-[#F2B632] sm:min-h-[64px] sm:py-3 sm:pl-7 sm:pr-3 sm:text-lg">
              <span>{t('Conhecer a BETTEX')}</span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20" aria-hidden="true"><ArrowDown size={22} strokeWidth={2.2} /></span>
            </a>
            <a href={DOC} className="tap inline-flex min-h-11 items-center gap-2 px-1 py-2 text-sm font-bold text-[#F4F1E8] underline underline-offset-4 hover:text-[#F2B632]">{t('Documentação')}</a>
          </div>
        </div>
      </div>
    </section>

    <TechnologyNetworks label="Tecnologias" ethereum />

    <AudienceSection />

    <PitchProblemSection />

    <Sec id="solucao" puppetBackground title={<>{x('BETTEX é a solução.', 'BETTEX is the solution.', 'BETTEX es la solución.')} <span className="text-[#2B59FF]">{x('Participação nos lucros da IA.', 'Sharing in AI’s profits.', 'Participación en los beneficios de la IA.')}</span></>} summary={x('Em vez de depender do resultado de uma aposta, a proposta é ter BETTEX e participar dos lucros elegíveis de uma IA que opera cripto. Recebimento em reais previsto, sem lucro ou retorno garantido.', 'Instead of depending on a bet’s outcome, the proposal is to hold BETTEX and share in the eligible profits of an AI trading crypto. Payouts in reais are planned; profits and returns are not guaranteed.', 'En lugar de depender del resultado de una apuesta, la propuesta es tener BETTEX y participar en los beneficios elegibles de una IA que opera en cripto. Cobros en reales previstos, sin beneficio ni rentabilidad garantizados.')}>
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
