import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getFormatLocale, t, useLocale } from '@/lib/i18n';
import type { LaunchDay } from './launchSimulation';
import './LaunchTokenEvolution.css';

interface Props { days: LaunchDay[]; checkpoint: 7 | 30 | 90; tokenPriceUsd: number; purchaseUsd: number }

const Raw = ({ children, className }: { children: string; className?: string }) => <span data-i18n="raw" className={className}>{children}</span>;
const sign = (v: number) => (v > 0 ? 'is-pos' : v < 0 ? 'is-neg' : undefined);

export function LaunchTokenEvolution({ days, checkpoint, tokenPriceUsd, purchaseUsd }: Props) {
  useLocale();
  const loc = getFormatLocale();
  const n = (v: number, min = 0, max = 0) => new Intl.NumberFormat(loc, { minimumFractionDigits: min, maximumFractionDigits: max }).format(v);
  const usdc = (v: number, max = 2) => `${n(v, 2, max)} USDC`;
  const tok = (v: number) => `${n(v, 0, 2)} BETTEX`;
  const perTok = (v: number) => `${n(v, 8, 10)} USDC`;

  const data = useMemo(() => days.filter(d => d.day <= checkpoint), [days, checkpoint]);
  const last = data[data.length - 1];
  const prev = (day: number) => (day > 1 ? days[day - 2] : undefined);

  const ends = useMemo(() => {
    const s = new Set<number>();
    [30, 60, 90].forEach(d => { if (d <= checkpoint) s.add(d); });
    s.add(checkpoint);
    return [...s].sort((a, b) => a - b).filter(d => d <= data.length);
  }, [checkpoint, data.length]);

  const cohorts = useMemo(() => [1, 2, 3].map(m => {
    const entry = data.find(d => d.day > (m - 1) * 30 && d.day <= m * 30 && d.newTokensSold > 0);
    return { m, start: (m - 1) * 30 + 1, entry };
  }).filter(c => c.start <= checkpoint), [data, checkpoint]);

  if (!last || !(tokenPriceUsd > 0)) return null;
  const mult = purchaseUsd / tokenPriceUsd;
  const base = (d: number) => prev(d)?.perTokenPaidCumulativeUsd ?? 0;
  const dayTick = (v: number) => String(v);
  const tip = { contentStyle: { background: '#0a1230', border: '1px solid #5F86FF', borderRadius: 8, fontSize: 12, maxWidth: 260 }, labelStyle: { color: '#F2B632' }, wrapperStyle: { maxWidth: '90vw', zIndex: 5 }, allowEscapeViewBox: { x: false, y: false } } as const;
  const axis = { stroke: '#9fb0d8', fontSize: 11 };
  const dayLabel = (v: unknown) => <Raw>{`${t('Dia')} ${v}`}</Raw>;
  const numericTick = (v: number) => n(v);
  const nameDay = t('Dia');

  return (
    <section id="evolucao-tokens" className="lte" data-testid="launch-token-evolution" aria-label={t('Evolução de tokens e pagamentos')}>
      <div>
        <h4>{t('Evolução de tokens e pagamentos')}</h4>
        <p>{t('Preço ilustrativo fixo no período, sem valorização. Todos os tokens vendidos ficam em auto staking; estoque público não vendido e carteiras de fundadores e investidores ficam fora (diluição não modelada).')}</p>
      </div>

      <dl className="lte__kpis" data-testid="lte-kpis">
        <div><dt>{t('Tokens vendidos')}</dt><dd><Raw>{tok(last.tokensSold)}</Raw></dd></div>
        <div><dt>{t('Tokens em auto staking')}</dt><dd><Raw>{tok(last.tokensInStaking)}</Raw></dd></div>
        <div><dt>{t('Preço ilustrativo por token')}</dt><dd><Raw>{usdc(tokenPriceUsd, 4)}</Raw></dd></div>
        <div className="is-act"><dt>{t('Pago por token na última rodada (já liquidado)')}</dt><dd><Raw>{perTok(last.perTokenPaidTodayUsd)}</Raw></dd></div>
        <div className="is-ref"><dt>{t('Token mantido desde a primeira rodada: pagamentos acumulados')}</dt><dd><Raw>{perTok(last.perTokenPaidCumulativeUsd)}</Raw></dd></div>
      </dl>
      <p>{t('O pagamento da última rodada é o valor efetivamente liquidado nas carteiras dividido pelos tokens elegíveis, não o pool nominal. O acumulado vale só para um token mantido desde a primeira rodada; quem compra depois não recebe pagamentos anteriores.')}</p>

      <div className="lte__charts">
        <figure className="lte__chart" style={{ margin: 0 }}>
          <h5>{t('Saldo de trading da tesouraria')}</h5>
          <div className="lte__plot"><ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(197,210,241,.12)" />
              <XAxis dataKey="day" type="number" domain={[1, checkpoint]} tickFormatter={dayTick} {...axis} />
              <YAxis tickFormatter={numericTick} width={58} {...axis} />
              <Tooltip {...tip} labelFormatter={dayLabel} formatter={(v: number) => [usdc(v), t('Saldo de trading')]} />
              <Area type="linear" dataKey="treasuryTradingBalanceUsd" name={t('Saldo de trading')} stroke="#8fb0ff" fill="#8fb0ff" fillOpacity={.15} strokeWidth={2} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer></div>
          <small>{t('Eixo X: dia. Eixo Y: USDC.')}</small>
        </figure>
        <figure className="lte__chart" style={{ margin: 0 }}>
          <h5>{t('Resultado diário da estratégia (com sinal)')}</h5>
          <div className="lte__plot"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(197,210,241,.12)" />
              <XAxis dataKey="day" type="number" domain={[0.5, checkpoint + 0.5]} ticks={checkpoint === 7 ? [1, 3, 5, 7] : checkpoint === 30 ? [1, 10, 20, 30] : [1, 30, 60, 90]} tickFormatter={dayTick} allowDecimals={false} {...axis} />
              <YAxis tickFormatter={numericTick} width={58} {...axis} />
              <ReferenceLine y={0} stroke="#F4F1E8" />
              <Tooltip {...tip} labelFormatter={dayLabel} formatter={(v: number) => [usdc(v, 4), t('Resultado diário')]} />
              <Bar dataKey="dailyTreasuryProfitUsd" name={t('Resultado diário')} isAnimationActive={false}>
                {data.map(d => <Cell key={d.day} fill={d.dailyTreasuryProfitUsd < 0 ? '#ff6b5e' : '#44c07a'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer></div>
          <small>{t('Verde: resultado positivo. Vermelho: negativo. Linha clara: zero.')}</small>
        </figure>
        <figure className="lte__chart" style={{ margin: 0 }}>
          <h5>{t('Pago por token por dia (liquidado)')}</h5>
          <div className="lte__plot"><ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(197,210,241,.12)" />
              <XAxis dataKey="day" type="number" domain={[1, checkpoint]} tickFormatter={dayTick} {...axis} />
              <YAxis tickFormatter={(v: number) => n(v, 0, 6)} width={64} domain={[0, 'auto']} {...axis} />
              <Tooltip {...tip} labelFormatter={dayLabel} formatter={(v: number) => [perTok(v), t('Pago por token')]} />
              <Area type="linear" dataKey="perTokenPaidTodayUsd" name={t('Pago por token')} stroke="#F2B632" fill="#F2B632" fillOpacity={.15} strokeWidth={2} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer></div>
          <small>{t('Zero nas rodadas com perda.')}</small>
        </figure>
      </div>

      <div>
        <div className="lte__scroll" role="region" tabIndex={0} aria-label={t('Evolução numérica por marco')}>
          <table data-testid="table-lte-evolution">
            <caption>{t('Evolução numérica por marco (dia final de cada período)')}</caption>
            <thead><tr><th scope="col">{t('Métrica')}</th>{ends.map(e => <th scope="col" key={e}>{nameDay} <Raw>{String(e)}</Raw></th>)}</tr></thead>
            <tbody>
              {([
                [t('Tokens novos vendidos no período'), (d: LaunchDay, p?: LaunchDay) => tok(d.tokensSold - (p?.tokensSold ?? 0)), false],
                [t('Tokens vendidos acumulados'), (d: LaunchDay) => tok(d.tokensSold), false],
                [t('Tokens em auto staking acumulados'), (d: LaunchDay) => tok(d.tokensInStaking), false],
                 [t('USDC das novas compras no período'), (d: LaunchDay, p?: LaunchDay) => usdc(d.purchasesUsd - (p?.purchasesUsd ?? 0)), false],
                [t('Saldo de trading ao fechar'), (d: LaunchDay) => usdc(d.treasuryTradingBalanceUsd), false],
                [t('Reserva de recompra (separada)'), (d: LaunchDay) => usdc(d.buybackReserveUsd), false],
                 [t('Trading + reserva de recompra'), (d: LaunchDay) => usdc(d.treasuryTotalAssetsUsd), false],
                [t('Ganhos no período'), (d: LaunchDay, p?: LaunchDay) => usdc(d.treasuryGainsUsd - (p?.treasuryGainsUsd ?? 0)), false],
                [t('Perdas no período (magnitude)'), (d: LaunchDay, p?: LaunchDay) => usdc(d.treasuryLossesUsd - (p?.treasuryLossesUsd ?? 0)), false],
                [t('Resultado líquido no período'), (d: LaunchDay, p?: LaunchDay) => usdc(d.treasuryProfitUsd - (p?.treasuryProfitUsd ?? 0), 4), true],
                [t('Pagamentos aos stakers no período'), (d: LaunchDay, p?: LaunchDay) => usdc(d.stakerPaidUsd - (p?.stakerPaidUsd ?? 0), 4), false],
                [t('Pago por token no dia final'), (d: LaunchDay) => perTok(d.perTokenPaidTodayUsd), false],
              ] as [string, (d: LaunchDay, p?: LaunchDay) => string, boolean][]).map(([label, f, signed], i) => (
                <tr key={i}><th scope="row">{label}</th>{ends.map((e, k) => {
                  const d = days[e - 1]; const p = k > 0 ? days[ends[k - 1] - 1] : undefined;
                  const net = d.treasuryProfitUsd - (p?.treasuryProfitUsd ?? 0);
                  return <td key={e} className={signed ? sign(net) : undefined}><Raw>{f(d, p)}</Raw></td>;
                })}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <small>{t('Períodos completos de 30 dias; na visão de 7 dias, somente a primeira semana. O saldo da tesouraria cresce também pelas novas compras, não apenas pelos ganhos.')}</small>
      </div>

      <div>
        <h4>{t('Pagamento por data de compra')}</h4>
        <p>{t('Referência: o primeiro comprador de cada mês, não a média de todos os compradores desse mês. Pagamento por token = acumulado no marco menos o acumulado antes da entrada, sem renda passada.')}</p>
        <div className="lte__scroll" role="region" tabIndex={0} aria-label={t('Coortes de compradores')} style={{ marginTop: 10 }}>
          <table data-testid="table-lte-cohorts">
             <caption>{t('Pagamento acumulado por token e por compra de referência')}</caption>
             <thead><tr><th scope="col">{t('Comprador de referência')}</th><th scope="col">{t('Dia de entrada')}</th><th scope="col">{t('Tokens da compra de referência')}</th>
              {ends.map(e => <th scope="col" key={e}>{nameDay} <Raw>{String(e)}</Raw></th>)}</tr></thead>
            <tbody>
              {cohorts.map(c => c.entry ? (
                <tr key={c.m}>
                  <th scope="row">{t('Mês')} <Raw>{String(c.m)}</Raw></th>
                  <td><Raw>{String(c.entry.day)}</Raw></td>
                  <td><Raw>{tok(mult)}</Raw></td>
                  {ends.map(e => {
                    if (e < c.entry!.day) return <td key={e}>—</td>;
                    const per = days[e - 1].perTokenPaidCumulativeUsd - base(c.entry!.day);
                     return <td key={e}><div className="lte__cohort-cell"><Raw>{`${n(per, 8, 10)} USDC/BETTEX`}</Raw><small>{t('Na compra de referência:')} <Raw>{usdc(per * mult, 4)}</Raw></small></div></td>;
                  })}
                </tr>
              ) : (
                <tr key={c.m}><th scope="row">{t('Mês')} <Raw>{String(c.m)}</Raw></th><td colSpan={ends.length + 2}>{t('Sem compradores neste mês.')}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <small>{t('Ganho por token mantido desde a primeira rodada no ponto de verificação:')} <Raw>{perTok(last.perTokenPaidCumulativeUsd)}</Raw></small>
        <p>{t('São créditos recebidos em USDC antes de eventuais saques, não o saldo atual da carteira nem direitos pendentes.')}</p>
      </div>

      <details data-testid="lte-ledger">
        <summary>{t('Livro diário: matemática dia a dia')}</summary>
        <div className="lte__scroll lte__ledger" role="region" tabIndex={0} aria-label={t('Livro diário')}>
          <table>
             <caption>{t('Registro diário calculado da simulação até o ponto de verificação')}</caption>
            <thead><tr>
               <th scope="col">{t('Dia')}</th><th scope="col">{t('Tokens novos vendidos')}</th><th scope="col">{t('Tokens vendidos acumulados')}</th><th scope="col">{t('Tokens em auto staking')}</th>
              <th scope="col">{t('Saldo de trading')}</th><th scope="col">{t('Resultado diário')}</th><th scope="col">{t('Pago aos stakers')}</th><th scope="col">{t('Pago por token')}</th>
            </tr></thead>
            <tbody>
              {data.map(d => (
                <tr key={d.day}>
                  <th scope="row"><Raw>{String(d.day)}</Raw></th>
                   <td><Raw>{tok(d.newTokensSold)}</Raw></td><td><Raw>{tok(d.tokensSold)}</Raw></td><td><Raw>{tok(d.tokensInStaking)}</Raw></td>
                  <td><Raw>{usdc(d.treasuryTradingBalanceUsd)}</Raw></td>
                  <td className={sign(d.dailyTreasuryProfitUsd)}><Raw>{usdc(d.dailyTreasuryProfitUsd, 4)}</Raw></td>
                  <td><Raw>{usdc(d.dailyStakerPaidUsd, 6)}</Raw></td>
                  <td><Raw>{perTok(d.perTokenPaidTodayUsd)}</Raw></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div>
        <h5>{t('Notas metodológicas')}</h5>
        <ul>
          <li>{t('Resultados hipotéticos, não são previsão nem retorno prometido.')}</li>
          <li>{t('A data da compra importa: tokens comprados depois não recebem pagamentos anteriores.')}</li>
           <li>{t('O valor por token é uma proporção dos créditos liquidados na carteira; não é uma transferência separada para cada unidade de BETTEX.')}</li>
          <li>{t('Tokens vendidos são considerados disponíveis sob vesting.')}</li>
          <li>{t('Sem execução de recompra, queima ou valorização de preço confirmada.')}</li>
        </ul>
      </div>
    </section>
  );
}

export default LaunchTokenEvolution;
