/** @jsxImportSource react */
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from '../demo/ui';
import { Money } from '../demo/fin';
import { openDemoNotice } from './runtime';
import { MOCK_TREASURY_ADDRESSES } from './mock-addresses';

export function MockTreasuryPanel({ d }: { d: DemoDashboard }) {
  const { x } = useX();
  const t = d.treasury;
  const cards = [
    { id: 'operational', label: x('Operacional', 'Operational', 'Operativa'), value: t.assetsUsdc - t.reserveUsdc },
    { id: 'reserve', label: x('Reserva', 'Reserve', 'Reserva'), value: t.reserveUsdc },
    { id: 'buyback', label: x('Recompra e queima', 'Buyback and burn', 'Recompra y quema'), value: Math.max(0, t.cycleResultUsdc) * .25 },
  ];
  return <section className="dcard grid gap-4 p-4 sm:p-5" data-testid="page-treasury-mock">
    <h1 className="display text-xl font-extrabold">{x('Tesouraria', 'Treasury', 'Tesorería')}</h1>
    <p className="text-xs text-[#5B6B85]">{x('Saldos, carteiras e resultados ilustrativos. Sem rede blockchain ou fundos reais.', 'Illustrative balances, wallets and results. No blockchain network or real funds.', 'Saldos, carteras y resultados ilustrativos. Sin red blockchain ni fondos reales.')}</p>
    <div className="grid gap-3 sm:grid-cols-3">{cards.map(c => <article key={c.id} className="grid gap-3 rounded-xl border border-[#E4DCCB] bg-[#FFFCF6] p-4">
      <h2 className="text-sm font-bold">{c.label}</h2><Money v={c.value} a="USDC" big />
      <details><summary className="min-h-11 cursor-pointer py-3 text-xs font-bold text-[#0A6657]">{x('Ver detalhes', 'View details', 'Ver detalles')}</summary><p className="break-all font-mono text-xs" data-testid={`mock-treasury-address-${c.id}`}>{MOCK_TREASURY_ADDRESSES[c.id as keyof typeof MOCK_TREASURY_ADDRESSES]}</p><p className="text-xs text-[#5B6B85]">{x('Carteira fictícia para apresentação da interface. Não recebe depósitos.', 'Fictitious wallet for presenting the interface. It does not accept deposits.', 'Cartera ficticia para presentar la interfaz. No acepta depósitos.')}</p></details>
      <button data-demo-action onClick={openDemoNotice} className="min-h-11 rounded-xl border border-[#E4DCCB] px-3 text-sm font-bold">{x('Gerar transação', 'Generate transaction', 'Generar transacción')}</button>
    </article>)}</div>
    <div className="grid gap-3 rounded-xl bg-[#E6F4EE] p-4 sm:grid-cols-3">
      <div><p className="text-xs font-bold">{x('Lucro líquido', 'Net profit', 'Beneficio neto')}</p><Money v={t.cycleResultUsdc} a="USDC" big /></div>
      <div><p className="text-xs font-bold">{x('Alocação pool', 'Pool allocation', 'Asignación del pool')}</p><Money v={d.staking.poolAllocationUsdc ?? 0} a="USDC" /></div>
      <div><p className="text-xs font-bold">{x('Recompra', 'Buyback', 'Recompra')}</p><Money v={Math.max(0, t.cycleResultUsdc) * .25} a="USDC" /></div>
    </div>
    <button data-demo-action onClick={openDemoNotice} className="min-h-11 justify-self-start rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white">{x('Gerar relatório da tesouraria', 'Generate treasury report', 'Generar informe de tesorería')}</button>
  </section>;
}
