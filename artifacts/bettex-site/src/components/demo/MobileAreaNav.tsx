/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronDown, Send, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useX } from '@/components/demo/ui';
import { demoLabel, demoPath, type DemoView } from '@/components/demo/demo-navigation';
import { TELEGRAM_COMMUNITY_URL } from '@/lib/community';

export const APP_AREAS: DemoView[] = ['home', 'central', 'wallet', 'simulation', 'treasury', 'account'];

/** Mobile-only (<640px): one compact row with the current area and an Areas button; destinations show only while open. */
export function MobileAreaNav({ current, className = '' }: { current: DemoView; className?: string }) {
  const { x, loc } = useX();
  const [path] = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path, loc]);
  const areas = x('Áreas do app', 'App areas', 'Áreas de la app');
  const menu = x('Áreas', 'Areas', 'Áreas');
  const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
  return <div className={`mx-auto flex max-w-5xl items-center gap-2 px-3 sm:hidden ${className}`} data-testid="app-nav-mobile">
    <p className="min-w-0 flex-1 truncate border-l-4 border-[#0E7C6B] pl-2 text-sm font-bold text-[#0A6657]" data-testid="text-current-area">{demoLabel(current, loc)}</p>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label={areas} data-testid="button-app-areas" className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-[#E4DCCB] bg-[#FFFCF6] px-4 text-sm font-bold text-[#1B2A41] ${focus}`}>{menu}<ChevronDown className="h-4 w-4" aria-hidden="true" /></button>
      </DialogTrigger>
      <DialogContent className="top-0 max-h-[100dvh] w-full max-w-none translate-x-[-50%] translate-y-0 gap-2 overflow-y-auto rounded-b-2xl border-[#E4DCCB] bg-[#FBF8F0] p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-[#1B2A41] data-[state=closed]:slide-out-to-top-[10%] data-[state=open]:slide-in-from-top-[10%] [&>button.absolute]:hidden">
        <div className="flex items-center justify-between gap-2"><DialogTitle className="text-base font-extrabold">{areas}</DialogTitle>
          <DialogClose aria-label={x('Fechar áreas', 'Close areas', 'Cerrar áreas')} data-testid="button-app-areas-close" className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-[#E9EEE5] ${focus}`}><X className="h-5 w-5" aria-hidden="true" /></DialogClose></div>
        <DialogDescription className="sr-only">{x('Escolha uma área do app.', 'Choose an app area.', 'Elige un área de la app.')}</DialogDescription>
        <nav aria-label={areas}><ul className="grid gap-1">{APP_AREAS.map(k => <li key={k}><Link href={demoPath(k, loc)} data-testid={`nav-mobile-${k}`} aria-current={current === k ? 'page' : undefined} onClick={() => { setOpen(false); window.scrollTo({ top: 0 }); }} className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-bold ${focus} ${current === k ? 'bg-[#E9EEE5] text-[#0A6657]' : 'text-[#1B2A41] hover:bg-[#F1EBDD]'}`}>{demoLabel(k, loc)}</Link></li>)}
          <li><a href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" data-testid="link-app-community-mobile" onClick={() => setOpen(false)} className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-[#0A6657] hover:bg-[#F1EBDD] ${focus}`}><Send className="h-4 w-4" aria-hidden="true" />{x('Comunidade no Telegram', 'Community on Telegram', 'Comunidad en Telegram')}</a></li></ul></nav>
      </DialogContent>
    </Dialog>
  </div>;
}
