import { type ReactNode, type CSSProperties, useEffect, useState } from 'react';
import { PageMetadata } from '@/components/PageMetadata';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLocale, localizedUrl, t } from '@/lib/i18n';
import { ArrowRight, ChartCandlestick, ChevronDown, Menu, Radar, Spade, Trophy, X, type LucideIcon } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { DocumentationPage } from '@/pages/documentation';
import { PitchPage } from '@/pages/pitch';
import { DemoPage } from '@/pages/demo';
import { TechnologySection } from '@/components/technology/TechnologySection';
import { MarketsFloorSection } from '@/components/robot-floor/MarketsFloorSection';
import { InvestorAppPreview } from '@/components/investor/InvestorAppPreview';
import { HeroBenefit } from '@/components/hero/HeroBenefit';
import { BettexMark } from '@/components/BettexMark';
import { MarketMark, type MarketKind } from '@/components/hero/MarketMark';
import '@/components/hero/MarketCard.css';
import '@/components/SiteFooter.css';
import '@/pages/pitch.css';
import { ProjectModelSection } from '@/components/ProjectModelSection';
import { NewEconomySection } from '@/components/NewEconomySection';
import { HumanStorySection } from '@/components/HumanStorySection';
import { RoadmapSection } from '@/components/RoadmapSection';
import { chapters } from '@/components/WhitepaperChapters';
import { FloatingCommunityCTA, TelegramIcon } from '@/components/CommunityCTA';
import { TELEGRAM_COMMUNITY_URL } from '@/lib/community';
import { TechnologyNetworks } from '@/components/technology/TechnologyNetworks';

const queryClient = new QueryClient();
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');
const HOME_PATH = `${BASE_PATH}/`;
const DOCUMENTATION_PATH = `${BASE_PATH}/documentacao`;
const mainLinks = [{ label: 'Pitch', href: '/pitch' }, { label: 'Documentação', href: '/documentacao' }, { label: 'Demo', href: '/demo' }] as const;
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

function Logo() {
  return <a href={homeAnchor('inicio')} className="inline-flex items-center gap-2.5 rounded-xl text-[#F4F1E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#AAC3EE]" aria-label="BETTEX, voltar ao início">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-[#768BB5]/30 bg-[#0D1530] shadow-[0_3px_10px_rgba(0,9,33,.12)]">
      <BettexMark slate className="block h-[30px] w-[30px]" />
    </span>
    <span className="display text-[25px] font-extrabold leading-none tracking-[-.075em]">BETTEX</span>
  </a>;
}

function MainLinks({ className, onNavigate, uniform = false }: { className: string; onNavigate?: () => void; uniform?: boolean }) {
  const [location] = useLocation();
  return <>{mainLinks.map(({ label, href }) => {
    const active = location === href || (href === '/documentacao' && ['/documentation', '/documentacion'].includes(location));
    return <a key={href} href={`${BASE_PATH}${href}`} onClick={onNavigate} aria-current={active ? 'page' : undefined} data-testid={`link-main-${label.toLowerCase()}`} className={`${className} ${uniform ? `bg-[#2B59FF] text-white hover:bg-[#1E44D6] ${active ? 'ring-1 ring-inset ring-white/60' : ''}` : active ? 'bg-[#26324D] text-[#E4EAF4] ring-1 ring-inset ring-[#7185AC]/35 hover:bg-[#303E5C]' : 'bg-[#2B59FF] text-white hover:bg-[#1E44D6]'}`}>{label}</a>;
  })}</>;
}

function SiteHeader() {
  useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  return <header className="site-header sticky top-0 z-40 border-b border-[#2B59FF]/30 bg-[#070B1F]/95 text-[#F4F1E8] backdrop-blur-lg">
    <div className="page-wrap flex h-[72px] items-center justify-between gap-3">
      <Logo />
      <nav className="hidden items-center gap-3 xl:ml-6 xl:flex" aria-label="Navegação principal">
        {navItems.map(({ label, id }) => <a key={id} href={homeAnchor(id)} data-testid={`link-nav-${id}`} className="whitespace-nowrap text-[13px] font-semibold hover:text-[#F2B632]"><span data-i18n="translated">{t(label)}</span></a>)}
      </nav>
      <div className="ml-auto hidden items-center gap-2 xl:flex" aria-label="Páginas do projeto"><MainLinks className="tap inline-flex min-h-10 items-center rounded-full px-4 text-xs font-bold" /></div>
      <div className="hidden xl:flex"><LanguageSelector /></div>
      <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#2B59FF]/60 max-sm:ml-auto xl:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
    </div>
    {menuOpen && <nav className="page-wrap flex max-h-[calc(100dvh-var(--site-header-h))] flex-col gap-1 overflow-y-auto border-t border-[#2B59FF]/30 py-3 xl:hidden" aria-label="Navegação móvel">
      {navItems.map(({ label, id }) => <a key={id} href={homeAnchor(id)} data-testid={`link-menu-${id}`} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-2 py-2.5 text-[15px] font-bold hover:bg-[#13204F]"><span data-i18n="translated">{t(label)}</span></a>)}
      <section className="mt-2 border-t border-[#2B59FF]/30 pt-3" aria-label="Páginas do projeto">
        <h2 className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-[#c5d2f1]">Páginas do projeto</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <MainLinks uniform onNavigate={() => setMenuOpen(false)} className="tap flex min-h-11 items-center justify-center rounded-lg px-3 py-2.5 text-[15px] font-bold" />
        </div>
      </section>
      <div className="mt-2 flex min-h-14 items-center justify-between gap-3 border-t border-[#2B59FF]/30 px-2 pt-3">
        <span className="text-[15px] font-bold">Selecionar idioma</span>
        <LanguageSelector />
      </div>
    </nav>}
  </header>;
}

function SiteFooter({ compact = false }: { compact?: boolean }) {
  return <footer id="rodape" className="site-footer relative overflow-hidden bg-[#070B1F] text-[#e1e7f4]">
    <div className={`site-footer__cta relative overflow-hidden bg-[#2B59FF] ${compact ? 'hidden' : ''}`}>
      <div aria-hidden="true" className="site-footer__tech">
        <svg className="site-footer__tech-svg" viewBox="0 0 800 560" preserveAspectRatio="xMaxYMax slice" focusable="false">
          <circle className="halo" cx="470" cy="330" r="190" />
          <circle className="halo" cx="470" cy="330" r="270" strokeDasharray="2 9" />
          <path className="trace" d="M0 110H150L190 70H330L370 110H520" />
          <path className="trace trace--soft" d="M40 200H210L250 240H360" />
          <path className="trace" d="M800 90H690L650 130H560V210" />
          <path className="trace trace--gold" d="M800 250H720L690 280V400" />
          <path className="trace trace--soft" d="M0 470H180L220 430H320" />
          <path className="trace" d="M800 500H640L600 460H520" />
          <path className="trace trace--soft" d="M300 0V40L340 80" />
          <path className="trace trace--soft" d="M620 0V60L660 100" />
          <circle className="node" cx="520" cy="110" r="5" />
          <circle className="node" cx="190" cy="70" r="4" />
          <circle className="node" cx="360" cy="240" r="4" />
          <circle className="node" cx="560" cy="210" r="5" />
          <circle className="node node--gold" cx="690" cy="400" r="6" />
          <circle className="node" cx="320" cy="430" r="4" />
          <circle className="node" cx="520" cy="460" r="5" />
          <circle className="node node--gold" cx="650" cy="130" r="4" />
          <circle className="node" cx="340" cy="80" r="3.5" />
        </svg>
      </div>
      <div className="page-wrap relative">
        <div className="grid items-end gap-6 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)] lg:gap-10">
          <div className="pb-2 lg:pb-20">
            <span className="mono text-[10px] font-bold uppercase tracking-[.2em] text-[#F4F1E8]">BETTEX</span>
            <h2 className="display mt-5 max-w-[760px] text-[clamp(2.25rem,4.3vw,4rem)] font-extrabold leading-[1.04] tracking-[-.065em] text-[#F4F1E8]"><span className="block">Deixe de ser um </span><span className="block">refém das apostas </span><span className="block text-[#F2B632]">e se torne dono do jogo</span></h2>
            <p className="mt-6 max-w-[390px] text-base font-medium leading-7 text-[#F4F1E8]">Participe dos resultados da IA com o token BETTEX.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={homeAnchor('roadmap')} className="tap inline-flex min-h-12 items-center gap-2 rounded-full bg-[#070B1F] px-6 py-3.5 text-sm font-bold text-[#F4F1E8] hover:bg-[#13204F] focus-visible:outline-[#F2B632]">Ver o roadmap <ArrowRight className="h-4 w-4 text-[#F2B632]" aria-hidden="true" /></a>
              <a href={DOCUMENTATION_PATH} className="tap inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-[#F4F1E8]/70 px-6 py-3.5 text-sm font-bold text-[#F4F1E8] hover:bg-[#F4F1E8] hover:text-[#070B1F] focus-visible:outline-[#F2B632]">Ler a documentação</a>
              <a href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" data-community-source="footer" data-testid="link-community-footer" className="tap inline-flex min-h-12 items-center gap-2 rounded-full bg-[#F4F1E8] px-6 py-3.5 text-sm font-bold text-[#070B1F] hover:bg-white focus-visible:outline-[#F2B632]"><TelegramIcon className="h-5 w-5" />Vem pra comunidade</a>
            </div>
          </div>
          <div className="relative z-10 mx-auto w-full max-w-[400px] self-end lg:max-w-[540px] lg:justify-self-end">
            <div aria-hidden="true" className="absolute inset-x-[8%] bottom-0 top-[18%] rounded-t-full bg-[#1E44D6]/60" />
            <img src={`${import.meta.env.BASE_URL}footer-community.webp`} width={900} height={858} alt="" aria-hidden="true" loading="lazy" decoding="async" className="relative block h-auto w-full drop-shadow-[0_14px_24px_rgba(7,11,31,.35)]" />
          </div>
        </div>
      </div>
    </div>
    <div className="h-1 bg-[#F2B632]" aria-hidden="true" />
    <div className="page-wrap relative">
      <div className="sf-nav">
        <div className="sf-brand">
          <Logo />
          <LanguageSelector className="sf-lang" />
          <p className="sf-tag mono">COMUNIDADE DE INVESTIMENTO COM IA</p>
        </div>
        <nav aria-label="Explorar o projeto" className="sf-group">
          <h3 className="mono">Explore</h3>
          <ul>
            <li><a href={homeAnchor('participacao')}>Token BETTEX</a></li>
            <li><a href={homeAnchor('tecnologia')}>Como opera</a></li>
            <li><a href={homeAnchor('mercados')}>Mercados</a></li>
            <li><a href={homeAnchor('visao-investidor')}>Aplicativo</a></li>
          </ul>
        </nav>
        <nav aria-label="Links do projeto" className="sf-group">
          <h3 className="mono">O projeto</h3>
          <ul>
            <li><a href={homeAnchor('historia')}>Por que BETTEX</a></li>
            <li><a href={homeAnchor('roadmap')}>Roadmap</a></li>
            <li><a href={`${BASE_PATH}/pitch`}>Pitch</a></li>
            <li><a href={DOCUMENTATION_PATH}>Documentação</a></li>
            <li><a href={`${BASE_PATH}/demo`}>Demo</a></li>
          </ul>
        </nav>
      </div>
      <div className="sf-bottom">
        <p>© {new Date().getFullYear()} BETTEX.</p>
        <a href={homeAnchor('inicio')}>Voltar ao início <ChevronDown className="h-4 w-4 rotate-180" aria-hidden="true" /></a>
      </div>
    </div>
  </footer>;
}

function SitePage({ children, documentation = false, compactFooter = false, floatingCta = false }: { children: ReactNode; documentation?: boolean; compactFooter?: boolean; floatingCta?: boolean }) {
  return <div style={{ '--pitch-label-1': JSON.stringify(t('Movimentação')), '--pitch-label-2': JSON.stringify(t('Tarifa')), '--pitch-label-3': JSON.stringify(t('Resultado')) } as CSSProperties} className={`min-h-[100dvh] ${documentation ? '' : 'overflow-x-clip'} bg-[#F4F1E8]`}>
    <SiteHeader />
    {children}
    <SiteFooter compact={compactFooter} />
    {floatingCta && <><div className="h-[calc(72px+env(safe-area-inset-bottom))] bg-[#070B1F] md:hidden" aria-hidden="true" /><FloatingCommunityCTA /></>}
  </div>;
}

function MarketCard({ market, number }: { market: Market; number: number }) {
  return <article className={`market-card market-card--${market.kind} flex h-full flex-col overflow-hidden rounded-[18px] border border-[#070B1F]/15 bg-[#F4F1E8]`}>
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
      <div className="min-h-[75px]"><h4 className="display text-[25px] font-extrabold leading-none tracking-[-.055em] text-[#070B1F]">{market.name}</h4><p className="display mt-2 text-base font-bold leading-5 text-[#122353]">{market.intro}</p></div>
      <p className="market-card__label mono mt-4 text-[9px] font-bold uppercase tracking-[.12em]">Como a BETTEX atua</p>
      <p className="mt-2 min-h-[70px] text-[13px] leading-[1.55] text-[#183173]">{market.detail}</p>
    </div>
  </article>;
}

function Home() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    if (id === 'documentacao' || legacyChapterIds.has(id)) {
      window.location.replace(localizedUrl(`${DOCUMENTATION_PATH}${id === 'documentacao' ? '' : `#${id}`}`));
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

  return <SitePage floatingCta>
    <main>
      <section id="inicio" className="hero-bg relative overflow-hidden text-[#F4F1E8]">
        <div className="hero-intro-stage relative">
        <div className="page-wrap relative grid items-center pb-2 pt-8 sm:pt-16 xl:min-h-[730px] xl:py-16">
          <div className="entrance relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5a8bfc]/35 bg-[#2B59FF]/15 px-4 py-2 text-[11px] font-bold text-[#F4F1E8]"><span className="h-2 w-2 rounded-full bg-[#36E0D0]" /> COMUNIDADE DE INVESTIMENTO COM IA</div>
            <h1 className="hero-title mt-7 max-w-[690px] text-[clamp(2.3rem,5.2vw,4.4rem)] font-extrabold">
              <span className="block">Chega de apostar.</span>{' '}
              <span className="block text-[#F2B632]">Comece a investir.</span>
            </h1>
            <h2 className="mt-5 max-w-[550px] text-[clamp(1.3rem,2.3vw,1.7rem)] font-bold leading-[1.25] text-[#F4F1E8]">Uma comunidade pra quem está cansado de só apostar e quer começar a ganhar.</h2>
            <p className="mt-5 max-w-[520px] text-[17px] leading-[1.6] text-[#c5d2f1] sm:text-lg">Na BETTEX, nossa IA analisa e opera em diferentes mercados. Com nosso token, você participa dos lucros do projeto.</p>
          </div>
        </div>
        <HeroBenefit />
        </div>
      </section>

      <TechnologyNetworks />
      <HumanStorySection />
      <NewEconomySection />

      <ProjectModelSection />

       <TechnologySection>
         {markets.map((market, index) => <div className="technology-section__agent-slot" key={market.name}><MarketCard market={market} number={index + 1} /></div>)}
       </TechnologySection>
       <InvestorAppPreview />
       <MarketsFloorSection />
        <RoadmapSection />

    </main>
  </SitePage>;
}

function Pitch() {
  return <SitePage compactFooter><PitchPage /></SitePage>;
}

function Demo() {
  return <SitePage compactFooter><DemoPage /></SitePage>;
}

function Documentation() {
  return <SitePage documentation><DocumentationPage /></SitePage>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App({ ssrPath }: { ssrPath?: string } = {}) {
  const language = useLocale();
  const base = `${BASE_PATH}${language === 'pt' ? '' : `/${language}`}`;
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={base} ssrPath={ssrPath}><PageMetadata /><RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/pitch" component={Pitch} /><Route path="/demo" component={Demo} /><Route path="/documentacao" component={Documentation} /><Route path="/documentation" component={Documentation} /><Route path="/documentacion" component={Documentation} /><Route component={NotFound} /></Switch></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
