import { useEffect, type ReactNode } from 'react';
import { ArrowRight, CircuitBoard, ExternalLink } from 'lucide-react';
import g from '@/lib/growth-strategy.json';
import { TechnologyNetworks } from '@/components/technology/TechnologyNetworks';
import { ProblemSection } from '@/components/pitch/ProblemSection';
import { AudienceSection } from '@/components/pitch/AudienceSection';
import { FutureSections } from '@/components/pitch/FutureSections';
import { EconomicComparison } from '@/components/pitch/EconomicComparison';
import { economicComparisonRows } from '@/components/pitch/EconomicComparisonRows';
import { PitchTokenCharts } from '@/components/pitch/PitchTokenCharts';
import { TokenValueMechanisms } from '@/components/pitch/TokenValueMechanisms';
import { FounderLaunchFunnel } from '@/components/pitch/FounderLaunchFunnel';
import { RoadmapSection } from '@/components/RoadmapSection';
import { DemoAppLink } from '@/components/DemoAppLink';
import { SolutionParticipationFlow } from '@/components/pitch/SolutionParticipationFlow';
import { PitchObservations } from '@/components/pitch/PitchObservations';
import { ChapterHero } from '@/components/pitch/ChapterHero';
import { PitchEditorialImage, PitchEditorialSplit } from '@/components/pitch/PitchEditorialImage';
import { formatCryptoDailyBillions } from '@/components/pitch/marketFlow';
import { PitchHeroGraph } from '@/components/pitch/PitchHeroGraph';
import { PitchProductResources } from '@/components/pitch/PitchProductResources';
import { PitchDeFAIVision } from '@/components/pitch/PitchDeFAIVision';
import { t, useLocale } from '@/lib/i18n';
import './pitch.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;
const HERO_NOTICE = 'Agente autônomo de IA que faz trading em mercados de apostas esportivas, iGaming, previsões e cripto #DeFI #DeFAI';
const HERO_RESCUE_VISION = 'Nossa visão é resgatar pessoas de um futuro incerto, usando IA para lhes dar uma participação na era de ouro da humanidade e buscar proteger o capital de quem hoje trata apostas como investimento.';

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

const A = ({ href, children, dark = false }: { href: string; children: ReactNode; dark?: boolean }) => <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 font-bold underline underline-offset-4 ${dark ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}>{children}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>;
const Doc = ({ hash, children, dark = false }: { hash: string; children: ReactNode; dark?: boolean }) => <a href={`${DOC}#${hash}`} className={`tap inline-flex min-h-11 items-center gap-2 text-sm font-bold underline underline-offset-4 ${dark ? 'text-[#F2B632]' : 'text-[#2B59FF]'}`}>{children}<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>;

export function PitchPage() {
  useLocale();
  const cryptoDailyBillions = formatCryptoDailyBillions();
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
            <span className="cover__audience mono mb-5 block text-xs font-bold uppercase tracking-[.12em] text-[#F2B632]">Início</span>
            <h1 className="display text-[clamp(1.65rem,3.3vw,2.65rem)] font-extrabold leading-[1.08] tracking-[-.05em]">Um agente de trading DeFi <span className="text-[#F2B632]">para jogadores e apostadores esportivos.</span></h1>
            <p className="cover__market mt-4"><strong data-i18n="translated"><span data-pitch-rescue-vision="">{t(HERO_RESCUE_VISION)}</span>{' '}{t(`Mais de 60 milhões de brasileiros formam o público potencial estimado, enquanto o mercado de cripto movimenta cerca de R$ ${cryptoDailyBillions} bilhão em operações diárias e as bets têm uma referência histórica de R$ 600 milhões em depósitos por dia.`)}</strong></p>
            <p className="cover__notice mt-4 text-[13px] leading-[1.55] text-[#c5d2f1]">{t(HERO_NOTICE)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#solucao" className="tap inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2B59FF] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1E44D6]">Conhecer a BETTEX</a>
              <a href={DOC} className="tap inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[#F4F1E8]/70 px-6 py-2.5 text-sm font-bold hover:bg-[#F4F1E8] hover:text-[#070B1F]">Ler a documentação</a>
            </div>
          </div>
          <PitchHeroGraph />
        </div>
      </div>
    </section>

    <TechnologyNetworks />

    <AudienceSection />
    <ProblemSection />

    <FutureSections />

    <Sec id="solucao" hero="pitch-illustrations/pitch-product-development.webp" summary="Um agente BETTEX, vários mercados e participação econômica por token." n="05" kicker="Solução" title={<>IA na operação, participação por token.</>}>
      <p className="mb-8 max-w-[900px] text-base leading-7 text-[#183173]">A BETTEX é um projeto DeFi e DEX, sem entidade empresarial, que prevê trading com IA sob mandatos e limites de risco. Pelo staking, o usuário participa do rateio do pool global quando há lucro elegível, sem acompanhar cada operação, financiar o trading ou ter pagamento garantido. A gestão começa com o fundador e o time, com transição gradual para IA condicionada à validação do desempenho e a controles verificáveis.</p>
      <div className="fu-position">
        <span className="fu-signal-icon fu-position-icon"><CircuitBoard aria-hidden="true" /></span>
        <p className="display fu-pos-lead">Resgatar o futuro, transformando apostadores em investidores.</p>
      </div>
      <SolutionParticipationFlow />
       <PitchProductResources />
      <div className="mt-8 rounded-2xl bg-[#070B1F] p-6 text-[#F4F1E8]">
        <span className="mono text-[10px] font-bold uppercase tracking-[.14em] text-[#F2B632]">Regra do lucro</span>
        <p className="mt-3 text-[15px] leading-7 text-[#c5d2f1]">Só há lucro elegível após custos reais, obrigações, avaliação das posições abertas, reservas e liquidez.</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          {[['50%', 'Tesouraria', 'Retenção e reinvestimento.'], ['25%', 'Stakers', 'Pool global, rateado pelo peso elegível.'], ['25%', 'Carteira de recompra', 'USDC exclusivo para recompras autorizadas.']].map(([share, destination, explanation]) => <div key={destination} className="border-t border-[#5F86FF]/40 pt-4"><dt className="text-sm font-bold">{destination}</dt><dd className="display mt-2 text-4xl font-extrabold text-[#F2B632]">{share}</dd><dd className="mt-2 text-sm leading-6 text-[#c5d2f1]">{explanation}</dd></div>)}
        </dl>
      </div>
      <Doc hash="documentacao-oportunidade">Ver regras na documentação</Doc>

    <Sec id="diferencial" summary="Na aposta, o resultado depende do evento. Num token centrado no preço, depende da revenda. A BETTEX propõe também participação no lucro elegível de suas estratégias, sujeita às regras do staking." kicker="Diferenciação proposta" title={<>A diferença está <span className="text-[#2B59FF]">no direito econômico.</span></>}>
      <EconomicComparison rows={economicComparisonRows} />
      <PitchObservations>
        <p>Custos, direitos e regras das alternativas variam conforme a plataforma e o contrato.</p>
        <p>Nenhuma promessa de que a IA supere o mercado. O desempenho líquido das estratégias precisa ser medido contra uma referência.</p>
      </PitchObservations>
    </Sec>
    </Sec>

    <section id="tokenomics" aria-labelledby="economia-t">
    <Sec id="economia" hero="pitch-illustrations/pitch-economy-separation.webp" summary="Emissão, financiamento do projeto e participação nos resultados, com recursos separados." n="06" kicker="Tokenomics" title={<>Tokenomics.<br /><span className="text-[#2B59FF]">Emissão, tesouraria e direitos do token.</span></>}>
      <PitchDeFAIVision />
      <div className="pb-fin-scene" id="financiamento">
      <img className="pb-fin-scene__figure" src={`${BASE}/hero-person-phone.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="pb-fin-scene__content">
      <h3 className="display mb-6 text-2xl font-extrabold">Financiamento do projeto e tesouraria ficam separados.</h3>
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card label="Mint público inicial" title="Financiamento do projeto">Mint aberto a preço fixo, separado da comunidade em vesting. Aplicação dos recursos e custos da oferta devem ser documentados antes da abertura.</Card>
        <Card label="Comunidade em vesting" title="100% para a tesouraria">O preço dos tokens da comunidade já liberados financia a tesouraria. A venda não é lucro distribuível; o mint inicial fica separado.</Card>
        <Card label="Investidores-anjo" title="100% para produto, tecnologia e marketing">{g.launch.angelFundingUse}</Card>
        <Card label="Custos de rede" title="ALFA sem tarifa de serviço">No ALFA, apenas custos externos da rede. O custeio de manutenção permanece em aberto, sem retirada automática da tesouraria.</Card>
      </div>
      </div>
      </div>
    </Sec>

    <Sec id="token" kicker="Oferta, vesting e direitos do token" dark title={<>1 bilhão de BETTEX. <span className="text-[#F2B632]">Quatro destinações.</span></>}>
      <PitchTokenCharts />
      <TokenValueMechanisms />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card dark label="Mint público inicial" title="10% · 100 milhões">Mint aberto a qualquer pessoa, a preço fixo, para financiar o projeto.</Card>
        <Card dark label="Comunidade" title="55% · 550 milhões">Destinação posterior em vesting de 24 meses, separada dos 10% do mint inicial.</Card>
        <Card dark label="Fundador e equipe" title="20% · 200 milhões">Livre destinação após a liberação, sem antecipação do vesting.</Card>
        <Card dark label="Investidores" title="15% · 150 milhões">Tokens para investidores, sujeitos ao vesting de 24 meses. Aportes e liberação de tokens seguem condições distintas.</Card>
      </div>
      <div className="mt-8" />
      <PitchEditorialSplit dark side="right" image={<PitchEditorialImage dark name="pitch-token-participation" />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card dark label="Liberação" title="Parcelas mensais durante 24 meses">Vesting dos 90% posteriores a partir de março de 2027: comunidade 55%, fundador/equipe 20% e investidores 15%. O mint inicial fica separado. Liberação não comprova venda ou circulação.</Card>
        <Card dark label="Participação" title="Elegibilidade na abertura da rodada">Quem entra durante a rodada recebe zero nela e espera a próxima, inclusive para lucros gerados depois da entrada. Tokens bloqueados, estoque público e valores indisponíveis ficam fora do rateio. Fundador e demais usuários seguem os mesmos critérios.</Card>
      </div>
      </PitchEditorialSplit>
      <p className="mt-6 max-w-[800px] text-[15px] leading-7 text-[#c5d2f1]">O titular tem os direitos de participação nos resultados definidos pelo token, não propriedade da tesouraria nem resgate pelo valor patrimonial. Pode ganhar ou perder na revenda, se houver liquidez. Oferta fixa não significa pagamento fixo.</p>
      <Doc dark hash="documentacao-emissao">Oferta, vesting e direitos na documentação</Doc>
    </Sec>
    </section>


    <Sec id="publico" hero="pitch-illustrations/pitch-online-community.webp" summary="Comunidade antes do mint público de dezembro de 2026; sistema/ALFA e vesting previstos para março de 2027, sujeitos à adequação jurídica." n="07" kicker="Fase atual e próximos passos" dark title={<>Preparação. <span className="text-[#F2B632]">Comunidade e mint.</span></>}>
      <aside className="pitch-validation-status" data-testid="pitch-current-phase" aria-label="Fase atual do projeto">
        <DemoAppLink className="mono">DEMO VISUAL DISPONÍVEL</DemoAppLink>
        <strong>Comunidade antes do lançamento</strong>
        <p>O demo apresenta a interface com dados ilustrativos, sem dinheiro real ou execução de operações. O mint público está previsto para 10 de dezembro de 2026; sistema/ALFA, captação de investidores e início do vesting, para março de 2027. BETA e go to market vêm depois do ALFA, com data a definir. Cada lançamento depende de adequação legal por atividade e território.</p>
        <DemoAppLink data-testid="pitch-open-alpha-demo" />
      </aside>
      <p className="mb-8 max-w-[800px] text-[15px] leading-7 text-[#c5d2f1]">A promoção para a comunidade precede o mint inicial, cuja receita financia o projeto. A abertura pode começar com baixa captação, sem reduzir automaticamente o preço fixo nem exigir a venda de todo o teto. Preço, janela, plataforma e destino da parcela não mintada ainda serão definidos.</p>
      <FounderLaunchFunnel />
      {/* Launch simulation intentionally unpublished; its component is retained for future reactivation. */}
      <div className="pitch-community" id="pitch-community">
        <div className="pitch-community__copy">
          <p className="mono text-[11px] font-bold uppercase tracking-[.18em] text-[#5F86FF]">Community-driven</p>
          <h3 className="display">Construído com a comunidade.</h3>
          <p>A proposta é construir com os usuários: ouvir feedback, validar melhorias e estimular recomendações orgânicas. A comunidade no Telegram reúne dúvidas e feedback para orientar a evolução do produto.</p>
        </div>
        <img src={`${BASE}/pitch-illustrations/pitch-community-people-cutout.webp`} alt={t('Pessoas sorrindo e interagindo com notebook, tablet e celular, em um recorte sem fundo com elementos tecnológicos')} width={1021} height={886} loading="lazy" decoding="async" />
      </div>
      <PitchObservations dark><p>A validação acompanha a primeira compra elegível, o primeiro uso útil e o retorno dos usuários. Compradores e usuários ativados serão medidos separadamente; a meta não representa resultados já alcançados. Oferta e publicidade dependem de revisão jurídica e elegibilidade.</p></PitchObservations>
    </Sec>

    <RoadmapSection id="pitch-roadmap" />

    <Sec id="recursos" hero="pitch-illustrations/pitch-startup-team.webp" summary="Capital para construir o produto e desenvolver o mercado, não para remunerar o fundador ou financiar uma folha salarial." n="08" kicker="Recursos e riscos" title={<>100% do aporte anjo. <span className="text-[#2B59FF]">Produto, tecnologia e marketing.</span></>}>
      <p className="mb-8 max-w-[900px] text-[15px] leading-7">O mint público inicial e o aporte de investidores-anjo são frentes distintas de financiamento. O mint tem destinação de 10% da oferta; os investidores têm 15% em vesting. Destinação de tokens não equivale a participação societária, valor de captação ou venda já realizada.</p>
      <PitchEditorialSplit image={<PitchEditorialImage name="pitch-product-development" />}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Destino do capital" title="Tecnologia e marketing, sem salários">{g.launch.angelFundingUse}</Card>
        <Card label="Administração inicial" title="Do fundador e do time à autonomia da IA">O fundador e o time administram inicialmente. A direção DeFi e DEX evolui para agentes de IA que assumirão essas funções, até a autonomia operacional completa do agente BETTEX. Essa autonomia é futura e depende de validação e controles. {g.founder.bettexEarnings}</Card>
        <Card label="Em aberto" title="Valor, contrapartida e marcos">Valor total do aporte, condições de entrada, contrapartida em tokens e marcos de aplicação do capital ainda precisam ser definidos. Os 15% destinados a investidores não estabelecem, por si só, preço, valuation ou participação societária. Não há oferta formal de venda de tokens apresentada aqui.</Card>
      </div>
      </PitchEditorialSplit>
      <Doc hash="documentacao-financiamento-fundacao">Financiamento na documentação</Doc>
    </Sec>
  </main>;
}
export default PitchPage;
