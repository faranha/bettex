/** @jsxImportSource react */
import { useState } from 'react';
import { Sparkles, TriangleAlert, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetAgentReasoning, getGetAgentReasoningQueryKey, useCreateAgentReasoning, type AgentReasoningReport } from '@workspace/api-client-react';
import { useFmt } from '@/components/alpha-trading/format';

type Lang = 'pt' | 'en' | 'es';

export function AgentReasoningPanel({ agentId, agentName }: { agentId: string; agentName: string }) {
  const f = useFmt(); const { x } = f; const language = f.loc as Lang;
  const qc = useQueryClient();
  const params = { agentId, language };
  const hist = useGetAgentReasoning(params, { query: { queryKey: getGetAgentReasoningQueryKey(params), refetchInterval: false, refetchOnWindowFocus: false, retry: 1 } });
  const create = useCreateAgentReasoning();
  const [made, setMade] = useState<AgentReasoningReport | null>(null);
  const [err, setErr] = useState<{ key: string; status?: number } | null>(null);
  const key = `${agentId}|${language}`;
  const current = made && made.agentId === agentId && made.language === language ? made : null;
  const curErr = err && err.key === key ? err : null;
  const pending = create.isPending && create.variables?.data.agentId === agentId && create.variables?.data.language === language;

  const generate = () => {
    setErr(null);
    create.mutate({ data: { agentId, language } }, {
      onSuccess: r => { setMade(r); void qc.invalidateQueries({ queryKey: getGetAgentReasoningQueryKey(params) }); },
      onError: e => setErr({ key, status: (e as { status?: number }).status }),
    });
  };

  const reports = (hist.data?.reports ?? []).filter(r => r.agentId === agentId && r.language === language);
  const newest = current ?? reports[0] ?? null;
  const past = reports.filter(r => r.id !== newest?.id);
  const rec = (v: string) => v === 'monitor' ? x('Monitorar', 'Monitor', 'Monitorear') : v === 'abstain' ? x('Abster-se', 'Abstain', 'Abstenerse') : x('Revisar', 'Review', 'Revisar');
  const errText = curErr && (curErr.status === 429 ? x('Limite de uso atingido. Aguarde o intervalo e tente de novo.', 'Usage limit reached. Wait for the cooldown and try again.', 'Límite de uso alcanzado. Espere el intervalo e intente de nuevo.') : curErr.status === 503 ? x('Inferência indisponível agora. Nenhuma análise substituta foi criada.', 'Inference is unavailable right now. No substitute analysis was created.', 'Inferencia no disponible ahora. No se creó ningún análisis sustituto.') : x('A análise falhou. Nada foi salvo.', 'The analysis failed. Nothing was saved.', 'El análisis falló. No se guardó nada.'));

  const List = ({ title, items }: { title: string; items: string[] }) => items.length ? <div><h5 className="font-bold">{title}</h5><ul className="list-disc pl-5">{items.map((s, i) => <li key={i} className="break-words">{s}</li>)}</ul></div> : null;

  const Body = ({ r }: { r: AgentReasoningReport }) => <div className="grid gap-2 text-sm">
    <p className="text-xs text-[#5B6B85] break-words" data-testid={`ai-provenance-${r.id}`}>{x('Modelo', 'Model', 'Modelo')}: <b className="mono">{r.model}</b> ({r.provider}) · {x('resposta', 'response', 'respuesta')} <span className="mono">{r.providerResponseId}</span> · {x('execução de origem', 'source run', 'ejecución de origen')} <span className="mono">{r.sourceRunId ?? x('nenhuma', 'none', 'ninguna')}</span> · {x('dados de', 'data from', 'datos de')} {f.date(r.sourceAt)} · {x('gerado em', 'generated', 'generado')} {f.date(r.createdAt)}</p>
    <p className="break-words font-semibold">{r.analysis.summary}</p>
    <p><b>{x('Sugestão do modelo', 'Model suggestion', 'Sugerencia del modelo')}:</b> {rec(r.analysis.recommendation)}. <span className="text-xs text-[#5B6B85]">{x('Não é ordem financeira. Execução permitida: não.', 'Not a financial order. Execution allowed: no.', 'No es una orden financiera. Ejecución permitida: no.')}</span></p>
    <List title={x('Observações', 'Observations', 'Observaciones')} items={r.analysis.observations} />
    <List title={x('Incertezas', 'Uncertainties', 'Incertidumbres')} items={r.analysis.uncertainties} />
    <List title={x('Próximos passos sugeridos', 'Suggested next steps', 'Próximos pasos sugeridos')} items={r.analysis.nextSteps} />
    {r.evidence.length > 0 && <details><summary className="min-h-11 cursor-pointer py-2 text-xs font-bold text-[#0A6657]">{x('Evidência original usada', 'Original evidence used', 'Evidencia original usada')} ({r.evidence.length})</summary><ul className="grid gap-1 text-xs">{r.evidence.map((e, i) => <li key={i} className="break-words rounded-lg border border-[#E4DCCB] p-2"><span className="mono">[{i}]</span>{r.analysis.evidenceIndices.includes(i) ? ` ${x('citada', 'cited', 'citada')}` : ''} · <b>{e.unit === 'market' ? e.value : `${e.value} ${e.unit}`}</b> · {e.source}{e.producedAt ? ` · ${f.date(e.producedAt)}` : ''}</li>)}</ul></details>}
  </div>;

  return <section className="mt-3 rounded-xl border border-[#0E7C6B]/30 bg-[#F1F7F3] p-3" data-testid="ai-reasoning-panel" aria-live="polite">
    <h4 className="flex flex-wrap items-center gap-2 text-sm font-extrabold"><Sparkles className="h-4 w-4 text-[#0A6657]" aria-hidden="true" />{x('Análise por IA', 'AI analysis', 'Análisis por IA')} · {agentName}</h4>
    <p className="mt-1 text-xs text-[#5B6B85]">{x('Gerada somente quando você pedir, por um modelo de linguagem real, a partir da última evidência registrada. As verificações por regras continuam separadas. É sugestão, não autorização nem ordem.', 'Generated only when you ask, by a real language model, from the latest recorded evidence. Rule checks stay separate. It is a suggestion, not authorization or an order.', 'Generada solo cuando lo pida, por un modelo de lenguaje real, a partir de la última evidencia registrada. Las verificaciones por reglas siguen separadas. Es una sugerencia, no autorización ni orden.')}</p>
    <button type="button" onClick={generate} disabled={create.isPending} data-testid="button-ai-generate" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white disabled:opacity-60"><Sparkles className="h-4 w-4" aria-hidden="true" />{pending ? x('Gerando análise…', 'Generating analysis…', 'Generando análisis…') : x('Gerar análise por IA', 'Generate AI analysis', 'Generar análisis por IA')}</button>
    {pending && <div className="mt-2 h-16 animate-pulse rounded-xl bg-[#EFE9DA]" aria-busy="true" data-testid="ai-pending" />}
    {errText && <div role="alert" data-testid="ai-error" className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-[#B3392A]/40 bg-[#F8E5E1] p-2 text-xs font-bold text-[#8E2A1D]"><TriangleAlert className="h-4 w-4" aria-hidden="true" />{errText}</div>}
    <div className="mt-3">
      {!current && hist.isLoading ? <div className="h-16 animate-pulse rounded-xl bg-[#EFE9DA]" aria-busy="true" /> : hist.isError && !current ? <div role="alert" className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#8E2A1D]">{x('Não foi possível carregar relatórios anteriores.', 'Could not load previous reports.', 'No se pudieron cargar informes anteriores.')}<button type="button" onClick={() => void hist.refetch()} data-testid="button-ai-history-retry" className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#B3392A]/40 px-3"><RefreshCw className="h-4 w-4" aria-hidden="true" />{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div> : newest ? <div className="rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-3" data-testid="ai-latest"><h5 className="mb-1 text-xs font-bold uppercase tracking-wide text-[#0A6657]">{x('Análise mais recente', 'Newest analysis', 'Análisis más reciente')}</h5><Body r={newest} /></div> : <p className="rounded-xl border border-dashed border-[#E4DCCB] p-4 text-center text-sm text-[#5B6B85]" data-testid="ai-empty">{x('Nenhuma análise por IA para este agente e idioma ainda.', 'No AI analysis for this agent and language yet.', 'Aún no hay análisis por IA para este agente e idioma.')}</p>}
      {past.length > 0 && <ul className="mt-2 grid gap-2" data-testid="ai-history">{past.map(r => <li key={r.id} className="rounded-xl border border-[#E4DCCB] bg-[#FBF8F0] text-sm"><details><summary className="min-h-11 cursor-pointer px-3 py-2 text-xs font-bold">{f.date(r.createdAt)} · <span className="mono">{r.model}</span> · {rec(r.analysis.recommendation)}</summary><div className="px-3 pb-3"><Body r={r} /></div></details></li>)}</ul>}
    </div>
  </section>;
}
