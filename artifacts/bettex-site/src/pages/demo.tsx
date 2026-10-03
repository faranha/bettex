/** @jsxImportSource react */
import { useEffect, useReducer, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward, FastForward } from 'lucide-react';
import { createInitialState, demoReducer, MAX_SCENARIO_STEP } from '@/components/demo/model';
import { Btn, useX, Example } from '@/components/demo/ui';
import { Dashboard, History, Profile } from '@/components/demo/Personal';
import { Central } from '@/components/demo/Central';
import { Live } from '@/components/demo/Live';
import { Rounds } from '@/components/demo/Rounds';
import { Treasury } from '@/components/demo/Treasury';
import { Transparency } from '@/components/demo/Transparency';
import { Community } from '@/components/demo/Community';

export function DemoPage() {
  const [state, dispatch] = useReducer(demoReducer, undefined, createInitialState);
  const [area, setArea] = useState('home');
  const [rk, setRk] = useState(0);
  const h1 = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const { x, tx } = useX();
  useEffect(() => { if (first.current) { first.current = false; return; } h1.current?.focus(); }, [area]);
  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => dispatch({ type: 'TICK' }), 6000);
    return () => window.clearInterval(id);
  }, [state.running]);
  const ended = state.step >= MAX_SCENARIO_STEP;
  const areas: [string, string][] = [['home', x('Meu painel', 'My dashboard', 'Mi panel')], ['central', x('Central da IA', 'AI Center', 'Central de IA')], ['live', 'Live Trading'], ['rounds', x('Participação e resultados', 'Participation and results', 'Participación y resultados')], ['treasury', x('Tesouraria', 'Treasury', 'Tesorería')], ['transparency', x('Transparência', 'Transparency', 'Transparencia')], ['community', x('Comunidade', 'Community', 'Comunidad')], ['history', x('Histórico pessoal', 'Personal history', 'Historial personal')], ['profile', x('Perfil e ajuda', 'Profile and help', 'Perfil y ayuda')]];
  const phase = state.step < 3 ? x('Captação de oportunidades', 'Opportunity intake', 'Captación de oportunidades') : state.step < 6 ? x('Execução e acompanhamento', 'Execution and monitoring', 'Ejecución y seguimiento') : state.step < MAX_SCENARIO_STEP ? x('Conciliação e correções', 'Reconciliation and corrections', 'Conciliación y correcciones') : x('Fim do cenário preparado', 'End of prepared scenario', 'Fin del escenario preparado');
  return <main className="min-h-[calc(100dvh-var(--site-header-h))] bg-[#070B1F] text-[#F4F1E8]">
    <div className="mx-auto grid max-w-[1400px] gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[220px_1fr]">
      <aside className="min-w-0 lg:sticky lg:top-[calc(var(--site-header-h)+12px)] lg:self-start">
        <div className="rounded-2xl border border-white/10 bg-[#0C1536] p-3">
          <div className="flex flex-wrap items-center gap-2"><span className="mono text-[10px] font-bold uppercase tracking-widest text-[#F2B632]">{x('Centro de operações', 'Operations center', 'Centro de operaciones')}</span><Example /></div>
          <p className="mono mt-2 text-sm font-bold" data-testid="text-clock">T+{state.clock}h · {x('passo', 'step', 'paso')} {state.step}/{MAX_SCENARIO_STEP}</p>
          <p className="text-xs text-[#9AA9D6]">{phase}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn testid="button-run" tone={state.running ? 'warn' : 'primary'} disabled={ended && !state.running} onClick={() => dispatch({ type: 'RUN', value: !state.running })}>{state.running ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}{state.running ? x('Pausar', 'Pause', 'Pausar') : x('Autoplay', 'Autoplay', 'Autoplay')}</Btn>
            <Btn testid="button-tick" tone="ghost" onClick={() => dispatch({ type: 'TICK' })}><SkipForward className="h-3.5 w-3.5" aria-hidden="true" />{x('Avançar 1 h', 'Advance 1 h', 'Avanzar 1 h')}</Btn>
            <Btn testid="button-tick-24" tone="ghost" onClick={() => { for (let i = 0; i < 24; i++) dispatch({ type: 'TICK' }); }}><FastForward className="h-3.5 w-3.5" aria-hidden="true" />{x('Avançar 24 h', 'Advance 24 h', 'Avanzar 24 h')}</Btn>
            <Btn testid="button-reset" tone="ghost" onClick={() => { dispatch({ type: 'RESET' }); setArea('home'); setRk(k => k + 1); }}><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />{x('Reiniciar tudo', 'Reset everything', 'Reiniciar todo')}</Btn>
          </div>
        </div>
        <nav aria-label={x('Áreas do demo', 'Demo areas', 'Áreas del demo')} className="mt-3 flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {areas.map(([k, l]) => <button key={k} type="button" aria-current={area === k ? 'page' : undefined} onClick={() => setArea(k)} data-testid={`nav-${k}`} className={`min-h-11 shrink-0 rounded-xl px-3 text-left text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#36E0D0] ${area === k ? 'bg-[#F2B632] text-[#070B1F]' : 'border border-white/10 bg-[#0C1536] hover:bg-white/10'}`}>{l}</button>)}
        </nav>
      </aside>
      <div className="min-w-0" key={rk}>
        <h1 ref={h1} tabIndex={-1} className="display mb-3 text-2xl font-extrabold tracking-tight outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#36E0D0]" data-testid="text-area-title">{areas.find(a => a[0] === area)?.[1]}</h1>
        {state.error && <div role="alert" className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#FF8A45]/60 bg-[#FF8A45]/10 p-3 text-sm"><span>{tx(state.error)}</span><Btn tone="ghost" onClick={() => dispatch({ type: 'CLEAR_ERROR' })}>{x('Entendi', 'Dismiss', 'Entendido')}</Btn></div>}
        {area === 'home' && <Dashboard state={state} dispatch={dispatch} go={setArea} />}
        {area === 'central' && <Central state={state} dispatch={dispatch} />}
        {area === 'live' && <Live state={state} dispatch={dispatch} />}
        {area === 'rounds' && <Rounds state={state} dispatch={dispatch} />}
        {area === 'treasury' && <Treasury state={state} dispatch={dispatch} />}
        {area === 'transparency' && <Transparency state={state} dispatch={dispatch} />}
        {area === 'community' && <Community state={state} dispatch={dispatch} />}
        {area === 'history' && <History state={state} dispatch={dispatch} />}
        {area === 'profile' && <Profile state={state} dispatch={dispatch} />}
      </div>
    </div>
  </main>;
}
export default DemoPage;
