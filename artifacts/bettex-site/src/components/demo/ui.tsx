/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';
import { roundTerminology } from '@/lib/round-terminology';
import type { ReactNode } from 'react';
import type { AgentId, Status, Text } from './types';

export type X = (pt: string, en: string, es: string) => string;
export function useX(): { x: X; tx: (t: Text) => string; n: (v: number, d?: number) => string; loc: 'pt' | 'en' | 'es' } {
  const loc = useLocale() as 'pt' | 'en' | 'es';
  const i = loc === 'pt' ? 0 : loc === 'en' ? 1 : 2;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  return { loc, x: (a, b, c) => roundTerminology([a, b, c][i], loc), tx: t => roundTerminology(t[i], loc), n: (v, d = 2) => v.toLocaleString(fl, { minimumFractionDigits: d, maximumFractionDigits: d }) };
}
export const AGENTS: Record<AgentId, { name: Text; color: string; role: Text }> = {
  orchestrator: { name: ['BTEX', 'BTEX', 'BTEX'], color: '#5F86FF', role: ['Recebe, prioriza e pede análise', 'Receives, prioritizes, requests analysis', 'Recibe, prioriza y pide análisis'] },
  treasury: { name: ['Tesouraria', 'Treasury', 'Tesorería'], color: '#8FA8F0', role: ['Reservas, liquidez e reservas concorrentes', 'Reserves, liquidity, competing reservations', 'Reservas, liquidez y reservas concurrentes'] },
  predictions: { name: ['Previsões', 'Predictions', 'Predicciones'], color: '#36E0D0', role: ['Probabilidades, posição e resolução', 'Probabilities, position, resolution', 'Probabilidades, posición y resolución'] },
  crypto: { name: ['Cripto à vista', 'Spot crypto', 'Cripto spot'], color: '#7C9BFF', role: ['Compra à vista, sem alavancagem', 'Spot only, no leverage', 'Solo spot, sin apalancamiento'] },
  sports: { name: ['Surebet', 'Surebet', 'Surebet'], color: '#FF8A45', role: ['Odds, coberturas e execução incompleta', 'Odds, hedges, incomplete execution', 'Cuotas, coberturas y ejecución incompleta'] },
  bonus: { name: ['Bônus', 'Bonus', 'Bonos'], color: '#F2B632', role: ['Requisitos, progresso e custos', 'Requirements, progress, costs', 'Requisitos, progreso y costos'] },
  buyback: { name: ['Recompra e queima', 'Buyback and burn', 'Recompra y quema'], color: '#E56B9A', role: ['Compra com carteira exclusiva e queima', 'Exclusive wallet purchase then burn', 'Compra con cartera exclusiva y quema'] },
  governance: { name: ['Governança', 'Governance', 'Gobernanza'], color: '#B79CFF', role: ['Políticas, versões e incidentes', 'Policies, versions, incidents', 'Políticas, versiones e incidentes'] },
};
export const STATUS: Record<Status, Text> = {
  proposed: ['Proposta', 'Proposed', 'Propuesta'], analyzing: ['Em análise', 'Analyzing', 'En análisis'], authorized: ['Autorizada', 'Authorized', 'Autorizada'],
  open: ['Em andamento', 'In progress', 'En curso'], partial: ['Parcial', 'Partial', 'Parcial'], uncertain: ['Incerta', 'Uncertain', 'Incierta'],
  confirmed: ['Confirmada', 'Confirmed', 'Confirmada'], rejected: ['Rejeitada', 'Rejected', 'Rechazada'], failed: ['Falhou', 'Failed', 'Falló'],
  cancelled: ['Cancelada', 'Cancelled', 'Cancelada'], closed: ['Encerrada', 'Closed', 'Cerrada'],
};
export const STATUS_COLOR: Record<Status, string> = { proposed: '#8FA8F0', analyzing: '#5F86FF', authorized: '#36E0D0', open: '#36E0D0', partial: '#F2B632', uncertain: '#FF8A45', confirmed: '#6FE3A1', rejected: '#E56B6B', failed: '#E56B6B', cancelled: '#9AA3BF', closed: '#9AA3BF' };
export const ACTIVE: Status[] = ['proposed', 'analyzing', 'authorized', 'open', 'partial', 'uncertain'];
export function Chip({ status }: { status: Status }) {
  const { tx } = useX();
  return <span className="mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: STATUS_COLOR[status], borderColor: STATUS_COLOR[status] + '66' }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[status] }} />{tx(STATUS[status])}</span>;
}
export function Panel({ title, tag, children, className = '', id }: { title?: string; tag?: string; children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`min-w-0 rounded-2xl border border-white/10 bg-[#0C1536]/90 p-4 sm:p-5 ${className}`}>
    {(title || tag) && <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">{title && <h3 className="display text-lg font-bold tracking-tight">{title}</h3>}{tag && <span className="mono text-[10px] uppercase tracking-widest text-[#F2B632]">{tag}</span>}</header>}
    {children}
  </section>;
}
export function Btn({ children, onClick, disabled, tone = 'primary', testid, pressed }: { children: ReactNode; onClick?: () => void; disabled?: boolean; tone?: 'primary' | 'ghost' | 'warn'; testid?: string; pressed?: boolean }) {
  const c = tone === 'primary' ? 'bg-[#2B59FF] text-white hover:bg-[#1E44D6]' : tone === 'warn' ? 'bg-[#F2B632] text-[#070B1F] hover:bg-[#ffcd5c]' : 'border border-white/25 text-[#F4F1E8] hover:bg-white/10';
  return <button type="button" aria-pressed={pressed} data-testid={testid} disabled={disabled} onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#36E0D0] disabled:cursor-not-allowed disabled:opacity-40 ${c}`}>{children}</button>;
}
export function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return <div className="min-w-0 rounded-xl border border-white/10 bg-[#070B1F]/70 p-3"><p className="mono text-[10px] uppercase tracking-wider text-[#8FA8F0]">{label}</p><p className="display mt-1 break-words text-xl font-extrabold" style={{ color: accent }}>{value}</p>{sub && <p className="mt-0.5 text-[11px] text-[#9AA9D6]">{sub}</p>}</div>;
}
export const field = 'min-h-10 w-full rounded-lg border border-white/20 bg-[#070B1F] px-3 text-sm text-[#F4F1E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#36E0D0]';
export const Example = () => { const { x } = useX(); return <span className="mono rounded border border-[#F2B632]/40 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-[#F2B632]">{x('Exemplo ilustrativo', 'Illustrative example', 'Ejemplo ilustrativo')}</span>; };
export const BUYBACK_STAGE: Record<string, Text> = {
  accumulating: ['Acúmulo na carteira exclusiva', 'Accumulating in exclusive wallet', 'Acumulación en cartera exclusiva'], analysis: ['Análise da proposta', 'Proposal analysis', 'Análisis de la propuesta'],
  authorized: ['Compra autorizada', 'Purchase authorized', 'Compra autorizada'], purchased: ['BETTEX comprado', 'BETTEX purchased', 'BETTEX comprado'], burned: ['Queima permanente concluída', 'Permanent burn complete', 'Quema permanente completada'],
};
export const POLICY_STAGE: Record<string, Text> = {
  suggested: ['Sugerida pela IA', 'AI suggestion', 'Sugerida por la IA'], approved: ['Aprovação competente', 'Competent approval', 'Aprobación competente'], waiting: ['Espera aplicável', 'Applicable waiting', 'Espera aplicable'], active: ['Vigente', 'In force', 'Vigente'],
};
export const INCIDENT: Record<string, Text> = {
  none: ['Sem incidente', 'No incident', 'Sin incidente'], detected: ['Detectado', 'Detected', 'Detectado'], contained: ['Contido', 'Contained', 'Contenido'], resolved: ['Resolvido', 'Resolved', 'Resuelto'],
};
