/** @jsxImportSource react */
import { useState } from 'react';
import { useX } from '@/components/demo/ui';
import { MOCK_WALLET_ADDRESSES } from './mock-addresses';

type Tab = 'prefs' | 'security' | 'wallet';
const btn = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[#12372A] px-4 text-sm font-bold text-[#F2C14E] hover:bg-[#0C2A1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]';
const field = 'min-h-11 w-full rounded-xl border border-[#E4DCCB] bg-white/60 px-3 text-sm text-[#12372A]';

export function MockProfilePanel({ onAction }: { onAction: () => void }) {
  const { x } = useX();
  const [tab, setTab] = useState<Tab>('prefs');
  const [lang, setLang] = useState('pt');
  const [notify, setNotify] = useState(true);
  const tabs: [Tab, string][] = [['prefs', x('Preferências', 'Preferences', 'Preferencias')], ['security', x('Segurança', 'Security', 'Seguridad')], ['wallet', x('Carteira', 'Wallet', 'Cartera')]];
  const act = (label: string) => <button type="button" data-demo-action onClick={onAction} className={btn}>{label}</button>;
  const row = (k: string, v: string) => <div className="flex justify-between gap-3 border-b border-[#E4DCCB] py-2 text-sm"><dt className="text-[#5B6B85]">{k}</dt><dd className="font-bold">{v}</dd></div>;
  return (
    <section data-testid="mock-profile-panel" className="grid min-w-0 gap-4 rounded-2xl border border-[#E4DCCB] bg-[#FBF6E9] p-4 text-[#12372A] sm:p-6">
      <header className="flex items-center gap-3">
        <div aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-[#12372A] text-lg font-extrabold text-[#F2C14E]">{x('UD', 'DU', 'UD')}</div>
        <div className="min-w-0"><h2 className="text-lg font-bold">{x('Usuário Demo', 'Demo User', 'Usuario Demo')}</h2><p className="text-xs text-[#5B6B85]">{x('Perfil fictício para demonstração', 'Fictitious profile for demonstration', 'Perfil ficticio para demostración')}</p></div>
      </header>
      <div role="tablist" className="grid grid-cols-3 gap-2">
        {tabs.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`min-h-11 rounded-xl text-sm font-bold ${tab === k ? 'bg-[#12372A] text-[#F2C14E]' : 'bg-[#F0E9DA]'}`}>{l}</button>)}
      </div>
      <div role="tabpanel" className="grid gap-3">
        {tab === 'prefs' && <>
          <label className="grid gap-1 text-sm font-bold">{x('Idioma', 'Language', 'Idioma')}
            <select value={lang} onChange={e => setLang(e.target.value)} className={field}><option value="pt">{x('Português', 'Português', 'Português')}</option><option value="en">{x('English', 'English', 'English')}</option><option value="es">{x('Español', 'Español', 'Español')}</option></select>
          </label>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} className="h-4 w-4" />{x('Avisos por e-mail', 'Email notices', 'Avisos por correo')}</label>
          {act(x('Salvar preferências', 'Save preferences', 'Guardar preferencias'))}
        </>}
        {tab === 'security' && <>
          <dl>{row(x('Verificação em duas etapas', 'Two-step verification', 'Verificación en dos pasos'), x('Desativada', 'Off', 'Desactivada'))}{row(x('Último acesso', 'Last access', 'Último acceso'), '—')}</dl>
          {act(x('Ativar verificação', 'Enable verification', 'Activar verificación'))}
          {act(x('Alterar senha', 'Change password', 'Cambiar contraseña'))}
        </>}
        {tab === 'wallet' && <>
          <dl>{row(x('Saldo de exemplo', 'Sample balance', 'Saldo de ejemplo'), 'R$ 1.250,00')}{row(x('Carteira fictícia', 'Fictitious wallet', 'Cartera ficticia'), MOCK_WALLET_ADDRESSES.USDC)}</dl>
          <p className="text-xs text-[#5B6B85]">{x('Endereço mock. Sem rede, conexão de carteira ou depósitos.', 'Mock address. No network, wallet connection or deposits.', 'Dirección mock. Sin red, conexión de cartera ni depósitos.')}</p>
          {act(x('Registrar carteira', 'Register wallet', 'Registrar cartera'))}
          {act(x('Exportar relatório', 'Export report', 'Exportar informe'))}
          {act(x('Fazer depósito', 'Make deposit', 'Hacer depósito'))}
        </>}
      </div>
    </section>
  );
}
export default MockProfilePanel;
