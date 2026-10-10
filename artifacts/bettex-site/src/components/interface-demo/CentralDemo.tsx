/** @jsxImportSource react */
import { useState } from 'react';
import { useFmt, card } from '../alpha-trading/format';
import { CentralAgents } from './CentralAgents';
import { CentralBettex } from './CentralBettex';
import { CentralCapital, CentralForecast } from './CentralCapital';
import { RecordsSection, Journey } from './CentralRecords';
import { MockCentralPanel } from './MockCentralPanel';
import { SPEC_NOTE } from './central-copy';

/** Full BETTEX AI Center as a local visual demo: fixture-driven, no queries, timers or writes. */
export function CentralDemo({ onAction }: { onAction: () => void }) {
  const { x } = useFmt();
  const [jid, setJid] = useState<string | null>(null);
  return <div className="grid min-w-0 gap-4" data-testid="alpha-trading">
    <div><h1 className="display text-2xl font-extrabold">{x('Central da IA', 'AI Center', 'Central de IA')}</h1>
      <p className="mt-1 text-sm text-[#5B6B85]">{x('Do sinal à decisão: pedidos, execução e acompanhamento das posições.', 'From signal to decision: requests, execution and position monitoring.', 'De la señal a la decisión: pedidos, ejecución y seguimiento de posiciones.')}</p>
      <p className="mt-2 rounded-xl border border-[#C9A227]/60 bg-[#FBF0D6] p-2 text-xs font-bold text-[#7A5410]" data-testid="central-demo-note">{SPEC_NOTE(x)}</p></div>
    <section className={card} data-testid="section-bettex-orchestration" aria-labelledby="h-bettex"><h2 id="h-bettex" className="sr-only">BETTEX</h2>
      <div className="grid gap-3">
        <CentralBettex onAction={onAction} />
        <CentralAgents scope="orchestrator" onAction={onAction} />
        <RecordsSection views={['opportunities', 'decisions']} onJourney={setJid} onAction={onAction}
          title={x('Pedidos recebidos, comparações e decisões', 'Received requests, comparisons and decisions', 'Pedidos recibidos, comparaciones y decisiones')}
          intro={x('Pedidos do agente Cripto e seus especialistas, comparados e encaminhados pela BETTEX.', 'Requests from the Crypto agent and its specialists, compared and routed by BETTEX.', 'Pedidos del agente Cripto y sus especialistas, comparados y encaminados por BETTEX.')} />
        <div className="flex flex-wrap gap-2">
          <button type="button" data-demo-action data-testid="button-submit-proposal" onClick={onAction} className="min-h-11 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white">{x('Enviar proposta', 'Submit proposal', 'Enviar propuesta')}</button>
          <button type="button" data-demo-action data-testid="button-run-decision" onClick={onAction} className="min-h-11 rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657]">{x('Registrar decisão', 'Register decision', 'Registrar decisión')}</button>
          <button type="button" data-demo-action data-testid="button-run-inference" onClick={onAction} className="min-h-11 rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657]">{x('Executar análise', 'Run inference', 'Ejecutar análisis')}</button></div>
        {jid && <Journey key={jid} id={jid} onClose={() => setJid(null)} />}
      </div></section>
    <section className={card} data-testid="section-active-agents"><CentralAgents scope="agents" onAction={onAction} /></section>
    <CentralForecast />
    <CentralCapital onAction={onAction} />
    <section className={card} data-testid="section-execution-records">
      <RecordsSection views={['orders', 'positions', 'closed']} onJourney={setJid} onAction={onAction}
        title={x('Registros de execução: ordens e posições', 'Execution records: orders and positions', 'Registros de ejecución: órdenes y posiciones')}
        intro={x('Ordens e posições são registros de execução, separados dos pedidos e decisões acima.', 'Orders and positions are execution records, separate from the requests and decisions above.', 'Órdenes y posiciones son registros de ejecución, separados de los pedidos y decisiones anteriores.')} />
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" data-demo-action data-testid="button-place-order" onClick={onAction} className="min-h-11 rounded-xl border border-[#0E7C6B] px-4 text-sm font-bold text-[#0A6657]">{x('Enviar ordem', 'Place order', 'Enviar orden')}</button>
        <button type="button" data-demo-action data-testid="button-cancel-order" onClick={onAction} className="min-h-11 rounded-xl border border-[#E4DCCB] px-4 text-sm font-bold">{x('Cancelar ordem', 'Cancel order', 'Cancelar orden')}</button></div></section>
    <details className={card} data-testid="section-operational-controls"><summary className="min-h-11 cursor-pointer py-2 font-bold">{x('Controles operacionais (não são agentes)', 'Operational controls (not agents)', 'Controles operativos (no son agentes)')}</summary>
      <div className="mt-2"><CentralAgents scope="controls" onAction={onAction} /></div></details>
    <section className={card} data-testid="section-markets"><h2 className="display text-lg font-extrabold">{x('Mercados', 'Markets', 'Mercados')}</h2>
      <div className="mt-3"><MockCentralPanel embedded onAction={onAction} /></div></section>
  </div>;
}
