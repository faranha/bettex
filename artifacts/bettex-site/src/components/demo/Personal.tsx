/** @jsxImportSource react */
import { useMemo, useState, type Dispatch } from 'react';
import type { DemoAction, DemoState, Movement, MovementKind } from './types';
import { setLocale, localizedUrl } from '@/lib/i18n';
import { useLocation } from 'wouter';
import { BUYBACK_STAGE, INCIDENT, Btn, Chip, Panel, STATUS, Stat, field, useX, Example, AGENTS, ACTIVE } from './ui';
import { Wallets, MovementRow } from './Wallets';
import type { Status } from './types';

export function Dashboard({ state, dispatch, go }: { state: DemoState; dispatch: Dispatch<DemoAction>; go: (a: string) => void }) {
  const { x, n, tx } = useX();
  const active = state.operations.filter(o => ACTIVE.includes(o.status));
  const last = state.rounds[0];
  return <div className="grid gap-4">
    <Wallets state={state} dispatch={dispatch} />
    <Panel title={x('Resumo operacional', 'Operations summary', 'Resumen operativo')} tag={`T+${state.clock}h`}>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4"><Stat label={x('Operações ativas', 'Active operations', 'Operaciones activas')} value={String(active.length)} /><Stat label={x('Última rodada', 'Latest round', 'Última ronda')} value={last ? last.id : x('Nenhuma', 'None', 'Ninguna')} /><Stat label={x('Recompra', 'Buyback', 'Recompra')} value={tx(BUYBACK_STAGE[state.buyback.stage])} /><Stat label={x('Política', 'Policy', 'Política')} value={`v${state.policy.version}`} /></div>
      <ul className="mt-3 grid gap-2">{active.slice(0, 4).map(o => <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#070B1F]/60 px-3 py-2 text-sm"><span><span className="mono mr-2 text-[10px]" style={{ color: AGENTS[o.agent].color }}>{o.id}</span>{tx(o.title)}</span><Chip status={o.status} /></li>)}</ul>
      <div className="mt-3 flex flex-wrap gap-2"><Btn tone="ghost" onClick={() => go('central')}>{x('Abrir Central da IA', 'Open AI Center', 'Abrir Central de IA')}</Btn><Btn tone="ghost" onClick={() => go('rounds')}>{x('Ver participação', 'View participation', 'Ver participación')}</Btn></div>
    </Panel>
  </div>;
}

export function History({ state, dispatch }: { state: DemoState; dispatch: Dispatch<DemoAction> }) {
  const { x } = useX();
  const [asset, setAsset] = useState('all'); const [kind, setKind] = useState('all'); const [status, setStatus] = useState('all'); const [win, setWin] = useState(0);
  const list = useMemo(() => state.movements.filter(m => (asset === 'all' || m.asset === asset) && (kind === 'all' || m.kind === kind) && (status === 'all' || m.status === status) && (win === 0 || state.clock - m.time <= win)), [state.movements, state.clock, asset, kind, status, win]);
  const kinds: MovementKind[] = ['receive', 'onramp', 'swap', 'send', 'withdraw', 'distribution'];
  const kn = (k: MovementKind) => ({ receive: x('Receber', 'Receive', 'Recibir'), onramp: 'On-ramp', swap: 'Swap', send: x('Envio', 'Send', 'Envío'), withdraw: x('Retirada', 'Withdrawal', 'Retiro'), distribution: x('Crédito de rodada', 'Round credit', 'Crédito de ronda') })[k];
  return <Panel title={x('Histórico pessoal', 'Personal history', 'Historial personal')} tag={x('Separado do registro público', 'Separate from the public record', 'Separado del registro público')}>
    <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <label className="grid gap-1 text-xs">{x('Ativo', 'Asset', 'Activo')}<select className={field} value={asset} onChange={e => setAsset(e.target.value)}><option value="all">{x('Todos', 'All', 'Todos')}</option><option>USDC</option><option>BETTEX</option></select></label>
      <label className="grid gap-1 text-xs">{x('Tipo', 'Type', 'Tipo')}<select className={field} value={kind} onChange={e => setKind(e.target.value)}><option value="all">{x('Todos', 'All', 'Todos')}</option>{kinds.map(k => <option key={k} value={k}>{kn(k)}</option>)}</select></label>
      <label className="grid gap-1 text-xs">{x('Estado', 'Status', 'Estado')}<select className={field} value={status} onChange={e => setStatus(e.target.value)}><option value="all">{x('Todos', 'All', 'Todos')}</option>{(Object.keys(STATUS) as Status[]).map(s => <option key={s} value={s}>{STATUS[s][x('0', '1', '2') as never] ?? s}</option>)}</select></label>
      <label className="grid gap-1 text-xs">{x('Período', 'Period', 'Período')}<select className={field} value={win} onChange={e => setWin(Number(e.target.value))}><option value={0}>{x('Tudo', 'All time', 'Todo')}</option><option value={6}>6 h</option><option value={24}>24 h</option></select></label>
    </div>
    {list.length === 0 ? <p className="rounded-xl border border-dashed border-white/20 p-6 text-center text-sm text-[#9AA9D6]">{x('Nada no histórico com esses filtros.', 'Nothing in history for these filters.', 'Nada en el historial con estos filtros.')}</p>
      : <ul className="grid gap-2">{list.map((m: Movement) => <MovementRow key={m.id} m={m} state={state} dispatch={dispatch} />)}</ul>}
  </Panel>;
}

export function Profile({ state, dispatch }: { state: DemoState; dispatch: Dispatch<DemoAction> }) {
  const { x, loc, tx } = useX();
  const [, navigate] = useLocation();
  const switchLang = (l: 'pt' | 'en' | 'es') => { navigate('~' + localizedUrl(window.location.pathname + window.location.search, l), { replace: true }); setLocale(l); };
  const [help, setHelp] = useState<'idle' | 'sent'>('idle');
  const [topic, setTopic] = useState('wallet');
  type J = 'creation' | 'access' | 'recovery' | 'export';
  const [jr, setJr] = useState<J | null>(null);
  const [step, setStep] = useState(0);
  const jl = { creation: x('Criação de conta', 'Account creation', 'Creación de cuenta'), access: x('Acesso', 'Access', 'Acceso'), recovery: x('Troca de aparelho / recuperação', 'Device change / recovery', 'Cambio de dispositivo / recuperación'), export: x('Exportação', 'Export', 'Exportación') };
  const steps = jr === 'export' ? [x('Revisar conteúdo', 'Review content', 'Revisar contenido'), x('Confirmar', 'Confirm', 'Confirmar'), x('Baixar arquivo', 'Download file', 'Descargar archivo')] : [x('Revisar passos', 'Review steps', 'Revisar pasos'), x('Aprovar localmente (ilustrativo)', 'Approve locally (illustrative)', 'Aprobar localmente (ilustrativo)'), x('Concluir', 'Complete', 'Completar')];
  const msgs = jr === 'export' ? [x('O arquivo terá apenas saldos e movimentos de exemplo, nunca chaves.', 'The file will hold only example balances and movements, never keys.', 'El archivo tendrá solo saldos y movimientos de ejemplo, nunca claves.'), x('Confirme que é material ilustrativo, não utilizável como credencial.', 'Confirm this is illustrative material, not usable as a credential.', 'Confirme que es material ilustrativo, no utilizable como credencial.'), x('Será baixado um arquivo de texto de exemplo.', 'An example text file will be downloaded.', 'Se descargará un archivo de texto de ejemplo.')]
    : [x('Nenhum dado real, segredo ou chave é pedido ou criado.', 'No real data, secret or key is requested or created.', 'No se pide ni crea ningún dato real, secreto ni clave.'), x('Aprovação visual e local: nada é enviado.', 'Visual, local approval: nothing is sent.', 'Aprobación visual y local: no se envía nada.'), x('Ao concluir, o estado do perfil e a sessão de exemplo são atualizados.', 'On completion the profile state and example session update.', 'Al completar, se actualizan el estado del perfil y la sesión de ejemplo.')];
  const done = jr === 'export' ? x('Exportação ilustrativa concluída. Marca: ILLUSTRATIVE-NOT-A-CREDENTIAL.', 'Illustrative export complete. Mark: ILLUSTRATIVE-NOT-A-CREDENTIAL.', 'Exportación ilustrativa completada. Marca: ILLUSTRATIVE-NOT-A-CREDENTIAL.') : x('Percurso ilustrativo concluído; sessão de exemplo ativa.', 'Illustrative journey complete; example session active.', 'Recorrido ilustrativo completado; sesión de ejemplo activa.');
  const advance = () => {
    if (step === 2) { if (jr === 'export') exportText(); else if (jr) { dispatch({ type: 'PROFILE', state: jr }); dispatch({ type: 'SESSION', state: 'ready' }); } }
    setStep(step + 1);
  };
  const exportText = () => {
    const body = ['ILLUSTRATIVE-NOT-A-CREDENTIAL', `profile: ${state.profile}`, `session: ${state.session}`, `usdc: ${state.usdc}`, `bettex: ${state.bettex}`, `movements: ${state.movements.length}`, 'SAMPLE-WALLET-OWN'].join('\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }));
    const a = document.createElement('a'); a.href = url; a.download = 'bettex-illustrative-export.txt'; a.click(); URL.revokeObjectURL(url);
  };
  const pl = { ready: x('Conta pronta', 'Account ready', 'Cuenta lista'), creation: x('Criação ilustrativa', 'Illustrative creation', 'Creación ilustrativa'), access: x('Acesso ilustrativo', 'Illustrative access', 'Acceso ilustrativo'), recovery: x('Troca de aparelho / recuperação', 'Device change / recovery', 'Cambio de dispositivo / recuperación') };
  const ss: DemoState['session'][] = ['ready', 'expired', 'ended'];
  const sl = { ready: x('Sessão ativa', 'Session active', 'Sesión activa'), expired: x('Sessão expirada', 'Session expired', 'Sesión expirada'), ended: x('Sessão encerrada', 'Session ended', 'Sesión cerrada') };
  return <div className="grid gap-4 lg:grid-cols-2">
    <Panel title={x('Perfil fictício', 'Fictional profile', 'Perfil ficticio')} tag={x('Sem dados reais', 'No real data', 'Sin datos reales')}>
      <p className="mono text-xs text-[#8FA8F0]">SAMPLE-WALLET-OWN</p>
      <p className="mt-2 text-sm">{pl[state.profile]} · {sl[state.session]}</p>
      <p className="mt-3 text-xs text-[#9AA9D6]">{x('Percursos ilustrativos: nenhum segredo, chave ou dado pessoal é pedido ou criado.', 'Illustrative paths: no secret, key or personal data is requested or created.', 'Recorridos ilustrativos: no se pide ni crea ningún secreto, clave o dato personal.')}</p>
      <div className="mt-3 flex flex-wrap gap-2">{(['creation', 'access', 'recovery', 'export'] as const).map(j => <Btn key={j} tone={jr === j ? 'warn' : 'ghost'} pressed={jr === j} onClick={() => { setJr(j); setStep(0); }}>{jl[j]}</Btn>)}</div>
      {jr && <div className="mt-3 rounded-xl border border-white/15 bg-[#070B1F]/70 p-3" data-testid="journey">
        <p className="mono text-[10px] uppercase tracking-widest text-[#F2B632]">{jl[jr]} · {x('etapa', 'step', 'etapa')} {Math.min(step + 1, steps.length)}/{steps.length}</p>
        <ol className="mt-2 flex flex-wrap gap-1.5">{steps.map((t, i) => <li key={i} aria-current={i === step} className={`rounded-full border px-2.5 py-1 text-[11px] ${i < step ? 'border-[#6FE3A1] text-[#6FE3A1]' : i === step ? 'border-[#36E0D0] bg-[#36E0D0]/10' : 'border-white/15 text-[#9AA9D6]'}`}>{t}</li>)}</ol>
        <p className="mt-2 text-xs text-[#C5D2F1]">{step === steps.length ? done : msgs[step]}</p>
        <div className="mt-2 flex flex-wrap gap-2">{step < steps.length && <Btn onClick={advance}>{steps[step]}</Btn>}<Btn tone="ghost" onClick={() => setJr(null)}>{x('Fechar percurso', 'Close journey', 'Cerrar recorrido')}</Btn></div>
      </div>}
      <div className="mt-3 flex flex-wrap gap-2">{ss.map(s => <Btn key={s} tone={state.session === s ? 'warn' : 'ghost'} pressed={state.session === s} onClick={() => dispatch({ type: 'SESSION', state: s })}>{s === 'ready' && state.session !== 'ready' ? x('Retomar sessão', 'Resume session', 'Reanudar sesión') : sl[s]}</Btn>)}</div>
      <div className="mt-4 border-t border-white/10 pt-3"><p className="mb-2 text-xs font-bold">{x('Idioma', 'Language', 'Idioma')}</p><div className="flex gap-2">{(['pt', 'en', 'es'] as const).map(l => <Btn key={l} tone={loc === l ? 'warn' : 'ghost'} pressed={loc === l} onClick={() => switchLang(l)}>{l.toUpperCase()}</Btn>)}</div></div>
    </Panel>
    <Panel title={x('Ajuda', 'Help', 'Ayuda')} tag={x('Solicitação local', 'Local request', 'Solicitud local')}>
      <ul className="grid gap-2 text-sm">
        <li><b>{x('Hydra', 'Hydra', 'Hydra')}:</b> {x('identidade da marca explicada no material de apoio.', 'brand identity explained in the supporting material.', 'identidad de marca explicada en el material de apoyo.')}</li>
        <li><b>BETTEX Bank:</b> {x('proposta informativa; não é conta bancária nem serviço fiat ativo.', 'informational proposal; not an active bank account or fiat service.', 'propuesta informativa; no es cuenta bancaria ni servicio fiat activo.')}</li>
        <li>{x('Tarifa oficial de 2,50 USDC: swap, envio avulso de BETTEX e retirada de rendimentos.', 'Official 2.50 USDC fee: swap, standalone BETTEX send and yield withdrawal.', 'Tarifa oficial de 2,50 USDC: swap, envío independiente de BETTEX y retiro de rendimientos.')}</li>
      </ul>
      <label className="mt-3 grid gap-1 text-xs">{x('Assunto', 'Topic', 'Asunto')}<select className={field} value={topic} onChange={e => { setTopic(e.target.value); setHelp('idle'); }}><option value="wallet">{x('Carteira', 'Wallet', 'Cartera')}</option><option value="round">{x('Rodada', 'Round', 'Ronda')}</option><option value="incident">{x('Incidente', 'Incident', 'Incidente')}</option></select></label>
      <div className="mt-3"><Btn onClick={() => setHelp('sent')} disabled={help === 'sent'}>{help === 'sent' ? x('Solicitação de exemplo registrada', 'Example request recorded', 'Solicitud de ejemplo registrada') : x('Pedir apoio (exemplo)', 'Request support (example)', 'Pedir apoyo (ejemplo)')}</Btn></div>
      {help === 'sent' && <p role="status" className="mt-2 text-xs text-[#6FE3A1]">{x('Estado visual apenas: nenhum atendimento real foi acionado.', 'Visual state only: no real support was contacted.', 'Solo estado visual: no se contactó a ningún soporte real.')}</p>}
      <p className="mt-3 text-xs text-[#9AA9D6]">{x('Incidente do cenário', 'Scenario incident', 'Incidente del escenario')}: {tx(INCIDENT[state.policy.incident])}. <Example /></p>
    </Panel>
  </div>;
}
