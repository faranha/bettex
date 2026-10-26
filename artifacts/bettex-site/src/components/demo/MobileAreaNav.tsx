/** @jsxImportSource react */
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { Menu, Send, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useX } from '@/components/demo/ui';
import { demoLabel, demoHref, type DemoView } from '@/components/demo/demo-navigation';
import { TELEGRAM_COMMUNITY_URL } from '@/lib/community';
import { localizedUrl } from '@/lib/i18n';
import { requestAnchor, useHash } from './use-hash';
import { PANEL_SECTIONS } from '../interface-demo/panel-navigation';

export const APP_AREAS: DemoView[] = ['home', 'treasury', 'wallet'];

/** Mobile-only hamburger in the system header, opening a side drawer. */
export function MobileAreaNav({ current, className = '' }: { current: DemoView; className?: string }) {
  const { x, loc } = useX();
  const [path] = useLocation();
  const search = useSearch();
  const hash = useHash();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const destination = useRef<string | null>(null);
  const panelItems = [
    x('Carteiras', 'Wallets', 'Carteras'),
    x('Central da IA', 'AI Center', 'Central de IA'),
    x('Participação', 'Participation', 'Participación'),
  ];
  const activeSection = (typeof document === 'undefined' ? undefined : document.querySelector('[data-testid="home-anchors"] [aria-current="location"]')?.getAttribute('href')?.slice(1)) || hash.slice(1) || 'wallets';
  const closeFor = (event: MouseEvent, target: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    destination.current = target;
    setOpen(false);
  };
  const isCurrent = (k: DemoView) => current === k;
  useEffect(() => { setOpen(false); }, [path, loc]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 640px)');
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  const areas = x('Áreas do app', 'App areas', 'Áreas de la app');
  const menu = x('Abrir menu', 'Open menu', 'Abrir menú');
  const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
  return <div className={`shrink-0 sm:hidden ${className}`} data-testid="app-nav-mobile">
    <Dialog open={open} onOpenChange={value => { if (value) destination.current = null; setOpen(value); }}>
      <DialogTrigger asChild>
        <button ref={trigger} type="button" aria-label={menu} data-testid="button-app-areas" className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] text-[#1B2A41] ${focus}`}><Menu className="h-5 w-5" aria-hidden="true" /></button>
      </DialogTrigger>
      <DialogContent data-testid="app-menu-drawer" style={{ left: 0, top: 0, transform: 'none' }} onCloseAutoFocus={event => {
        event.preventDefault();
        trigger.current?.focus({ preventScroll: true });
        const target = destination.current;
        destination.current = null;
        if (target) requestAnimationFrame(() => {
          if (target === 'top') window.scrollTo({ top: 0, behavior: 'instant' });
          else requestAnchor(target);
        });
      }} className="left-0 top-0 flex h-[100dvh] max-h-[100dvh] w-[min(20rem,calc(100vw-2rem))] max-w-none translate-x-0 translate-y-0 flex-col gap-3 overflow-y-auto rounded-none rounded-r-2xl border-[#E4DCCB] bg-[#FBF8F0] p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-[#1B2A41] data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0 [&>button.absolute]:hidden">
        <div className="flex items-center justify-between gap-2"><DialogTitle className="text-base font-extrabold">{areas}</DialogTitle>
          <DialogClose aria-label={x('Fechar áreas', 'Close areas', 'Cerrar áreas')} data-testid="button-app-areas-close" className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-[#E9EEE5] ${focus}`}><X className="h-5 w-5" aria-hidden="true" /></DialogClose></div>
        <DialogDescription className="sr-only">{x('Escolha uma área do app.', 'Choose an app area.', 'Elige un área de la app.')}</DialogDescription>
        <nav aria-label={areas}><ul className="grid gap-1">{APP_AREAS.map(k => <li key={k}><Link href={demoHref(k, loc)} data-testid={`nav-mobile-${k}`} aria-current={isCurrent(k) ? 'page' : undefined} onClick={event => closeFor(event, 'top')} className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-bold ${focus} ${isCurrent(k) ? 'bg-[#E9EEE5] text-[#0A6657]' : 'text-[#1B2A41] hover:bg-[#F1EBDD]'}`}>{demoLabel(k, loc)}</Link>
          {k === 'home' && <ul className="mb-2 ml-4 grid gap-0.5 border-l border-[#E4DCCB] pl-2" aria-label={x('Seções do Painel', 'Dashboard sections', 'Secciones del Panel')}>
            {PANEL_SECTIONS.map((id, index) => <li key={id}><Link href={`${demoHref('home', loc, search ? `?${search}` : '')}#${id}`} data-testid={`nav-mobile-${id}`} aria-current={current === 'home' && activeSection === id ? 'location' : undefined} onClick={event => closeFor(event, id)} className={`flex min-h-11 items-center rounded-xl px-3 text-sm ${focus} ${current === 'home' && activeSection === id ? 'bg-[#E9EEE5] font-bold text-[#0A6657]' : 'text-[#44546E] hover:bg-[#F1EBDD]'}`}>{panelItems[index]}</Link></li>)}
          </ul>}
        </li>)}
          <li><Link href={demoHref('account', loc)} data-testid="nav-mobile-account" aria-current={current === 'account' ? 'page' : undefined} onClick={event => closeFor(event, 'top')} className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-bold ${focus} ${current === 'account' ? 'bg-[#E9EEE5] text-[#0A6657]' : 'text-[#1B2A41] hover:bg-[#F1EBDD]'}`}>{demoLabel('account', loc)}</Link></li>
          <li className="mt-2 border-t border-[#E4DCCB] pt-2"><a href={localizedUrl('/')} data-testid="nav-mobile-website" onClick={() => setOpen(false)} className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-bold text-[#44546E] hover:bg-[#F1EBDD] ${focus}`}>{x('Voltar ao site', 'Back to website', 'Volver al sitio')}</a></li>
          <li><a href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" data-testid="link-app-community-mobile" onClick={() => setOpen(false)} className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[#0A6657] hover:bg-[#F1EBDD] ${focus}`}><Send className="h-4 w-4" aria-hidden="true" />{x('Comunidade no Telegram', 'Community on Telegram', 'Comunidad en Telegram')}</a></li></ul></nav>
      </DialogContent>
    </Dialog>
  </div>;
}
