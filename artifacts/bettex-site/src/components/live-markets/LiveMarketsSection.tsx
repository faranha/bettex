/** @jsxImportSource react */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Line, LineChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, ArrowUpRight, ArrowDownRight, Minus, RefreshCw } from 'lucide-react';
import { useGetMarketLive, getGetMarketLiveQueryKey, useGetAgentCenter, getGetAgentCenterQueryKey, type MarketLiveAsset } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { localizedUrl } from '@/lib/i18n';
import './live-markets.css';

const SYMBOLS = ['BTC', 'ETH', 'SOL'] as const;
type Sym = (typeof SYMBOLS)[number];
type Dir = 'up' | 'down' | 'flat';
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function LiveMarketsSection() {
  const { x, loc } = useX();
  const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const [sel, setSel] = useState<Sym>('BTC');
  const [hover, setHover] = useState<number | null>(null);
  const [kb, setKb] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const q = useGetMarketLive({ query: { queryKey: getGetMarketLiveQueryKey(), refetchInterval: 15000, refetchIntervalInBackground: false, staleTime: 10000, retry: 1 } });
  const agentParams = { agentId: sel.toLowerCase() };
  const ag = useGetAgentCenter(agentParams, { query: { queryKey: getGetAgentCenterQueryKey(agentParams), refetchInterval: 30000, refetchIntervalInBackground: false, retry: 1 } });

  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 5000); return () => clearInterval(id); }, []);

  // Direction comes only from real differences between consecutive snapshots.
  const prev = useRef<{ at: string; prices: Partial<Record<Sym, number>> } | null>(null);
  const [dirs, setDirs] = useState<Partial<Record<Sym, Dir>>>({});
  const data = q.data;
  useEffect(() => {
    if (!data || prev.current?.at === data.generatedAt) return;
    const prices: Partial<Record<Sym, number>> = {};
    const next: Partial<Record<Sym, Dir>> = {};
    data.assets.forEach(a => {
      const v = a.price === null ? NaN : Number(a.price);
      if (!Number.isFinite(v)) return;
      prices[a.symbol] = v;
      const p = prev.current?.prices[a.symbol];
      if (p !== undefined) next[a.symbol] = v > p ? 'up' : v < p ? 'down' : 'flat';
    });
    if (prev.current) setDirs(next);
    prev.current = { at: data.generatedAt, prices };
  }, [data]);

  useEffect(() => { setHover(null); setKb(null); }, [sel]);

  const asset: MarketLiveAsset | undefined = data?.assets.find(a => a.symbol === sel);
  const genMs = data ? Date.parse(data.generatedAt) : NaN;
  const limit = Math.max(45000, (data?.refreshIntervalMs ?? 15000) * 3);
  const snapshotAge = Number.isFinite(genMs) ? Math.max(0, now - genMs) : Infinity;
  const observedMs = asset?.observedAt ? Date.parse(asset.observedAt) : NaN;
  const age = Number.isFinite(observedMs) ? Math.max(0, now - observedMs) : Infinity;
  const tradeMs = asset?.tradeAt ? Date.parse(asset.tradeAt) : NaN;
  const stale = !!data && (q.isError || snapshotAge > limit || age > limit || !Number.isFinite(tradeMs) || now - tradeMs > 120000 || asset?.status === 'stale');
  const unavailable = !asset || asset.status === 'unavailable' || asset.price === null;
  const hist = useMemo(() => (asset?.history ?? []).filter(p => Number.isFinite(p.time) && Number.isFinite(p.value)), [asset]);
  const histOk = hist.length > 1 && asset?.historyStatus !== 'unavailable';
  const histStale = asset?.historyStatus === 'stale' || stale;

  const usd = (v: number | string, d = 2) => Number(v).toLocaleString(lc, { style: 'currency', currency: 'USD', minimumFractionDigits: d, maximumFractionDigits: d });
  const tm = (ms: number) => new Date(ms).toLocaleTimeString(lc, { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  const full = (ms: number) => new Date(ms).toLocaleString(lc, { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const ago = (ms: number) => { const s = Math.round(ms / 1000); return s < 60 ? `${s} s` : s < 3600 ? `${Math.floor(s / 60)} min` : `${Math.floor(s / 3600)} h`; };

  const idx = kb ?? hover;
  const pt = idx !== null && hist[idx] ? hist[idx] : null;
  const first = hist[0]; const last = hist[hist.length - 1];
  const up = first && last ? last.value >= first.value : true;
  const stroke = histStale ? '#979797' : up ? '#44986D' : '#D8524F';

  const onKey = (e: KeyboardEvent) => {
    if (!histOk) return;
    const n = hist.length; const cur = kb ?? n - 1;
    const step = e.shiftKey ? 12 : 1;
    if (e.key === 'ArrowLeft') setKb(Math.max(0, cur - step));
    else if (e.key === 'ArrowRight') setKb(Math.min(n - 1, cur + step));
    else if (e.key === 'Home') setKb(0);
    else if (e.key === 'End') setKb(n - 1);
    else if (e.key === 'Escape') setKb(null);
    else return;
    e.preventDefault();
  };

  const names: Record<Sym, string> = { BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana' };
  const dirIcon = (d?: Dir) => d === 'up' ? <ArrowUpRight size={14} aria-hidden="true" /> : d === 'down' ? <ArrowDownRight size={14} aria-hidden="true" /> : <Minus size={14} aria-hidden="true" />;
  const dirText = (d?: Dir) => d === 'up' ? x('subiu desde a última leitura', 'up since last reading', 'subió desde la última lectura') : d === 'down' ? x('caiu desde a última leitura', 'down since last reading', 'bajó desde la última lectura') : d === 'flat' ? x('sem mudança desde a última leitura', 'unchanged since last reading', 'sin cambio desde la última lectura') : '';

  const agent = ag.data?.agents.find(a => a.id === sel.toLowerCase());
  const run = agent?.latest ?? null;
  const st = { healthy: x('saudável', 'healthy', 'saludable'), degraded: x('degradada', 'degraded', 'degradada'), failed: x('falhou', 'failed', 'falló') } as const;
  const dc = { monitor: x('monitorar', 'monitor', 'monitorizar'), hold: x('manter', 'hold', 'mantener'), block: x('bloquear', 'block', 'bloquear') } as const;

  const retry = () => { void q.refetch(); };

  return <section id="mercados-ao-vivo" className="lm lm--app" aria-labelledby="lm-title" data-testid="section-live-markets">
    <div className="lm__wrap">
      <header className="lm__head">
        <span className="mono lm__eyebrow">{x('MERCADOS AO VIVO', 'LIVE MARKETS', 'MERCADOS EN VIVO')}</span>
        <h2 id="lm-title" className="display lm__title">{x('BTC, ETH e SOL em tempo real.', 'BTC, ETH and SOL in real time.', 'BTC, ETH y SOL en tiempo real.')}</h2>
        <p className="lm__lead">{x('Preços reais de BTC, ETH e SOL, atualizados a cada 15 s enquanto esta página está visível. Só leitura de mercado: não são execuções nem retorno garantido.', 'Real BTC, ETH and SOL prices, refreshed every 15 s while this page is visible. Market reading only: not trade executions or guaranteed returns.', 'Precios reales de BTC, ETH y SOL, actualizados cada 15 s mientras esta página está visible. Solo lectura de mercado: no son ejecuciones ni retorno garantizado.')}</p>
      </header>

      <div className="lm__tabs" role="tablist" aria-label={x('Ativo', 'Asset', 'Activo')}>
        {SYMBOLS.map(s => {
          const a = data?.assets.find(v => v.symbol === s);
          const on = s === sel;
          return <button key={s} type="button" role="tab" aria-selected={on} tabIndex={on ? 0 : -1} data-testid={`tab-market-${s.toLowerCase()}`} className="lm__tab" onClick={() => setSel(s)}
            onKeyDown={e => { const i = SYMBOLS.indexOf(s); const n = e.key === 'ArrowRight' ? SYMBOLS[(i + 1) % 3] : e.key === 'ArrowLeft' ? SYMBOLS[(i + 2) % 3] : null; if (n) { e.preventDefault(); setSel(n); (e.currentTarget.parentElement?.querySelector(`[data-testid="tab-market-${n.toLowerCase()}"]`) as HTMLElement | null)?.focus(); } }}>
            <span className="lm__tab-sym mono">{s}</span>
            <span className="lm__tab-name">{names[s]}</span>
            <span className="lm__tab-price mono">{a?.price ? usd(a.price) : '--'}</span>
            <span className={`lm__tab-chg lm__tab-chg--${typeof a?.change24h === 'number' ? (a.change24h >= 0 ? 'up' : 'down') : 'na'}`}>{typeof a?.change24h === 'number' ? `${a.change24h >= 0 ? '+' : ''}${a.change24h.toLocaleString(lc, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}%` : x('sem dado', 'no data', 'sin dato')}</span>
          </button>;
        })}
      </div>

      <div className="lm__panel" role="tabpanel" aria-busy={q.isLoading} data-testid="panel-market">
        {q.isLoading && !data ? <div className="lm__skel" aria-label={x('Carregando', 'Loading', 'Cargando')}><i /><i /><i /></div>
          : q.isError && !data ? <div className="lm__state" role="alert"><p>{x('Não conseguimos carregar os preços agora.', 'We could not load prices right now.', 'No pudimos cargar los precios ahora.')}</p><button type="button" className="lm__btn" data-testid="button-market-retry" onClick={retry}><RefreshCw size={16} aria-hidden="true" />{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div>
          : data ? <>
            <div className="lm__top">
              <div>
                <div className="lm__status-row">
                  <span className={`lm__badge lm__badge--${unavailable ? 'off' : stale ? 'stale' : 'live'}`} data-testid="status-market">{unavailable ? x('Sem dados', 'No data', 'Sin datos') : stale ? x('Defasado', 'Stale', 'Desactualizado') : x('Ao vivo', 'Live', 'En vivo')}</span>
                  {q.isError && <span className="lm__warn" role="alert">{x('A atualização falhou; exibindo a última leitura.', 'Refresh failed; showing the last reading.', 'La actualización falló; se muestra la última lectura.')}</span>}
                </div>
                <p className={`lm__price mono lm__price--${dirs[sel] ?? 'none'}`} data-testid="text-market-price" key={asset?.price ?? 'x'}>{!unavailable ? usd(asset!.price!) : '--'}</p>
                <p className="lm__dir" aria-live="polite">{!unavailable && dirs[sel] && <>{dirIcon(dirs[sel])} {dirText(dirs[sel])}</>}</p>
              </div>
              <dl className="lm__stats">
                <div><dt>{x('Variação 24 h', '24 h change', 'Variación 24 h')}</dt><dd className="mono">{typeof asset?.change24h === 'number' ? `${asset.change24h >= 0 ? '+' : ''}${asset.change24h.toLocaleString(lc, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : '--'}</dd></div>
                <div><dt>{x('Máxima 24 h', '24 h high', 'Máximo 24 h')}</dt><dd className="mono">{asset?.high24h ? usd(asset.high24h) : '--'}</dd></div>
                <div><dt>{x('Mínima 24 h', '24 h low', 'Mínimo 24 h')}</dt><dd className="mono">{asset?.low24h ? usd(asset.low24h) : '--'}</dd></div>
              </dl>
            </div>

            <div className="lm__chart-head">
              <span>{x('Fechamentos de velas de 5 min, últimas 24 h, em USD', '5-min candle closes, last 24 h, in USD', 'Cierres de velas de 5 min, últimas 24 h, en USD')}</span>
              <span className="lm__readout mono" aria-live="polite" data-testid="text-market-readout">{pt ? `${full(pt.time)} · ${usd(pt.value)}` : histOk ? x('Passe o mouse ou use as setas', 'Hover or use arrow keys', 'Pasa el ratón o usa las flechas') : ''}</span>
            </div>
            {histOk ? <div className="lm__chart" tabIndex={0} role="group" onKeyDown={onKey} onBlur={() => setKb(null)}
              aria-label={x(`Histórico de preço de ${sel}. Use as setas para percorrer os pontos.`, `${sel} price history. Use arrow keys to move through points.`, `Historial de precio de ${sel}. Usa las flechas para recorrer los puntos.`)} data-testid="chart-market-history">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hist} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}
                  onMouseMove={s => { const raw = s.activeTooltipIndex; const i = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN; setKb(null); setHover(Number.isInteger(i) ? i : null); }}
                  onClick={s => { const raw = s.activeTooltipIndex; const i = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN; setKb(null); setHover(Number.isInteger(i) ? i : null); }}
                  onMouseLeave={() => setHover(null)}>
                  <CartesianGrid stroke="#ffffff14" vertical={false} />
                  <XAxis dataKey="time" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={tm} tick={{ fill: '#9fb0d6', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#ffffff22' }} minTickGap={48} />
                  <YAxis domain={['auto', 'auto']} width={72} orientation="right" tickFormatter={(v: number) => usd(v, v < 100 ? 2 : 0)} tick={{ fill: '#9fb0d6', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={() => null} cursor={{ stroke: '#9fb0d6', strokeDasharray: '4 4' }} />
                  <Line type="linear" dataKey="value" stroke={stroke} strokeWidth={2} isAnimationActive={false} dot={false} activeDot={{ r: 5, fill: stroke, stroke: '#070B1F', strokeWidth: 2 }} />
                  {pt && <ReferenceDot x={pt.time} y={pt.value} r={5} fill={stroke} stroke="#070B1F" strokeWidth={2} />}
                </LineChart>
              </ResponsiveContainer>
            </div> : <div className="lm__state lm__state--chart" data-testid="state-market-nohistory"><p>{asset?.historyStatus === 'unavailable' || !asset ? x('Histórico indisponível para este ativo agora.', 'History is unavailable for this asset right now.', 'Historial no disponible para este activo ahora.') : x('Dados insuficientes para desenhar o histórico.', 'Not enough data to draw the history.', 'Datos insuficientes para dibujar el historial.')}</p></div>}
            {histOk && histStale && <p className="lm__note lm__note--warn">{x('Histórico defasado: os pontos podem não refletir o mercado atual.', 'Stale history: points may not reflect the current market.', 'Historial desactualizado: los puntos pueden no reflejar el mercado actual.')}</p>}

            <footer className="lm__foot">
              <p>
                {x('Fonte', 'Source', 'Fuente')}: {/^https?:\/\//i.test(data.sourceUrl) ? <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">{data.source}</a> : data.source}
                {' · '}{x('Produto', 'Product', 'Producto')}: {asset?.product ?? '--'}
                {' · '}{x('Leitura há', 'Reading', 'Lectura hace')} <span data-testid="text-market-age">{Number.isFinite(age) ? ago(age) : '--'}</span>{loc === 'en' ? ' ago' : ''}
                {asset?.tradeAt && Number.isFinite(Date.parse(asset.tradeAt)) && <>{' · '}{x('Último negócio', 'Last trade', 'Última operación')} {tm(Date.parse(asset.tradeAt))}</>}
              </p>
              {stale && <p className="lm__note lm__note--warn" role="status">{x('Esta leitura está defasada. Os valores acima são os últimos recebidos.', 'This reading is stale. The values above are the last received.', 'Esta lectura está desactualizada. Los valores son los últimos recibidos.')}</p>}
            </footer>
          </> : null}
      </div>

      <aside className="lm__agent" aria-label={x('Monitoramento do agente', 'Agent monitoring', 'Monitoreo del agente')} data-testid="panel-agent">
        <div>
          <span className="mono lm__eyebrow lm__eyebrow--gold">{x('ALFA', 'ALFA', 'ALFA')} · {x('SOMENTE LEITURA', 'READ-ONLY', 'SOLO LECTURA')}</span>
          <h3 className="display lm__agent-title">{x(`Agente ${sel}`, `${sel} agent`, `Agente ${sel}`)}</h3>
          {ag.isLoading ? <p className="lm__agent-line">{x('Carregando status...', 'Loading status...', 'Cargando estado...')}</p>
            : ag.isError ? <p className="lm__agent-line" role="alert">{x('Status do agente indisponível agora.', 'Agent status unavailable right now.', 'Estado del agente no disponible ahora.')} <button type="button" className="lm__link" onClick={() => void ag.refetch()}>{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></p>
            : !run ? <p className="lm__agent-line">{x('Nenhuma análise registrada ainda.', 'No analysis recorded yet.', 'Ningún análisis registrado aún.')}</p>
            : <p className="lm__agent-line" data-testid="text-agent-status">{x('Última análise', 'Latest analysis', 'Último análisis')} {full(Date.parse(run.completedAt))}: <b>{st[run.status]}</b>, {x('decisão', 'decision', 'decisión')} <b>{dc[run.decision]}</b>.</p>}
          <p className="lm__note">{x('Preços de referência. Análises ALFA; sem execução com dinheiro real.', 'Reference prices. ALFA analysis; no real-money execution.', 'Precios de referencia. Análisis ALFA; sin ejecución con dinero real.')}</p>
        </div>
        <div className="lm__cta">
          <a className="lm__btn lm__btn--gold" data-testid="link-markets-central" href={localizedUrl(`${BASE}/app/central`)}>{x('Ver a Central de agentes', 'Open the agent Central', 'Abrir la Central de agentes')}<ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </aside>
    </div>
  </section>;
}
