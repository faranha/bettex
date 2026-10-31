/** @jsxImportSource react */
import { useState } from 'react';
import { Link } from 'wouter';
import { RefreshCw } from 'lucide-react';
import { useGetAlphaTrading, getGetAlphaTradingQueryKey, type GetAlphaTradingParams } from '@workspace/api-client-react';
import { useFmt } from './format';
import { PositionCard, OrderCard } from './Records';
import { Journey } from './Journey';
import { demoHref } from '@/components/demo/demo-navigation';

const POSITIONS: GetAlphaTradingParams = { view: 'positions', limit: 3 };
const ORDERS: GetAlphaTradingParams = { view: 'orders', limit: 3 };

/** Stored agent paper records, never synthetic positions derived from market prices. */
export function TradingOverview() {
  const { x, loc } = useFmt();
  const [journey, setJourney] = useState<string | null>(null);
  const positions = useGetAlphaTrading(POSITIONS, { query: { queryKey: getGetAlphaTradingQueryKey(POSITIONS), refetchInterval: 15000, retry: 1 } });
  const orders = useGetAlphaTrading(ORDERS, { query: { queryKey: getGetAlphaTradingQueryKey(ORDERS), refetchInterval: 15000, retry: 1 } });
  return <section className="dcard grid gap-4 p-4 sm:p-5" data-testid="dashboard-agent-trading">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="display text-lg font-extrabold">{x('Negociações dos agentes', 'Agent trading', 'Operaciones de los agentes')}</h2>
      <Link href={demoHref('central', loc)} className="inline-flex min-h-11 items-center rounded-xl border border-[#0E7C6B] px-3 text-sm font-bold text-[#0A6657]">{x('Abrir Central da IA', 'Open AI Center', 'Abrir Central de IA')}</Link>
    </div>
    <p className="text-xs text-[#5B6B85]">{x('Posições e ordens registradas da carteira dos agentes.', 'Recorded positions and orders in the agents’ portfolio.', 'Posiciones y órdenes registradas de la cartera de los agentes.')}</p>
    <div className="grid gap-5">
      <div data-testid="dashboard-open-positions">
        <h3 className="font-bold">{x('Posições abertas dos agentes', 'Agents’ open positions', 'Posiciones abiertas de los agentes')}{positions.data && <span className="ml-2 text-[#0A6657]">{positions.data.page.total}</span>}</h3>
        {positions.isError && <div role="alert" className="mt-2 text-sm text-[#8E2A1D]"><p>{x('Não foi possível atualizar as posições. Dados anteriores podem estar desatualizados.', 'Could not refresh positions. Previous data may be out of date.', 'No se pudieron actualizar las posiciones. Los datos anteriores pueden estar desactualizados.')}</p><button type="button" onClick={() => void positions.refetch()} className="inline-flex min-h-11 items-center gap-2 font-bold"><RefreshCw size={16} />{x('Tentar novamente', 'Retry', 'Reintentar')}</button></div>}
        {positions.isLoading && !positions.data && <p aria-busy="true" className="mt-2 text-sm">{x('Carregando posições…', 'Loading positions…', 'Cargando posiciones…')}</p>}
        {positions.data && (positions.data.positions.length
          ? <ul className="mt-3 grid gap-3">{positions.data.positions.map(p => <PositionCard key={p.id} p={p} onJourney={setJourney} />)}</ul>
          : <p className="mt-2 rounded-xl border border-dashed border-[#E4DCCB] p-4 text-sm text-[#5B6B85]">{x('Nenhuma posição aberta registrada.', 'No open positions recorded.', 'No hay posiciones abiertas registradas.')}</p>)}
        {positions.data?.page.hasMore && <p className="mt-2 text-xs text-[#5B6B85]">{x('As 3 mais recentes. Consulte todas na Central da IA.', 'Showing the 3 latest. View all in AI Center.', 'Las 3 más recientes. Consulta todas en la Central de IA.')}</p>}
      </div>
      <div data-testid="dashboard-agent-orders">
        <h3 className="font-bold">{x('Ordens recentes dos agentes', 'Recent agent orders', 'Órdenes recientes de los agentes')}{orders.data && <span className="ml-2 text-[#0A6657]">{orders.data.page.total}</span>}</h3>
        {orders.isError && <div role="alert" className="mt-2 text-sm text-[#8E2A1D]"><p>{x('Não foi possível atualizar as ordens. Dados anteriores podem estar desatualizados.', 'Could not refresh orders. Previous data may be out of date.', 'No se pudieron actualizar las órdenes. Los datos anteriores pueden estar desactualizados.')}</p><button type="button" onClick={() => void orders.refetch()} className="inline-flex min-h-11 items-center gap-2 font-bold"><RefreshCw size={16} />{x('Tentar novamente', 'Retry', 'Reintentar')}</button></div>}
        {orders.isLoading && !orders.data && <p aria-busy="true" className="mt-2 text-sm">{x('Carregando ordens…', 'Loading orders…', 'Cargando órdenes…')}</p>}
        {orders.data && (orders.data.orders.length
          ? <ul className="mt-3 grid gap-3">{orders.data.orders.map(o => <OrderCard key={o.id} o={o} onJourney={setJourney} />)}</ul>
          : <p className="mt-2 rounded-xl border border-dashed border-[#E4DCCB] p-4 text-sm text-[#5B6B85]">{x('Nenhuma ordem registrada.', 'No orders recorded.', 'No hay órdenes registradas.')}</p>)}
        {orders.data?.page.hasMore && <p className="mt-2 text-xs text-[#5B6B85]">{x('As 3 mais recentes. Consulte todas na Central da IA.', 'Showing the 3 latest. View all in AI Center.', 'Las 3 más recientes. Consulta todas en la Central de IA.')}</p>}
      </div>
    </div>
    {journey && <Journey key={journey} id={journey} onClose={() => setJourney(null)} />}
  </section>;
}
