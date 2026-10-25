import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ExternalLink } from 'lucide-react';
import { getFormatLocale } from '@/lib/i18n';
import { marketFlow } from './marketFlow';
import { useX } from './pitchCopy';
import './PitchCharts.css';

const BETS_URL = 'https://www.gov.br/mj/pt-br/assuntos/noticias-1/governo-federal-amplia-fiscalizacao-contra-bets-ilegais';
const BETS_DAILY_BRL = 600_000_000;

/** Average daily flow, R$ billions: crypto = R$283bn / 181 calendar days; bets = ~R$600m/day historical deposits. */
export function AudienceFlowChart() {
  const x = useX();
  const fl = getFormatLocale();
  const bn = (n: number) => {
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return x(`R$ ${n.toLocaleString('pt-BR', options)} bi`, `R$ ${n.toLocaleString('en-US', options)} bn`, `R$ ${n.toLocaleString('es-ES', options)} mil M`);
  };
  const data = [
    { key: 'crypto', name: x('Cripto: operações', 'Crypto: operations', 'Cripto: operaciones'), v: marketFlow.cryptoDailyAverageBrl / 1e9, color: '#2B59FF' },
    { key: 'bets', name: x('Bets: depósitos', 'Bets: deposits', 'Bets: depósitos'), v: BETS_DAILY_BRL / 1e9, color: '#F2B632' },
  ];
  return <figure className="pcc pcc--light" data-testid="audience-flow-chart">
    <figcaption>
      <h3>{x('Volume financeiro médio por dia', 'Average daily financial volume', 'Volumen financiero medio por día')}</h3>
      <p>{x('Unidade: R$ bilhões por dia. Cripto: R$ 283 bilhões em operações no 1º semestre de 2026, divididos por 181 dias corridos. Bets: referência histórica de depósitos, antes da proibição de setembro de 2026. As medidas diferem e não devem ser somadas.', 'Unit: R$ billions per day. Crypto: R$283 billion in operations in H1 2026, divided by 181 calendar days. Bets: historical deposit reference, before the September 2026 ban. The measures differ and should not be added together.', 'Unidad: miles de millones de R$ por día. Cripto: R$283 mil millones en operaciones en el 1.er semestre de 2026, divididos entre 181 días naturales. Bets: referencia histórica de depósitos, antes de la prohibición de septiembre de 2026. Las medidas difieren y no deben sumarse.')}</p>
    </figcaption>
    <div className="pcc__plot pcc__plot--short" role="img" aria-label={x('Gráfico de barras comparando o volume médio diário de cripto e de depósitos em bets', 'Bar chart comparing average daily crypto volume and bet deposits', 'Gráfico de barras que compara el volumen medio diario de cripto y de depósitos en bets')}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 22, right: 12, bottom: 0, left: 0 }}>
          <XAxis type="category" dataKey="key" tickFormatter={k => k === 'crypto' ? x('Cripto', 'Crypto', 'Cripto') : x('Apostas', 'Betting', 'Apuestas')} tick={{ fill: '#070B1F', fontSize: 12 }} stroke="rgba(7,11,31,.35)" />
          <YAxis type="number" domain={[0, 2]} ticks={[0, 0.5, 1, 1.5, 2]} width={34} tickFormatter={n => Number(n).toLocaleString(fl)} tick={{ fill: '#183173', fontSize: 11 }} stroke="rgba(7,11,31,.35)" />
          <Tooltip position={{ x: 0, y: 0 }} wrapperStyle={{ maxWidth: '100%', pointerEvents: 'none' }} cursor={{ fill: 'rgba(43,89,255,.08)' }} labelFormatter={key => data.find(d => d.key === key)?.name ?? key} formatter={(v) => [bn(Number(v)), x('Por dia', 'Per day', 'Por día')]} contentStyle={{ backgroundColor: '#070B1F', border: '1px solid rgba(95,134,255,.5)', borderRadius: 6, fontSize: 12, color: '#F4F1E8', whiteSpace: 'normal' }} />
          <Bar dataKey="v" radius={[6, 6, 0, 0]} maxBarSize={100} isAnimationActive={false}>
            {data.map(d => <Cell key={d.key} fill={d.color} />)}
            <LabelList dataKey="v" position="top" formatter={(v: unknown) => bn(Number(v))} fill="#070B1F" fontSize={12} fontWeight={800} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <p className="pcc__src">
      <a href={marketFlow.cryptoSourceUrl} target="_blank" rel="noopener noreferrer">{x('Receita Federal / Valor Investe · set. 2026', 'Receita Federal / Valor Investe · Sep. 2026', 'Receita Federal / Valor Investe · sep. 2026')}<ExternalLink size={13} aria-hidden="true" /></a>
      <a href={BETS_URL} target="_blank" rel="noopener noreferrer">{x('Fazenda / MJSP · 2 out. 2026', 'Fazenda / MJSP · Oct. 2, 2026', 'Fazenda / MJSP · 2 oct. 2026')}<ExternalLink size={13} aria-hidden="true" /></a>
    </p>
  </figure>;
}
