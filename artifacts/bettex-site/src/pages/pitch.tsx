import { useEffect, type ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';
import { TechnologyNetworks } from '@/components/technology/TechnologyNetworks';
import { AudienceSection } from '@/components/pitch/AudienceSection';
import { EmploymentIncomeProblem } from '@/components/pitch/EmploymentIncomeProblem';
import { PitchTokenomics } from '@/components/pitch/PitchTokenomics';
import { PitchFinalCommunity } from '@/components/pitch/PitchFinalCommunity';
import { HeroBenefit } from '@/components/hero/HeroBenefit';
import { HeroAnimatedBackground } from '@/components/hero/HeroAnimatedBackground';
import { PitchContext, PitchJourney, PitchStrategy } from '@/components/pitch/PitchNarrative';
import { useX } from '@/components/pitch/pitchCopy';
import { t } from '@/lib/i18n';
import './pitch.css';
import './pitch-compact.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;
const WORLD_CUP_SOURCE = 'https://site.cndl.org.br/copa-do-mundo-vai-levar-992-milhoes-de-consumidores-as-compras-apontam-cndlspc-brasil/';
const LEGACY_PITCH_SECTIONS: Record<string, { id: string }> = { tese: { id: 'visao' }, publico: { id: 'publico-pitch' } };

function Sec({ id, title, dark = false, summary, children, heading = 'h2', puppetBackground = false }: { id: string; n?: string; kicker?: string; title: ReactNode; dark?: boolean; summary?: ReactNode; hero?: string; children: ReactNode; heading?: 'h1' | 'h2'; puppetBackground?: boolean }) {
  const Heading = heading;
  return <section id={id} aria-labelledby={`${id}-t`} className={`slide slide--flow ${dark ? 'slide--dark bg-[#070B1F] text-[#F4F1E8]' : 'bg-[#F4F1E8] text-[#070B1F]'}`}>
    {puppetBackground && <img className="slide__illustration" src={`${BASE}/pitch-solution-puppet.png`} alt="" aria-hidden="true" loading="lazy" />}
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
    <section id="visao" aria-label={x('Apresentação', 'Overview', 'Presentación')} className="cover cover--hero hero-intro-stage pitch-home-hero relative overflow-hidden text-[#F4F1E8]">
      <HeroAnimatedBackground />
      <div className="hero-intro-content page-wrap relative grid items-center pb-2 pt-8 sm:pt-16 xl:min-h-[680px] xl:py-16">
        <div className="hero-intro-copy entrance relative z-10">
          <div className="pitch-hero-kicker inline-flex items-center gap-2 rounded-full border border-[#5a8bfc]/35 bg-[#2B59FF]/15 px-4 py-2 text-[11px] font-bold text-[#F4F1E8]"><span className="h-2 w-2 rounded-full bg-[#36E0D0]" />{x('PROJETO DEFI · TRADING COM IA', 'DEFI PROJECT · AI TRADING', 'PROYECTO DEFI · TRADING CON IA')}</div>
          <h1 className="hero-title mt-7 max-w-[690px] text-[clamp(2.3rem,5.2vw,4.4rem)] font-extrabold">
            <span className="block">{x('Investir, não apostar.', 'Invest, not bet.', 'Invertir, no apostar.')}</span>{' '}
            <span className="block text-[#F2B632]">{x('Com IA operando em cripto.', 'With AI trading crypto.', 'Con IA operando en cripto.')}</span>
          </h1>
          <h2 className="mt-5 max-w-[550px] text-[clamp(1.3rem,2.3vw,1.7rem)] font-bold leading-[1.25] text-[#F4F1E8]">{x('Compre BETTEX e participe dos lucros elegíveis da nossa IA. Recebimento em reais e saque TODOS OS DIAS via Pix previstos, sem precisar saber operar cripto.', 'Buy BETTEX and share in our AI’s eligible profits. Payouts in reais and withdrawals EVERY DAY via Pix are planned, with no need to know how to trade crypto.', 'Compra BETTEX y participa en los beneficios elegibles de nuestra IA. Cobros en reales y retiros TODOS LOS DÍAS por Pix previstos, sin tener que saber operar en cripto.')}</h2>
          <p className="cover__notice mt-4 text-[13px] leading-[1.55] text-[#c5d2f1]">{x('Demo visual disponível. Sem trading, pagamentos ou retornos garantidos. Há risco de perda.', 'Visual demo available. No trading, payments or guaranteed returns. There is a risk of loss.', 'Demo visual disponible. Sin trading, pagos ni retornos garantizados. Existe riesgo de pérdida.')}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="#solucao" className="tap pitch-home-hero__cta inline-flex min-h-[68px] w-full max-w-[320px] items-center justify-between gap-5 rounded-full border border-[#7390ff]/40 bg-[#2B59FF] py-3 pl-7 pr-3 text-lg font-bold text-white shadow-[0_10px_30px_rgba(43,89,255,0.25)] transition-colors hover:bg-[#1E44D6] focus-visible:outline-[#F2B632]"><span>{t('Conhecer a BETTEX')}</span><span className="pitch-home-hero__arrow grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20" aria-hidden="true"><ArrowDown size={22} strokeWidth={2.2} /></span></a>
            <a href={DOC} className="tap inline-flex min-h-11 items-center gap-2 px-1 py-2 text-sm font-bold text-[#F4F1E8] underline underline-offset-4 hover:text-[#F2B632]">{t('Documentação')}</a>
          </div>
        </div>
      </div>
      <HeroBenefit alt={x('Um homem com celular ao lado do robô de inteligência artificial da BETTEX.', 'A man with a phone beside BETTEX’s artificial intelligence robot.', 'Un hombre con un teléfono junto al robot de inteligencia artificial de BETTEX.')} />
    </section>

    <TechnologyNetworks label="Tecnologias" ethereum />

    <AudienceSection />

    <Sec id="problema" heading="h1" title={<><span className="pitch-world-cup-stat">74%</span><span className="pitch-world-cup-claim">{x('de quem pretendia apostar na Copa de 2026 via nas bets uma forma de quitar dívidas pendentes.', 'of those who planned to bet on the 2026 World Cup saw betting as a way to pay off outstanding debts.', 'de quienes pensaban apostar en la Copa Mundial de 2026 veían las apuestas como una forma de saldar deudas pendientes.')}</span></>} summary={<>{x('Esse público pode enfrentar duas pressões: perdas que comprometem o orçamento de hoje e mudanças no trabalho que ameaçam a renda de amanhã.', 'This audience can face two pressures: losses that jeopardize today’s budget and changes in work that threaten tomorrow’s income.', 'Este público puede enfrentar dos presiones: pérdidas que comprometen el presupuesto de hoy y cambios en el trabajo que amenazan los ingresos de mañana.')}<span className="pitch-world-cup-source">{x('CNDL/SPC Brasil e Offerwise: 600 participantes de 18 anos ou mais nas 27 capitais, com intenção de gastos na Copa; coleta de 27/04 a 05/05/2026. O dado reúne 31% de concordância total e 43% parcial. Não representa toda a população, retorno de apostas ou demanda da BETTEX.', 'CNDL/SPC Brasil and Offerwise: 600 participants aged 18+ in the 27 capitals who intended to spend on the World Cup; fieldwork ran from Apr 27 to May 5, 2026. The result combines 31% strong and 43% partial agreement. It does not represent the full population, betting returns, or demand for BETTEX.', 'CNDL/SPC Brasil y Offerwise: 600 participantes de 18 años o más en las 27 capitales, con intención de gastar en el Mundial; la encuesta se realizó del 27 de abril al 5 de mayo de 2026. El dato reúne un 31% de acuerdo total y un 43% parcial. No representa a toda la población, los retornos de las apuestas ni la demanda de BETTEX.')} <a href={WORLD_CUP_SOURCE} target="_blank" rel="noopener noreferrer">{x('Ver pesquisa original', 'View original survey', 'Ver investigación original')}</a></span></>}>
      <PitchContext />
      <div id="ambiente-externo"><EmploymentIncomeProblem /></div>
    </Sec>

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
