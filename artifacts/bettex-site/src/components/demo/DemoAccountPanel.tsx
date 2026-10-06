/** @jsxImportSource react */
import { useState } from 'react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { Download } from 'lucide-react';
import { useX } from './ui';
import { Money, ProfileSheet, type Asset, type Kind } from './fin';
import { WalletAction } from './WalletAction';
import { History } from './Views';
import { DemoWalletsCard } from './DemoWalletsCard';

type Tab = 'profile' | 'wallets' | 'operations' | 'security' | 'history';
const tabs: Tab[] = ['profile', 'wallets', 'operations', 'security', 'history'];
const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0E7C6B] bg-white px-4 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5]';

function initialTab(): Tab {
  if (typeof window === 'undefined') return 'profile';
  const t = new URLSearchParams(window.location.search).get('tab');
  return tabs.includes(t as Tab) ? (t as Tab) : 'profile';
}

export function DemoAccountPanel({ d, onWallet }: { d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void }) {
  const { x, loc } = useX();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [edit, setEdit] = useState(false);
  const p = d.profile; const b = d.balances;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const since = new Date(p.memberSince).toLocaleDateString(fl, { dateStyle: 'long' });
  const labels: Record<Tab, string> = {
    profile: x('Perfil', 'Profile', 'Perfil'), wallets: x('Carteiras', 'Wallets', 'Carteras'),
    operations: x('Operações', 'Operations', 'Operaciones'), security: x('Segurança', 'Security', 'Seguridad'), history: x('Histórico', 'History', 'Historial'),
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ profile: d.profile, balances: d.balances, history: d.history, exportedAt: new Date().toISOString(), note: 'demo-simulation' }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'bettex-demo-account.json'; a.click(); URL.revokeObjectURL(url);
  };
  const rows: [string, string, string][] = [
    ['name', x('Nome', 'Name', 'Nombre'), p.name], ['email', x('E-mail', 'Email', 'Correo electrónico'), p.email],
    ['id', x('ID da conta', 'Account ID', 'ID de cuenta'), p.accountId], ['since', x('Membro desde', 'Member since', 'Miembro desde'), since],
  ];
  const ops: [Kind, Asset, string, string][] = [
    ['onramp', 'USDC', 'add-credit', x('Adicionar crédito', 'Add credit', 'Agregar crédito')],
    ['withdraw', 'USDC', 'withdraw-usdc', x('Sacar dólares para carteira cripto', 'Withdraw dollars to crypto wallet', 'Retirar dólares a cartera cripto')],
    ['swap', 'USDC', 'swap-usdc', x('Converter USDC em BETTEX', 'Convert USDC to BETTEX', 'Convertir USDC en BETTEX')],
    ['receive', 'BETTEX', 'add-bettex', x('Adicionar BETTEX', 'Add BETTEX', 'Agregar BETTEX')],
    ['send', 'BETTEX', 'send-bettex', x('Transferir BETTEX para carteira externa', 'Transfer BETTEX to external wallet', 'Transferir BETTEX a cartera externa')],
    ['swap', 'BETTEX', 'swap-bettex', x('Converter BETTEX em USDC', 'Convert BETTEX to USDC', 'Convertir BETTEX en USDC')],
  ];
  return <div className="grid gap-4" data-testid="demo-account-panel">
    <header className="dcard p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="display text-lg font-extrabold">{x('Minha conta de demonstração', 'My demo account', 'Mi cuenta de demostración')}</h2>
        <span data-testid="badge-test-session" className="rounded-full bg-[#DDEBE4] px-2.5 py-0.5 text-xs font-bold text-[#0A6657]">{x('SESSÃO DE TESTE', 'TEST SESSION', 'SESIÓN DE PRUEBA')}</span>
      </div>
      <p className="mt-1 text-xs text-[#5B6B85]">{x('Período de teste · ALFA · sem dinheiro real. Saldos e movimentos são emulados.', 'Test period · ALFA · no real money. Balances and movements are emulated.', 'Período de prueba · ALFA · sin dinero real. Saldos y movimientos son emulados.')}</p>
    </header>
    <div role="tablist" className="flex gap-1 overflow-x-auto rounded-2xl bg-[#F0E9DA] p-1">
      {tabs.map(t => <button key={t} role="tab" type="button" aria-selected={tab === t} data-testid={`tab-demo-${t}`} onClick={() => setTab(t)}
        className={`min-h-11 flex-1 whitespace-nowrap rounded-xl px-3 text-sm font-bold ${tab === t ? 'bg-[#0E7C6B] text-white' : 'text-[#1B2A41]'}`}>{labels[t]}</button>)}
    </div>
    {tab === 'profile' && <section className="dcard p-4 sm:p-5" data-testid="demo-tab-profile">
      <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">{rows.map(([k, l, v]) => <div key={k} className="contents"><dt className="text-[#5B6B85]">{l}</dt><dd className="min-w-0 break-all font-bold" data-testid={`text-demo-${k}`}>{v}</dd></div>)}
        <dt className="text-[#5B6B85]">{x('Acesso', 'Access', 'Acceso')}</dt><dd className="font-bold">{x('Sessão de teste ativa', 'Active test session', 'Sesión de prueba activa')}</dd></dl>
      <button type="button" data-testid="button-edit-name" onClick={() => setEdit(true)} className={`${btn} mt-4`}>{x('Editar nome', 'Edit name', 'Editar nombre')}</button>
      <ProfileSheet open={edit} d={d} onClose={() => setEdit(false)} />
    </section>}
    {tab === 'wallets' && <div data-testid="demo-tab-wallets"><DemoWalletsCard d={d} onWallet={onWallet} /></div>}
    {tab === 'operations' && <section className="dcard p-4 sm:p-5" data-testid="demo-tab-operations">
      <div className="grid gap-3 sm:grid-cols-2">
        {(['USDC', 'BETTEX'] as Asset[]).map(a => <div key={a} className="rounded-2xl bg-[#F5F1E8] p-3"><p className="text-xs font-semibold text-[#5B6B85]">{a === 'USDC' ? x('Saldo em dólares', 'Dollar balance', 'Saldo en dólares') : x('Saldo em BETTEX', 'BETTEX balance', 'Saldo en BETTEX')}</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-2"><Money v={a === 'USDC' ? b.usdc : b.bettex} a={a} big />
            <div className="flex gap-2">{ops.filter(o => o[1] === a).map(([k, as, id, l]) => <WalletAction key={id} kind={k} asset={as} id={`demo-${id}`} label={l} onOpen={onWallet} />)}</div></div></div>)}
      </div>
      <p className="mt-3 text-xs text-[#5B6B85]">{x('Movimentações emuladas: nenhuma transação em blockchain real é feita.', 'Emulated movements: no real blockchain transaction is made.', 'Movimientos emulados: no se realiza ninguna transacción en blockchain real.')}</p>
    </section>}
    {tab === 'security' && <section className="dcard grid gap-3 p-4 text-sm sm:p-5" data-testid="demo-tab-security">
      <p><b>{x('Sessão de teste ativa automaticamente.', 'Test session active automatically.', 'Sesión de prueba activa automáticamente.')}</b></p>
      <p className="text-[#5B6B85]">{x('Seus dados ficam isolados neste navegador. Não há chaves reais nem senha nesta conta de demonstração.', 'Your data is isolated in this browser. There are no real keys or password in this demo account.', 'Tus datos están aislados en este navegador. No hay claves reales ni contraseña en esta cuenta de demostración.')}</p>
      <button type="button" data-testid="button-export-demo" onClick={exportJson} className={`${btn} justify-self-start`}><Download className="h-4 w-4" aria-hidden="true" />{x('Exportar dados da demonstração (JSON)', 'Export demo data (JSON)', 'Exportar datos de la demostración (JSON)')}</button>
    </section>}
    {tab === 'history' && <section className="dcard p-4 sm:p-5" data-testid="demo-tab-history"><History d={d} /></section>}
  </div>;
}
