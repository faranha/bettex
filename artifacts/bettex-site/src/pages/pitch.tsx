import { useEffect, type ReactNode } from 'react';
import { TechnologyNetworks } from '@/components/technology/TechnologyNetworks';
import { AudienceSection } from '@/components/pitch/AudienceSection';
import { EmploymentIncomeProblem } from '@/components/pitch/EmploymentIncomeProblem';
import { PitchTokenomics } from '@/components/pitch/PitchTokenomics';
import { DemoAppLink } from '@/components/DemoAppLink';
import { PitchHeroGraph } from '@/components/pitch/PitchHeroGraph';
import { PitchContext, PitchJourney, PitchStrategy } from '@/components/pitch/PitchNarrative';
import { useX } from '@/components/pitch/pitchCopy';
import { t } from '@/lib/i18n';
import './pitch.css';
import './pitch-compact.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;
const LEGACY_PITCH_SECTIONS: Record<string, { id: string }> = { tese: { id: 'visao' } };

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
            <h1 className="display text-[clamp(1.65rem,3.3vw,2.65rem)] font-extrabold leading-[1.08] tracking-[-.05em]">{x('IA opera em cripto.', 'AI trades crypto.', 'La IA opera en cripto.')} <span className="text-[#F2B632]">{x('Você participa dos lucros.', 'You share in the profits.', 'Tú participas en los beneficios.')}</span></h1>
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

    <Sec id="problema" kicker={x('Problema', 'Problem', 'Problema')} title={x('Perdas nas apostas. Renda sob pressão.', 'Betting losses. Income under pressure.', 'Pérdidas en las apuestas. Ingresos bajo presión.')} summary={x('Dinheiro essencial exposto nas apostas, poucas reservas e riscos para emprego e salário.', 'Essential money exposed to betting, limited savings and risks to jobs and wages.', 'Dinero esencial expuesto a las apuestas, pocas reservas y riesgos para el empleo y el salario.')}>
      <PitchContext />
      <div id="ambiente-externo"><EmploymentIncomeProblem /></div>
    </Sec>

    <Sec id="solucao" kicker={x('Solução', 'Solution', 'Solución')} title={x('Compre BETTEX. Participe dos lucros.', 'Buy BETTEX. Share in the profits.', 'Compra BETTEX. Participa en los beneficios.')} summary={x('A IA opera em cripto. Você acompanha seus tokens e recebe sua parte em reais, quando houver lucro elegível.', 'AI trades crypto. You track your tokens and receive your share in reais when there is eligible profit.', 'La IA opera en cripto. Tú sigues tus tokens y recibes tu parte en reales cuando hay beneficio elegible.')}>
      <PitchJourney />
    </Sec>

    <Sec id="estrategia" kicker={x('Estratégia', 'Strategy', 'Estrategia')} dark title={<>{x('BETTEX e subagentes.', 'BETTEX and subagents.', 'BETTEX y subagentes.')} <span className="text-[#F2B632]">{x('Operação guiada por padrões.', 'Pattern-driven trading.', 'Operación guiada por patrones.')}</span></>}>
      <PitchStrategy />
    </Sec>

    <PitchTokenomics />

    <Sec id="publico" summary={x('Demo visual hoje. Comunidade e preparação para as próximas etapas, sujeitas à adequação jurídica.', 'Visual demo today. Community and preparation for the next stages, subject to legal compliance.', 'Demo visual hoy. Comunidad y preparación para las próximas etapas, sujetas a adecuación jurídica.')} kicker={x('Fase atual e próximos passos', 'Current phase and next steps', 'Fase actual y próximos pasos')} dark title={<>{x('Preparação.', 'Preparation.', 'Preparación.')} <span className="text-[#F2B632]">{x('Comunidade e mint.', 'Community and mint.', 'Comunidad y mint.')}</span></>}>
      <div className="pitch-launch-layout">
      <aside className="pitch-validation-status" data-testid="pitch-current-phase" aria-label="Fase atual do projeto">
        <DemoAppLink className="mono">DEMO VISUAL DISPONÍVEL</DemoAppLink>
        <strong>Comunidade antes do lançamento</strong>
        <p>{x('Hoje, interface com dados ilustrativos, sem dinheiro real ou execução. Captação de investidores prevista na ALFA; BETA e go to market vêm depois, sem data definida. Lançamentos dependem de adequação jurídica por atividade e território.', 'Today, an interface with illustrative data, no real money or execution. Investor fundraising is planned for ALFA; BETA and go to market follow, with no set date. Launches depend on legal compliance by activity and territory.', 'Hoy, una interfaz con datos ilustrativos, sin dinero real ni ejecución. Captación de inversores prevista en ALFA; BETA y go to market vendrán después, sin fecha definida. Lanzamientos sujetos a adecuación jurídica por actividad y territorio.')}</p>
        <DemoAppLink data-testid="pitch-open-alpha-demo" />
      </aside>
      <div className="pitch-community" id="pitch-community">
        <div className="pitch-community__copy">
          <p className="mono text-[11px] font-bold uppercase tracking-[.18em] text-[#5F86FF]">Community-driven</p>
          <h3 className="display">{x('Construído com a comunidade.', 'Built with the community.', 'Construido con la comunidad.')}</h3>
          <p>{x('A comunidade no Telegram reúne dúvidas e feedback para orientar o produto. Primeira compra, primeiro uso e retorno dos usuários são métricas separadas; a meta de 1 mil usuários em 3 meses é objetivo, não tração alcançada, e o custo de aquisição do projeto é zero, não o custo operacional.', 'The Telegram community gathers questions and feedback to guide the product. First purchase, first use and user retention are separate metrics; the target of 1,000 users in 3 months is a goal, not achieved traction, and the project acquisition cost is zero, not the operating cost.', 'La comunidad en Telegram reúne dudas y feedback para orientar el producto. Primera compra, primer uso y retención de usuarios son métricas separadas; la meta de 1.000 usuarios en 3 meses es un objetivo, no tracción alcanzada, y el costo de adquisición del proyecto es cero, no el costo operativo.')}</p>
        </div>
        <img src={`${BASE}/pitch-illustrations/pitch-community-people-cutout.webp`} alt={t('Pessoas sorrindo e interagindo com notebook, tablet e celular, em um recorte sem fundo com elementos tecnológicos')} width={1021} height={886} loading="lazy" decoding="async" />
      </div>
      </div>
      <details className="pitch-launch-details">
        <summary>{x('Condições do mint', 'Mint conditions', 'Condiciones del mint')}</summary>
        <p>{x('A comunidade antecede o mint a preço fixo, cuja receita inicia a tesouraria. Preço, janela e plataforma seguem em definição. Baixa captação não reduz automaticamente o preço.', 'The community precedes the fixed-price mint, whose proceeds establish the treasury. Price, window and platform remain to be defined. Low fundraising does not automatically lower the price.', 'La comunidad precede al mint a precio fijo, cuyos ingresos inician la tesorería. Precio, ventana y plataforma siguen por definir. Una captación baja no reduce automáticamente el precio.')}</p>
      </details>
    </Sec>


  </main>;
}
export default PitchPage;
