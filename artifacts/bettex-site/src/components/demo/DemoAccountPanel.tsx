/** @jsxImportSource react */
import { useState } from 'react';
import type { DemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { ProfileIdentitySummary } from '../account/ProfileIdentityEditor';
import { EditProfileSheet } from '../account/EditProfileSheet';

const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0E7C6B] bg-white px-4 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5]';

export function DemoAccountPanel({ d }: { d: DemoDashboard }) {
  const { x, loc } = useX();
  const [edit, setEdit] = useState(false);
  const p = d.profile;
  const fl = loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES';
  const since = new Date(p.memberSince).toLocaleDateString(fl, { dateStyle: 'long' });
  const rows: [string, string, string][] = [
    ['name', x('Nome', 'Name', 'Nombre'), p.name], ['email', x('E-mail', 'Email', 'Correo electrónico'), p.email],
    ['id', x('ID da conta', 'Account ID', 'ID de cuenta'), p.accountId], ['since', x('Membro desde', 'Member since', 'Miembro desde'), since],
  ];
  return <div className="grid gap-4" data-testid="demo-account-panel">
    <h1 className="display text-xl font-extrabold">{x('Perfil', 'Profile', 'Perfil')}</h1>
    <section className="dcard p-4 sm:p-5" data-testid="demo-tab-profile">
      <ProfileIdentitySummary d={d} />
      <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">{rows.map(([k, l, v]) => <div key={k} className="contents"><dt className="text-[#5B6B85]">{l}</dt><dd className="min-w-0 break-all font-bold" data-testid={`text-demo-${k}`}>{v}</dd></div>)}
        <dt className="text-[#5B6B85]">{x('Acesso', 'Access', 'Acceso')}</dt><dd className="font-bold">{x('Sessão ativa', 'Active session', 'Sesión activa')}</dd></dl>
      <button type="button" data-testid="button-edit-name" onClick={() => setEdit(true)} className={`${btn} mt-4`}>{x('Editar perfil', 'Edit profile', 'Editar perfil')}</button>
      <EditProfileSheet open={edit} d={d} onClose={() => setEdit(false)} />
    </section>
  </div>;
}
