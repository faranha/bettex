import { type ReactNode, type CSSProperties, useEffect, useRef, useState } from 'react';
import { PageMetadata } from '@/components/PageMetadata';
import { InterfaceDemoPage } from '@/components/interface-demo/InterfaceDemoPage';
import { InterfaceDemoProvider } from '@/components/interface-demo/InterfaceDemoProvider';
import { DemoActionNotice } from '@/components/interface-demo/DemoActionNotice';
import { installVisualDemoTransport } from '@/components/interface-demo/runtime';
installVisualDemoTransport();
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLocale, localizedUrl, t } from '@/lib/i18n';
import { ArrowDown, ArrowRight, Menu, X } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { DocumentationPage } from '@/pages/documentation';
import { PitchPage } from '@/pages/pitch';
import { DemoPage } from '@/pages/demo';
import { HeroBenefit } from '@/components/hero/HeroBenefit';
import { HeroAnimatedBackground } from '@/components/hero/HeroAnimatedBackground';
import { BettexMark } from '@/components/BettexMark';
import '@/components/SiteFooter.css';
import '@/pages/pitch.css';
import { ProjectModelSection } from '@/components/ProjectModelSection';
import { HomeEarningsSection } from '@/components/HomeRevisionSections';
import { RoadmapSection } from '@/components/RoadmapSection';
import { DemoAppLink } from '@/components/DemoAppLink';
import { legacyDocumentationHashes } from '@/lib/documentation-aliases';
import { FloatingCommunityCTA, TelegramIcon } from '@/components/CommunityCTA';
import { TELEGRAM_COMMUNITY_URL, X_COMMUNITY_URL } from '@/lib/community';
import { TechnologyNetworks } from '@/components/technology/TechnologyNetworks';
import { PitchSectionNav } from '@/components/pitch/PitchSectionNav';
import { HomeSectionNav } from '@/components/HomeSectionNav';
import { AppHeader } from '@/components/app/AppHeader';
import { AppSessionGate } from '@/components/app/AppSessionGate';
import { demoView, isRemovedSimulationPath } from '@/components/demo/demo-navigation';

const queryClient = new QueryClient();
import { AccountAuthProvider } from '@/components/account/AuthProvider';
import { SignInPage, SignUpPage } from '@/pages/auth';

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');
const HOME_PATH = `${BASE_PATH}/`;
const DOCUMENTATION_PATH = `${BASE_PATH}/documentacao`;
const mainLinks = [{ label: 'Página Inicial', href: '/' }, { label: 'Pitch', href: '/pitch' }, { label: 'Documentação', href: '/documentacao' }, { label: 'ABRIR DEMO', href: '/app' }] as const;
const legacyChapterIds = legacyDocumentationHashes;
const homeAnchor = (id: string) => `${HOME_PATH}#${id}`;
function usePageLinkProps() {
  // Internal site navigation always stays in the current tab.
  return {};
}

function Logo() {
  const linkProps = usePageLinkProps();
  return <div className="inline-flex items-center gap-2.5 max-[359px]:gap-1.5">
    <a {...linkProps} href={homeAnchor('inicio')} className="inline-flex items-center gap-2.5 max-[359px]:gap-1.5 rounded-xl text-[#F4F1E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#AAC3EE]" aria-label="BETTEX, voltar ao início">
    <span className="grid h-9 w-9 max-[359px]:h-7 max-[359px]:w-7 shrink-0 place-items-center rounded-lg border border-[#768BB5]/30 bg-[#0D1530] shadow-[0_3px_10px_rgba(0,9,33,.12)]">
      <BettexMark slate className="block h-[26px] w-[26px] max-[359px]:h-[22px] max-[359px]:w-[22px]" />
    </span>
    <span className="display text-[22px] max-[359px]:text-[18px] font-extrabold leading-none tracking-[-.075em]">BETTEX</span>
    </a>
    <DemoAppLink data-i18n="raw" data-testid="brand-alpha-badge" aria-label={t('Abrir aplicativo')} className="inline-flex min-h-11 shrink-0 items-center text-[#F2B632]"><span className="mono rounded border border-[#F2B632]/60 bg-[#F2B632]/10 px-1.5 py-1 text-[9px] font-bold leading-none tracking-[.12em]">ALFA</span></DemoAppLink>
  </div>;
}

function MainLinks({ className, onNavigate, uniform = false }: { className: string; onNavigate?: () => void; uniform?: boolean }) {
  const [location] = useLocation();
  const linkProps = usePageLinkProps();
  return <>{mainLinks.map(({ label, href }) => {
    const active = location === href || (href === '/documentacao' && ['/documentation', '/documentacion'].includes(location));
    const appLink = href === '/app';
    return <a key={href} {...linkProps} href={`${BASE_PATH}${href}`} onClick={onNavigate} aria-current={active ? 'page' : undefined} data-testid={`link-main-${label.toLowerCase()}`} className={`site-page-link ${appLink ? 'site-page-link--app' : uniform ? 'site-page-link--tile' : 'site-page-link--tab'} ${className}`}>{appLink && /^\/(documentacao|documentation|documentacion)\/?$/.test(location) ? t('ABRIR APP') : label}{appLink && <ArrowRight size={16} aria-hidden="true" />}</a>;
  })}</>;
}

function SiteHeader() {
  useLocale();
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const header = headerRef.current;
    const primaryRow = header?.firstElementChild;
    if (!header || !primaryRow) return;
    const measure = () => {
      const style = getComputedStyle(header);
      const height = primaryRow.getBoundingClientRect().height
        + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      document.documentElement.style.setProperty('--site-header-h', `${height}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(primaryRow);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('bettex:close-public-menu', close);
    return () => window.removeEventListener('bettex:close-public-menu', close);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  useEffect(() => {
    if (!menuOpen) return;
    const dismissOutside = (event: PointerEvent) => {
      // The language dropdown is portalled to body, but belongs to this menu.
      if (event.target instanceof Element && event.target.closest('[data-testid="language-options"]')) return;
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const dismissEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      headerRef.current?.querySelector<HTMLButtonElement>('[data-testid="public-menu-toggle"]')?.focus();
    };
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('keydown', dismissEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('keydown', dismissEscape);
    };
  }, [menuOpen]);

  return <header ref={headerRef} className="site-header sticky top-0 z-40 border-b border-[#2B59FF]/30 bg-[#070B1F]/95 text-[#F4F1E8] backdrop-blur-lg">
    <div className="page-wrap flex h-14 items-center justify-between gap-3 max-[399px]:gap-2">
      <Logo />
      <nav className="site-main-nav ml-auto hidden xl:flex" aria-label="Navegação principal">
        <MainLinks className="" />
      </nav>
      <div className="hidden xl:flex"><LanguageSelector /></div>
      <a href={localizedUrl(`${BASE_PATH}/app`)} data-testid="launch-app-mobile" className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-[#F2B632] bg-[#F2B632] px-3 max-[399px]:px-2 text-[11px] font-extrabold text-[#070B1F] hover:bg-[#FFD16A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AAC3EE] xl:hidden">{t(/^\/(documentacao|documentation|documentacion)\/?$/.test(location) ? 'ABRIR APP' : 'ABRIR DEMO')}<ArrowRight size={14} aria-hidden="true" className="max-[399px]:hidden" /></a>
      <button type="button" data-testid="public-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#2B59FF]/60 xl:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
    </div>
    <div inert={menuOpen}>
      {/\/pitch\/?$/.test(location) && <PitchSectionNav onNavigate={() => setMenuOpen(false)} menuOpen={menuOpen} />}
      {location.replace(/\/$/, '') === '' && <HomeSectionNav onNavigate={() => setMenuOpen(false)} menuOpen={menuOpen} />}
      {/^\/(documentacao|documentation|documentacion)\/?$/.test(location) && <div id="documentation-mobile-slot" className="documentation-mobile-slot" />}
    </div>
    {menuOpen && <nav data-testid="public-mobile-menu" className="page-wrap absolute inset-x-0 top-[var(--site-header-h,57px)] z-20 mx-auto flex max-h-[calc(100dvh-var(--site-header-h,57px))] flex-col gap-1 overflow-y-auto rounded-b-lg border border-[#2B59FF]/30 bg-[#070B1F] pb-3 shadow-xl xl:hidden" aria-label="Navegação móvel">
      <div className="grid gap-2 pt-3 sm:grid-cols-3">
        <MainLinks uniform onNavigate={() => setMenuOpen(false)} className="" />
      </div>
      <div className="mt-2 flex min-h-14 items-center justify-between gap-3 border-t border-[#2B59FF]/30 px-2 pt-3">
        <span className="text-[15px] font-bold">Selecionar idioma</span>
        <LanguageSelector />
      </div>
    </nav>}
  </header>;
}

function SiteFooter() {
  const linkProps = usePageLinkProps();
  return <footer id="rodape" className="site-footer relative overflow-hidden bg-[#070B1F] text-[#e1e7f4]">
    <div className="site-footer__cta site-footer__cta--home relative overflow-hidden bg-[#2B59FF]">
      <div aria-hidden="true" className="site-footer__sports">
        <img
          src={`${import.meta.env.BASE_URL}footer-rio-scene-hd.webp`}
          srcSet={`${import.meta.env.BASE_URL}footer-rio-scene-sharp.webp 1024w, ${import.meta.env.BASE_URL}footer-rio-scene-hd.webp 2048w`}
          sizes="(max-width: 1023px) 100vw, 1000px"
          width={2048}
          height={2048}
          alt=""
          loading="lazy"
          decoding="async"
          className="site-footer__sports-photo"
        />
      </div>
      <div className="page-wrap relative">
        <div className="grid items-end gap-6 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)] lg:gap-10">
          <div className="pb-2 lg:pb-20">
            <span className="mono text-[10px] font-bold uppercase tracking-[.2em] text-[#F4F1E8]">BETTEX</span>
            <h2 className="display mt-5 max-w-[760px] text-[clamp(2.25rem,4.3vw,4rem)] font-extrabold leading-[1.04] tracking-[-.065em] text-[#F4F1E8]"><span className="block">{t('Comece a ganhar.')}</span><span className="block text-[#F2B632]">{t('Invista com inteligência.')}</span></h2>
            <p className="mt-6 max-w-[420px] text-base font-medium leading-7 text-[#F4F1E8]">{t('O agente IA da BETTEX opera em cripto. Você recebe em reais, sem precisar saber operar.')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a {...linkProps} href={DOCUMENTATION_PATH} className="tap inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-[#F4F1E8]/70 px-6 py-3.5 text-sm font-bold text-[#F4F1E8] hover:bg-[#F4F1E8] hover:text-[#070B1F] focus-visible:outline-[#F2B632]">Ler a documentação</a>
              <a href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" data-community-source="footer" data-testid="link-community-footer" className="tap inline-flex min-h-12 items-center gap-2 rounded-full bg-[#F4F1E8] px-6 py-3.5 text-sm font-bold text-[#070B1F] hover:bg-white focus-visible:outline-[#F2B632]"><TelegramIcon className="h-5 w-5" />Vem pra comunidade</a>
            </div>
          </div>
          <div className="relative z-10 mx-auto w-full max-w-[400px] self-end lg:max-w-[540px] lg:justify-self-end">
            <div className="h-[260px] lg:h-[420px]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
    <div className="h-1 bg-[#F2B632]" aria-hidden="true" />
    <div className="page-wrap relative">
      <div className="sf-nav">
        <div className="sf-brand">
          <Logo />
          <p className="sf-tag mono">PROJETO DEFI DE TRADING COM IA</p>
          <div className="sf-actions">
            <LanguageSelector className="sf-lang" showLabel />
            <a href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" className="sf-community" data-community-source="footer" data-testid="link-community-footer-nav"><TelegramIcon className="sf-community__icon" /><span>Entre na comunidade</span></a>
          </div>
          <a href={X_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" data-testid="link-community-x-footer" className="inline-flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-[#e1e7f4] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4F1E8]">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="sf-community__icon" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.153h7.594l5.243 6.932 6.064-6.932ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" /></svg>
            <span>Siga a Bettex no X</span>
          </a>
        </div>
        <nav aria-label="Links do projeto" className="sf-group sf-pages" data-testid="footer-page-navigation">
          <h3 className="mono">Explore</h3>
          <ul>
            <li><a {...linkProps} href={HOME_PATH}>Página inicial</a></li>
            <li><a {...linkProps} href={`${BASE_PATH}/pitch`}>Pitch</a></li>
            <li><a {...linkProps} href={DOCUMENTATION_PATH}>Documentação</a></li>
            <li><a {...linkProps} href={`${BASE_PATH}/app`}>Demo</a></li>
          </ul>
        </nav>
      </div>
      <div className="sf-bottom">
        <p>© {new Date().getFullYear()} BETTEX.</p>
      </div>
    </div>
  </footer>;
}

function SitePage({ children, documentation = false }: { children: ReactNode; documentation?: boolean }) {
  return <div style={{ '--pitch-label-1': JSON.stringify(t('Movimentação')), '--pitch-label-2': JSON.stringify(t('Tarifa')), '--pitch-label-3': JSON.stringify(t('Resultado')) } as CSSProperties} className={`min-h-[100dvh] ${documentation ? '' : 'overflow-x-clip'} bg-[#F4F1E8]`}>
    <SiteHeader />
    {children}
    <SiteFooter />
  </div>;
}

function Home() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id === 'documentacao' || legacyChapterIds.has(id)) {
      window.location.replace(localizedUrl(`${DOCUMENTATION_PATH}${id === 'documentacao' ? '' : `#${id}`}`));
      return;
    }
    let cancelled = false;
    const scrollToSection = () => {
      if (cancelled) return;
      // Loading assets must not return a visitor to an earlier anchor.
      const target = document.getElementById(window.location.hash.slice(1));
      if (!target) return;
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
      root.style.scrollBehavior = previousBehavior;
    };
    const frame = requestAnimationFrame(scrollToSection);
    window.addEventListener('load', scrollToSection, { once: true });
    void document.fonts.ready.then(scrollToSection);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('load', scrollToSection);
    };
  }, []);

  return <SitePage>
    <main className="home-page">
      <section id="inicio" className="hero-bg relative overflow-hidden text-[#F4F1E8]">
        <div className="hero-intro-stage relative">
        <HeroAnimatedBackground />
        <div className="page-wrap relative grid items-center pb-2 pt-8 sm:pt-16 xl:min-h-[730px] xl:py-16">
          <div className="entrance relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5a8bfc]/35 bg-[#2B59FF]/15 px-4 py-2 text-[11px] font-bold text-[#F4F1E8]"><span className="h-2 w-2 rounded-full bg-[#36E0D0]" /> PROJETO DEFI · TRADING COM IA</div>
            <h1 className="hero-title mt-7 max-w-[690px] text-[clamp(2.3rem,5.2vw,4.4rem)] font-extrabold">
              <span className="block">Chega de apostar.</span>{' '}
              <span className="block text-[#F2B632]">Comece a investir.</span>
            </h1>
            <h2 className="mt-5 max-w-[550px] text-[clamp(1.3rem,2.3vw,1.7rem)] font-bold leading-[1.25] text-[#F4F1E8]">Nosso agente IA opera em cripto, você recebe no Pix.</h2>
            <p className="mt-4 max-w-[520px] text-[17px] font-bold leading-[1.5] text-[#F2B632] sm:text-lg">Ganhe até 1% por dia de lucro.</p>
            <a href="#participacao" data-testid="link-hero-projeto" className="tap mt-8 inline-flex min-h-[68px] w-full max-w-[320px] items-center justify-between gap-5 rounded-full border border-[#7390ff]/40 bg-[#2B59FF] py-3 pl-7 pr-3 text-lg font-bold text-white shadow-[0_10px_30px_rgba(43,89,255,0.25)] transition-colors hover:bg-[#1E44D6] focus-visible:outline-[#F2B632]">
              <span>Quero participar</span>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20" aria-hidden="true"><ArrowDown size={22} strokeWidth={2.2} /></span>
            </a>
          </div>
        </div>
        <HeroBenefit />
        </div>
      </section>

      <TechnologyNetworks label="Tecnologias" ethereum />
      <HomeEarningsSection />

      <ProjectModelSection />

      <RoadmapSection variant="home" />

    </main>
  </SitePage>;
}

function Pitch() {
  return <SitePage><PitchPage /></SitePage>;
}

function Demo() {
  const [path] = useLocation();
  if (isRemovedSimulationPath(path)) return <Redirect to={`/app${typeof window === 'undefined' ? '' : window.location.search}`} />;
  if (path === '/app/login') return <Redirect to="/sign-in" />;
  if (!demoView(path)) return <NotFound />;
  return <InterfaceDemoProvider><div className="min-h-[100dvh] min-w-0 overflow-x-clip bg-[#FBF8F0]" data-testid="app-shell"><AppHeader /><InterfaceDemoPage /><SiteFooter /></div></InterfaceDemoProvider>;
}

function Documentation() {
  return <SitePage documentation><DocumentationPage /></SitePage>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function HomeRoute() {
  return <Home />;
}

function SignInEntry() {
  const [, navigate] = useLocation();
  return <><main className="min-h-[100dvh] bg-[#FBF8F0]"><h1 className="sr-only">BETTEX</h1></main><DemoActionNotice open onOpenChange={open => { if (!open) navigate('/app'); }} /></>;
}

function SignUpEntry() {
  return <SignInEntry />;
}

function LegacyDemoRedirect() {
  const [path, navigate] = useLocation();
  useEffect(() => {
    if (isRemovedSimulationPath(path)) navigate('/app' + window.location.search, { replace: true });
    else if (demoView(path)) navigate(path.replace(/^\/demo/, '/app') + window.location.search + window.location.hash, { replace: true });
  }, [path, navigate]);
  return demoView(path) || isRemovedSimulationPath(path) ? null : <NotFound />;
}

/** The old account URL has no page: reload the canonical app route cleanly. */
function Redirect({ to }: { to: string }) {
  const language = useLocale();
  useEffect(() => {
    window.location.replace(`${BASE_PATH}${language === 'pt' ? '' : `/${language}`}${to}`);
  }, [language, to]);
  return null;
}

function App({ ssrPath }: { ssrPath?: string } = {}) {
  const language = useLocale();
  const base = `${BASE_PATH}${language === 'pt' ? '' : `/${language}`}`;
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={base} ssrPath={ssrPath}><AccountAuthProvider><PageMetadata /><RoutedErrorBoundary><Switch><Route path="/" component={HomeRoute} /><Route path="/pitch" component={Pitch} /><Route path="/testes/conta"><Redirect to="/app/minha-conta" /></Route><Route path="/app/*?" component={Demo} /><Route path="/demo/*?" component={LegacyDemoRedirect} /><Route path="/sign-in/*?" component={SignInEntry} /><Route path="/sign-up/*?" component={SignUpEntry} /><Route path="/documentacao" component={Documentation} /><Route path="/documentation" component={Documentation} /><Route path="/documentacion" component={Documentation} /><Route component={NotFound} /></Switch></RoutedErrorBoundary></AccountAuthProvider></WouterRouter><FloatingCommunityCTA /><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
