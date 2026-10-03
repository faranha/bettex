import { ReadingDisclosure, Topics } from './ReadingDisclosure';
import g from '@/lib/growth-strategy.json';
import { FounderProfile } from './FounderProfile';
import './growth.css';

const n = (v: number, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (v: number) => `US$ ${n(v)}`;
const e = g.expansion;

export function GrowthStrategy() {
  const paid = g.media.paidAllocation.reduce((s, x) => s + x.amountUsd, 0);
  const other = g.media.otherMarketing.reduce((s, x) => s + x.amountUsd, 0);
  return <ReadingDisclosure id="documentacao-aquisicao-retencao" headingId="aquisicao-title" title={<>Aquisição, retenção e expansão</>}><Topics>
    <div className="whitepaper__prose">
      <p><strong>Meta, não resultado:</strong> {g.launch.goalDefinition} A meta vale para o {g.launch.country}; não é número atual de usuários, e a audiência do fundador ({' '}<a href="#documentacao-fundador">ver apresentação</a>) não equivale a clientes. {g.launch.strategy}</p>
    </div>
    <h3 className="whitepaper__subhead">Canais e funil consentido</h3>
    <div className="whitepaper__status-grid">
      {g.launch.channels.map((c, i) => <div key={c.name}><span>{String(i + 1).padStart(2, '0')} / CANAL ORGÂNICO</span><strong>{c.name}</strong><p>{c.purpose}</p></div>)}
    </div>
    <div className="whitepaper__flow" role="group" aria-label="Funil de aquisição">
      <span>FUNIL</span>
      <ol>{g.launch.funnel.map(s => <li key={s}>{s}</li>)}</ol>
    </div>
    <div className="whitepaper__prose"><p><strong>Narrativa:</strong> {g.launch.brandNarrative}</p></div>

    <h3 className="whitepaper__subhead">Orçamento de marketing proposto</h3>
    <div className="whitepaper__prose"><p>{g.media.status} Total existente de {usd(g.media.monthlyMarketingTotalUsd)}/mês, sem alteração: {usd(paid)} de mídia paga mais {usd(other)} de criadores, peças e localização. Os valores abaixo são partes do mesmo total, não somas adicionais.</p></div>
    <div className="gs-bud">
      <div><h5>Mídia paga · {usd(g.media.monthlyPaidMediaUsd)}</h5><dl>{g.media.paidAllocation.map(x => <div key={x.name}><dt>{x.name}<br /><small>{x.purpose}</small></dt><dd>{usd(x.amountUsd)}</dd></div>)}</dl></div>
      <div><h5>Produção e parceiros · {usd(other)}</h5><dl>{g.media.otherMarketing.map(x => <div key={x.name}><dt>{x.name}</dt><dd>{usd(x.amountUsd)}</dd></div>)}</dl></div>
    </div>
    <div className="whitepaper__prose">
      <p><strong>Medição:</strong> {g.media.measurement}</p>
      <p><strong>Limites:</strong> {g.media.constraints}</p>
    </div>

    <h3 className="whitepaper__subhead">Retenção</h3>
    <div className="whitepaper__status-grid">
      {g.retention.actions.map((a, i) => <div key={a.name}><span>{String(i + 1).padStart(2, '0')} / AÇÃO</span><strong>{a.name}</strong><p>{a.detail}</p></div>)}
    </div>
    <div className="whitepaper__prose">
      <p><strong>Métricas:</strong> {g.retention.metrics.join('; ')}.</p>
      <p>{g.retention.definition}</p>
    </div>

    <h3 id="documentacao-expansao" className="whitepaper__subhead">Expansão internacional cautelosa</h3>
    <div className="whitepaper__prose"><p>{e.status} Critérios: {e.criteria}</p></div>
    <div className="gs-tablewrap" role="region" aria-label="Comparação de países candidatos" tabIndex={0}>
      <table className="gs-table">
        <caption className="sr-only">Indicadores do Banco Mundial, {e.comparisonYear}</caption>
        <thead><tr><th>País</th><th>PIB per capita PPC ({e.comparisonYear})</th><th>Internet (%)</th><th>Urbana (%)</th></tr></thead>
        <tbody>{e.countries.map(c => <tr key={c.code}><td><strong>{c.name}</strong><br /><small>{c.reason}</small></td><td>{n(c.gdpPppPerCapita)}</td><td>{n(c.internetPercent, 1)}</td><td>{n(c.urbanPercent, 1)}</td></tr>)}</tbody>
      </table>
    </div>
    <div className="whitepaper__prose">
      <p>{e.methodNote} PIB per capita em PPC em dólares internacionais correntes; internet: usuários em % da população; urbana: % da população total.</p>
      <p>Fontes: {e.sources.map((s, i) => <span key={s.url}>{i ? '; ' : ''}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></span>)}.</p>
    </div>
    <div className="whitepaper__aside-callout"><span>PORTAS ANTES DE GASTAR</span><p>{e.gates}</p></div>
  </Topics></ReadingDisclosure>;
}

export function FounderIntro() {
  return <section id="documentacao-fundador" aria-labelledby="fundador-title">
    <h3 id="fundador-title" className="whitepaper__subhead">Fundador e distribuição</h3>
    <FounderProfile />
    <div className="whitepaper__prose"><p>As audiências podem se sobrepor; não há total único somado. Engajamento não é conversão e não garante alcance. Plano de uso na <a href="#documentacao-aquisicao-retencao">aquisição, retenção e expansão</a>.</p></div>
  </section>;
}
