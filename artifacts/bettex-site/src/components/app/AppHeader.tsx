/** @jsxImportSource react */
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { BettexMark } from '@/components/BettexMark';
import { LanguageSelector } from '@/components/LanguageSelector';
import { MobileAreaNav, APP_AREAS } from '@/components/demo/MobileAreaNav';
import { useX } from '@/components/demo/ui';
import { demoLabel, demoPath, demoView, type DemoView } from '@/components/demo/demo-navigation';
import { localizedUrl } from '@/lib/i18n';
import { AppExchangeRates } from './AppExchangeRates';
import { AppProfileLink } from './AppProfileLink';
import './AppHeader.css';

export function AppHeader({ current, className = '' }: { current?: DemoView; className?: string }) {
  const { x, loc } = useX();
  const [path] = useLocation();
  const ref = useRef<HTMLElement>(null);
  const detected: DemoView = current ?? demoView(path) ?? 'home';
  const view: DemoView = detected === 'wallet' ? 'account' : detected;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty('--site-header-h', `${Math.ceil(el.getBoundingClientRect().height)}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => { ro.disconnect(); root.style.removeProperty('--site-header-h'); };
  }, []);

  const siteHref = localizedUrl(import.meta.env.BASE_URL, loc);
  return <header ref={ref} className={`app-header ${className}`} data-testid="app-header">
    <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:gap-4">
      <Link href={demoPath('home', loc)} aria-label={x('BETTEX, meu painel', 'BETTEX, my dashboard', 'BETTEX, mi panel')} data-testid="link-app-brand" className="flex min-w-0 shrink-0 items-center gap-2 rounded-lg">
        <BettexMark className="h-7 w-7" />
        <span className="hidden text-base font-extrabold tracking-wide text-[#1B2A41] min-[360px]:inline">BETTEX</span>
        <span className="hidden rounded-full border border-[#0E7C6B] bg-[#E9EEE5] px-2 py-0.5 text-[10px] font-extrabold tracking-widest text-[#0A6657] sm:inline">{x('ALFA', 'ALPHA', 'ALFA')}</span>
      </Link>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <AppProfileLink />
        <a href={siteHref} data-testid="link-back-to-website" className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-xs font-semibold text-[#5B6B85] hover:text-[#0A6657]">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">{x('Voltar ao site', 'Back to website', 'Volver al sitio')}</span>
          <span className="sr-only sm:hidden">{x('Voltar ao site', 'Back to website', 'Volver al sitio')}</span>
        </a>
        <LanguageSelector className="app-header__lang" />
      </div>
    </div>
    <div className="hidden border-t border-[#EFE8D8] sm:block">
      <nav aria-label={x('Áreas do app', 'App areas', 'Áreas de la app')} className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-3 py-1" data-testid="app-nav-desktop">
        {APP_AREAS.map(k => <Link key={k} href={demoPath(k, loc)} data-testid={`nav-${k}`} aria-current={view === k ? 'page' : undefined}
          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
          className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 text-[13px] font-bold ${view === k ? 'bg-[#E9EEE5] text-[#0A6657] shadow-[inset_0_-2px_0_#0E7C6B]' : 'text-[#44546E] hover:bg-[#F1EBDD] hover:text-[#1B2A41]'}`}>{demoLabel(k, loc)}</Link>)}
        <AppExchangeRates className="ml-auto py-1" />
      </nav>
    </div>
    <div className="border-t border-[#EFE8D8] py-1.5 sm:hidden"><MobileAreaNav current={view} /></div>
    <div className="border-t border-[#EFE8D8] px-3 py-1.5 sm:hidden"><AppExchangeRates /></div>
  </header>;
}

export default AppHeader;
