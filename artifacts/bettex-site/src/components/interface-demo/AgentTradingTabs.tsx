/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { useX } from '../demo/ui';

/** Only Crypto is available in the visual demo; the other agents are upcoming. */
export function AgentTradingTabs({ children, id }: { children: ReactNode; id: string }) {
  const { x } = useX();
  const tabs = [
    { key: 'crypto', label: x('Cripto', 'Crypto', 'Cripto') },
    { key: 'sports', label: x('Esportes', 'Sports', 'Deportes') },
    { key: 'predictions', label: x('Predictions', 'Predictions', 'Predicciones') },
    { key: 'casino', label: x('Cassino', 'Casino', 'Casino') },
  ];
  return <div className="grid min-w-0 gap-4" data-testid={id}>
    <div role="tablist" aria-label={x('Trading por agente', 'Trading by agent', 'Trading por agente')} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {tabs.map(({ key, label }) => <button key={key} type="button" role="tab"
        id={`${id}-tab-${key}`} data-testid={`${id}-tab-${key}`}
        aria-selected={key === 'crypto'} aria-controls={key === 'crypto' ? `${id}-panel-crypto` : undefined}
        disabled={key !== 'crypto'} aria-disabled={key !== 'crypto'}
        className={`flex min-h-12 min-w-0 flex-wrap items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-bold ${key === 'crypto' ? 'border-[#0E7C6B] bg-[#0E7C6B] text-white' : 'cursor-not-allowed border-[#E4DCCB] bg-[#F0E9DA] text-[#5B6B85]'}`}>
        {label}{key !== 'crypto' && <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px]">{x('Em breve', 'Coming soon', 'Próximamente')}</span>}
      </button>)}
    </div>
    <div role="tabpanel" id={`${id}-panel-crypto`} aria-labelledby={`${id}-tab-crypto`} className="grid min-w-0 gap-3">
      {children}
    </div>
  </div>;
}
