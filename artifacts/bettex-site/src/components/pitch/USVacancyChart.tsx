import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { t, useLocale } from '@/lib/i18n';
import snapshot from './us-employment-data.json';
import './USEmploymentCharts.css';

const rows = snapshot.observations
  .filter(row => row.date >= '2019-01-01' && row.openings !== null)
  .map(row => ({ date: row.date, time: row.time, vacancies: row.openings! }));
const peak = rows.reduce((a, b) => a.vacancies > b.vacancies ? a : b);
const latest = rows.at(-1)!;
const decrease = (1 - latest.vacancies / peak.vacancies) * 100;
const ticks = Array.from({ length: 8 }, (_, i) => Date.UTC(2019 + i, 0, 1));

export function USVacancyChart() {
  const locale = useLocale();
  const number = (value: number, digits = 3) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
  const millions = (value: number) => number(value / 1_000_000);
  const month = (date: string) => new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(date));
  const axis = { stroke: '#c5d2f1', fontSize: 11, tickLine: false, axisLine: false };

  return <section id="vagas-eua" className="us-jobs" aria-labelledby="us-vacancies-title">
    <span className="mono fu-tag">EUA · vagas disponíveis, não empregos ocupados</span>
    <h3 id="us-vacancies-title" className="display">As vagas abertas caíram do pico de 2022.</h3>
    <div className="us-jobs-totals">
      <div><span>Pico · março de 2022</span><strong>{millions(peak.vacancies)}</strong><span>milhões de vagas abertas</span></div>
      <div><span>Agosto de 2026</span><strong>{millions(latest.vacancies)}</strong><span>milhões de vagas abertas</span></div>
      <div><span>Queda desde o pico</span><strong>−{number(decrease, 1)}%</strong><span>{number(peak.vacancies - latest.vacancies, 0)} <span>vagas abertas a menos</span></span></div>
    </div>
    <figure className="us-jobs-panel">
      <figcaption><h4 className="display">Menos oportunidades disponíveis</h4><p>Vagas não preenchidas ao final do mês, em milhões. Série mensal de janeiro de 2019 a agosto de 2026, com ajuste sazonal. Eixo começa em zero.</p></figcaption>
      <div className="us-jobs-stage" role="img" aria-label={t('Gráfico da queda de 42,5% nas vagas abertas nos EUA desde março de 2022')}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 1000, height: 280 }}>
          <LineChart data={rows} margin={{ top: 30, right: 25, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="#29334e" vertical={false} />
            <XAxis {...axis} dataKey="time" type="number" scale="time" domain={['dataMin', 'dataMax']} ticks={ticks} tickFormatter={value => String(new Date(value).getUTCFullYear())} minTickGap={25} />
            <YAxis {...axis} domain={[0, 14_000_000]} width={36} tickFormatter={value => millions(value)} />
            <Tooltip allowEscapeViewBox={{ x: false, y: false }} wrapperStyle={{ maxWidth: 'calc(100vw - 64px)', pointerEvents: 'none' }} content={({ active, payload }) => {
              const row = payload?.[0]?.payload;
              return active && row ? <div className="us-jobs-tooltip"><strong>{month(row.date)}</strong><p>{millions(row.vacancies)} {t('milhões de vagas abertas')}</p></div> : null;
            }} />
            <Line dataKey="vacancies" type="linear" stroke="#ff7981" strokeWidth={3} dot={false} isAnimationActive={false} />
            <ReferenceDot x={peak.time} y={peak.vacancies} r={5} fill="#f2b632" stroke="#f2b632" label={{ value: `${t('Pico')} · ${millions(peak.vacancies)}`, position: 'top', fill: '#f2b632', fontSize: 12 }} />
            <ReferenceDot x={latest.time} y={latest.vacancies} r={5} fill="#ff7981" stroke="#ff7981" label={{ value: millions(latest.vacancies), position: 'top', fill: '#ffb4b8', fontSize: 12 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <a href={snapshot.sources.openings} target="_blank" rel="noopener noreferrer">Fonte: BLS / FRED · JTSJOL</a>
    </figure>
    <p className="us-jobs-method">Essa queda mede oportunidades de contratação, não pessoas que perderam o emprego. O ponto de comparação é o pico de março de 2022, não 2020. Os dados não demonstram que a IA causou toda a redução. Série publicada em 29 set. 2026.</p>
    <table className="sr-only"><caption>EUA: vagas abertas em unidades</caption><thead><tr><th>Período</th><th>Vagas abertas</th></tr></thead><tbody>{rows.map(row => <tr key={row.date}><th>{row.date.slice(0, 7)}</th><td>{row.vacancies}</td></tr>)}</tbody></table>
  </section>;
}