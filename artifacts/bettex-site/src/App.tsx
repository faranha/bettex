import { type ReactNode, useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ChartCandlestick, ChevronDown, Menu, Radar, Spade, Trophy, X, type LucideIcon } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { DocumentationPage } from '@/pages/documentation';
import { TechnologySection } from '@/components/technology/TechnologySection';
import { InvestorAppPreview } from '@/components/investor/InvestorAppPreview';
import { HeroBenefit } from '@/components/hero/HeroBenefit';
import { BettexMark } from '@/components/BettexMark';
import { MarketMark, type MarketKind } from '@/components/hero/MarketMark';
import '@/components/hero/MarketCard.css';
import { ProjectModelSection } from '@/components/ProjectModelSection';
import { HumanStorySection } from '@/components/HumanStorySection';
import { RoadmapSection } from '@/components/RoadmapSection';
import { chapters } from '@/components/WhitepaperChapters';

const queryClient = new QueryClient();
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');
const HOME_PATH = `${BASE_PATH}/`;
const DOCUMENTATION_PATH = `${BASE_PATH}/documentacao`;
const legacyChapterIds = new Set<string>(chapters.map(({ id }) => id));
const homeAnchor = (id: string) => `${HOME_PATH}#${id}`;
type Market = {
  name: string;
  kind: MarketKind;
  icon: LucideIcon;
  visual: string;
  area: string;
  intro: string;
  detail: string;
};

const markets: Market[] = [
  { name: 'Previsões', kind: 'predictions', icon: Radar, visual: 'símbolo de cenários ramificados', area: 'Previsões', intro: 'Mercados de previsão.', detail: 'Analisa probabilidades, cenários e preços em eventos futuros.' },
  { name: 'Ações e cripto', kind: 'trading', icon: ChartCandlestick, visual: 'símbolo de gráfico de negociação', area: 'Ações e cripto', intro: 'Negociação de ações e criptoativos.', detail: 'Compara tendências, liquidez e risco antes de negociar ativos financeiros.' },
  { name: 'Esportes', kind: 'sports', icon: Trophy, visual: 'símbolo de bola esportiva', area: 'Esportes', intro: 'Surebet automatizada.', detail: 'Compara cotações entre casas de apostas e automatiza a execução de apostas combinadas.' },
  { name: 'Cassinos', kind: 'casino', icon: Spade, visual: 'símbolo de naipe de espadas', area: 'Cassinos', intro: 'Exploração automatizada de bônus.', detail: 'Analisa as regras dos bônus e automatiza os métodos para aproveitar as ofertas disponíveis.' },
];

const navItems = [
  { label: 'Início', id: 'inicio' },
  { label: 'Token BETTEX', id: 'participacao' },
  { label: 'Por que BETTEX', id: 'historia' },
  { label: 'Como opera', id: 'tecnologia' },
  { label: 'Mercados', id: 'mercados' },
  { label: 'Aplicativo', id: 'visao-investidor' },
  { label: 'Roadmap', id: 'roadmap' },
] as const;

function Logo({ pale = false }: { pale?: boolean }) {
  return <a href={homeAnchor('inicio')} className={`inline-flex items-center gap-2.5 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#168367] ${pale ? 'text-[#f6f4e9]' : 'text-[#123a3b]'}`} aria-label="BETTEX, voltar ao início">
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${pale ? 'border-[#a4eacb]/35 bg-[#0b2c30]' : 'border-[#1e5551] bg-[#123a3b]'} shadow-[0_3px_10px_rgba(6,32,33,.12)]`}>
      <BettexMark className="block h-[30px] w-[30px]" />
    </span>
    <span className="display text-[25px] font-extrabold leading-none tracking-[-.075em]">BETTEX</span>
  </a>;
}

function SiteHeader({ documentation = false }: { documentation?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return <header className="sticky top-0 z-40 border-b border-[#d6e1d7] bg-[#f7f4e9]/95 backdrop-blur-lg">
    <div className="page-wrap flex h-[72px] items-center justify-between gap-4">
      <Logo />
      <nav className="hidden items-center gap-4 xl:flex" aria-label="Navegação principal">
        {navItems.map(({ label, id }) => <a key={id} href={homeAnchor(id)} data-testid={`link-nav-${id}`} className="whitespace-nowrap text-[13px] font-semibold hover:text-[#168367] xl:text-sm">{label}</a>)}
      </nav>
      <a href={documentation ? HOME_PATH : DOCUMENTATION_PATH} className="tap hidden shrink-0 items-center gap-2 rounded-full bg-[#123a3b] px-5 py-3 text-xs font-bold text-[#f7f4e9] hover:bg-[#245d57] sm:inline-flex">{documentation ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}{documentation ? 'Voltar à página principal' : 'Documentação'}</a>
      <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#bdd5c8] xl:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
    </div>
    {menuOpen && <nav className="page-wrap flex max-h-[calc(100dvh-72px)] flex-col gap-1 overflow-y-auto border-t border-[#d6e1d7] py-3 xl:hidden" aria-label="Navegação móvel">
      {navItems.map(({ label, id }) => <a key={id} href={homeAnchor(id)} data-testid={`link-menu-${id}`} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-2 py-2.5 text-[15px] font-bold hover:bg-[#e6f0e7]">{label}</a>)}
      <a href={documentation ? HOME_PATH : DOCUMENTATION_PATH} onClick={() => setMenuOpen(false)} className="tap mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#123a3b] px-5 py-3 text-xs font-bold text-[#f7f4e9] hover:bg-[#245d57] sm:hidden">{documentation ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}{documentation ? 'Voltar à página principal' : 'Documentação'}</a>
    </nav>}
  </header>;
}

function SiteFooter() {
  return <footer id="rodape" className="relative overflow-hidden bg-[#123a3b] text-[#e5f0e8]">
    <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-0 h-[440px] w-[440px] rounded-full border border-[#a4eacb]/10 sm:-right-12" />
    <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-[290px] w-[290px] rounded-full border border-[#a4eacb]/10 sm:right-6" />
    <div className="page-wrap relative">
      <div className="grid gap-8 border-b border-[#a4eacb]/20 py-10 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div>
          <span className="mono text-[10px] font-bold uppercase tracking-[.2em] text-[#a4eacb]">BETTEX</span>
          <h2 className="display mt-5 max-w-[760px] text-[clamp(2.25rem,4.3vw,4rem)] font-extrabold leading-[1.04] tracking-[-.065em] text-[#f7f4e9]"><span className="block">Deixe de ser um </span><span className="block">refém das apostas </span><span className="block text-[#a4eacb]">e se torne dono do jogo</span></h2>
        </div>
        <div className="lg:justify-self-end">
          <p className="max-w-[390px] text-sm leading-7 text-[#cadfd4]">Participe dos resultados da IA com o token BETTEX.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={homeAnchor('roadmap')} className="tap inline-flex items-center gap-2 rounded-full bg-[#a4eacb] px-5 py-3 text-sm font-bold text-[#123a3b] hover:bg-[#c0f5dc]">Ver o roadmap <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
            <a href={DOCUMENTATION_PATH} className="tap inline-flex items-center gap-2 rounded-full border border-[#a4eacb]/40 px-5 py-3 text-sm font-bold text-[#f7f4e9] hover:bg-white/10">Ler a documentação</a>
          </div>
        </div>
      </div>
      <div className="grid gap-10 border-b border-[#a4eacb]/20 py-11 md:grid-cols-[minmax(0,1.5fr)_1fr_1fr]">
        <div>
          <Logo pale />
           <p className="mt-5 max-w-[350px] text-sm leading-7 text-[#cadfd4]">O token do projeto de inteligência artificial BETTEX.</p>
        </div>
        <nav aria-label="Explorar o projeto">
          <h3 className="mono mb-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#a4eacb]">Explore</h3>
          <ul className="footer-links space-y-1 text-sm font-semibold">
            <li><a className="hover:text-[#a4eacb]" href={homeAnchor('participacao')}>Token BETTEX</a></li>
            <li><a className="hover:text-[#a4eacb]" href={homeAnchor('tecnologia')}>Como opera</a></li>
            <li><a className="hover:text-[#a4eacb]" href={homeAnchor('mercados')}>Mercados</a></li>
            <li><a className="hover:text-[#a4eacb]" href={homeAnchor('visao-investidor')}>Aplicativo</a></li>
          </ul>
        </nav>
        <nav aria-label="Links do projeto">
          <h3 className="mono mb-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#a4eacb]">O projeto</h3>
          <ul className="footer-links space-y-1 text-sm font-semibold">
            <li><a className="hover:text-[#a4eacb]" href={homeAnchor('historia')}>Por que BETTEX</a></li>
            <li><a className="hover:text-[#a4eacb]" href={homeAnchor('roadmap')}>Roadmap</a></li>
            <li><a className="hover:text-[#a4eacb]" href={DOCUMENTATION_PATH}>Documentação</a></li>
          </ul>
        </nav>
      </div>
      <div className="flex flex-col gap-4 py-6 text-xs leading-5 text-[#b5d1c3] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} BETTEX.</p>
        <a href={homeAnchor('inicio')} className="inline-flex min-h-11 w-fit items-center gap-2 font-bold text-[#a4eacb] hover:text-white">Voltar ao início <ChevronDown className="h-4 w-4 rotate-180" aria-hidden="true" /></a>
      </div>
    </div>
  </footer>;
}

function SitePage({ children, documentation = false }: { children: ReactNode; documentation?: boolean }) {
  return <div className={`min-h-[100dvh] ${documentation ? '' : 'overflow-x-clip'} bg-[#f7f4e9]`}>
    <SiteHeader documentation={documentation} />
    {children}
    <SiteFooter />
  </div>;
}

function MarketCard({ market, number }: { market: Market; number: number }) {
  return <article className={`market-card market-card--${market.kind} flex h-full flex-col overflow-hidden rounded-[18px] border border-[#123a3b]/15 bg-[#f5f6ef]`}>
    <div className="market-card__stage relative flex h-[190px] shrink-0 items-center justify-center overflow-hidden sm:h-[205px]">
      <div className="market-card__index absolute left-5 top-5 z-20 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em]"><market.icon className="h-4 w-4" aria-hidden="true" />0{number} / {market.area}</div>
      <span className="market-card__crosshair market-card__crosshair--tl" aria-hidden="true" />
      <span className="market-card__crosshair market-card__crosshair--br" aria-hidden="true" />
      <div className="market-card__composition relative z-10" role="img" aria-label={`Mercado de ${market.area}, ${market.visual}`}>
        <span className="market-card__ring market-card__ring--outer" aria-hidden="true" />
        <span className="market-card__ring market-card__ring--inner" aria-hidden="true" />
        <span className="market-card__chip market-card__chip--a" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="market-card__chip market-card__chip--b" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="market-card__tile" aria-hidden="true"><MarketMark kind={market.kind} className="market-card__mark" /></span>
      </div>
      <div className="market-card__stage-foot absolute bottom-3 left-5 right-5 z-20 flex justify-between border-t border-white/15 pt-2 text-[8px] font-bold uppercase tracking-[.16em]"><span>BETTEX / MERCADO</span><span>0{number} / 04</span></div>
    </div>
    <div className="flex flex-1 flex-col p-5 sm:p-6">
      <div className="min-h-[75px]"><h4 className="display text-[25px] font-extrabold leading-none tracking-[-.055em] text-[#123a3b]">{market.name}</h4><p className="display mt-2 text-base font-bold leading-5 text-[#294d4a]">{market.intro}</p></div>
      <p className="mono mt-4 text-[9px] font-bold uppercase tracking-[.12em] text-[#44776b]">Como a BETTEX atua</p>
      <p className="mt-2 min-h-[70px] text-[13px] leading-[1.55] text-[#455f5b]">{market.detail}</p>
    </div>
  </article>;
}

function Home() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    if (id === 'documentacao' || legacyChapterIds.has(id)) {
      window.location.replace(`${DOCUMENTATION_PATH}${id === 'documentacao' ? '' : `#${id}`}`);
      return;
    }
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

  return <SitePage>
    <main>
      <section id="inicio" className="hero-bg relative overflow-hidden text-[#f7f4e9]">
        <div className="hero-intro-stage relative">
        <div className="page-wrap relative grid items-center pb-2 pt-8 sm:pt-16 xl:min-h-[730px] xl:py-16">
          <div className="entrance relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#94ebcb]/35 bg-[#94ebcb]/10 px-4 py-2 text-[11px] font-bold text-[#aff3d7]"><span className="h-2 w-2 rounded-full bg-[#a6edcb]" /> AGENTE MULTIMERCADO</div>
            <h1 className="hero-title mt-7 max-w-[690px] text-[clamp(2.3rem,5.2vw,4.4rem)] font-extrabold">
              <span className="block">USE IA CONTRA</span>
              <span className="block text-[#a4eacb]">O SISTEMA.</span>
            </h1>
            <h2 className="mt-5 max-w-[550px] text-[clamp(1.3rem,2.3vw,1.7rem)] font-bold leading-[1.25] text-[#f7f4e9]">Seja o dono do jogo. Participe dos resultados da IA.</h2>
            <p className="mt-5 max-w-[520px] text-[17px] leading-[1.6] text-[#d7e9df] sm:text-lg">BETTEX é o token do nosso agente de inteligência artificial, que analisa e opera em esportes, previsões, cassinos, ações e cripto. Quem tem BETTEX participa dos resultados do projeto.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3"><a href="#participacao" data-testid="link-hero-participacao" className="tap inline-flex items-center gap-2 rounded-full bg-[#a4eacb] px-7 py-4 text-sm font-bold text-[#103739] hover:bg-[#c0f5dc]">Quero participar</a><a href="#visao-investidor" data-testid="link-hero-demo" className="tap inline-flex items-center gap-2 px-4 py-4 text-sm font-semibold text-[#d7e9df] underline-offset-4 hover:underline">Ver telas do app</a></div>
          </div>
        </div>
        <HeroBenefit />
        </div>
      </section>

      <ProjectModelSection />
      <HumanStorySection />

       <TechnologySection>
         {markets.map((market, index) => <div className="technology-section__agent-slot" key={market.name}><MarketCard market={market} number={index + 1} /></div>)}
       </TechnologySection>
       <InvestorAppPreview />
        <RoadmapSection />

    </main>
  </SitePage>;
}

function Documentation() {
  return <SitePage documentation><DocumentationPage /></SitePage>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={BASE_PATH}><RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/documentacao" component={Documentation} /><Route component={NotFound} /></Switch></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;