import { type ReactNode, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ChartCandlestick, ChevronDown, Menu, Radar, Spade, Trophy, X, type LucideIcon } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { TechnologySection } from '@/components/technology/TechnologySection';
import { InvestorAppPreview } from '@/components/investor/InvestorAppPreview';
import { HeroBenefit } from '@/components/hero/HeroBenefit';
import { BettexMark } from '@/components/BettexMark';
import { AgentMark, type AgentKind } from '@/components/hero/AgentMark';
import '@/components/hero/AgentCard.css';
import { ProjectModelSection } from '@/components/ProjectModelSection';
import { HumanStorySection } from '@/components/HumanStorySection';
import { WhitepaperSection } from '@/components/WhitepaperSection';
import { RoadmapSection } from '@/components/RoadmapSection';

const queryClient = new QueryClient();
type Agent = {
  name: string;
  kind: AgentKind;
  icon: LucideIcon;
  visual: string;
  area: string;
  intro: string;
  detail: string;
  platform: string;
  platformLogo?: string;
};

const agents: Agent[] = [
  { name: 'PREDIX', kind: 'predix', icon: Radar, visual: 'máquina cilíndrica sem rosto com ícone de cenários ramificados', area: 'Previsões', intro: 'Inteligência de cenários.', detail: 'Analisa mercados de previsão na Polymarket para a BETTEX.', platform: 'Polymarket', platformLogo: 'polymarket.svg' },
  { name: 'TRADEX', kind: 'tradex', icon: ChartCandlestick, visual: 'máquina cilíndrica sem rosto com ícone de gráfico de negociação', area: 'Ações e cripto', intro: 'Negociação de ações e criptoativos.', detail: 'Negocia ações e criptoativos na Robinhood como parte da BETTEX.', platform: 'Robinhood', platformLogo: 'robinhood.svg' },
  { name: 'SPORTIX', kind: 'sportix', icon: Trophy, visual: 'máquina cilíndrica sem rosto com pequeno ícone de bola de futebol', area: 'Esportes', intro: 'Análise esportiva.', detail: 'Opera em mercados esportivos na Kalshi como parte da BETTEX.', platform: 'Kalshi', platformLogo: 'kalshi.webp' },
  { name: 'BETTIX', kind: 'bettix', icon: Spade, visual: 'máquina cilíndrica sem rosto com ícone de naipe de espadas', area: 'Cassino', intro: 'Análise de jogos.', detail: 'Opera somente nos jogos de cassino da Duel como parte da BETTEX.', platform: 'Duel', platformLogo: 'duel.webp' },
];

const navItems = [
  { label: 'Início', id: 'inicio' },
  { label: 'O projeto', id: 'participacao' },
  { label: 'História', id: 'historia' },
  { label: 'Operações', id: 'tecnologia' },
  { label: 'Agentes', id: 'agentes' },
  { label: 'Aplicativo', id: 'visao-investidor' },
  { label: 'Documentação', id: 'documentacao' },
  { label: 'Roadmap', id: 'roadmap' },
] as const;

function Logo({ pale = false }: { pale?: boolean }) {
  return <a href="#inicio" className={`inline-flex items-center gap-2.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#168367] ${pale ? 'text-[#f6f4e9]' : 'text-[#123a3b]'}`} aria-label="BETTEX, voltar ao início">
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${pale ? 'border-[#a4eacb]/35 bg-[#0b2c30]' : 'border-[#1e5551] bg-[#123a3b]'} shadow-[0_3px_10px_rgba(6,32,33,.12)]`}>
      <BettexMark className="block h-[30px] w-[30px]" />
    </span>
    <span className="display text-[25px] font-extrabold leading-none tracking-[-.075em]">BETTEX</span>
  </a>;
}

function SiteFooter() {
  return <footer id="rodape" className="relative overflow-hidden bg-[#123a3b] text-[#e5f0e8]">
    <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-0 h-[440px] w-[440px] rounded-full border border-[#a4eacb]/10 sm:-right-12" />
    <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-[290px] w-[290px] rounded-full border border-[#a4eacb]/10 sm:right-6" />
    <div className="page-wrap relative">
      <div className="grid gap-8 border-b border-[#a4eacb]/20 py-14 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div>
          <span className="mono text-[10px] font-bold uppercase tracking-[.2em] text-[#a4eacb]">O próximo passo é entender</span>
          <h2 className="display mt-5 max-w-[760px] text-[clamp(2.25rem,5vw,4.7rem)] font-extrabold leading-[1.04] tracking-[-.065em] text-[#f7f4e9]">Conheça o caminho.<br /><span className="text-[#a4eacb]">Decida com consciência.</span></h2>
        </div>
        <div className="lg:justify-self-end">
          <p className="max-w-[390px] text-sm leading-7 text-[#cadfd4]">Veja a sequência planejada, as regras do projeto e os riscos antes de tomar qualquer decisão.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#roadmap" className="tap inline-flex items-center gap-2 rounded-full bg-[#a4eacb] px-5 py-3 text-sm font-bold text-[#123a3b] hover:bg-[#c0f5dc]">Ver o roadmap <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
            <a href="#documentacao" className="tap inline-flex items-center gap-2 rounded-full border border-[#a4eacb]/40 px-5 py-3 text-sm font-bold text-[#f7f4e9] hover:bg-white/10">Ler a documentação</a>
          </div>
        </div>
      </div>
      <div className="grid gap-10 border-b border-[#a4eacb]/20 py-11 md:grid-cols-[minmax(0,1.5fr)_1fr_1fr]">
        <div>
          <Logo pale />
          <p className="mt-5 max-w-[350px] text-sm leading-7 text-[#cadfd4]">Um projeto de IA para acompanhar operações em mercados de risco. Resultados e valorização do token não são garantidos.</p>
        </div>
        <nav aria-label="Explorar o projeto">
          <h3 className="mono mb-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#a4eacb]">Explore</h3>
          <ul className="space-y-3 text-sm font-semibold">
            <li><a className="hover:text-[#a4eacb]" href="#participacao">Como funciona</a></li>
            <li><a className="hover:text-[#a4eacb]" href="#agentes">Os quatro agentes</a></li>
            <li><a className="hover:text-[#a4eacb]" href="#visao-investidor">Demonstração</a></li>
          </ul>
        </nav>
        <nav aria-label="Informações e etapas">
          <h3 className="mono mb-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#a4eacb]">Informe-se</h3>
          <ul className="space-y-3 text-sm font-semibold">
            <li><a className="hover:text-[#a4eacb]" href="#documentacao">Documentação técnica</a></li>
            <li><a className="hover:text-[#a4eacb]" href="#roadmap">Roadmap</a></li>
            <li><a className="hover:text-[#a4eacb]" href="#historia">Dinheiro e risco</a></li>
          </ul>
        </nav>
      </div>
      <div className="flex flex-col gap-4 py-6 text-xs leading-5 text-[#b5d1c3] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} BETTEX. Investir envolve risco de perda.</p>
        <a href="#inicio" className="inline-flex w-fit items-center gap-2 font-bold text-[#a4eacb] hover:text-white">Voltar ao início <ChevronDown className="h-4 w-4 rotate-180" aria-hidden="true" /></a>
      </div>
    </div>
  </footer>;
}

function AgentCard({ agent, number }: { agent: Agent; number: number }) {
  return <article className={`agent-card agent-card--${agent.kind} flex h-full flex-col overflow-hidden rounded-[18px] border border-[#123a3b]/15 bg-[#f5f6ef]`}>
    <div className="agent-card__stage relative flex h-[190px] shrink-0 items-center justify-center overflow-hidden sm:h-[205px]">
      <div className="agent-card__index absolute left-5 top-5 z-20 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em]"><agent.icon className="h-4 w-4" aria-hidden="true" />0{number} / {agent.area}</div>
      <span className="agent-card__crosshair agent-card__crosshair--tl" aria-hidden="true" />
      <span className="agent-card__crosshair agent-card__crosshair--br" aria-hidden="true" />
      <div className="agent-card__instrument relative z-10 h-[154px] w-[154px] sm:h-[166px] sm:w-[166px]" role="img" aria-label={`${agent.name}, ${agent.visual}`}>
        <img src={`${import.meta.env.BASE_URL}agents/predix-cycle.webp`} alt="" aria-hidden="true" loading="lazy" className="agent-card__image h-full w-full object-contain" />
        <span className="agent-card__emblem" aria-hidden="true"><AgentMark kind={agent.kind} /></span>
      </div>
      <div className="agent-card__stage-foot absolute bottom-3 left-5 right-5 z-20 flex justify-between border-t border-white/15 pt-2 text-[8px] font-bold uppercase tracking-[.16em]"><span>BETTEX / AGENTE</span><span>0{number} / 04</span></div>
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <div className="min-h-[75px]"><h4 className="display text-[25px] font-extrabold leading-none tracking-[-.055em] text-[#123a3b]">{agent.name}</h4><p className="display mt-2 text-base font-bold leading-5 text-[#294d4a]">{agent.intro}</p></div>
      <p className="mono mt-4 text-[9px] font-bold uppercase tracking-[.12em] text-[#44776b]">O que faz</p>
      <p className="mt-2 min-h-[70px] text-[13px] leading-[1.55] text-[#455f5b]">{agent.detail}</p>
      <div className="mt-auto flex min-h-[76px] items-center rounded-[10px] border border-[#294e4b] bg-[#123a3b] px-4 py-3 text-[#f7f4e9]">
        <div>
          <p className="mono text-[9px] font-bold uppercase tracking-[.09em] text-[#c9e0d6]">{agent.platformLogo ? 'Plataforma' : 'Onde atua'}</p>
          {agent.platformLogo
            ? <div className="agent-card__platform-logo-slot"><img src={`${import.meta.env.BASE_URL}platforms/${agent.platformLogo}`} alt={`Marca da ${agent.platform}`} loading="lazy" className={`agent-card__platform-logo agent-card__platform-logo--${agent.kind}`} /></div>
            : <p className="display mt-1 text-base font-extrabold leading-tight text-[#f7f4e9]">{agent.platform}</p>}
        </div>
      </div>
    </div>
  </article>;
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const scrollToSection = () => {
      const target = document.getElementById(id);
      if (!target) return;
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
      root.style.scrollBehavior = previousBehavior;
    };
    const frame = requestAnimationFrame(scrollToSection);
    window.addEventListener('load', scrollToSection, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('load', scrollToSection);
    };
  }, []);

  return <div className="min-h-[100dvh] overflow-x-clip bg-[#f7f4e9]">
    <header className="sticky top-0 z-40 border-b border-[#d6e1d7] bg-[#f7f4e9]/95 backdrop-blur-lg">
      <div className="page-wrap flex h-[72px] items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-4 xl:flex xl:gap-6" aria-label="Navegação principal">
          {navItems.map(({ label, id }) => <a key={id} href={`#${id}`} data-testid={`link-nav-${id}`} className="whitespace-nowrap text-[13px] font-semibold hover:text-[#168367] xl:text-sm">{label}</a>)}
        </nav>
        <a href="#participacao" className="tap hidden shrink-0 items-center gap-2 rounded-full bg-[#123a3b] px-5 py-3 text-xs font-bold text-[#f7f4e9] hover:bg-[#245d57] sm:inline-flex"><ArrowRight className="h-4 w-4" />Entenda o projeto</a>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} className="rounded-xl border border-[#bdd5c8] p-2.5 xl:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
      {menuOpen && <nav className="page-wrap flex max-h-[calc(100dvh-72px)] flex-col gap-1 overflow-y-auto border-t border-[#d6e1d7] py-3 xl:hidden" aria-label="Navegação móvel">
        {navItems.map(({ label, id }) => <a key={id} href={`#${id}`} data-testid={`link-menu-${id}`} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-bold hover:bg-[#e6f0e7]">{label}</a>)}
      </nav>}
    </header>

    <main>
      <section id="inicio" className="hero-bg relative overflow-hidden text-[#f7f4e9]">
        <div className="hero-pattern pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_right,transparent,black)]" />
        <div className="page-wrap relative grid items-center gap-10 pb-10 pt-12 sm:pt-16 md:min-h-[690px] md:grid-cols-[1.08fr_.92fr] md:gap-8 md:py-16 lg:min-h-[730px] lg:gap-14">
          <div className="entrance relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#94ebcb]/35 bg-[#94ebcb]/10 px-4 py-2 text-[11px] font-bold text-[#aff3d7]"><span className="h-2 w-2 rounded-full bg-[#a6edcb]" /> BETTEX · SUA IA PARA MERCADOS DE RISCO</div>
            <h1 className="hero-title mt-7 max-w-[690px] text-[clamp(2rem,5vw,4.6rem)] font-extrabold">
              <span className="block whitespace-nowrap">A melhor aposta é</span>
              <span className="block whitespace-nowrap text-[#a4eacb]">um investimento.</span>
            </h1>
            <p className="mt-7 max-w-[550px] text-[17px] leading-[1.6] text-[#d7e9df] sm:text-lg">Em vez de colocar o dinheiro do mês em uma aposta, conheça a BETTEX: seja dono de uma IA que opera em diferentes mercados de risco com resultados diários.</p>
            <p className="mt-4 max-w-[550px] text-[17px] leading-[1.6] text-[#d7e9df] sm:text-lg">BETTEX é um token. Ao comprá-lo, você ativa sua participação e recebe uma parte dos lucros gerados pelos agentes autônomos de apostas e trading.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#participacao" data-testid="link-hero-participacao" className="tap inline-flex items-center gap-2 rounded-full bg-[#a4eacb] px-6 py-4 text-sm font-bold text-[#103739] hover:bg-[#c0f5dc]">Entenda como funciona <ArrowRight className="h-4 w-4" /></a><a href="#visao-investidor" data-testid="link-hero-demo" className="tap inline-flex items-center gap-2 rounded-full border border-[#a4eacb]/45 px-6 py-4 text-sm font-bold text-[#f7f4e9] hover:bg-white/10">Ver demonstração <ArrowDown className="h-4 w-4" /></a></div>
            <p className="mt-7 max-w-lg border-l-2 border-[#ffcb9b] pl-4 text-xs leading-5 text-[#c9e0d6]">Investir em mercados de risco pode gerar perdas. Lucro e valorização do token não são garantidos.</p>
          </div>
          <div className="entrance entrance-delay relative mx-auto w-full max-w-[510px]">
            <HeroBenefit />
          </div>
        </div>
      </section>

      <ProjectModelSection />
      <HumanStorySection />

       <TechnologySection>
         {agents.map((agent, index) => <div className="technology-section__agent-slot" key={agent.name}><AgentCard agent={agent} number={index + 1} /></div>)}
       </TechnologySection>
       <InvestorAppPreview />
       <WhitepaperSection />
        <RoadmapSection />

    </main>

    <SiteFooter />
  </div>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;