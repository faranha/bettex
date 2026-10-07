/** @jsxImportSource react */
import { useRef, useState, type KeyboardEvent } from 'react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { TreasuryActivity } from '../demo/TreasuryActivity';
import { BurnHistory } from '../demo/BurnHistory';
import { LotteryHistory } from '../demo/LotteryHistory';
import { RoundPositions } from './RoundPositions';

type Tab = 'positions' | 'history' | 'closed' | 'fees' | 'burn' | 'lottery';
type Win = { id: string; startedAt: string; endsAt: string } | null;

export function RoundTabs({ d, roundId, current, roundWindow: win }: { d: DemoDashboard; roundId: string; current: boolean; roundWindow: Win }) {
  const { x } = useX();
  const tabs: Tab[] = [...(current ? ['positions' as const] : []), 'history', 'closed', 'fees', 'burn', 'lottery'];
  const [tab, setTab] = useState<Tab>('history');
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const active = tabs.includes(tab) ? tab : 'history';
  const label: Record<Tab, string> = { positions: x('Posições atuais', 'Current positions', 'Posiciones actuales'), history: x('Histórico', 'History', 'Historial'), closed: x('Encerradas', 'Closed positions', 'Cerradas'), fees: x('Tarifas', 'Operator fees', 'Tarifas'), burn: x('Queima', 'Burn', 'Quema'), lottery: x('Loteria', 'Lottery', 'Lotería') };
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
    if (n < 0) return; e.preventDefault(); setTab(tabs[n]); refs.current[tabs[n]]?.focus();
  };
  const act = (view: 'history' | 'closed' | 'fees') => <>
    {!current && <p data-testid="round-archive-note" className="mb-2 rounded-xl bg-[#F5F1E8] p-3 text-xs text-[#5B6B85]">{x('O arquivo desta rodada contém apenas registros retidos. A contagem da foto não prova que registros individuais estejam disponíveis.', 'This round\'s archive consists only of retained records. The snapshot count does not prove individual records are available.', 'El archivo de esta ronda consta solo de registros retenidos. El conteo de la foto no prueba que haya registros individuales disponibles.')}</p>}
    <TreasuryActivity key={`${roundId}-${view}-${d.profile.accountId}`} d={d} roundId={roundId} view={view} archived={!current} /></>;
  return <div className="mt-3 min-w-0">
    <div role="tablist" aria-label={x('Detalhes da rodada', 'Round details', 'Detalles de la ronda')} className="flex gap-1 overflow-x-auto rounded-xl bg-[#F0E9DA] p-1">
      {tabs.map((t, i) => <button key={t} ref={el => { refs.current[t] = el; }} type="button" role="tab" id={`rh-tab-${t}`} data-testid={`round-tab-${t}`} aria-selected={active === t} aria-controls={`rh-panel-${t}`} tabIndex={active === t ? 0 : -1} onClick={() => setTab(t)} onKeyDown={e => onKey(e, i)} className={`min-h-11 shrink-0 rounded-lg px-3 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] ${active === t ? 'bg-[#FFFCF6] text-[#0A6657] shadow-sm' : 'text-[#5B6B85] hover:text-[#1B2A41]'}`}>{label[t]}</button>)}
    </div>
    <div role="tabpanel" id={`rh-panel-${active}`} aria-labelledby={`rh-tab-${active}`} tabIndex={0} className="mt-3">
      {active === 'positions' ? <RoundPositions d={d} /> : active === 'burn' ? <BurnHistory d={d} roundId={roundId} embedded />
        : active === 'lottery' ? (win ? <LotteryHistory d={d} round={win} embedded /> : <p className="rounded-xl bg-[#F5F1E8] p-3 text-sm font-semibold text-[#5B6B85]">{x('Não registrado: sem datas salvas desta rodada, os sorteios não podem ser associados.', 'Not recorded: without saved dates for this round, draws cannot be matched.', 'No registrado: sin fechas guardadas de esta ronda, los sorteos no pueden asociarse.')}</p>)
        : act(active)}
    </div>
  </div>;
}
