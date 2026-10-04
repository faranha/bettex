/** @jsxImportSource react */
import { useState, type Dispatch } from 'react';
import { Heart, Send } from 'lucide-react';
import type { DemoAction, DemoState } from './types';
import { RefDetail } from './Operations';
import { Btn, Panel, field, useX, Example } from './ui';

export function Chat({ state, dispatch, compact }: { state: DemoState; dispatch: Dispatch<DemoAction>; compact?: boolean }) {
  const { x, tx } = useX();
  const [text, setText] = useState('');
  const [ref, setRef] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const send = () => { if (!text.trim()) return; dispatch({ type: 'MESSAGE', text: text.trim(), reference: ref || undefined }); setText(''); setRef(''); };
  const who = (a: string) => a === 'participant' ? x('Você', 'You', 'Tú') : a === 'system' ? x('Sistema', 'System', 'Sistema') : x('Exemplo', 'Example', 'Ejemplo');
  return <Panel title={x('Chat geral', 'General chat', 'Chat general')} tag={x('Mesmo chat em todas as áreas', 'Same chat in every area', 'El mismo chat en todas las áreas')}>
    <p className="mb-2 text-[11px] text-[#9AA9D6]">{x('Mensagens preparadas são exemplos, não pessoas conectadas. Conversar não comanda os agentes.', 'Prepared messages are examples, not connected people. Chatting does not command the agents.', 'Los mensajes preparados son ejemplos, no personas conectadas. Conversar no comanda a los agentes.')} <Example /></p>
    <ul className={`grid gap-2 overflow-y-auto pr-1 ${compact ? 'max-h-64' : 'max-h-96'}`} aria-live="polite" data-testid="chat-list">
      {state.messages.map(m => <li key={m.id} className={`rounded-xl border p-2.5 text-sm ${m.author === 'participant' ? 'border-[#2B59FF]/50 bg-[#2B59FF]/15' : 'border-white/10 bg-[#070B1F]/60'}`}>
        <p className="mono text-[10px] uppercase tracking-wider text-[#8FA8F0]">{who(m.author)} · T+{m.time}h</p>
        <p className="mt-1">{tx(m.text)}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">{m.reference && <button type="button" aria-expanded={open === m.reference} onClick={() => setOpen(open === m.reference ? null : m.reference!)} className="mono rounded bg-white/10 px-1.5 py-0.5 text-[10px] underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#36E0D0]">{x('Ref.', 'Ref.', 'Ref.')} {m.reference}</button>}
          <button type="button" aria-pressed={m.reacted} onClick={() => dispatch({ type: 'REACTION', id: m.id })} className="inline-flex min-h-8 items-center gap-1 rounded-full border border-white/20 px-2.5 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#36E0D0]" aria-label={x('Reagir', 'React', 'Reaccionar')}><Heart className="h-3 w-3" aria-hidden="true" fill={m.reacted ? '#E56B9A' : 'none'} />{m.reactions}</button></div>
      </li>)}
    </ul>
    {open && <div className="mt-3"><RefDetail reference={open} state={state} /><Btn tone="ghost" onClick={() => setOpen(null)}>{x('Fechar detalhe', 'Close detail', 'Cerrar detalle')}</Btn></div>}
    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
      <input className={field} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={x('Escreva uma mensagem local', 'Write a local message', 'Escriba un mensaje local')} aria-label={x('Mensagem', 'Message', 'Mensaje')} data-testid="input-message" />
      <select className={field} value={ref} onChange={e => setRef(e.target.value)} aria-label={x('Referenciar operação', 'Reference an operation', 'Referenciar operación')}><option value="">{x('Sem referência', 'No reference', 'Sin referencia')}</option>{state.operations.map(o => <option key={o.id} value={o.id}>{o.id}</option>)}</select>
      <Btn testid="button-send-message" onClick={send} disabled={!text.trim()}><Send className="h-3.5 w-3.5" aria-hidden="true" />{x('Enviar', 'Send', 'Enviar')}</Btn>
    </div>
  </Panel>;
}
