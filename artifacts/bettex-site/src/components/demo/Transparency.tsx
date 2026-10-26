/** @jsxImportSource react */
import { useMemo, useState, type Dispatch } from 'react';
import type { AgentId, DemoAction, DemoState, Status } from './types';
import { documentationVestingSchedule as vestingSchedule } from '@/lib/documentation-vesting';
import { documentationTokenomics as tokenomics } from '@/lib/tokenomics';
import { AGENTS, BUYBACK_STAGE, INCIDENT, POLICY_STAGE, Btn, Chip, Panel, STATUS, Stat, field, useX, Example } from './ui';
import { RefDetail } from './Operations';

type Sub = 'events' | 'gov' | 'buyback' | 'token';
export function PublicEvents({ state }: { state: DemoState }) {
  const { x, tx } = useX();
  const [agent, setAgent] = useState<'all' | AgentId>('all');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [win, setWin] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const list = useMemo(() => [...state.publicEvents].filter(e => (agent === 'all' || e.agent === agent) && (status === 'all' || e.status === status) && (win === 0 || state.clock - e.time <= win)).reverse(), [state.publicEvents, state.clock, agent, status, win]);
  return <Panel title={x('Registro público', 'Public record', 'Registro público')} tag={x('Referências de exemplo, sem prova real', 'Example references, not real proof', 'Referencias de ejemplo, sin prueba real')}>
    <div className="mb-3 grid gap-2 sm:grid-cols-3">
      <label className="grid gap-1 text-xs">{x('Agente', 'Agent', 'Agente')}<select className={field} value={agent} onChange={e => setAgent(e.target.value as never)}><option value="all">{x('Todos', 'All', 'Todos')}</option>{(Object.keys(AGENTS) as AgentId[]).map(a => <option key={a} value={a}>{tx(AGENTS[a].name)}</option>)}</select></label>
      <label className="grid gap-1 text-xs">{x('Estado', 'Status', 'Estado')}<select className={field} value={status} onChange={e => setStatus(e.target.value as never)}><option value="all">{x('Todos', 'All', 'Todos')}</option>{(Object.keys(STATUS) as Status[]).map(s => <option key={s} value={s}>{tx(STATUS[s])}</option>)}</select></label>
      <label className="grid gap-1 text-xs">{x('Período', 'Period', 'Período')}<select className={field} value={win} onChange={e => setWin(Number(e.target.value))}><option value={0}>{x('Tudo', 'All time', 'Todo')}</option><option value={6}>{x('Últimas 6 h', 'Last 6 h', 'Últimas 6 h')}</option><option value={24}>{x('Últimas 24 h', 'Last 24 h', 'Últimas 24 h')}</option></select></label>
    </div>
    {list.length === 0 ? <p className="rounded-xl border border-dashed border-white/20 p-6 text-center text-sm text-[#9AA9D6]">{x('Nenhum evento com esses filtros.', 'No events match these filters.', 'Ningún evento con estos filtros.')}</p>
      : <ul className="grid gap-2" data-testid="public-events">{list.map(e => <li key={e.id} className="rounded-xl border border-white/10 bg-[#070B1F]/60 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><span className="mono text-[10px] text-[#9AA9D6]">T+{e.time}h</span><span className="mono text-[11px]" style={{ color: AGENTS[e.agent].color }}>{tx(AGENTS[e.agent].name)}</span><Chip status={e.status} />{e.reference && <button type="button" aria-expanded={open === e.reference} onClick={() => setOpen(open === e.reference! ? null : e.reference!)} className="mono rounded bg-white/10 px-1.5 text-[10px] underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#36E0D0]">{e.reference}</button>}</div><p className="mt-1">{tx(e.text)}</p></li>)}</ul>}
    {open && <div className="mt-4"><RefDetail reference={open} state={state} /><Btn tone="ghost" onClick={() => setOpen(null)}>{x('Fechar detalhe', 'Close detail', 'Cerrar detalle')}</Btn></div>}
  </Panel>;
}

function Tokenomics({ state }: { state: DemoState }) {
  const { x, n } = useX();
  const [m, setM] = useState(12);
  const row = vestingSchedule[m - 1];
  const total = tokenomics.maxSupply;
  const sold = row.communityCumulative * 0.4;
  const burned = state.buyback.burned;
  const circulating = Math.max(0, sold + row.teamCumulative + row.investorsCumulative - burned);
  const groups = [['communityCumulative', x('Comunidade 55%', 'Community 55%', 'Comunidad 55%'), '#36E0D0', tokenomics.communityAllocation], ['teamCumulative', x('Fundador e equipe 20%', 'Founder and team 20%', 'Fundador y equipo 20%'), '#F2B632', tokenomics.teamAllocation], ['investorsCumulative', x('Investidores 15%', 'Investors 15%', 'Inversores 15%'), '#5F86FF', tokenomics.investorAllocation]] as const;
  return <Panel title="Tokenomics" tag={x('1 bilhão · 10/55/20/15 · 24 meses', '1 billion · 10/55/20/15 · 24 months', '1 mil millones · 10/55/20/15 · 24 meses')}>
    <p className="mb-3 text-xs text-[#9AA9D6]">{x('Mint público inicial: teto de 10% (100 milhões), previsto para março de 2027. Vesting: 55% comunidade, 20% fundador/equipe e 15% investidores, em 24 meses a partir de junho de 2027. Visualização ilustrativa; nenhum mint é executado.', 'Initial public mint: 10% cap (100 million), planned for March 2027. Vesting: 55% community, 20% founder/team and 15% investors, over 24 months from June 2027. Illustrative view; no mint is executed.', 'Mint público inicial: límite del 10% (100 millones), previsto para marzo de 2027. Vesting: 55% comunidad, 20% fundador/equipo y 15% inversores, en 24 meses desde junio de 2027. Vista ilustrativa; no se ejecuta ningún mint.')}</p>
    <div className="mb-3 rounded-xl border border-white/10 p-3 text-xs"><div className="flex flex-wrap justify-between gap-2"><span>{x('Mint público inicial 10% · fora do vesting', 'Initial public mint 10% · outside vesting', 'Mint público inicial 10% · fuera del vesting')}</span><span className="mono">{n(tokenomics.initialMintAllocation, 0)}</span></div><p className="mt-1 text-[#9AA9D6]">{x('Teto previsto, não emissão realizada. Não incluído no circulante ilustrativo abaixo.', 'Planned cap, not completed issuance. Not included in the illustrative circulating supply below.', 'Límite previsto, no emisión realizada. No incluido en el circulante ilustrativo de abajo.')}</p></div>
    <label className="grid max-w-xs gap-1 text-xs">{x('Mês', 'Month', 'Mes')}: {m}<input type="range" min={1} max={tokenomics.vestingMonths} value={m} onChange={e => setM(Number(e.target.value))} aria-label={x('Mês do vesting', 'Vesting month', 'Mes del vesting')} /></label>
    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5"><Stat label={x('Liberado no mês', 'Released this month', 'Liberado en el mes')} value={n(row.total, 0)} /><Stat label={x('Liberado acumulado', 'Cumulative released', 'Liberado acumulado')} value={n(row.cumulative, 0)} sub={`${n((row.cumulative / total) * 100)}%`} /><Stat label={x('Vendido (cenário: 40% da comunidade liberada)', 'Sold (scenario: 40% of released community allocation)', 'Vendido (escenario: 40% de la comunidad liberada)')} value={n(sold, 0)} /><Stat label={x('Queimado (cenário fictício)', 'Burned (fictional scenario)', 'Quemado (escenario ficticio)')} value={n(burned, 0)} accent="#E56B9A" /><Stat label={x('Circulante (cenário)', 'Circulating (scenario)', 'Circulante (escenario)')} value={n(circulating, 0)} sub={x('vendido + equipe e investidores liberados − queimado', 'sold + released team and investors − burned', 'vendido + equipo e inversores liberados − quemado')} accent="#36E0D0" /></div>
    <p className="mt-2 text-xs text-[#9AA9D6]">{x('Liberado, vendido, circulante e queimado são medidas distintas. Vendido e circulante usam um número de cenário ilustrativo.', 'Released, sold, circulating and burned are distinct measures. Sold and circulating use an illustrative scenario number.', 'Liberado, vendido, circulante y quemado son medidas distintas. Vendido y circulante usan un número de escenario ilustrativo.')}</p>
    <div className="mt-3 grid gap-2">{groups.map(([k, l, c, cap]) => <div key={k}><div className="flex justify-between text-xs"><span>{l}</span><span className="mono">{n(row[k], 0)}</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${(row[k] / cap) * 100}%`, background: c }} /></div></div>)}</div>
    <div className="mt-3 max-h-72 overflow-auto"><table className="w-full min-w-[640px] text-xs"><caption className="sr-only">{x('Agenda mensal e acumulada de vesting por grupo', 'Monthly and cumulative vesting by group', 'Calendario mensual y acumulado de vesting por grupo')}</caption><thead className="sticky top-0 bg-[#0C1536] text-left"><tr><th scope="col" className="p-1.5">{x('Mês', 'Month', 'Mes')}</th><th scope="col">{x('Comunidade', 'Community', 'Comunidad')}</th><th scope="col">{x('Fundador/equipe', 'Founder/team', 'Fundador/equipo')}</th><th scope="col">{x('Invest.', 'Invest.', 'Invers.')}</th><th scope="col">{x('Comun. acum.', 'Community cum.', 'Comunidad acum.')}</th><th scope="col">{x('Equipe acum.', 'Team cum.', 'Equipo acum.')}</th><th scope="col">{x('Invest. acum.', 'Invest. cum.', 'Invers. acum.')}</th><th scope="col">{x('Total acum.', 'Total cum.', 'Total acum.')}</th></tr></thead><tbody>{vestingSchedule.map(r => <tr key={r.month} className={`mono border-t border-white/10 ${r.month === m ? 'bg-[#F2B632]/15' : ''}`}><th scope="row" className="p-1.5 text-left">{r.month}</th><td>{n(r.community, 0)}</td><td>{n(r.team, 0)}</td><td>{n(r.investors, 0)}</td><td>{n(r.communityCumulative, 0)}</td><td>{n(r.teamCumulative, 0)}</td><td>{n(r.investorsCumulative, 0)}</td><td>{n(r.cumulative, 0)}</td></tr>)}</tbody></table></div>
  </Panel>;
}

export function Transparency({ state, dispatch }: { state: DemoState; dispatch: Dispatch<DemoAction> }) {
  const { x, n, tx } = useX();
  const [sub, setSub] = useState<Sub>('events');
  const p = state.policy; const b = state.buyback;
  const tabs: [Sub, string][] = [['events', x('Eventos públicos', 'Public events', 'Eventos públicos')], ['gov', x('Governança', 'Governance', 'Gobernanza')], ['buyback', x('Recompra e queima', 'Buyback and burn', 'Recompra y quema')], ['token', 'Tokenomics']];
  const stages = ['suggested', 'approved', 'waiting', 'active'] as const;
  return <div className="grid gap-4">
    <div className="flex flex-wrap gap-2" role="group" aria-label={x('Subáreas de transparência', 'Transparency subareas', 'Subáreas de transparencia')}>{tabs.map(([k, l]) => <Btn key={k} tone={sub === k ? 'warn' : 'ghost'} pressed={sub === k} onClick={() => setSub(k)}>{l}</Btn>)}</div>
    {sub === 'events' && <PublicEvents state={state} />}
    {sub === 'gov' && <Panel title={x('Governança e políticas', 'Governance and policies', 'Gobernanza y políticas')} tag={`v${p.version}`}>
      <ol className="flex flex-wrap gap-2">{stages.map(s => <li key={s} aria-current={p.stage === s} className={`mono rounded-full border px-3 py-1 text-[11px] ${p.stage === s ? 'border-[#B79CFF] bg-[#B79CFF]/20' : 'border-white/15 text-[#9AA9D6]'}`}>{tx(POLICY_STAGE[s])}</li>)}</ol>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4"><Stat label={x('Assinaturas multisig', 'Multisig signatures', 'Firmas multisig')} value={String(p.signatures)} /><Stat label={x('Vigência', 'Effective', 'Vigencia')} value={p.scheduledAt === null ? x('Não agendada', 'Unscheduled', 'Sin programar') : `T+${p.scheduledAt}h`} /><Stat label={x('Operação', 'Operation', 'Operación')} value={p.paused ? x('Pausada', 'Paused', 'Pausada') : x('Ativa', 'Active', 'Activa')} accent={p.paused ? '#FF8A45' : '#6FE3A1'} /><Stat label={x('Incidente', 'Incident', 'Incidente')} value={tx(INCIDENT[p.incident])} /></div>
      <p className="mt-3 text-xs text-[#9AA9D6]">{x('Participantes observam. Aprovar políticas ou ordens e votar em assuntos societários não é permitido a quem detém BETTEX, nem ao fundador como holder.', 'Participants observe. Approving policies or orders and voting on corporate matters is not available to BETTEX holders, nor to the founder as a holder.', 'Los participantes observan. Aprobar políticas u órdenes y votar asuntos societarios no está disponible para holders de BETTEX, ni para el fundador como holder.')}</p>
      <div className="mt-3 flex flex-wrap gap-2"><Btn testid="button-policy-next" onClick={() => dispatch({ type: 'POLICY_NEXT' })}>{x('Avançar política (evento preparado)', 'Advance policy (prepared event)', 'Avanzar política (evento preparado)')}</Btn><Btn tone="ghost" testid="button-incident-next" onClick={() => dispatch({ type: 'INCIDENT_NEXT' })}>{x('Avançar incidente (evento preparado)', 'Advance incident (prepared event)', 'Avanzar incidente (evento preparado)')}</Btn></div><p className="mt-2"><Example /></p>
    </Panel>}
    {sub === 'buyback' && <Panel title={x('Recompra e queima', 'Buyback and burn', 'Recompra y quema')}>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4"><Stat label={x('Carteira exclusiva', 'Exclusive wallet', 'Cartera exclusiva')} value={n(b.wallet)} sub="USDC" /><Stat label={x('Comprometido', 'Committed', 'Comprometido')} value={n(b.committed)} /><Stat label={x('Adquirido', 'Acquired', 'Adquirido')} value={n(b.acquired, 0)} sub="BETTEX" /><Stat label={x('Queimado', 'Burned', 'Quemado')} value={n(b.burned, 0)} accent="#E56B9A" sub="BETTEX" /></div>
      <p className="mt-3 text-xs text-[#9AA9D6]">{x('Etapa atual', 'Current stage', 'Etapa actual')}: {tx(BUYBACK_STAGE[b.stage])}. {x('O BETTEX comprado é queimado de forma permanente.', 'Purchased BETTEX is permanently burned.', 'El BETTEX comprado se quema de forma permanente.')}</p>
      <div className="mt-3"><Btn disabled={b.stage === 'burned'} onClick={() => dispatch({ type: 'BUYBACK_NEXT' })}>{x('Avançar evento preparado', 'Advance prepared event', 'Avanzar evento preparado')}</Btn></div>
    </Panel>}
    {sub === 'token' && <Tokenomics state={state} />}
  </div>;
}
