/** @jsxImportSource react */
import { useState, type ReactNode } from 'react';
import { CircleHelp, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useX } from './ui';

/** Separate help buttons never execute a wallet action. Popovers work on touch too. */
export function WalletHelp({ id, label, children, iconOnly = false, icon }: {
  id: string; label: string; children: ReactNode; iconOnly?: boolean; icon?: ReactNode;
}) {
  const { x } = useX();
  const [open, setOpen] = useState(false);
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <button type="button" data-testid={`wallet-help-${id}`} aria-label={x(`${label}: explicação`, `${label}: explanation`, `${label}: explicación`)}
        className={`inline-flex max-w-full items-center gap-1.5 rounded-lg text-left text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${iconOnly ? 'h-11 w-9 shrink-0 justify-center' : 'min-h-8 min-w-0 shrink'}`}>
        {!iconOnly && <span className="min-w-0 whitespace-normal break-words">{label}</span>}{icon ?? <CircleHelp className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />}
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" side="top" collisionPadding={12} onOpenAutoFocus={e => e.preventDefault()}
      className="max-h-[60dvh] w-[min(22rem,calc(100vw-24px))] max-w-[calc(100vw-24px)] overflow-y-auto border-[#D8CFBB] bg-[#FFFCF6] p-3 text-xs text-[#1B2A41] [overflow-wrap:anywhere]"
      data-testid={`wallet-help-content-${id}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="min-w-0 font-bold">{label}</p>
        <button type="button" onClick={() => setOpen(false)} data-testid={`wallet-help-close-${id}`} aria-label={x('Fechar explicação', 'Close explanation', 'Cerrar explicación')}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-[#F0E9DA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]"><X className="h-4 w-4" aria-hidden="true" /></button>
      </div>
      <div className="grid gap-2 leading-relaxed">{children}</div>
    </PopoverContent>
  </Popover>;
}
