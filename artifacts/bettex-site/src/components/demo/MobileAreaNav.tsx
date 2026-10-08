/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, Send, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useX } from '@/components/demo/ui';
import { demoLabel, demoPath, type DemoView } from '@/components/demo/demo-navigation';
import { TELEGRAM_COMMUNITY_URL } from '@/lib/community';

export const APP_AREAS: DemoView[] = ['home', 'central', 'wallet', 'treasury'];

/** Mobile-only hamburger in the system header, opening a side drawer. */
export function MobileAreaNav({ current, className = '' }: { current: DemoView; className?: string }) {
  const { x, loc } = useX();
  const [path] = useLocation();
  const [open, setOpen] = useState(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label={menu} data-testid="button-app-areas" className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] text-[#1B2A41] ${focus}`}><Menu className="h-5 w-5" aria-hidden="true" /></button>
      </DialogTrigger>
      <DialogContent data-testid="app-menu-drawer" className="left-0 top-0 flex h-[100dvh] max-h-[100dvh] w-[min(20rem,calc(100vw-2rem))] max-w-none translate-x-0 translate-y-0 flex-col gap-3 overflow-y-auto rounded-none rounded-r-2xl border-[#E4DCCB] bg-[#FBF8F0] p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-[#1B2A41] data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-left-full data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0 [&>button.absolute]:hidden">
        <div className="flex items-center justify-between gap-2"><DialogTitle className="text-base font-extrabold">{areas}</DialogTitle>
          <DialogClose aria-label={x('Fechar áreas', 'Close areas', 'Cerrar áreas')} data-testid="button-app-areas-close" className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-[#E9EEE5] ${focus}`}><X className="h-5 w-5" aria-hidden="true" /></DialogClose></div>
        <DialogDescription className="sr-only">{x('Escolha uma área do app.', 'Choose an app area.', 'Elige un área de la app.')}</DialogDescription>
        <nav aria-label={areas}><ul className="grid gap-1">{APP_AREAS.map(k => <li key={k}><Link href={demoPath(k, loc)} data-testid={`nav-mobile-${k}`} aria-current={current === k ? 'page' : undefined} onClick={() => { setOpen(false); window.scrollTo({ top: 0 }); }} className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-bold ${focus} ${current === k ? 'bg-[#E9EEE5] text-[#0A6657]' : 'text-[#1B2A41] hover:bg-[#F1EBDD]'}`}>{demoLabel(k, loc)}</Link></li>)}
          <li><a href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" data-testid="link-app-community-mobile" onClick={() => setOpen(false)} className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[#0A6657] hover:bg-[#F1EBDD] ${focus}`}><Send className="h-4 w-4" aria-hidden="true" />{x('Comunidade no Telegram', 'Community on Telegram', 'Comunidad en Telegram')}</a></li></ul></nav>
      </DialogContent>
    </Dialog>
  </div>;
}
