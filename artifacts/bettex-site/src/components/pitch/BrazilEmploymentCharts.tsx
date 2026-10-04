import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getFormatLocale, t, useLocale } from '@/lib/i18n';
import data from './br-employment-data.json';
import './USEmploymentCharts.css';

const latest = data.annual.at(-1)!;
const previous = data.annual.at(-2)!;
const recentStart = data.annual.find(row => row.year === 2024)!;
const difference = previous.jobs - latest.jobs;
const change = difference / previous.jobs * 100;
const recentChange = (1 - latest.jobs / recentStart.jobs) * 100;
const axis = { stroke: '#a8b5d0', fontSize: 11, tickLine: false, axisLine: false };
const sourceProps = { target: '_blank', rel: 'noopener noreferrer' };

export function BrazilEmploymentCharts() {
  useLocale();
  const number = (value: number, digits = 0) => new Intl.NumberFormat(getFormatLocale(), { maximumFractionDigits: digits }).format(value);
  const millions = (value: number) => number(value / 1_000_000, 3);
  const flows = [{ label: t('Entradas'), jobs: data.august.hires }, { label: t('Saídas'), jobs: data.august.separations }];
  return <section id="empregos-brasil" className="us-jobs" aria-labelledby="br-jobs-title">
    <span className="mono fu-tag">Brasil · Novo Caged · janeiro a agosto</span>
    <h3 id="br-jobs-title" className="display">02 / Brasil · O motor de novas vagas desacelera</h3>
    <p className="us-jobs-intro">A criação líquida de empregos formais caiu pelo segundo ano consecutivo no acumulado de janeiro a agosto. O saldo de 2026 ficou 25,2% abaixo de 2025 e cerca de 35% abaixo de 2024. O país ainda gera novos vínculos, mas o ritmo recente é de queda.</p>
    <div className="us-jobs-totals">
      <div><span>Janeiro a agosto de 2025</span><strong>{number(previous.jobs)}</strong><span>novos empregos líquidos</span></div>
      <div><span>Janeiro a agosto de 2026</span><strong>{number(latest.jobs)}</strong><span>novos empregos líquidos</span></div>
      <div><span>Queda na criação de vagas</span><strong>−{number(change, 1)}%</strong><span>{number(difference)} <span>novas vagas a menos</span></span></div>
    </div>
    <div className="us-jobs-grid">
      <figure className="us-jobs-panel">
        <figcaption><h4 className="display">2021–2026: evolução da criação de novas vagas</h4><p>Saldo líquido de janeiro a agosto de cada ano, em milhões de empregos formais. Mesma janela de comparação; eixo começa em zero.</p></figcaption>
        <p className="us-jobs-reading"><strong>−{number(recentChange, 1)}%</strong> <span>desde 2024: duas quedas anuais consecutivas.</span></p>
        <div className="us-jobs-stage" role="img" aria-label={t('Gráfico de linha da criação líquida de empregos formais no Brasil de 2021 a 2026')}>
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 560, height: 280 }} minWidth={0}>
            <LineChart data={data.annual} margin={{ top: 28, right: 20, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="#29334e" vertical={false} />
              <XAxis {...axis} dataKey="time" type="number" scale="time" domain={[data.annual[0].time - 90 * 86400000, latest.time + 90 * 86400000]} ticks={data.annual.map(row => row.time)} tickFormatter={value => String(new Date(value).getUTCFullYear())} minTickGap={12} />
              <YAxis {...axis} domain={[0, 2_500_000]} ticks={[0, 500_000, 1_000_000, 1_500_000, 2_000_000, 2_500_000]} width={38} tickFormatter={value => millions(value)} />
              <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="us-jobs-tooltip"><strong>{payload[0].payload.year}</strong><p>{number(Number(payload[0].value))} {t('novos empregos líquidos')}</p></div> : null} allowEscapeViewBox={{ x: false, y: false }} />
              <Line dataKey="jobs" type="linear" stroke="#ff7981" strokeWidth={3} dot={{ r: 4, fill: '#ff7981' }} isAnimationActive={false} />
              <ReferenceDot x={recentStart.time} y={recentStart.jobs} r={5} fill="#f2b632" stroke="#f2b632" label={{ value: millions(recentStart.jobs), position: 'top', fill: '#f2b632', fontSize: 12 }} />
              <ReferenceDot x={latest.time} y={latest.jobs} r={5} fill="#ff7981" stroke="#ff7981" label={{ value: millions(latest.jobs), position: 'top', fill: '#ffb4b8', fontSize: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <a href={data.sources.history} {...sourceProps}>MTE · série histórica do Novo Caged · ago. 2026</a>
      </figure>
      <figure className="us-jobs-panel">
        <figcaption><h4 className="display">Contratações não são criação líquida</h4><p>Agosto de 2026: admissões e desligamentos em milhões de vínculos. A diferença entre as barras é o saldo de novos empregos. Eixo começa em zero.</p></figcaption>
        <div className="us-jobs-stage" role="img" aria-label={t('Gráfico de admissões e desligamentos no Brasil em agosto de 2026')}>
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 560, height: 280 }} minWidth={0}>
            <BarChart data={flows} margin={{ top: 28, right: 18, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="#29334e" vertical={false} />
              <XAxis {...axis} dataKey="label" />
              <YAxis {...axis} domain={[0, 2_500_000]} width={46} tickFormatter={value => millions(value)} />
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? <div className="us-jobs-tooltip"><strong>{label}</strong><p>{number(Number(payload[0].value))} {t('vínculos')}</p></div> : null} allowEscapeViewBox={{ x: false, y: false }} />
              <Bar dataKey="jobs" fill="#61A9BD" maxBarSize={100} isAnimationActive={false}><LabelList dataKey="jobs" position="top" fill="#f4f1e8" fontSize={13} formatter={(value: unknown) => millions(Number(value))} /></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="us-jobs-reading">+{number(data.august.net)} <span>novos empregos líquidos em agosto.</span> {number(data.august.stock)} <span>vínculos CLT ativos no fim do mês.</span></p>
        <a href={data.sources.official} {...sourceProps}>MTE · Novo Caged · agosto de 2026</a>
      </figure>
    </div>
    <p className="us-jobs-method">O Novo Caged mede vínculos formais CLT. A linha compara o saldo de janeiro a agosto de cada ano, de 2021 a 2026, com ajustes da divulgação de agosto de 2026. Houve recuperação em 2024 e queda em 2025 e 2026. A tendência recente de menor criação não é redução de todo o estoque de empregos nem uma previsão de queda futura. Não há atribuição causal à IA.</p>
    <table className="sr-only"><caption>Brasil: dados dos gráficos em unidades</caption><thead><tr><th>Período</th><th>Saldo líquido de empregos</th></tr></thead><tbody>{data.annual.map(row => <tr key={row.year}><th>{row.year}</th><td>{row.jobs}</td></tr>)}<tr><th>08/2026</th><td>{data.august.net}</td></tr></tbody></table>
  </section>;
}