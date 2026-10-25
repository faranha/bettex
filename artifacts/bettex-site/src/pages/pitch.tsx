import { useEffect, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import g from '@/lib/growth-strategy.json';
import { TechnologyNetworks } from '@/components/technology/TechnologyNetworks';
import { AudienceSection } from '@/components/pitch/AudienceSection';
import { EmploymentIncomeProblem } from '@/components/pitch/EmploymentIncomeProblem';
import { PitchTokenCharts } from '@/components/pitch/PitchTokenCharts';
import { FounderLaunchFunnel } from '@/components/pitch/FounderLaunchFunnel';
import { RoadmapSection } from '@/components/RoadmapSection';
import { DemoAppLink } from '@/components/DemoAppLink';
import { ChapterHero } from '@/components/pitch/ChapterHero';
import { PitchEditorialImage, PitchEditorialSplit } from '@/components/pitch/PitchEditorialImage';
import { PitchHeroGraph } from '@/components/pitch/PitchHeroGraph';
import { PitchContext, PitchJourney, PitchStrategy, PitchFunding, PitchRisks } from '@/components/pitch/PitchNarrative';
import { useX } from '@/components/pitch/pitchCopy';
import { t } from '@/lib/i18n';
import './pitch.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;

function Sec({ id, n, kicker, title, dark = false, summary, hero, children }: { id: string; n?: string; kicker: string; title: ReactNode; dark?: boolean; summary?: string; hero?: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-t`} className={`slide ${dark ? 'slide--dark bg-[#070B1F] text-[#F4F1E8]' : 'bg-[#F4F1E8] text-[#070B1F]'}`}>
    {hero && n ? <ChapterHero id={id} n={n} kicker={kicker} title={title} summary={summary ?? ''} src={hero} tone={id === 'solucao' ? 'blue' : 'ink'} /> : <header className={`slide__head ${dark ? 'slide__head--ink' : 'slide__head--paper'}`}>
      <div className="page-wrap slide__headin">
        <div className={`mono flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.18em] ${dark ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}><span className="h-px w-10 shrink-0 bg-current" aria-hidden="true" />{kicker}</div>
        <h3 id={`${id}-t`} className="display mt-4 max-w-[860px] text-[clamp(1.9rem,4.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-.06em]">{title}</h3>
        {summary ? <p className={`mt-5 max-w-[700px] text-base leading-7 ${dark ? 'text-[#e3eaff]' : 'text-[#183173]'}`}>{summary}</p> : null}
      </div>
    </header>}
    <div className="page-wrap slide__body">{children}</div>
  </section>;
}

function Card({ label, title, children, dark = false }: { label: string; title: string; children: ReactNode; dark?: boolean }) {
  return <div className={`rounded-2xl border p-6 ${dark ? 'border-[#2B59FF]/40 bg-[#0d1536]' : 'border-[#070B1F]/15 bg-white/50'}`}>
    <span className={`mono text-[10px] font-bold uppercase tracking-[.14em] ${dark ? 'text-[#5F86FF]' : 'text-[#2B59FF]'}`}>{label}</span>
    <h3 className="display mt-3 text-xl font-extrabold leading-tight tracking-[-.04em]">{title}</h3>
    <p className={`mt-3 text-[15px] leading-7 ${dark ? 'text-[#c5d2f1]' : 'text-[#183173]'}`}>{children}</p>
  </div>;
}

const Doc = ({ hash, children, dark = false }: { hash: string; children: ReactNode; dark?: boolean }) => <a href={`${DOC}#${hash}`} className={`tap inline-flex min-h-11 items-center gap-2 text-sm font-bold underline underline-offset-4 ${dark ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}>{children}<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>;

export function PitchPage() {
  const x = useX();
  useEffect(() => {
    let mounted = true;
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!mounted || !id) return;
      const el = document.getElementById(id);
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
    <section id="visao" aria-label="Início" className="cover relative overflow-hidden text-[#F4F1E8]">
      <div className="page-wrap relative pb-8 pt-8 sm:pb-12 sm:pt-14">
        <div className="cover__grid">
          <div className="cover__copy">
            <span className="cover__audience mono mb-5 block text-xs font-bold uppercase tracking-[.12em] text-[#F2B632]">{x('Início', 'Start', 'Inicio')}</span>
            <h1 className="display text-[clamp(1.65rem,3.3vw,2.65rem)] font-extrabold leading-[1.08] tracking-[-.05em]">{x('IA em cripto.', 'AI in crypto.', 'IA en cripto.')} <span className="text-[#F2B632]">{x('Participação nos lucros em reais.', 'Profit participation in reais.', 'Participación en los beneficios en reales.')}</span></h1>
            <p className="cover__market mt-4"><strong>{x('A BETTEX propõe transformar apostadores em investidores: participação nos resultados de um agente de IA em cripto, com apuração diária e recebimento em reais. Pix previsto.', 'BETTEX aims to turn bettors into investors: participation in the results of an AI agent in crypto, with daily calculation and payouts in reais. Pix is planned.', 'BETTEX propone convertir a apostadores en inversores: participación en los resultados de un agente de IA en cripto, con cálculo diario y cobro en reales. Pix previsto.')}</strong></p>
            <p className="cover__notice mt-4 text-[13px] leading-[1.55] text-[#c5d2f1]">{x('Demo visual disponível. Sem trading, pagamentos ou retornos garantidos.', 'Visual demo available. No trading, payments or guaranteed returns.', 'Demo visual disponible. Sin trading, pagos ni retornos garantizados.')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#solucao" className="tap inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2B59FF] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1E44D6]">{t('Conhecer a BETTEX')}</a>
              <a href={DOC} className="tap inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[#F4F1E8]/70 px-6 py-2.5 text-sm font-bold hover:bg-[#F4F1E8] hover:text-[#070B1F]">{t('Ler a documentação')}</a>
            </div>
          </div>
          <PitchHeroGraph />
        </div>
      </div>
    </section>

    <TechnologyNetworks label="Tecnologias" />

    <AudienceSection />
    <PitchContext />
    <div className="pb-problem">
      <div className="page-wrap">
        <EmploymentIncomeProblem />
      </div>
    </div>

    <Sec id="solucao" hero="pitch-illustrations/pitch-product-development.webp" n="03" kicker={x('Produto', 'Product', 'Producto')} title={x('Uma jornada de participação.', 'One participation journey.', 'Una jornada de participación.')} summary={x('Compra, carteira, agente, apuração e recebimento em reais.', 'Purchase, wallet, agent, calculation and payout in reais.', 'Compra, cartera, agente, cálculo y cobro en reales.')}>
      <PitchJourney />
    </Sec>

    <Sec id="estrategia" kicker={x('Estratégia', 'Strategy', 'Estrategia')} dark title={<>{x('Um agente, uma hipótese.', 'One agent, one hypothesis.', 'Un agente, una hipótesis.')} <span className="text-[#F2B632]">{x('Cripto sob limites de risco.', 'Crypto under risk limits.', 'Cripto bajo límites de riesgo.')}</span></>}>
      <PitchStrategy />
    </Sec>

    <section id="tokenomics" aria-labelledby="economia-t">
    <Sec id="economia" hero="pitch-illustrations/pitch-economy-separation.webp" n="05" kicker="Tokenomics" summary={x('Capital captado e lucro do trading são coisas distintas.', 'Capital raised and trading profit are distinct.', 'El capital captado y el beneficio del trading son distintos.')} title={<>Tokenomics.<br /><span className="text-[#2B59FF]">{x('Tesouraria e direitos do token.', 'Treasury and token rights.', 'Tesorería y derechos del token.')}</span></>}>
      <PitchFunding />
    </Sec>

    <Sec id="token" kicker={x('Oferta, vesting e direitos do token', 'Supply, vesting and token rights', 'Oferta, vesting y derechos del token')} dark title={<>{x('1 bilhão de BETTEX.', '1 billion BETTEX.', '1.000 millones de BETTEX.')} <span className="text-[#F2B632]">{x('Quatro destinações.', 'Four allocations.', 'Cuatro destinos.')}</span></>}>
      <PitchTokenCharts />
      <div className="mt-8" />
      <PitchEditorialSplit dark side="right" image={<PitchEditorialImage dark name="pitch-token-participation" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card dark label={x('Liberação', 'Release', 'Liberación')} title={x('24 meses a partir de março de 2027', '24 months from March 2027', '24 meses desde marzo de 2027')}>{x('Os 90% posteriores liberam em parcelas mensais: comunidade 55%, fundador e equipe 20%, investidores 15%. O mint inicial de 10%, em 10 de dezembro de 2026, é separado. Liberar não comprova venda.', 'The later 90% is released in monthly installments: community 55%, founder and team 20%, investors 15%. The 10% initial mint, on December 10, 2026, is separate. Release does not prove a sale.', 'El 90% posterior se libera en cuotas mensuales: comunidad 55%, fundador y equipo 20%, inversores 15%. El mint inicial del 10%, el 10 de diciembre de 2026, es aparte. Liberar no prueba una venta.')}</Card>
        <Card dark label={x('Direitos', 'Rights', 'Derechos')} title={x('Participação, não equity', 'Participation, not equity', 'Participación, no equity')}>{x('A destinação de 10% do mint não equivale aos 15% de investidores, a tokens vendidos nem a participação societária. O titular não tem propriedade da tesouraria nem resgate por valor patrimonial, e pode perder na revenda.', 'The 10% mint allotment is not the same as the investors’ 15%, tokens sold or equity. The holder has no ownership of the treasury or redemption at net asset value, and may lose on resale.', 'La asignación del 10% del mint no equivale al 15% de inversores, a tokens vendidos ni a participación societaria. El titular no tiene propiedad de la tesorería ni rescate por valor patrimonial, y puede perder en la reventa.')}</Card>
      </div>
      </PitchEditorialSplit>
      <Doc dark hash="documentacao-emissao">{x('Oferta, vesting e regras na documentação', 'Supply, vesting and rules in the documentation', 'Oferta, vesting y reglas en la documentación')}</Doc>
    </Sec>
    </section>

    <Sec id="publico" hero="pitch-illustrations/pitch-online-community.webp" summary="Comunidade antes do mint público de dezembro de 2026; sistema/ALFA e vesting previstos para março de 2027, sujeitos à adequação jurídica." n="06" kicker="Fase atual e próximos passos" dark title={<>Preparação. <span className="text-[#F2B632]">Comunidade e mint.</span></>}>
      <aside className="pitch-validation-status" data-testid="pitch-current-phase" aria-label="Fase atual do projeto">
        <DemoAppLink className="mono">DEMO VISUAL DISPONÍVEL</DemoAppLink>
        <strong>Comunidade antes do lançamento</strong>
        <p>O demo apresenta a interface com dados ilustrativos, sem dinheiro real ou execução de operações. O mint público está previsto para 10 de dezembro de 2026; sistema/ALFA, captação de investidores e início do vesting, para março de 2027. BETA e go to market vêm depois do ALFA, com data a definir. Cada lançamento depende de adequação legal por atividade e território.</p>
        <DemoAppLink data-testid="pitch-open-alpha-demo" />
      </aside>
      <p className="mb-8 max-w-[800px] text-[15px] leading-7 text-[#c5d2f1]">{x('A promoção para a comunidade precede o mint inicial, cuja receita forma a base da tesouraria. A abertura pode começar com baixa captação, sem reduzir automaticamente o preço fixo. Preço, janela e plataforma ainda serão definidos.', 'Community promotion precedes the initial mint, whose proceeds form the base of the treasury. Opening may begin with low take-up, without automatically lowering the fixed price. Price, window and platform are still to be defined.', 'La promoción a la comunidad precede al mint inicial, cuyos ingresos forman la base de la tesorería. La apertura puede comenzar con baja captación, sin reducir automáticamente el precio fijo. Precio, ventana y plataforma aún se definirán.')}</p>
      <FounderLaunchFunnel />
      <div className="pitch-community" id="pitch-community">
        <div className="pitch-community__copy">
          <p className="mono text-[11px] font-bold uppercase tracking-[.18em] text-[#5F86FF]">Community-driven</p>
          <h3 className="display">{x('Construído com a comunidade.', 'Built with the community.', 'Construido con la comunidad.')}</h3>
          <p>{x('A comunidade no Telegram reúne dúvidas e feedback para orientar o produto. Primeira compra, primeiro uso e retorno dos usuários são métricas separadas; a meta de 1 mil usuários em 3 meses é objetivo, não tração alcançada, e o custo de aquisição do projeto é zero, não o custo operacional.', 'The Telegram community gathers questions and feedback to guide the product. First purchase, first use and user retention are separate metrics; the target of 1,000 users in 3 months is a goal, not achieved traction, and the project acquisition cost is zero, not the operating cost.', 'La comunidad en Telegram reúne dudas y feedback para orientar el producto. Primera compra, primer uso y retención de usuarios son métricas separadas; la meta de 1.000 usuarios en 3 meses es un objetivo, no tracción alcanzada, y el costo de adquisición del proyecto es cero, no el costo operativo.')}</p>
        </div>
        <img src={`${BASE}/pitch-illustrations/pitch-community-people-cutout.webp`} alt={t('Pessoas sorrindo e interagindo com notebook, tablet e celular, em um recorte sem fundo com elementos tecnológicos')} width={1021} height={886} loading="lazy" decoding="async" />
      </div>
    </Sec>

    <RoadmapSection id="pitch-roadmap" scope="pitch" />

    <Sec id="recursos" hero="pitch-illustrations/pitch-startup-team.webp" summary={x('Capital para construir o produto e desenvolver o mercado, não para remunerar o fundador.', 'Capital to build the product and develop the market, not to pay the founder.', 'Capital para construir el producto y desarrollar el mercado, no para remunerar al fundador.')} n="07" kicker={x('Investimento', 'Investment', 'Inversión')} title={<>{x('100% do aporte anjo.', '100% of the angel contribution.', '100% del aporte ángel.')} <span className="text-[#2B59FF]">{x('Produto, tecnologia e marketing.', 'Product, technology and marketing.', 'Producto, tecnología y marketing.')}</span></>}>
      <PitchEditorialSplit image={<PitchEditorialImage name="pitch-product-development" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card label={x('Destino do capital', 'Use of capital', 'Destino del capital')} title={x('Tecnologia e marketing, sem salários', 'Technology and marketing, no salaries', 'Tecnología y marketing, sin salarios')}>{g.launch.angelFundingUse}</Card>
        <Card label={x('Em aberto', 'Open', 'Abierto')} title={x('Valor, condições e marcos', 'Amount, terms and milestones', 'Importe, condiciones e hitos')}>{x('Valor do aporte, condições, contrapartida em tokens e marcos ainda estão em definição. Os 15% de investidores não são valuation nem participação societária, e não há oferta formal aqui.', 'Contribution amount, terms, token consideration and milestones are still being defined. The investors’ 15% is not a valuation or equity, and there is no formal offer here.', 'El importe del aporte, las condiciones, la contrapartida en tokens y los hitos aún se están definiendo. El 15% de inversores no es valoración ni participación societaria, y aquí no hay oferta formal.')}</Card>
      </div>
      </PitchEditorialSplit>
      <p className="mt-6 text-sm leading-7 text-[#183173]">{x('Compra e venda de BETTEX, on-ramp, off-ramp e rede têm custos, debitados dos ganhos diários do participante. O recebimento em reais é líquido dessas taxas. O custeio de manutenção permanece em aberto, sem retirada automática da tesouraria.', 'BETTEX purchases and sales, on-ramp, off-ramp and network transactions have costs, deducted from the participant’s daily earnings. Payouts in reais are net of these fees. Maintenance funding remains unresolved, with no automatic treasury withdrawal.', 'La compra y venta de BETTEX, el on-ramp, el off-ramp y la red tienen costes, descontados de las ganancias diarias del participante. El cobro en reales es neto de estas comisiones. La financiación del mantenimiento sigue abierta, sin retiros automáticos de la tesorería.')}</p>
      <PitchRisks />
      <Doc hash="documentacao-financiamento-fundacao">{x('Financiamento na documentação', 'Funding in the documentation', 'Financiación en la documentación')}</Doc>
    </Sec>
  </main>;
}
export default PitchPage;
