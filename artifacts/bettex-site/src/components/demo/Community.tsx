/** @jsxImportSource react */
import type { Dispatch } from 'react';
import type { DemoAction, DemoState } from './types';
import { Chat } from './Chat';
import { Btn, Panel, useX, Example } from './ui';

export function Community({ state, dispatch }: { state: DemoState; dispatch: Dispatch<DemoAction> }) {
  const { x, n } = useX();
  const { votes, selected, closed } = state.poll;
  const total = votes.reduce((a, b) => a + b, 0);
  const opts = [x('Mais detalhes por operação', 'More detail per operation', 'Más detalle por operación'), x('Resumo diário mais curto', 'Shorter daily summary', 'Resumen diario más corto'), x('Nova visão de tokenomics', 'New tokenomics view', 'Nueva vista de tokenomics')];
  return <div className="grid gap-4 lg:grid-cols-2">
    <Chat state={state} dispatch={dispatch} />
    <Panel title={x('Enquete consultiva', 'Advisory poll', 'Encuesta consultiva')} tag={closed ? x('Encerrada', 'Closed', 'Cerrada') : x('Aberta', 'Open', 'Abierta')}>
      <p className="mb-3 text-sm">{x('O que a comunidade quer ver melhor na demonstração?', 'What should the community see better in the demo?', '¿Qué quiere ver mejor la comunidad en la demostración?')}</p>
      <ul className="grid gap-2">{opts.map((o, i) => <li key={i}><button type="button" disabled={closed || selected !== null} aria-pressed={selected === i} onClick={() => dispatch({ type: 'VOTE', option: i })} className={`relative w-full overflow-hidden rounded-xl border p-3 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#36E0D0] disabled:cursor-default ${selected === i ? 'border-[#36E0D0]' : 'border-white/15'}`}><span className="absolute inset-y-0 left-0 bg-[#2B59FF]/30" style={{ width: `${total ? (votes[i] / total) * 100 : 0}%` }} /><span className="relative flex justify-between gap-2"><span>{o}</span><span className="mono">{votes[i]} · {n(total ? (votes[i] / total) * 100 : 0, 1)}%</span></span></button></li>)}</ul>
      <div className="mt-3 flex flex-wrap gap-2"><Btn testid="button-close-poll" tone="ghost" disabled={closed} onClick={() => dispatch({ type: 'CLOSE_POLL' })}>{x('Encerrar enquete (evento preparado)', 'Close poll (prepared event)', 'Cerrar encuesta (evento preparado)')}</Btn></div>
      <p className="mt-3 text-xs text-[#9AA9D6]">{x('Consultiva: votos não determinam investimentos nem substituem a liderança. Contagens são exemplos. Reiniciar a simulação reabre a enquete.', 'Advisory: votes do not decide investments or replace leadership. Counts are examples. Resetting the simulation reopens the poll.', 'Consultiva: los votos no determinan inversiones ni sustituyen a la dirección. Los conteos son ejemplos. Reiniciar la simulación reabre la encuesta.')} <Example /></p>
    </Panel>
  </div>;
}
