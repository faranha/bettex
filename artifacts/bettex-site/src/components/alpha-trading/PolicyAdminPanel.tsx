/** @jsxImportSource react */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import {
  useGetTestAccountSession, useGetTradingPolicies, getGetTradingPoliciesQueryKey, useCommandTradingPolicies,
  type TestAccountSnapshot, type TradingPolicySnapshot, type TradingPolicyCommandInput,
} from '@workspace/api-client-react';
import { useFmt, card, KV, Tag } from './format';

const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white hover:bg-[#0A6657] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]';
const btn2 = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0E7C6B] bg-white px-4 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
type Action = TradingPolicyCommandInput['action'];
type Key = NonNullable<TradingPolicyCommandInput['key']>;
type Pending = { action: Action; key?: Key; versionId?: string; sourceCommit?: string };
const PERM: Record<Action, string> = { propose: 'treasury_propose', publish: 'treasury_policy', approve: 'treasury_approve', activate: 'treasury_activate', rollback: 'treasury_activate', revoke: 'treasury_pause' };
const KEYS: Key[] = ['global', 'strategy', 'btc', 'eth', 'sol'];

export function PolicyAdminPanel() {
  const f = useFmt(); const { x } = f;
  const qc = useQueryClient();
  const session = useGetTestAccountSession({ query: { retry: false, queryKey: ['test-account-session'] } });
  const snap = session.data as TestAccountSnapshot | undefined;
  const accountId = snap?.account?.id ?? null;
  const csrf = snap?.csrf ?? '';
  const params = { environment: 'development' as const };
  const q = useGetTradingPolicies(params, { query: { queryKey: [...getGetTradingPoliciesQueryKey(params), accountId], enabled: !!accountId, retry: false, refetchInterval: 15000 } });
  const d: TradingPolicySnapshot | undefined = accountId ? q.data : undefined;
  const [pending, setPending] = useState<Pending | null>(null);
  const [reason, setReason] = useState(''); const [target, setTarget] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (last.current !== accountId) {
      if (last.current !== null) qc.removeQueries({ queryKey: getGetTradingPoliciesQueryKey(params) });
      last.current = accountId; setPending(null); setReason(''); setMsg(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, qc]);
  const cmd = useCommandTradingPolicies();
  const can = (a: Action) => !!d?.permissions.includes(PERM[a]);
  const mine = (author: string) => !!snap?.account && [snap.account.id, snap.account.email, snap.account.displayName].includes(author);
  const status = (q.error as { status?: number } | null)?.status;
  const names: Record<Action, string> = { propose: x('Propor', 'Propose', 'Proponer'), publish: x('Publicar', 'Publish', 'Publicar'), approve: x('Aprovar', 'Approve', 'Aprobar'), activate: x('Ativar', 'Activate', 'Activar'), rollback: x('Reverter', 'Roll back', 'Revertir'), revoke: x('Revogar', 'Revoke', 'Revocar') };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pending || !d || reason.trim().length < 12 || cmd.isPending) return;
    setMsg(null);
    const data: TradingPolicyCommandInput = { csrf, environment: 'development', reason: reason.trim(), expectedRevision: d.revision, action: pending.action,
      ...(pending.key ? { key: pending.key } : {}), ...(pending.versionId ? { versionId: pending.versionId } : {}), ...(pending.sourceCommit ? { sourceCommit: pending.sourceCommit } : {}) };
    try {
      const r = await cmd.mutateAsync({ data });
      qc.setQueryData([...getGetTradingPoliciesQueryKey(params), accountId], r);
      setMsg({ ok: true, t: x('Comando registrado. Nenhum aporte nem negociação real é criado.', 'Command recorded. No funding or real trading is created.', 'Comando registrado. No se crea aporte ni negociación real.') });
      setPending(null); setReason('');
      void q.refetch();
    } catch (err) {
      const s = (err as { status?: number }).status;
      setMsg({ ok: false, t: s === 409 ? x('Revisão desatualizada: os dados foram recarregados, confira e tente de novo.', 'Stale revision: data was reloaded, review and retry.', 'Revisión desactualizada: los datos se recargaron, revisa e intenta de nuevo.')
        : s === 403 ? x('Sem permissão para esta ação.', 'Not permitted for this action.', 'Sin permiso para esta acción.')
        : s === 401 ? x('Sessão nativa ausente ou expirada.', 'Native session missing or expired.', 'Sesión nativa ausente o expirada.')
        : x('O comando foi recusado ou falhou.', 'The command was rejected or failed.', 'El comando fue rechazado o falló.') });
      void q.refetch();
    }
  };
  const open = (p: Pending) => { setPending(p); setReason(''); setMsg(null); };
  const head = <div><h2 className="display text-lg font-extrabold">{x('Políticas de negociação protegidas', 'Protected trading policies', 'Políticas de negociación protegidas')}</h2>
    <p className="mt-1 text-sm text-[#5B6B85]">{x('Somente desenvolvimento. Controles novos são editados no Git, nunca aqui. Aprovar não cria aporte nem negociação real.', 'Development only. New controls are edited in Git, never here. Approval creates no funding or real trading.', 'Solo desarrollo. Los controles nuevos se editan en Git, nunca aquí. Aprobar no crea aporte ni negociación real.')}</p></div>;
  let body;
  if (session.isLoading || (accountId && q.isLoading)) body = <div aria-busy="true" className="grid gap-3">{[0, 1].map(i => <div key={i} className="dcard h-24 animate-pulse" />)}</div>;
  else if (!accountId) body = <p role="status" className="rounded-xl border border-dashed border-[#E4DCCB] p-4 text-sm">{x('Entre com a conta de teste nativa (Minha conta) para administrar políticas.', 'Sign in with the native test account (My account) to administer policies.', 'Entra con la cuenta de prueba nativa (Mi cuenta) para administrar políticas.')}</p>;
  else if (q.isError) body = <div role="alert" className="grid justify-items-start gap-3"><p className="text-sm font-bold text-[#B4421A]">{status === 401 ? x('Sessão nativa necessária (401).', 'Native session required (401).', 'Sesión nativa requerida (401).') : status === 403 ? x('Acesso negado: sem permissão de tesouraria ou fora do desenvolvimento (403).', 'Access denied: no treasury permission or outside development (403).', 'Acceso denegado: sin permiso de tesorería o fuera de desarrollo (403).') : x('Não foi possível carregar as políticas.', 'Could not load policies.', 'No se pudieron cargar las políticas.')}</p>
    <button type="button" className={btn} onClick={() => void q.refetch()}><RefreshCw className="h-4 w-4" aria-hidden="true" />{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div>;
  else if (d) body = <>
    <div className="flex flex-wrap items-center gap-2"><Tag>{d.environment}</Tag><Tag>{x('revisão', 'revision', 'revisión')} {d.revision}</Tag><span className="text-xs text-[#5B6B85]">{f.date(d.asOf)}</span></div>
    <p className="text-xs text-[#5B6B85]">{x('Permissões', 'Permissions', 'Permisos')}: {d.permissions.length ? d.permissions.join(', ') : x('nenhuma', 'none', 'ninguna')}</p>
    {msg && <p role={msg.ok ? 'status' : 'alert'} className={`text-sm font-semibold ${msg.ok ? 'text-[#0E7C6B]' : 'text-[#B4421A]'}`}>{msg.t}</p>}
    <section aria-label={x('Camadas efetivas', 'Effective layers', 'Capas efectivas')}><h3 className="font-bold">{x('Política efetiva por ativo', 'Effective policy per asset', 'Política efectiva por activo')}</h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-3">{(['btc', 'eth', 'sol'] as const).map(a => { const e = d.effective.find(i => i.asset === a); return <li key={a} className="rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] p-3"><p className="font-bold">{f.code(a)}</p>{e ? <><Tag warn={e.status === 'blocked'}>{f.code(e.status)}</Tag><p className="mt-1 text-sm">{f.reason(e.reason)}</p>{e.reference && <pre className="mono mt-1 overflow-x-auto text-[11px]">{JSON.stringify(e.reference, null, 1)}</pre>}</> : <p className="text-sm text-[#5B6B85]">{x('Sem dados', 'No data', 'Sin datos')}</p>}</li>; })}</ul></section>
    <section><h3 className="font-bold">{x('Fontes no Git', 'Git sources', 'Fuentes en Git')}</h3>
      <ul className="mt-2 grid gap-2">{d.sources.map(s => <li key={s.key} className="rounded-xl border border-[#E4DCCB] p-3">
        <div className="flex flex-wrap items-center gap-2"><span className="font-bold">{s.key}</span><span className="text-sm">{s.definition.name} v{s.definition.version}</span><Tag warn={s.state === 'draft'}>{s.state === 'draft' ? x('rascunho', 'draft', 'borrador') : x('commitada', 'committed', 'confirmada')}</Tag></div>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2"><KV k="Hash" v={<span className="mono break-all text-xs">{s.contentHash}</span>} /><KV k="Commit" v={<span className="mono break-all text-xs">{s.sourceCommit ?? x('sem commit', 'no commit', 'sin commit')}</span>} /></dl>
        {can('publish') && <button type="button" className={`${btn2} mt-2`} disabled={!s.sourceCommit || s.state !== 'committed'} onClick={() => open({ action: 'publish', key: s.key as Key, sourceCommit: s.sourceCommit ?? undefined })}>{names.publish}</button>}
        {s.state === 'draft' && <p className="mt-1 text-xs text-[#6B3A10]">{x('Rascunho sem commit não pode ser publicado.', 'A draft without a commit cannot be published.', 'Un borrador sin commit no se puede publicar.')}</p>}</li>)}</ul></section>
    <section><h3 className="font-bold">{x('Versões', 'Versions', 'Versiones')}</h3>
      {d.versions.length === 0 ? <p className="mt-2 text-sm text-[#5B6B85]">{x('Nenhuma versão publicada.', 'No published versions.', 'Ninguna versión publicada.')}</p> :
      <ul className="mt-2 grid gap-2">{d.versions.map(v => { const own = mine(v.author); return <li key={v.id} className="rounded-xl border border-[#E4DCCB] p-3">
        <div className="flex flex-wrap items-center gap-2"><span className="font-bold">{v.definition.name} v{v.definition.version}</span><Tag warn={v.state === 'revoked'}>{f.code(v.state)}</Tag><Tag>{v.definition.scope}</Tag></div>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          <KV k="Hash" v={<span className="mono break-all text-xs">{v.contentHash}</span>} />
          <KV k="Git" v={<span className="mono break-all text-xs">{v.sourceCommit} · {v.sourcePath}</span>} />
          <KV k={x('Autor', 'Author', 'Autor')} v={v.author} /><KV k={x('Publicada', 'Published', 'Publicada')} v={f.date(v.publishedAt)} />
          <KV k={x('Aprovação', 'Approval', 'Aprobación')} v={v.approver ? `${v.approver} · ${f.date(v.approvedAt)}` : v.approvalRequired ? x('pendente', 'pending', 'pendiente') : x('não exigida', 'not required', 'no exigida')} />
          <KV k={x('Ativação', 'Activation', 'Activación')} v={f.date(v.activatedAt)} />
          {v.replacedBy && <KV k={x('Substituída por', 'Replaced by', 'Sustituida por')} v={v.replacedBy} />}</dl>
        <p className="mt-1 text-sm">{v.justification}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {v.state === 'validated' && can('approve') && <button type="button" className={btn2} disabled={own} title={own ? x('O aprovador deve ser outra pessoa', 'Approver must be a different person', 'El aprobador debe ser otra persona') : undefined} onClick={() => open({ action: 'approve', versionId: v.id })}>{names.approve}</button>}
          {(v.state === 'approved' || (v.state === 'validated' && !v.approvalRequired)) && can('activate') && <button type="button" className={btn2} onClick={() => open({ action: 'activate', versionId: v.id })}>{names.activate}</button>}
          {v.state === 'superseded' && can('rollback') && <button type="button" className={btn2} onClick={() => open({ action: 'rollback', versionId: v.id })}>{names.rollback}</button>}
          {v.state !== 'revoked' && v.state !== 'superseded' && can('revoke') && <button type="button" className={btn2} onClick={() => open({ action: 'revoke', versionId: v.id })}>{names.revoke}</button>}</div></li>; })}</ul>}</section>
    {can('propose') && <section className="rounded-xl border border-[#E4DCCB] p-3"><h3 className="font-bold">{x('Solicitar proposta', 'Request a proposal', 'Solicitar propuesta')}</h3>
      <p className="mt-1 text-xs text-[#5B6B85]">{x('Envia apenas o texto do pedido e uma versão-alvo opcional.', 'Sends only the request text and an optional target version.', 'Envía solo el texto del pedido y una versión objetivo opcional.')}</p>
      <label className="mt-2 grid gap-1 text-sm font-semibold">{x('Versão-alvo (opcional)', 'Target version (optional)', 'Versión objetivo (opcional)')}<select className="min-h-11 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] px-3 text-sm" value={target} onChange={e => setTarget(e.target.value)}><option value="">{x('Nenhuma', 'None', 'Ninguna')}</option>{d.versions.map(v => <option key={v.id} value={v.id}>{v.definition.name} v{v.definition.version}</option>)}</select></label>
      <button type="button" className={`${btn} mt-2`} onClick={() => open({ action: 'propose', ...(target ? { versionId: target } : {}) })}>{names.propose}</button></section>}
    {pending && <form onSubmit={e => void submit(e)} className="grid gap-2 rounded-xl border-2 border-[#0E7C6B] bg-[#F7FBF8] p-3" aria-label={names[pending.action]}>
      <p className="font-bold">{names[pending.action]}{pending.key ? ` · ${pending.key}` : ''}{pending.versionId ? ` · ${pending.versionId}` : ''}</p>
      <label className="grid gap-1 text-sm font-semibold">{x('Motivo (mínimo 12 caracteres)', 'Reason (minimum 12 characters)', 'Motivo (mínimo 12 caracteres)')}<textarea className="min-h-24 rounded-xl border border-[#E4DCCB] bg-white p-3 text-sm" maxLength={2000} value={reason} onChange={e => setReason(e.target.value)} /></label>
      <p className="text-xs text-[#5B6B85]">{x('Revisão esperada', 'Expected revision', 'Revisión esperada')}: {d.revision}</p>
      <div className="flex flex-wrap gap-2"><button type="submit" className={btn} disabled={reason.trim().length < 12 || cmd.isPending}>{cmd.isPending ? x('Aguarde…', 'Please wait…', 'Espera…') : names[pending.action]}</button><button type="button" className={btn2} onClick={() => setPending(null)}>{x('Cancelar', 'Cancel', 'Cancelar')}</button></div></form>}
    <section><h3 className="font-bold">{x('Operações abertas afetadas', 'Affected open operations', 'Operaciones abiertas afectadas')}</h3>
      {d.affected.length === 0 ? <p className="mt-2 text-sm text-[#5B6B85]">{x('Nenhuma operação afetada.', 'No affected operations.', 'Ninguna operación afectada.')}</p> :
      <ul className="mt-2 grid gap-2">{d.affected.map(a => <li key={a.id} className="rounded-xl border border-[#E4DCCB] p-3 text-sm"><span className="font-bold">{f.code(a.kind)}</span> <span className="mono break-all text-xs">{a.id}</span> · {f.code(a.state)}<p className="text-xs text-[#5B6B85]">{a.originalEffectiveId ?? '-'} {'->'} {a.currentEffectiveId ?? '-'} · {a.action}</p></li>)}</ul>}</section>
    <section><h3 className="font-bold">{x('Auditoria', 'Audit', 'Auditoría')}</h3>
      {d.changes.length === 0 ? <p className="mt-2 text-sm text-[#5B6B85]">{x('Sem alterações registradas.', 'No recorded changes.', 'Sin cambios registrados.')}</p> :
      <ol className="mt-2 grid gap-2">{d.changes.map(c => <li key={c.id} className="rounded-xl border border-[#E4DCCB] p-3 text-sm"><div className="flex flex-wrap gap-2"><Tag>{names[c.action as Action] ?? c.action}</Tag><Tag warn={c.actorType === 'agent'}>{c.actorType === 'agent' ? x('agente', 'agent', 'agente') : x('humano', 'human', 'humano')}</Tag><span className="text-xs text-[#5B6B85]">{c.actor} · {x('revisão', 'revision', 'revisión')} {c.revision} · {f.date(c.at)}</span></div><p className="mt-1">{c.reason}</p>
        {c.differences && c.differences.length > 0 && <pre className="mono mt-1 overflow-x-auto rounded-lg bg-[#F7F2E6] p-2 text-[11px]">{JSON.stringify(c.differences, null, 1)}</pre>}</li>)}</ol>}</section>
  </>;
  return <section className={`${card} grid gap-4`} data-testid="panel-policy-admin"><div className="flex items-start gap-2"><ShieldCheck className="mt-1 h-5 w-5 text-[#0E7C6B]" aria-hidden="true" />{head}</div>{body}</section>;
}
export default PolicyAdminPanel;
