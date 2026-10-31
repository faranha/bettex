/** @jsxImportSource react */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useX } from './ui';

const PairedDisclosure = createContext<{ expanded: boolean; toggle: () => void } | null>(null);

/** Pair disclosures on desktop; stacked mobile cards keep independent local state. */
export function WalletCardDetailsPair({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();
  return <PairedDisclosure.Provider value={isMobile ? null : { expanded, toggle: () => setExpanded(value => !value) }}>
    {children}
  </PairedDisclosure.Provider>;
}

/** Controlled native disclosure keeps forms mounted through live dashboard updates. */
export function WalletCardDetails({ id, label, dark = false, children }: {
  id: string; label: string; dark?: boolean; children: ReactNode;
}) {
  const { x } = useX();
  const pair = useContext(PairedDisclosure);
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = pair?.expanded ?? localExpanded;
  return <details open={expanded} className="group/wallet-details min-w-0" data-testid={`${id}-accordion`}>
    <summary aria-label={label} aria-expanded={expanded} aria-controls={`${id}-details`} data-testid={`button-${id}-details`}
      onClick={event => { event.preventDefault(); if (pair) pair.toggle(); else setLocalExpanded(value => !value); }}
      className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg border px-3 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden ${dark
        ? 'border-[#F4F1E8]/20 text-[#F4F1E8] hover:bg-white/5 focus-visible:outline-[#AAC3EE]'
        : 'border-[#0E7C6B]/25 text-[#0A6657] hover:bg-white/40 focus-visible:outline-[#0E7C6B]'}`}>
      <span>
        <span className="group-open/wallet-details:hidden">{x('Expandir detalhes', 'Expand details', 'Expandir detalles')}</span>
        <span className="hidden group-open/wallet-details:inline">{x('Recolher detalhes', 'Collapse details', 'Contraer detalles')}</span>
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open/wallet-details:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
    </summary>
    <div id={`${id}-details`} className="grid min-w-0 gap-3 pt-3" data-testid={`${id}-details`}>{children}</div>
  </details>;
}
