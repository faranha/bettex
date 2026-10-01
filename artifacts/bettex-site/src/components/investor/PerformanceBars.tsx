import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { performanceSeries, type PerformancePeriod, type PerformanceSubject } from './performanceSeries';
import { markets } from './presentationData';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' });
const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
const gains = '#168367';
const losses = '#b25c47';

export function PerformanceBars({ subject, period }: { subject: PerformanceSubject; period: PerformancePeriod }) {
  const points = performanceSeries(subject, period);
  const data = points.map((point) => ({ label: point.label, value: point.resultCents / 100 }));
  const description = points.map((point) =>
    `${point.label}: ${currency.format(point.resultCents / 100)}`).join('; ');
  const interval = period === '24 horas' ? 'intervalos de 4 horas' : period === '7 dias' ? 'dias' : 'intervalos de 5 dias';
  const subjectLabel = subject === 'BETTEX'
    ? 'da BETTEX nos quatro mercados'
    : `do mercado ${markets.find((market) => market.id === subject)?.label ?? subject}`;

  return (
    <figure className="investor-preview__bars" data-testid="grafico-desempenho">
        <figcaption>Resultado por {interval} <span>USD · exemplo fictício, sem câmbio real</span></figcaption>
      <div className="investor-preview__bars-plot" role="img" aria-label={`Gráfico de barras do desempenho ${subjectLabel} em ${period}. ${description}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 5, bottom: 0, left: -12 }} barCategoryGap="23%">
            <CartesianGrid vertical={false} stroke="#dce8dc" strokeDasharray="3 4" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#5e776c', fontSize: 10 }} interval={0} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#5e776c', fontSize: 10 }}
              tickFormatter={(value: number) => compact.format(value)}
              domain={[(min: number) => Math.min(0, min), (max: number) => Math.max(0, max)]}
              width={48}
            />
            <ReferenceLine y={0} stroke="#769489" />
            <Tooltip
              cursor={{ fill: '#d9e9db', fillOpacity: 0.55 }}
              formatter={(value: number) => [currency.format(value), 'Resultado']}
              contentStyle={{ border: '1px solid #c6dac9', borderRadius: 8, background: '#fffdf5', fontSize: 11 }}
            />
            <Bar dataKey="value" name="Resultado" maxBarSize={42} radius={[3, 3, 0, 0]}>
              {data.map((point, index) => <Cell key={`${point.label}-${index}`} fill={point.value < 0 ? losses : gains} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p>Barras acima de zero indicam ganho; abaixo, perda. Não são resultados reais nem saldo da conta.</p>
    </figure>
  );
}