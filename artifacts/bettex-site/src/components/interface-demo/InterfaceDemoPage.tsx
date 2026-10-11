/** @jsxImportSource react */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useX } from '../demo/ui';
import { Rates } from '../demo/fin';
import { demoView, demoRedirect } from '../demo/demo-navigation';
import { DEMO_ANCHOR_EVENT, useHash } from '../demo/use-hash';
import { DemoWalletsCard } from '../demo/DemoWalletsCard';
import { AgentShowcase } from '../demo/AgentShowcase';
import { StakingCorridor } from '../demo/StakingCorridor';
import { CentralDemo } from './CentralDemo';
import { MockProfilePanel } from './MockProfilePanel';
import { MockHistoryPanel } from './MockHistoryPanel';
import { MockTreasuryPanel } from './MockTreasuryPanel';
import { openDemoNotice, visualDashboard } from './runtime';
import { MOCK_WALLET_ADDRESSES } from './mock-addresses';
import { PANEL_SECTIONS as HOME_BLOCKS, panelScrollOffset, visiblePanelSection, type PanelSection } from './panel-navigation';
import '../demo/demo.css';

const ANCHOR_TOP = { scrollMarginTop: 'calc(var(--site-header-h, 56px) + var(--panel-submenu-h, 56px) + 12px)' } as const;

function scrollToBlock(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = document.querySelector('[data-testid="app-header"]');
  const nav = document.querySelector('[data-testid="home-anchors"]');
  const offset = panelScrollOffset(header?.getBoundingClientRect().height ?? 56, nav?.getBoundingClientRect().height ?? 56);
  // Explicit coordinates avoid adding global scroll-padding to the target's scroll-margin.
  // Instant also avoids inheriting the institutional site's smooth scrolling.
  window.scrollTo({ top: Math.max(0, window.scrollY + el.getBoundingClientRect().top - offset), behavior: 'instant' });
}

function HomeAreas({ d }: { d: ReturnType<typeof visualDashboard> }) {
  const { x } = useX();
  const hash = useHash();
  const search = useSearch();
  const requested = hash.slice(1) || new URLSearchParams(search).get('section');
  const [active, setActive] = useState<PanelSection>(() => HOME_BLOCKS.find(id => id === requested) ?? 'wallets');
  const submenu = useRef<HTMLElement>(null);
  const last = useRef(typeof window === 'undefined' ? '' : window.location.hash);
  useEffect(() => {
    const nav = submenu.current;
    if (!nav) return;
    const root = document.documentElement;
    let frame = 0;
    const track = () => {
      frame = 0;
      const headerHeight = parseFloat(getComputedStyle(root).getPropertyValue('--site-header-h')) || 56;
      const offset = panelScrollOffset(headerHeight, nav.getBoundingClientRect().height);
      const sections = HOME_BLOCKS.flatMap(id => {
        const el = document.getElementById(id);
        return el ? [{ id, top: el.getBoundingClientRect().top }] : [];
      });
      setActive(visiblePanelSection(sections, offset));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(track); };
    const measure = () => {
      root.style.setProperty('--panel-submenu-h', `${Math.ceil(nav.getBoundingClientRect().height)}px`);
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    const header = document.querySelector('[data-testid="app-header"]');
    if (header) observer.observe(header);
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      root.style.removeProperty('--panel-submenu-h');
    };
  }, []);
  useEffect(() => {
    const nav = submenu.current;
    const chip = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !chip) return;
    const chipBounds = chip.getBoundingClientRect();
    const navBounds = nav.getBoundingClientRect();
    if (chipBounds.left < navBounds.left) nav.scrollLeft += chipBounds.left - navBounds.left;
    else if (chipBounds.right > navBounds.right) nav.scrollLeft += chipBounds.right - navBounds.right;
  }, [active]);
  useEffect(() => {
    // Bookmarks and in-page navigation share the same measured offset.
    const legacy = new URLSearchParams(window.location.search).get('section');
    const initial = window.location.hash.slice(1) || HOME_BLOCKS.find(id => id === legacy) || '';
    let frame = 0;
    let cancelled = false;
    const schedule = (id: string) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { if (!cancelled) scrollToBlock(id); });
    };
    if (initial) schedule(initial);
    const settle = () => { if (initial && !cancelled && window.location.hash.slice(1) === initial) schedule(initial); };
    void document.fonts.ready.then(settle);
    window.addEventListener('load', settle, { once: true });
    const onHash = () => {
      if (window.location.hash === last.current) return;
      last.current = window.location.hash; schedule(last.current.slice(1));
    };
    const onAnchor = (e: Event) => schedule(String((e as CustomEvent).detail));
    const types = ['pushState', 'popstate', 'hashchange'];
    types.forEach(t => window.addEventListener(t, onHash));
    window.addEventListener(DEMO_ANCHOR_EVENT, onAnchor);
    return () => { cancelled = true; cancelAnimationFrame(frame); window.removeEventListener('load', settle); types.forEach(t => window.removeEventListener(t, onHash)); window.removeEventListener(DEMO_ANCHOR_EVENT, onAnchor); };
  }, []);
  const items = [{ id: HOME_BLOCKS[0], label: x('Carteiras', 'Wallets', 'Carteras') }, { id: HOME_BLOCKS[1], label: x('Central da IA', 'AI Center', 'Central de IA') }, { id: HOME_BLOCKS[2], label: x('Participação', 'Participation', 'Participación') }];
  return <>
    <nav ref={submenu} aria-label={x('Atalhos do painel', 'Dashboard shortcuts', 'Atajos del panel')} className="panel-submenu" data-testid="home-anchors">
      {items.map(i => <a key={i.id} href={`#${i.id}`} onClick={event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const target = `#${i.id}`;
        if (window.location.hash !== target) window.history.pushState(window.history.state, '', `${window.location.pathname}${window.location.search}${target}`);
        last.current = target;
        setActive(i.id);
        scrollToBlock(i.id);
      }} aria-current={active === i.id ? 'location' : undefined} data-testid={`anchor-home-${i.id}`} className={`inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-xl border px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B] ${active === i.id ? 'border-[#0E7C6B] bg-[#0E7C6B] text-white' : 'border-[#E4DCCB] bg-[#FFFCF6] text-[#1B2A41] hover:bg-[#E9EEE5]'}`}>{i.label}</a>)}
    </nav>
    <section id="wallets" style={ANCHOR_TOP} aria-label={items[0].label} className="grid min-w-0 gap-4">
      <DemoWalletsCard d={d} addresses={MOCK_WALLET_ADDRESSES} onWallet={openDemoNotice} onExport={openDemoNotice} />
    </section>
    <section id="central" style={ANCHOR_TOP} aria-label={items[1].label} className="op-unified" data-testid="operation-area">
      <CentralDemo onAction={openDemoNotice} />
      <div id="participation" style={ANCHOR_TOP} aria-label={items[2].label} role="region" className="op-part grid min-w-0">
        <StakingCorridor d={d} />
      </div>
    </section>
    <AgentShowcase showOtherAgents={false} showDisclaimer={false} />
  </>;
}

export function InterfaceDemoPage() {
  const { x, loc } = useX();
  const [path, navigate] = useLocation();
  const search = useSearch();
  const hash = useHash();
  const view = demoView(path) ?? 'home';
  const [d] = useState(visualDashboard);
  useEffect(() => {
    // Preserve old Central bookmarks and migrate embedded Treasury bookmarks.
    const target = demoRedirect(path, loc, search, hash);
    if (target) navigate(target, { replace: true });
  }, [path, loc, search, hash, navigate]);
  return <Rates.Provider value={{ r: d.balances.brlPerUsdc, bu: d.balances.bettexUsdc }}>
    <main className="demo-root min-h-[calc(100dvh-var(--site-header-h))] pb-10" data-testid="interface-demo-page">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-3 pt-5 sm:px-5">
        {view === 'account' && <h1 className="sr-only">{x('Perfil', 'Profile', 'Perfil')}</h1>}
        {view === 'home' && <><h1 className="sr-only">{x('Dashboard', 'Dashboard', 'Dashboard')}</h1>
          <HomeAreas d={d} />
        </>}
        {view === 'wallet' && <MockHistoryPanel key={path} d={d} />}
        {view === 'treasury' && <MockTreasuryPanel d={d} />}
        {view === 'account' && <MockProfilePanel onAction={openDemoNotice} />}
      </div>
    </main>
  </Rates.Provider>;
}
