/** @jsxImportSource react */
import { useEffect, useMemo, useState } from 'react';
import { useGetDemoPolymarket } from '@workspace/api-client-react';
import { useFmt } from '@/components/alpha-trading/format';
import './PolymarketSimulation.css';

type Asset = 'BTC' | 'ETH' | 'SOL';
const ASSETS: Asset[] = ['BTC', 'ETH', 'SOL'];
const MAX_BUDGET = 10000;

export function PolymarketSimulation({ asset }: { asset?: Asset }) {
  const { x, loc, date } = useFmt();
  const lc = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const [picked, setPicked] = useState<Asset>(asset ?? 'BTC');
  const cur = asset ?? picked;
  const [marketId, setMarketId] = useState('');
  const [budget, setBudget] = useState('100');
  const [side, setSide] = useState<'YES' | 'NO'>('YES');
  const q = useGetDemoPolymarket({ locale: loc }, { query: { staleTime: 60000, refetchInterval: 60000, retry: 1 } });
  const data = q.data;
  const markets = useMemo(() => (data?.markets ?? []).filter((m) => m.asset === cur), [data, cur]);
  useEffect(() => {
    if (!markets.some((m) => m.id === marketId)) setMarketId(markets[0]?.id ?? '');
  }, [markets, marketId]);
  const m = markets.find((k) => k.id === marketId);
  const err = data?.errors.find((e) => e.asset === cur);
  const usd = (n: number) => n.toLocaleString(lc, { style: 'currency', currency: 'USD' });
  const px = (n: number) => `${(n * 100).toLocaleString(lc, { maximumFractionDigits: 1 })}% (${usd(n)})`;
  const price = m ? (side === 'YES' ? m.yesPrice : m.noPrice) : NaN;
  const b = Number(budget);
  const budgetOk = budget.trim() !== '' && Number.isFinite(b) && b > 0 && b <= MAX_BUDGET;
  const priceOk = Number.isFinite(price) && price > 0 && price < 1;
  const ok = !!m && budgetOk && priceOk;
  const units = ok ? b / price : 0;
  const gross = units;
  const net = gross - b;
  const dash = x('indisponível', 'unavailable', 'no disponible');
  const num = (n: number) => n.toLocaleString(lc, { maximumFractionDigits: 4 });

  return (
    <section className="pms" data-testid="polymarket-simulation" aria-label={x('Polymarket', 'Polymarket', 'Polymarket')}>
      <div className="pms-lane">
        <b>{x('Polymarket · cotações e simulação', 'Polymarket · quotes and simulation', 'Polymarket · cotizaciones y simulación')}</b>
      </div>
      {!asset && (
        <div className="pms-tabs" role="group">
          {ASSETS.map((a) => (
            <button key={a} type="button" className={a === cur ? 'on' : ''} aria-pressed={a === cur} data-testid={`pm-asset-${a}`} onClick={() => setPicked(a)}>{a}</button>
          ))}
        </div>
      )}
      <div className="pms-tabs">
        <button type="button" data-testid="pm-refresh" disabled={q.isFetching} onClick={() => void q.refetch()}>
          {q.isFetching ? x('Atualizando...', 'Refreshing...', 'Actualizando...') : x('Atualizar cotações', 'Refresh quotes', 'Actualizar cotizaciones')}
        </button>
      </div>
      {q.isLoading && <div className="pms-sk" role="status" aria-label={x('Carregando', 'Loading', 'Cargando')} />}
      {q.isError && !data && <div className="pms-err" role="alert">{x('Não foi possível carregar os mercados no idioma selecionado. Tente atualizar as cotações.', 'Could not load markets in the selected language. Try refreshing quotes.', 'No se pudieron cargar los mercados en el idioma seleccionado. Intente actualizar las cotizaciones.')}</div>}
      {q.isError && data && <div className="pms-warn" role="status">{x('A última atualização falhou; exibindo a consulta anterior.', 'The latest refresh failed; showing the previous query.', 'La última actualización falló; se muestra la consulta anterior.')}</div>}
      {err && <div className="pms-warn" role="status">{cur}: {err.message === 'no_open_binary_markets'
        ? x('Nenhum mercado público disponível para este ativo.', 'No public market available for this asset.', 'Ningún mercado público disponible para este activo.')
        : x('Não foi possível consultar a fonte.', 'Could not query the source.', 'No se pudo consultar la fuente.')}</div>}
      {data && !markets.length && !err && <div className="pms-warn">{x('Nenhum mercado público disponível para este ativo.', 'No public market available for this asset.', 'Ningún mercado público disponible para este activo.')}</div>}
      {data && (
        <div className="pms-grid">
          <div className="pms-box pms-real">
            <h3>{x('Preços públicos reais', 'Real public prices', 'Precios públicos reales')}</h3>
            <label>{x('Mercado', 'Market', 'Mercado')}
              <select data-testid="pm-market-select" value={marketId} disabled={!markets.length} onChange={(e) => setMarketId(e.target.value)}>
                {markets.map((k) => <option key={k.id} value={k.id}>{k.question}</option>)}
              </select>
            </label>
            {m && (
              <>
                <p className="pms-q"><small>{x('Condição do mercado', 'Market condition', 'Condición del mercado')}: </small>{m.question}</p>
                <dl>
                  <div><dt>{x('SIM', 'YES', 'SÍ')}</dt><dd>{px(m.yesPrice)}</dd></div>
                  <div><dt>{x('NÃO', 'NO', 'NO')}</dt><dd>{px(m.noPrice)}</dd></div>
                  <div><dt>{x('Volume 24h', '24h volume', 'Volumen 24h')}</dt><dd>{usd(m.volume24h)}</dd></div>
                  <div><dt>{x('Liquidez', 'Liquidity', 'Liquidez')}</dt><dd>{usd(m.liquidity)}</dd></div>
                  <div><dt>{x('Consultado em', 'Consulted at', 'Consultado el')}</dt><dd>{date(data.fetchedAt)}</dd></div>
                  <div><dt>{x('Fonte', 'Source', 'Fuente')}</dt><dd><a data-testid="pm-source" href={m.url} target="_blank" rel="noopener noreferrer">{data.source}</a></dd></div>
                </dl>
              </>
            )}
          </div>
          <div className="pms-box pms-sim">
            <h3>{x('Simulação local', 'Local simulation', 'Simulación local')}</h3>
            <label>{x('Orçamento de exemplo (USD, máx. 10.000)', 'Example budget (USD, max 10,000)', 'Presupuesto de ejemplo (USD, máx. 10.000)')}
              <input data-testid="pm-budget" type="number" inputMode="decimal" min="0" max={MAX_BUDGET} step="any" value={budget} onChange={(e) => setBudget(e.target.value)} aria-invalid={!budgetOk} />
            </label>
            {!budgetOk && <div className="pms-err">{x('Informe um valor positivo até 10.000.', 'Enter a positive value up to 10,000.', 'Ingrese un valor positivo hasta 10.000.')}</div>}
            <label>{x('Lado', 'Side', 'Lado')}
              <select data-testid="pm-side" value={side} onChange={(e) => setSide(e.target.value as 'YES' | 'NO')}>
                <option value="YES">{x('SIM', 'YES', 'SÍ')}</option><option value="NO">{x('NÃO', 'NO', 'NO')}</option>
              </select>
            </label>
            {m && !priceOk && <div className="pms-err">{x('Cotação indisponível: cálculo bloqueado.', 'Quote unavailable: calculation blocked.', 'Cotización no disponible: cálculo bloqueado.')}</div>}
            <dl>
              <div><dt>{x('Valor investido simulado', 'Simulated invested amount', 'Monto invertido simulado')}</dt><dd>{ok ? usd(b) : dash}</dd></div>
              <div><dt>{x('Unidades (orçamento ÷ preço)', 'Units (budget ÷ price)', 'Unidades (presupuesto ÷ precio)')}</dt><dd data-testid="pm-units">{ok ? num(units) : dash}</dd></div>
              <div><dt>{x('Pagamento bruto se vencer', 'Gross payout if winning', 'Pago bruto si gana')}</dt><dd data-testid="pm-gross">{ok ? usd(gross) : dash}</dd></div>
              <div><dt>{x('Lucro potencial antes de custos', 'Potential profit before costs', 'Beneficio potencial antes de costes')}</dt><dd data-testid="pm-net">{ok ? usd(net) : dash}</dd></div>
              <div><dt>{x('Se perder', 'If losing', 'Si pierde')}</dt><dd>{ok ? `-${usd(b)}` : dash}</dd></div>
            </dl>
            <p className="pms-note">
              {x('Exemplo teórico local, não é ordem nem saldo real. Exclui taxas e deslizamento de preço e não valida liquidez nem execução. Não é lucro garantido nem vantagem de probabilidade; o resultado é incerto e pode ser a perda total do valor simulado.',
                'Local theoretical example, not an order or real balance. Excludes fees and slippage and does not validate liquidity or execution. Not guaranteed profit or a probability edge; the outcome is uncertain and may be a total loss of the simulated amount.',
                'Ejemplo teórico local, no es una orden ni saldo real. Excluye comisiones y deslizamiento de precio y no valida liquidez ni ejecución. No es beneficio garantizado ni ventaja de probabilidad; el resultado es incierto y puede ser la pérdida total del monto simulado.')}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
