/** @jsxImportSource react */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { demoAccountTab, demoPath, type DemoAccountTab } from './demo-navigation';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { ProfileSheet, type Asset, type Kind } from './fin';
import { WalletPage } from './WalletPage';
import { ProfileIdentityEditor } from '../account/ProfileIdentityEditor';
import { ProtectedDemoWallets } from '../account/ProtectedDemoWallets';
import { StakingCorridor } from './StakingCorridor';

type Tab = DemoAccountTab;
const tabs: Tab[] = ['profile', 'wallets', 'history'];
const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0E7C6B] bg-white px-4 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5]';

function initialTab(): Tab {
  if (typeof window === 'undefined') return 'profile';
  return demoAccountTab(window.location.pathname, window.location.search);
}

export function DemoAccountPanel({ d, onWallet }: { d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void }) {
  const { x, loc } = useX();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [path, navigate] = useLocation();
  const tablist = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const next = initialTab();
    setTab(next);
    const query = new URLSearchParams(window.location.search);
    const requested = path.match(/\/(?:minha-conta|account|mi-cuenta)\/([^/]+)/)?.[1] ?? query.get('tab');
    if (requested === 'operations' || requested === 'security') {
      query.delete('tab');
      navigate(`${demoPath('account', loc)}/${next}${query.size ? `?${query}` : ''}`, { replace: true });
    }
  }, [path, loc, navigate]);
  useEffect(() => {
    tablist.current?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [tab]);
  const [edit, setEdit] = useState(false);
  const p = d.profile;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const since = new Date(p.memberSince).toLocaleDateString(fl, { dateStyle: 'long' });
  const labels: Record<Tab, string> = {
    profile: x('Perfil', 'Profile', 'Perfil'), wallets: x('Carteiras', 'Wallets', 'Carteras'),
    history: x('Histórico', 'History', 'Historial'),
  };
  const rows: [string, string, string][] = [
    ['name', x('Nome', 'Name', 'Nombre'), p.name], ['email', x('E-mail', 'Email', 'Correo electrónico'), p.email],
    ['id', x('ID da conta', 'Account ID', 'ID de cuenta'), p.accountId], ['since', x('Membro desde', 'Member since', 'Miembro desde'), since],
  ];
  return <div className="grid gap-4" data-testid="demo-account-panel">
    <header className="dcard p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="display text-lg font-extrabold">{x('Minha conta', 'My account', 'Mi cuenta')}</h2>
      </div>
    </header>
    <div ref={tablist} role="tablist" className="flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-2xl bg-[#F0E9DA] p-1">
      {tabs.map(t => <button key={t} role="tab" type="button" aria-selected={tab === t} data-testid={`tab-demo-${t}`} onClick={() => {
        setTab(t);
        const query = new URLSearchParams(window.location.search);
        query.delete('tab');
        navigate(`${demoPath('account', loc)}/${t}${query.size ? `?${query}` : ''}`, { replace: true });
      }}
        className={`min-h-11 flex-1 whitespace-nowrap rounded-xl px-3 text-sm font-bold ${tab === t ? 'bg-[#0E7C6B] text-white' : 'text-[#1B2A41]'}`}>{labels[t]}</button>)}
    </div>
    {tab === 'profile' && <section className="dcard p-4 sm:p-5" data-testid="demo-tab-profile">
      <ProfileIdentityEditor d={d} />
      <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">{rows.map(([k, l, v]) => <div key={k} className="contents"><dt className="text-[#5B6B85]">{l}</dt><dd className="min-w-0 break-all font-bold" data-testid={`text-demo-${k}`}>{v}</dd></div>)}
        <dt className="text-[#5B6B85]">{x('Acesso', 'Access', 'Acceso')}</dt><dd className="font-bold">{x('Sessão ativa', 'Active session', 'Sesión activa')}</dd></dl>
      <button type="button" data-testid="button-edit-name" onClick={() => setEdit(true)} className={`${btn} mt-4`}>{x('Editar perfil', 'Edit profile', 'Editar perfil')}</button>
      <ProfileSheet open={edit} d={d} onClose={() => setEdit(false)} />
    </section>}
    {tab === 'wallets' && <div className="grid gap-4" data-testid="demo-tab-wallets"><ProtectedDemoWallets key={p.accountId} d={d} onWallet={onWallet} /><StakingCorridor d={d} /></div>}
    {tab === 'history' && <div data-testid="demo-tab-history"><WalletPage d={d} /></div>}
  </div>;
}
