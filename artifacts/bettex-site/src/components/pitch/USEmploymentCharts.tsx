import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLocale, t } from '@/lib/i18n';
import snapshot from './us-employment-data.json';
import './USEmploymentCharts.css';

const observations = snapshot.observations.filter(row => row.date >= '2019-01-01');
const before = observations.find(row => row.date === '2020-02-01')!;
const latest = observations.at(-1)!;
const vacancies = observations.filter(row => row.openings !== null);
const lastVacancies = vacancies.at(-1)!;
const peak = vacancies.reduce((a, b) => a.openings! > b.openings! ? a : b);
const monthly = observations.slice(-12);
const netChange = latest.jobs - before.jobs;
const ticks = Array.from({ length: 8 }, (_, index) => Date.UTC(2019 + index, 0, 1));
const sourceProps = { target: '_blank', rel: 'noopener noreferrer' };
const axis = { stroke: '#a8b5d0', fontSize: 11, tickLine: false, axisLine: false };
const cyan = '#61A9BD';

export function USEmploymentCharts() {
  const locale = useLocale();
  const number = (value: number, digits = 3) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
  const millions = (value: number) => number(value / 1_000_000);
  const comparisons = [{ label: t('Pré-pandemia'), jobs: before.jobs }, { label: t('Mais recente'), jobs: latest.jobs }];
  const tooltip = (unit: 'millions' | 'thousands') => <Tooltip
    allowEscapeViewBox={{ x: false, y: false }}
    wrapperStyle={{ maxWidth: 'calc(100vw - 64px)', pointerEvents: 'none' }}
    content={({ active, payload, label }) => {
      if (!active || !payload?.length) return null;
      const row = payload[0].payload;
      return <div className="us-jobs-tooltip"><strong>{row.date?.slice(0, 7) ?? label}</strong><p>{number(Number(payload[0].value) / (unit === 'millions' ? 1_000_000 : 1_000))} {unit === 'millions' ? t('Milhões') : t('Milhares')}</p></div>;
    }}
  />;
  const timeAxis = <XAxis {...axis} dataKey="time" type="number" scale="time" domain={['dataMin', 'dataMax']} ticks={ticks} tickFormatter={value => String(new Date(value).getUTCFullYear())} minTickGap={25} />;
  return <section id="empregos-eua" className="us-jobs" aria-labelledby="us-jobs-title">
    <span className="mono fu-tag">EUA · antes da pandemia e agora</span>
    <h3 id="us-jobs-title" className="display">01 / EUA · Emprego antes da pandemia e agora</h3>
    <p className="us-jobs-intro">O total de empregos não agrícolas está acima de fevereiro de 2020. A fragilidade aparece no ritmo de criação de postos e na redução das vagas abertas desde o pico de 2022, não numa queda do total agregado desde a pandemia.</p>
    <div className="us-jobs-totals">
      <div><span>Pré-pandemia · fev. 2020</span><strong>{number(before.jobs, 0)}</strong><span>empregos não agrícolas</span></div>
      <div><span>Mais recente · set. 2026</span><strong>{number(latest.jobs, 0)}</strong><span>empregos não agrícolas</span></div>
      <div><span>Diferença desde fevereiro de 2020</span><strong>+{number(netChange, 0)}</strong><span>empregos · +{number(netChange / before.jobs * 100, 2)}%</span></div>
    </div>
    <div className="us-jobs-persons"><strong>Pessoas ocupadas · pesquisa domiciliar CPS</strong><p>02/2020: {number(snapshot.persons[0].value, 0)} → 09/2026: {number(snapshot.persons[1].value, 0)}</p><span>Esta medida inclui agricultura e trabalhadores por conta própria. Não é a mesma população da folha de pagamento.</span></div>
    <div className="us-jobs-grid">
      <figure className="us-jobs-panel">
        <figcaption><span className="mono">01 / PAYEMS</span><h4 className="display">Total de empregos: antes e agora</h4><p>Postos não agrícolas em milhões. Fevereiro de 2020 e setembro de 2026. Eixo começa em zero.</p></figcaption>
        <div className="us-jobs-stage" role="img" aria-label={t('Gráfico de barras comparando o total de empregos antes da pandemia e em setembro de 2026')}>
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 560, height: 280 }} minWidth={0}>
            <BarChart data={comparisons} margin={{ top: 28, right: 16, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="#29334e" vertical={false} />
              <XAxis {...axis} dataKey="label" />
              <YAxis {...axis} domain={[0, 180_000_000]} tickFormatter={value => millions(value)} width={46} />
              {tooltip('millions')}
              <Bar dataKey="jobs" fill={cyan} maxBarSize={105} isAnimationActive={false}><LabelList dataKey="jobs" position="top" fill="#f4f1e8" fontSize={14} formatter={(value: unknown) => millions(Number(value))} /></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <a href={snapshot.sources.payroll} {...sourceProps}>BLS / FRED · PAYEMS</a>
      </figure>
      <figure className="us-jobs-panel">
        <figcaption><span className="mono">02 / PAYEMS</span><h4 className="display">A queda de 2020 e a recuperação</h4><p>Série mensal completa: janeiro de 2019 a setembro de 2026. Milhões de empregos; eixo de 125 a 165 milhões, sem preenchimento de área.</p></figcaption>
        <div className="us-jobs-stage" role="img" aria-label={t('Gráfico mensal do total de empregos nos EUA entre 2019 e 2026')}>
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 560, height: 280 }} minWidth={0}>
            <LineChart data={observations} margin={{ top: 14, right: 16, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="#29334e" vertical={false} />{timeAxis}
              <YAxis {...axis} domain={[125_000_000, 165_000_000]} tickFormatter={value => millions(value)} width={46} />
              {tooltip('millions')}
              <Line dataKey="jobs" type="linear" stroke={cyan} strokeWidth={3} dot={false} isAnimationActive={false}><LabelList dataKey="jobs" position="insideTopRight" fill="#8CCEDE" fontSize={11} formatter={(value: unknown) => Number(value) === latest.jobs ? millions(Number(value)) : ''} /></Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="us-jobs-reading">No fundo da pandemia, em abril de 2020, havia 130,426 milhões de postos. O nível de fevereiro de 2020 foi superado em junho de 2022 nesta versão revisada da série.</p>
        <a href={snapshot.sources.payroll} {...sourceProps}>BLS / FRED · PAYEMS</a>
      </figure>
      <figure className="us-jobs-panel">
        <figcaption><span className="mono">03 / JOLTS</span><h4 className="display">Vagas abertas recuaram do pico</h4><p>Série mensal completa: janeiro de 2019 a agosto de 2026. Milhões de vagas não preenchidas, não pessoas desempregadas.</p></figcaption>
        <div className="us-jobs-stage" role="img" aria-label={t('Gráfico mensal das vagas abertas nos EUA entre 2019 e agosto de 2026')}>
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 560, height: 280 }} minWidth={0}>
            <LineChart data={vacancies} margin={{ top: 14, right: 16, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="#29334e" vertical={false} />{timeAxis}
              <YAxis {...axis} domain={[0, 14_000_000]} tickFormatter={value => millions(value)} width={46} />
              {tooltip('millions')}
              <Line dataKey="openings" type="linear" stroke="#CED14E" strokeWidth={3} dot={false} isAnimationActive={false}><LabelList dataKey="openings" position="insideTopRight" fill="#EDED96" fontSize={11} formatter={(value: unknown) => Number(value) === lastVacancies.openings ? millions(Number(value)) : ''} /></Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="us-jobs-reading">{millions(peak.openings!)} → {millions(lastVacancies.openings!)} <span>milhões de vagas: março de 2022 → agosto de 2026.</span> −{number((1 - lastVacancies.openings! / peak.openings!) * 100, 1)}%. <span>Em fevereiro de 2020 eram 6,966 milhões; o total atual ainda é ligeiramente maior.</span></p>
        <a href={snapshot.sources.openings} {...sourceProps}>BLS / FRED · JTSJOL</a>
      </figure>
      <figure className="us-jobs-panel">
        <figcaption><span className="mono">04 / PAYEMS</span><h4 className="display">Criação líquida mês a mês</h4><p>Outubro de 2025 a setembro de 2026. Milhares de postos adicionados ou eliminados, calculados pela diferença entre meses consecutivos.</p></figcaption>
        <div className="us-jobs-stage" role="img" aria-label={t('Gráfico de criação e perda líquida de empregos nos últimos doze meses')}>
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 560, height: 280 }} minWidth={0}>
            <BarChart data={monthly} margin={{ top: 28, right: 16, left: 0, bottom: 6 }}>
              <CartesianGrid stroke="#29334e" vertical={false} />
              <XAxis {...axis} dataKey="time" type="number" scale="time" domain={[monthly[0].time - 15 * 86400000, monthly.at(-1)!.time + 15 * 86400000]} ticks={monthly.map(row => row.time)} tickFormatter={value => { const date = new Date(value).toISOString(); return `${date.slice(5, 7)}/${date.slice(2, 4)}`; }} minTickGap={14} />
              <YAxis {...axis} tickFormatter={value => number(value / 1_000, 0)} width={46} />
              {tooltip('thousands')}
              <Bar dataKey="change" fill={cyan} barSize={18} isAnimationActive={false}><LabelList dataKey="change" position="top" fill="#c5d2f1" fontSize={10} formatter={(value: unknown) => number(Number(value) / 1000, 0)} /></Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="us-jobs-reading">Setembro de 2026 adicionou 29 mil postos. A média dos 12 meses encerrados em setembro é de 41,3 mil por mês, calculada com os níveis revisados desta série.</p>
        <a href={snapshot.sources.payroll} {...sourceProps}>BLS / FRED · PAYEMS</a>
      </figure>
    </div>
    <p className="us-jobs-method">PAYEMS conta empregos em estabelecimentos não agrícolas, não pessoas únicas: exclui agricultura e parte dos autônomos. Na pesquisa domiciliar CPS, que mede pessoas ocupadas, os totais são 158,714 milhões em fevereiro de 2020 e 163,152 milhões em setembro de 2026. São pesquisas diferentes e não devem ser somadas; a CPS também incorpora revisões dos controles populacionais.</p>
    <a className="us-jobs-source" href={snapshot.sources.persons} {...sourceProps}>BLS / FRED · CE16OV · pessoas ocupadas</a>
    <p className="us-jobs-method">Dados disponíveis em 4 de outubro de 2026: PAYEMS e CPS até setembro; JOLTS até agosto. Séries mensais com ajuste sazonal, sujeitas a revisão. Não há projeções, interpolação ou atribuição automática das mudanças à IA.</p>
    <table className="sr-only"><caption>Dados mensais dos gráficos, em unidades, não milhões</caption><thead><tr><th>Mês</th><th>Empregos não agrícolas</th><th>Vagas abertas</th><th>Variação mensal de empregos</th></tr></thead><tbody>{observations.map(row => <tr key={row.date}><th>{row.date.slice(0, 7)}</th><td>{row.jobs}</td><td>{row.openings ?? '—'}</td><td>{row.change}</td></tr>)}</tbody></table>
  </section>;
}