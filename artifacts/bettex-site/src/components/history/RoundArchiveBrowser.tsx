/** @jsxImportSource react */
import { useState } from 'react';
import type { DemoRoundArchivePage } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { useRoundFmt } from './RoundFacts';

const button = 'min-h-11 rounded-xl border border-[#D8CFBB] bg-[#FFFCF6] px-3 text-sm font-bold text-[#1B2A41] hover:border-[#0E7C6B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] disabled:opacity-40';

export function RoundArchiveBrowser({ data, loading, error, currentId, selectedId, page, onPage, onSelect, onRetry }: {
  data?: DemoRoundArchivePage; loading: boolean; error: boolean; currentId?: string;
  selectedId?: string; page: number; onPage: (page: number) => void;
  onSelect: (id: string) => void; onRetry: () => void;
}) {
  const { x } = useX(); const { dt } = useRoundFmt();
  const [date, setDate] = useState('');
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / 10));
  const actualPage = data?.page ?? page;
  return <div id="round-archive" className="grid min-w-0 scroll-mt-36 gap-3 rounded-xl border border-[#E4DCCB] bg-[#F8F5ED] p-3" data-testid="round-archive-browser">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-sm font-extrabold">{x('Arquivo de rodadas', 'Round archive', 'Archivo de rondas')}</h3>
      {currentId && <button type="button" onClick={() => onSelect(currentId)} className={`${button} ${selectedId === currentId ? '!border-[#0E7C6B] !bg-[#DDEBE4]' : ''}`} data-testid="archive-current-round">{x('Atual', 'Current', 'Actual')} · {currentId}</button>}
    </div>
    <form className="flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); if (date) onSelect(date); }}>
      <label className="grid min-w-0 flex-1 gap-1 text-xs font-bold text-[#5B6B85]">{x('Buscar por data da rodada', 'Find by round date', 'Buscar por fecha de ronda')}
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${button} w-full min-w-0 font-normal`} data-testid="archive-round-date" />
      </label>
      <button type="submit" disabled={!date} className={button} data-testid="archive-find-round">{x('Abrir', 'Open', 'Abrir')}</button>
    </form>
    {loading ? <p role="status" className="text-sm text-[#5B6B85]">{x('Carregando rodadas...', 'Loading rounds...', 'Cargando rondas...')}</p> :
      error ? <div role="alert" className="text-sm text-[#A12D2D]">{x('Não foi possível carregar o arquivo.', 'Could not load the archive.', 'No se pudo cargar el archivo.')} <button type="button" className={button} onClick={onRetry}>{x('Tentar novamente', 'Retry', 'Reintentar')}</button></div> :
      !data?.items.length ? <p role="status" className="text-sm text-[#5B6B85]">{x('Nenhuma rodada encerrada registrada.', 'No closed rounds recorded.', 'No hay rondas cerradas registradas.')}</p> :
      <ul className="grid gap-1" data-testid="round-archive-list">{data.items.map(r => <li key={r.id}>
        <button type="button" onClick={() => onSelect(r.id)} aria-pressed={selectedId === r.id} data-testid={`archive-round-${r.id}`} className={`flex min-h-11 w-full min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border p-2 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] ${selectedId === r.id ? 'border-[#0E7C6B] bg-[#DDEBE4]' : 'border-transparent bg-[#FFFCF6] hover:border-[#D8CFBB]'}`}>
          <span className="mono font-bold">{r.id}</span><span className="text-xs text-[#5B6B85]">{dt(r.endedAt)}</span>
        </button>
      </li>)}</ul>}
    <nav aria-label={x('Páginas do arquivo de rodadas', 'Round archive pages', 'Páginas del archivo de rondas')} className="flex flex-wrap items-center justify-between gap-2" data-testid="round-archive-pagination">
      <button type="button" className={button} disabled={loading || error || actualPage <= 1} onClick={() => onPage(actualPage - 1)} data-testid="archive-previous">{x('Anterior', 'Previous', 'Anterior')}</button>
      <span role="status" className="text-xs font-semibold text-[#5B6B85]">{data ? x(`Página ${actualPage} de ${pages} · ${data.total} rodadas`, `Page ${actualPage} of ${pages} · ${data.total} rounds`, `Página ${actualPage} de ${pages} · ${data.total} rondas`) : '—'}</span>
      <button type="button" className={button} disabled={loading || error || !data || actualPage >= pages} onClick={() => onPage(actualPage + 1)} data-testid="archive-next">{x('Próxima', 'Next', 'Siguiente')}</button>
    </nav>
  </div>;
}
