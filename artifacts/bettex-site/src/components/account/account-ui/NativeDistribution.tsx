/** @jsxImportSource react */
import { useRef, useState } from 'react';
import type { NativeTestJourney, TestAccountSnapshot } from '@workspace/api-client-react';
import { formatUnits } from 'ethers';
import { useX } from '@/components/demo/ui';
import { requestNativeDistribution } from '../native-journey-client';

export function NativeDistribution({ j, snap, onJourney }: {
  j: NativeTestJourney; snap: TestAccountSnapshot; onJourney: (j: NativeTestJourney) => void;
}) {
  const { x } = useX();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const locked = useRef(false);
  const run = async () => {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError('');
    try { onJourney(await requestNativeDistribution(snap)); }
    catch { setError(x('Não confirmado. Atualize ou retome a mesma rodada; não há reenvio automático.', 'Not confirmed. Refresh or resume the same round; there is no automatic resend.', 'No confirmado. Actualiza o reanuda la misma ronda; no hay reenvío automático.')); }
    finally { locked.current = false; setBusy(false); }
  };
  const s = j.settlement;
  const state = s.ownState === 'paid' ? x('Recebido', 'Received', 'Recibido')
    : s.ownState === 'not_started' ? x('Não iniciada', 'Not started', 'No iniciada')
    : s.ownState === 'not_eligible' ? x('Sem peso elegível nesta apuração', 'No eligible weight in this assessment', 'Sin peso elegible en este cálculo')
    : ['cancelled', 'expired'].includes(s.ownState) ? x('Direito encerrado', 'Entitlement closed', 'Derecho cerrado')
    : x('Pendente de confirmação', 'Awaiting confirmation', 'Pendiente de confirmación');
  return <section className="rounded-2xl border border-[#E4DCCB] bg-white p-4" data-testid="native-distribution">
    <h2 className="display text-lg font-extrabold">{x('Distribuição de teste', 'Test distribution', 'Distribución de prueba')}</h2>
    <p className="mt-2 text-xs text-[#5B6B85]">{x('Resultado sintético limitado a 1 USDC TESTE por rodada. Transferências reais na EVM local, sem lucro de trading real.', 'Synthetic result limited to 1 USDC TESTE per round. Actual transfers on the local EVM, with no real trading profit.', 'Resultado sintético limitado a 1 USDC TESTE por ronda. Transferencias reales en la EVM local, sin beneficio de trading real.')}</p>
    <p className="my-3 text-sm font-semibold" data-testid="native-distribution-state">{state} · {formatUnits(BigInt(s.ownUnits), 6)} USDC TESTE</p>
    {s.ownTransactionHash && <p className="mono mb-3 break-all text-xs" data-testid="native-distribution-hash">{s.ownTransactionHash}</p>}
    {error && <p role="alert" className="mb-3 text-sm text-[#B4421A]">{error}</p>}
    <button type="button" data-testid="button-native-distribution" disabled={busy || BigInt(j.balances.bettex) === 0n}
      className="min-h-11 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white disabled:opacity-50"
      onClick={() => void run()}>{busy ? x('Aguarde…', 'Please wait…', 'Espera…') : x('Executar / retomar rodada de teste', 'Execute / resume test round', 'Ejecutar / reanudar ronda de prueba')}</button>
  </section>;
}
