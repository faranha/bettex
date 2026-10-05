/** @jsxImportSource react */
import { useState } from 'react';
import { getGetAlloraAnalysisQueryKey, useGetAlloraAnalysis } from '@workspace/api-client-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useX } from './ui';

export function AlloraAnalysis() {
  const { x, loc } = useX();
  const [asset, setAsset] = useState<'BTC' | 'ETH' | 'SOL'>('BTC');
  const query = useGetAlloraAnalysis(asset, { query: { queryKey: getGetAlloraAnalysisQueryKey(asset),
    refetchInterval: 60_000, retry: false } });
  const observation = query.data?.observation;
  const locale = loc === 'pt' ? 'pt-BR' : loc === 'es' ? 'es-ES' : 'en-US';
  const date = (v: string) => new Date(v).toLocaleString(locale, { timeZone: 'America/Sao_Paulo' });
  const history = [...(query.data?.history ?? [])].reverse().map(p => ({
    t: Date.parse(p.producedAt), value: Number(p.price), target: p.targetAt,
  }));
  return <section className="dcard grid gap-3 p-4 sm:p-5" data-testid="allora-analysis">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="display text-lg font-extrabold">{x('Allora · inferências reais', 'Allora · live inferences', 'Allora · inferencias reales')}</h2>
      <label className="text-xs font-bold">{x('Ativo', 'Asset', 'Activo')} <select value={asset} onChange={e => setAsset(e.target.value as typeof asset)} className="min-h-11 rounded-lg border border-[#D8CFBB] bg-white px-3"><option>BTC</option><option>ETH</option><option>SOL</option></select></label>
    </div>
    <p className="text-xs text-[#5B6B85]">{x('Leitura pública da mainnet Allora, separada do cenário emulado. Previsão de preço em USD para 8 horas; não é probabilidade de evento nem ordem de investimento.', 'Public Allora mainnet data, separate from the emulated scenario. USD price forecast for 8 hours; not an event probability or investment order.', 'Lectura pública de mainnet Allora, separada del escenario emulado. Previsión de precio en USD a 8 horas; no es probabilidad de evento ni orden de inversión.')}</p>
    {query.isLoading ? <p role="status">{x('Consultando a fonte…', 'Reading the source…', 'Consultando la fuente…')}</p>
      : query.isError || !observation ? <p role="alert">{x('Fonte indisponível ou resposta incompatível. Nenhuma inferência foi inventada.', 'Source unavailable or incompatible response. No inference was fabricated.', 'Fuente no disponible o respuesta incompatible. No se inventó ninguna inferencia.')}</p>
      : <>
        <p className="text-2xl font-extrabold">{Number(observation.price).toLocaleString(locale, { style: 'currency', currency: 'USD' })}</p>
        <dl className="grid gap-2 text-xs sm:grid-cols-2">
          <div><dt>{x('Produzida', 'Produced', 'Producida')}</dt><dd>{date(observation.producedAt)}</dd></div>
          <div><dt>{x('Horizonte-alvo', 'Target horizon', 'Horizonte objetivo')}</dt><dd>{date(observation.targetAt)}</dd></div>
          <div><dt>{x('Rede / tópico / bloco', 'Network / topic / block', 'Red / tema / bloque')}</dt><dd className="break-all">{observation.network} · {observation.topicId} · {observation.blockHeight}</dd></div>
          <div><dt>{x('Validade do horizonte', 'Horizon validity', 'Vigencia del horizonte')}</dt><dd>{observation.status === 'stale' ? x('Horizonte encerrado', 'Horizon elapsed', 'Horizonte vencido') : x('Horizonte em aberto', 'Horizon open', 'Horizonte abierto')}</dd></div>
        </dl>
        <p className="text-xs">{x('Resposta pública sem assinatura de consumo. Intervalo de confiança indisponível; velas, volume e preço observado não vêm desta inferência.', 'Public response without a consumer signature. Confidence interval unavailable; candles, volume and observed price do not come from this inference.', 'Respuesta pública sin firma de consumo. Intervalo de confianza no disponible; velas, volumen y precio observado no provienen de esta inferencia.')}</p>
        <h3 className="text-sm font-bold">{x('Histórico das previsões coletadas', 'Collected forecast history', 'Historial de previsiones recopiladas')}</h3>
        <div className="h-48 w-full min-w-0" role="img" aria-label={x('Previsões Allora por horário de produção, em USD', 'Allora forecasts by production time, in USD', 'Previsiones Allora por hora de producción, en USD')}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={history} margin={{ left: 0, right: 12, bottom: 8 }}>
            <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} tickFormatter={v => new Date(v).toLocaleTimeString(locale, { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })} minTickGap={35} />
            <YAxis type="number" domain={['auto', 'auto']} width={62} tickFormatter={v => Number(v).toLocaleString(locale, { maximumFractionDigits: 0 })} />
            <Tooltip wrapperStyle={{ maxWidth: 240 }} labelFormatter={v => date(new Date(Number(v)).toISOString())} formatter={v => [Number(v).toLocaleString(locale, { style: 'currency', currency: 'USD' }), x('Previsão 8h', '8h forecast', 'Previsión 8h')]} />
            <Line type="linear" dataKey="value" stroke="#0E7C6B" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
          </LineChart></ResponsiveContainer>
        </div>
        <a className="w-fit text-xs font-bold text-[#0E7C6B] underline" href={observation.source} target="_blank" rel="noopener noreferrer">{x('Abrir resposta da fonte', 'Open source response', 'Abrir respuesta de la fuente')}</a>
      </>}
    <button type="button" className="min-h-11 w-fit rounded-lg border border-[#D8CFBB] px-3 text-xs font-bold" disabled={query.isFetching} onClick={() => void query.refetch()}>{x('Atualizar consulta', 'Refresh source', 'Actualizar consulta')}</button>
  </section>;
}
