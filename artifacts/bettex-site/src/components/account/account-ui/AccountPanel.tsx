/** @jsxImportSource react */
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useGetTestAccountSession, type TestAccountSnapshot, type PersonalTestWallet } from '@workspace/api-client-react';
import QRCode from 'qrcode';
import { Download, KeyRound, LogOut, ShieldAlert, Copy, Coins, Wallet as WalletIcon, UserRound } from 'lucide-react';
import { inp } from '@/components/demo/fin';
import { useX } from '@/components/demo/ui';
import { demoPath, demoAccountTab } from '@/components/demo/demo-navigation';
import { WalletKeyRow } from '../WalletKeyRow';
import { HistoryPanel } from '../../history/HistoryPanel';
import { PolicyAdminPanel } from '../../alpha-trading/PolicyAdminPanel';
import { NativeJourney } from './NativeJourney';
import { downloadFile, type PrivateWalletAction } from '../wallet-vault';
import {
  createTestAccount, signInTestAccount, signOutTestAccount, saveTestName,
  changeTestEmail, changeTestPassword, privateWalletAction,
} from '../test-account-client';

const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white hover:bg-[#0A6657] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]';
const btn2 = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0E7C6B] bg-white px-4 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]';
const card = 'rounded-2xl border border-[#E4DCCB] bg-white p-4';
const CONTRACT = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d';
const REVEAL_MS = 60000;

type Tab = 'policies' | 'profile' | 'wallets' | 'history';

export function AccountPanel({ onLogout, renderHistory, profileContent, walletContent }: { onLogout?: () => Promise<void>; renderHistory?: (history: ReactNode) => ReactNode; profileContent?: ReactNode; walletContent?: ReactNode } = {}) {
  const { x, loc } = useX();
  const session = useGetTestAccountSession({ query: { retry: false, queryKey: ['test-account-session'] } });
  const qc = useQueryClient();
  const refetch = session.refetch;
  // Identity or profile changed: drop every cache bound to the previous owner and refetch the active ones.
  const refresh = () => { void qc.resetQueries(); };
  const snap = session.data as TestAccountSnapshot | undefined;
  const [path, navigate] = useLocation();
  const readTab = useCallback((): Tab => {
    const detail = path.match(/\/(?:app|demo)\/(?:minha-conta|account|mi-cuenta)\/([^/]+)/)?.[1];
    const query = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('tab');
    const requested = detail ?? query;
    return requested === 'policies' ? 'policies' : demoAccountTab(path, typeof window === 'undefined' ? '' : window.location.search);
  }, [path]);
  const [tab, setTab] = useState<Tab>(readTab);
  useEffect(() => {
    const next = readTab();
    setTab(next);
    const query = new URLSearchParams(window.location.search);
    const requested = path.match(/\/(?:minha-conta|account|mi-cuenta)\/([^/]+)/)?.[1] ?? query.get('tab');
    if (requested === 'operations' || requested === 'security') {
      query.delete('tab');
      navigate(`${demoPath('account', loc)}/${next}${query.size ? `?${query}` : ''}`, { replace: true });
    }
  }, [readTab, path, loc, navigate]);
  const selectTab = (next: Tab) => {
    setTab(next);
    const query = new URLSearchParams(window.location.search);
    query.delete('tab');
    navigate(`${demoPath('account', loc)}/${next}${query.size ? `?${query}` : ''}`, { replace: true });
  };



  let body: ReactNode;
  if (session.isLoading) body = <div aria-busy="true" className="grid gap-3">{[0, 1, 2].map(i => <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#F0E9DA]" />)}</div>;
  else if (session.isError || !snap) body = <div role="alert" className={card}>
    <p className="text-sm font-semibold text-[#B4421A]">{x('Não foi possível carregar a sessão.', 'Could not load the session.', 'No se pudo cargar la sesión.')}</p>
    <button type="button" className={`${btn} mt-3`} onClick={() => void refetch()}>{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div>;
  else if (!snap.enabled) body = <div role="status" data-testid="status-unavailable" className={card}>
    <p className="text-sm font-bold">{x('Contas indisponíveis', 'Accounts unavailable', 'Cuentas no disponibles')}</p>
    <p className="mt-1 text-sm text-[#5B6B85]">{x('Este recurso não está ativo neste ambiente. Nenhuma chave é gerada.', 'This feature is not active in this environment. No keys are generated.', 'Esta función no está activa en este entorno. No se genera ninguna clave.')}</p></div>;
  else if (!snap.account) body = <Guest onDone={refresh} />;
  else body = <Signed snap={snap} tab={tab} setTab={selectTab} onDone={refresh} onLogout={onLogout} renderHistory={renderHistory} profileContent={profileContent} walletContent={walletContent} />;

  return <div data-testid="panel-account" className="grid min-w-0 content-start gap-4">
    {body}
  </div>;
}

function LocalNote() {
  const { x } = useX();
  return <p className="text-xs text-[#5B6B85]">{x('Rede', 'Network', 'Red')}: {x('EVM local · 31337', 'Local EVM · 31337', 'EVM local · 31337')}</p>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1 text-sm font-semibold">{label}{children}</label>;
}

function Guest({ onDone }: { onDone: () => void }) {
  const { x } = useX();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');
  const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const failMsg = x('Não foi possível concluir. Confira os dados e tente de novo.', 'Could not complete. Check your details and try again.', 'No se pudo completar. Revisa los datos e intenta de nuevo.');
  const valid = mode === 'signin' ? email.length > 3 && pw.length > 0
    : name.trim().length >= 2 && name.trim().length <= 60 && email.includes('@') && pw.length >= 12 && pw.length <= 128 && pw === pw2 && ok;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true); setErr('');
    try {
      if (mode === 'signup') await createTestAccount(name.trim(), email, pw, ok);
      else await signInTestAccount(email, pw);
      setPw(''); setPw2(''); onDone();
    } catch { setErr(failMsg); setPw(''); setPw2(''); } finally { setBusy(false); }
  };
  return <section className={card}>
    <div role="tablist" className="mb-4 grid grid-cols-2 gap-2">
      {(['signup', 'signin'] as const).map(m => <button key={m} type="button" role="tab" aria-selected={mode === m} data-testid={`tab-${m}`} onClick={() => { setMode(m); setErr(''); }}
        className={`min-h-11 rounded-xl text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] ${mode === m ? 'bg-[#0E7C6B] text-white' : 'bg-[#F0E9DA]'}`}>
        {m === 'signup' ? x('Criar conta', 'Create account', 'Crear cuenta') : x('Entrar', 'Sign in', 'Entrar')}</button>)}
    </div>
    <form className="grid gap-3" onSubmit={e => void submit(e)}>
      {mode === 'signup' && <Field label={x('Nome', 'Name', 'Nombre')}><input data-testid="input-name" className={inp} autoComplete="name" minLength={2} maxLength={60} value={name} onChange={e => setName(e.target.value)} /></Field>}
      <Field label={x('E-mail', 'Email', 'Correo electrónico')}><input data-testid="input-email" className={inp} type="email" autoComplete="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></Field>
      <Field label={x('Senha (mínimo 12 caracteres)', 'Password (minimum 12 characters)', 'Contraseña (mínimo 12 caracteres)')}><input data-testid="input-password" className={inp} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} maxLength={128} value={pw} onChange={e => setPw(e.target.value)} /></Field>
      {mode === 'signup' && <>
        <Field label={x('Confirmar senha', 'Confirm password', 'Confirmar contraseña')}><input data-testid="input-confirm" className={inp} type="password" autoComplete="new-password" maxLength={128} value={pw2} onChange={e => setPw2(e.target.value)} /></Field>
        {pw2 && pw !== pw2 && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{x('As senhas não coincidem.', 'Passwords do not match.', 'Las contraseñas no coinciden.')}</p>}
        <p className="rounded-xl bg-[#FFF3E3] p-3 text-xs leading-relaxed text-[#6B3A10]">{x('A BETTEX não oferece recuperação de senha nesta versão. Se você esquecer sua senha, não será possível redefini-la ou recuperar o acesso à sua conta pelo aplicativo. Seu e-mail não será confirmado e não poderá ser utilizado para recuperar sua senha. Guarde sua senha e exporte um backup seguro das suas carteiras.',
          'BETTEX does not offer password recovery in this version. If you forget your password, it will not be possible to reset it or regain access to your account through the app. Your email will not be verified and cannot be used to recover your password. Keep your password and export a secure backup of your wallets.',
          'BETTEX no ofrece recuperación de contraseña en esta versión. Si olvidas tu contraseña, no será posible restablecerla ni recuperar el acceso a tu cuenta desde la aplicación. Tu correo no será verificado y no podrá usarse para recuperar tu contraseña. Guarda tu contraseña y exporta una copia de seguridad segura de tus carteras.')}</p>
        <label className="flex items-start gap-3 text-sm"><input data-testid="check-no-recovery" type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#0E7C6B]" checked={ok} onChange={e => setOk(e.target.checked)} />
          <span>{x('Entendo que não existe recuperação de senha e que sou responsável por guardar minha senha e o backup das minhas carteiras.', 'I understand there is no password recovery and that I am responsible for keeping my password and my wallet backups.', 'Entiendo que no existe recuperación de contraseña y que soy responsable de guardar mi contraseña y la copia de seguridad de mis carteras.')}</span></label>
      </>}
      {err && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{err}</p>}
      <button type="submit" data-testid="button-submit-auth" disabled={!valid || busy} className={btn}>{busy ? x('Aguarde…', 'Please wait…', 'Espera…') : mode === 'signup' ? x('Criar conta e carteiras', 'Create account and wallets', 'Crear cuenta y carteras') : x('Entrar', 'Sign in', 'Entrar')}</button>
    </form>
  </section>;
}

function Signed({ snap, tab, setTab, onDone, onLogout, renderHistory, profileContent, walletContent }: { profileContent?: ReactNode; walletContent?: ReactNode; snap: TestAccountSnapshot; tab: Tab; setTab: (t: Tab) => void; onDone: () => void; onLogout?: () => Promise<void>; renderHistory?: (history: ReactNode) => ReactNode }) {
  const { x } = useX();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(false);
  const out = async () => { window.dispatchEvent(new Event('bettex-wallet-lock')); setBusy(true); setErr(false); try { await onLogout?.(); await signOutTestAccount(snap); onDone(); } catch { setErr(true); } finally { setBusy(false); } };
  const tabs: [Tab, string, ReactNode][] = [
    ['profile', x('Perfil', 'Profile', 'Perfil'), <UserRound key="p" className="h-4 w-4" aria-hidden="true" />],
    ['wallets', x('Minhas carteiras', 'My wallets', 'Mis carteras'), <WalletIcon key="w" className="h-4 w-4" aria-hidden="true" />],
    ['policies', x('Políticas', 'Policies', 'Políticas'), <ShieldAlert key="pl" className="h-4 w-4" aria-hidden="true" />],
    ['history', x('Histórico', 'History', 'Historial'), <Coins key="h" className="h-4 w-4" aria-hidden="true" />],
  ];
  return <div className="grid gap-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm"><span className="font-bold">{snap.account?.displayName}</span> <span className="break-all text-[#5B6B85]">{snap.account?.email}</span></p>
      <button type="button" data-testid="button-sign-out" className={btn2} disabled={busy} onClick={() => void out()}><LogOut className="h-4 w-4" aria-hidden="true" />{x('Sair', 'Sign out', 'Salir')}</button>
    </div>
    {err && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{x('Não foi possível sair. Tente de novo.', 'Could not sign out. Try again.', 'No se pudo salir. Intenta de nuevo.')}</p>}
    <div role="tablist" className="grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-2">
      {tabs.map(([k, l, ic]) => <button key={k} type="button" role="tab" aria-selected={tab === k} data-testid={`tab-${k}`} onClick={() => setTab(k)}
        className={`flex min-h-11 items-center justify-center gap-1 rounded-xl px-2 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] sm:text-sm ${tab === k ? 'bg-[#0E7C6B] text-white' : 'bg-[#F0E9DA]'}`}>{ic}{l}</button>)}
    </div>
    {tab === 'policies' && <PolicyAdminPanel />}
    {tab === 'profile' && <>{profileContent}<Profile snap={snap} onDone={onDone} /><details className={card}>
      <summary className="cursor-pointer text-sm font-bold">{x('Alterar senha', 'Change password', 'Cambiar contraseña')}</summary>
      <div className="mt-4"><Security snap={snap} onDone={onDone} /></div>
    </details></>}
    {tab === 'wallets' && <><Wallets snap={snap} />{walletContent}<LocalNote /><NativeJourney snap={snap} /></>}
    {tab === 'history' && snap.account && (renderHistory
      ? renderHistory(<HistoryPanel mode="native" accountKey={snap.account.id} csrf={snap.csrf} initialView={snap.isAdmin ? 'treasury' : undefined} />)
      : <HistoryPanel mode="native" accountKey={snap.account.id} csrf={snap.csrf} initialView={snap.isAdmin ? 'treasury' : undefined} />)}
  </div>;
}

function Profile({ snap, onDone }: { snap: TestAccountSnapshot; onDone: () => void }) {
  const { x } = useX();
  const [name, setName] = useState(snap.account?.displayName ?? '');
  const [email, setEmail] = useState(snap.account?.email ?? '');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<'' | 'ok' | 'err'>(''); const [busy, setBusy] = useState(false);
  const fail = x('Não foi possível salvar. Tente de novo.', 'Could not save. Try again.', 'No se pudo guardar. Intenta de nuevo.');
  const okm = x('Alterações salvas.', 'Changes saved.', 'Cambios guardados.');
  const run = async (f: () => Promise<unknown>) => { setBusy(true); setMsg(''); try { await f(); setMsg('ok'); onDone(); } catch { setMsg('err'); } finally { setPw(''); setBusy(false); } };
  return <section className="grid gap-4">
    <form className={`${card} grid gap-3`} onSubmit={e => { e.preventDefault(); void run(() => saveTestName(snap, name.trim())); }}>
      <Field label={x('Nome', 'Name', 'Nombre')}><input data-testid="input-profile-name" className={inp} autoComplete="name" minLength={2} maxLength={60} value={name} onChange={e => setName(e.target.value)} /></Field>
      <button type="submit" data-testid="button-save-name" className={btn} disabled={busy || name.trim().length < 2}>{x('Salvar nome', 'Save name', 'Guardar nombre')}</button>
    </form>
    <form className={`${card} grid gap-3`} onSubmit={e => { e.preventDefault(); void run(() => changeTestEmail(snap, email.trim(), pw)); }}>
      <Field label={x('Novo e-mail', 'New email', 'Nuevo correo')}><input data-testid="input-profile-email" className={inp} type="email" autoComplete="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></Field>
      <Field label={x('Senha atual', 'Current password', 'Contraseña actual')}><input data-testid="input-email-password" className={inp} type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} /></Field>
      <p className="text-xs text-[#5B6B85]">{x('O e-mail não é verificado e não serve para recuperar a senha.', 'The email is not verified and cannot recover your password.', 'El correo no se verifica y no sirve para recuperar la contraseña.')}</p>
      <button type="submit" data-testid="button-save-email" className={btn} disabled={busy || !pw || !email.includes('@')}>{x('Alterar e-mail', 'Change email', 'Cambiar correo')}</button>
    </form>
    {msg && <p role={msg === 'err' ? 'alert' : 'status'} className={`text-sm font-semibold ${msg === 'err' ? 'text-[#B4421A]' : 'text-[#0E7C6B]'}`}>{msg === 'err' ? fail : okm}</p>}
  </section>;
}

function Security({ snap, onDone }: { snap: TestAccountSnapshot; onDone: () => void }) {
  const { x } = useX();
  const [cur, setCur] = useState(''); const [nw, setNw] = useState(''); const [cf, setCf] = useState('');
  const [msg, setMsg] = useState<'' | 'ok' | 'err'>(''); const [busy, setBusy] = useState(false);
  const valid = cur.length > 0 && nw.length >= 12 && nw.length <= 128 && nw === cf;
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (!valid || busy) return;
    setBusy(true); setMsg('');
    try { await changeTestPassword(snap, cur, nw); setMsg('ok'); onDone(); } catch { setMsg('err'); }
    finally { setCur(''); setNw(''); setCf(''); setBusy(false); }
  };
  return <section className="grid gap-4">
    <div className="rounded-2xl bg-[#FFF3E3] p-4 text-sm leading-relaxed text-[#6B3A10]">
      <p className="font-bold">{x('Sem recuperação de senha', 'No password recovery', 'Sin recuperación de contraseña')}</p>
      <p className="mt-1">{x('A BETTEX não oferece recuperação de senha nesta versão. Se você esquecer sua senha, não será possível redefini-la nem recuperar a conta. Seu e-mail não é verificado. Guarde sua senha e exporte um backup seguro das suas carteiras.', 'BETTEX does not offer password recovery in this version. If you forget your password, it cannot be reset and the account cannot be recovered. Your email is not verified. Keep your password and export a secure backup of your wallets.', 'BETTEX no ofrece recuperación de contraseña en esta versión. Si la olvidas, no se puede restablecer ni recuperar la cuenta. Tu correo no se verifica. Guarda tu contraseña y exporta una copia segura de tus carteras.')}</p>
      <p className="mt-2 text-xs">{x('Aceite registrado em', 'Accepted on', 'Aceptado el')} {snap.account ? new Date(snap.account.acceptedAt).toLocaleString(undefined, { timeZone: 'America/Sao_Paulo' }) : ''} ({snap.account?.noticeVersion})</p>
      <p className="mt-2 text-xs">{x('Trocar a senha não altera as chaves nem invalida backups já exportados. Exporte um novo backup e proteja as cópias antigas.', 'Changing your password does not change the keys or invalidate previously exported backups. Export a new backup and protect old copies.', 'Cambiar la contraseña no cambia las claves ni invalida las copias ya exportadas. Exporta una nueva copia y protege las anteriores.')}</p>
    </div>
    <form className={`${card} grid gap-3`} onSubmit={e => void submit(e)}>
      <Field label={x('Senha atual', 'Current password', 'Contraseña actual')}><input data-testid="input-current-password" className={inp} type="password" autoComplete="current-password" value={cur} onChange={e => setCur(e.target.value)} /></Field>
      <Field label={x('Nova senha (mínimo 12 caracteres)', 'New password (minimum 12 characters)', 'Nueva contraseña (mínimo 12 caracteres)')}><input data-testid="input-new-password" className={inp} type="password" autoComplete="new-password" maxLength={128} value={nw} onChange={e => setNw(e.target.value)} /></Field>
      <Field label={x('Confirmar nova senha', 'Confirm new password', 'Confirmar nueva contraseña')}><input data-testid="input-confirm-new-password" className={inp} type="password" autoComplete="new-password" maxLength={128} value={cf} onChange={e => setCf(e.target.value)} /></Field>
      {cf && nw !== cf && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{x('As senhas não coincidem.', 'Passwords do not match.', 'Las contraseñas no coinciden.')}</p>}
      {msg && <p role={msg === 'err' ? 'alert' : 'status'} className={`text-sm font-semibold ${msg === 'err' ? 'text-[#B4421A]' : 'text-[#0E7C6B]'}`}>{msg === 'err' ? x('Não foi possível alterar a senha. Confira a senha atual.', 'Could not change the password. Check your current password.', 'No se pudo cambiar la contraseña. Revisa la actual.') : x('Senha alterada.', 'Password changed.', 'Contraseña cambiada.')}</p>}
      <button type="submit" data-testid="button-change-password" className={btn} disabled={!valid || busy}><KeyRound className="h-4 w-4" aria-hidden="true" />{x('Alterar senha', 'Change password', 'Cambiar contraseña')}</button>
    </form>
  </section>;
}

function Wallets({ snap }: { snap: TestAccountSnapshot }) {
  const { x } = useX();
  return <section className="grid gap-4">
    <div className={`${card} text-sm`}>
      <p className="font-bold">{x('Rede e ativo', 'Network and asset', 'Red y activo')}</p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
        <dt className="text-[#5B6B85]">{x('Redes associadas', 'Associated networks', 'Redes asociadas')}</dt><dd>{snap.wallets.some(w => w.chainIds.includes(31337)) ? 'Arbitrum Sepolia (421614) · EVM LOCAL (31337)' : 'Arbitrum Sepolia (421614)'}</dd>
        <dt className="text-[#5B6B85]">{x('Ativo', 'Asset', 'Activo')}</dt><dd>USDC {x('de teste', 'test', 'de prueba')}</dd>
        <dt className="text-[#5B6B85]">{x('USDC na Arbitrum Sepolia', 'USDC on Arbitrum Sepolia', 'USDC en Arbitrum Sepolia')}</dt><dd className="mono break-all" data-testid="text-usdc-contract">{CONTRACT}</dd>
      </dl>
      <p className="mt-2 text-xs text-[#5B6B85]">{x('Saldos e operações disponíveis abaixo; rendimentos não implementados.', 'Balances and wallet actions are available below; yields not implemented.', 'Saldos y operaciones disponibles abajo; rendimientos no implementados.')}</p>
    </div>
    {snap.wallets.map(w => <WalletCard key={w.id} w={w} snap={snap} />)}
  </section>;
}

function CopyRow({ label, value, id, filename }: { label: string; value: string; id: string; filename: string }) {
  const { x } = useX();
  const [done, setDone] = useState(false);
  return <div className="grid gap-1">
    <p className="text-xs font-bold text-[#5B6B85]">{label}</p>
    <p className="mono break-all rounded-lg bg-[#F7F2E6] p-2 text-xs" data-testid={`text-${id}`}>{value}</p>
    <div className="flex gap-2">
      <button type="button" data-testid={`button-copy-${id}`} className={btn2} onClick={() => { void navigator.clipboard.writeText(value).then(() => setDone(true)).catch(() => setDone(false)); }}><Copy className="h-4 w-4" aria-hidden="true" />{done ? x('Copiado', 'Copied', 'Copiado') : x('Copiar', 'Copy', 'Copiar')}</button>
      <button type="button" data-testid={`button-download-${id}`} className={btn2} onClick={() => downloadFile(value, filename)}><Download className="h-4 w-4" aria-hidden="true" />{x('Baixar arquivo público', 'Download public file', 'Descargar archivo público')}</button>
    </div>
  </div>;
}

function WalletCard({ w, snap }: { w: PersonalTestWallet; snap: TestAccountSnapshot }) {
  const { x } = useX();
  const [qr, setQr] = useState('');
  useEffect(() => { let live = true; QRCode.toDataURL(w.address, { margin: 1, width: 192 }).then(u => { if (live) setQr(u); }).catch(() => { if (live) setQr(''); }); return () => { live = false; }; }, [w.address]);
  const title = w.purpose === 'deposits' ? x('Carteira de depósitos', 'Deposits wallet', 'Cartera de depósitos') : x('Carteira BETTEX', 'BETTEX wallet', 'Cartera BETTEX');
  return <article className={`${card} grid gap-4`} data-testid={`card-wallet-${w.purpose}`}>
    <div className="flex items-start justify-between gap-3">
      <h2 className="display text-lg font-extrabold">{title}</h2>
      <span className="rounded-full bg-[#E9EEE5] px-2 py-1 text-xs font-bold text-[#0A6657]">{x('Carteira gerada', 'Generated wallet', 'Cartera generada')}</span>
    </div>
    <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
      <div className="grid justify-items-center gap-1">
        {qr ? <img src={qr} width={160} height={160} alt={x('QR do endereço de recebimento', 'Receiving address QR code', 'QR de la dirección de recepción')} className="rounded-lg border border-[#E4DCCB]" /> : <div className="h-40 w-40 animate-pulse rounded-lg bg-[#F0E9DA]" />}
        <p className="text-xs text-[#5B6B85]">{w.chainIds.includes(31337) ? 'Arbitrum Sepolia · EVM LOCAL 31337' : 'Arbitrum Sepolia 421614'}</p>
      </div>
      <div className="grid min-w-0 gap-3">
        <CopyRow id={`address-${w.purpose}`} label={x('Endereço de recebimento', 'Receiving address', 'Dirección de recepción')} value={w.address} filename={`bettex-${w.purpose}-address.txt`} />
        <WalletKeyRow id={`pubkey-${w.purpose}`} label={x('Chave pública (não é a chave privada)', 'Public key (not the private key)', 'Clave pública (no es la clave privada)')} value={w.publicKey} filename={`bettex-${w.purpose}-public-key.txt`} />
      </div>
    </div>
    <PrivatePanel w={w} snap={snap} />
  </article>;
}

type WalletExporter = (password: string, walletId: string, action: PrivateWalletAction, signal: AbortSignal) => Promise<string | null>;
type PrivatePanelProps = { w: PersonalTestWallet } & (
  { snap: TestAccountSnapshot; exportWallet?: never } | { snap?: never; exportWallet: WalletExporter }
);
export function PrivatePanel({ w, snap, exportWallet }: PrivatePanelProps) {
  const { x } = useX();
  const [action, setAction] = useState<PrivateWalletAction | null>(null);
  const [pw, setPw] = useState(''); const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(false); const [note, setNote] = useState('');
  const [secret, setSecret] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const operation = useRef<AbortController | null>(null);
  const hide = useCallback(() => { operation.current?.abort(); clearTimeout(timer.current); setSecret(null); setPw(''); setAck(false); setAction(null); }, []);
  useEffect(() => {
    const v = () => { if (document.visibilityState === 'hidden') hide(); };
    document.addEventListener('visibilitychange', v);
    window.addEventListener('pagehide', hide);
    window.addEventListener('bettex-wallet-lock', hide);
    return () => { operation.current?.abort(); document.removeEventListener('visibilitychange', v); window.removeEventListener('pagehide', hide); window.removeEventListener('bettex-wallet-lock', hide); clearTimeout(timer.current); };
  }, [hide]);

  const labels: Record<PrivateWalletAction, string> = {
    reveal: x('Revelar chave privada', 'Reveal private key', 'Revelar clave privada'),
    copy: x('Copiar chave privada', 'Copy private key', 'Copiar clave privada'),
    'private-download': x('Baixar chave privada sem criptografia', 'Download unencrypted private key', 'Descargar clave privada sin cifrar'),
    'encrypted-backup': x('Baixar backup criptografado (recomendado)', 'Download encrypted backup (recommended)', 'Descargar copia cifrada (recomendado)'),
  };
  const open = (a: PrivateWalletAction) => { hide(); setAction(a); setPw(''); setAck(false); setErr(false); setNote(''); };
  const cancel = () => { hide(); setAction(null); setPw(''); setAck(false); setErr(false); };
  const go = async (e: FormEvent) => {
    e.preventDefault();
    if (!action || !pw || !ack || busy) return;
    const p = pw, a = action; setPw(''); setBusy(true); setErr(false);
    const controller = new AbortController();
    operation.current = controller;
    try {
      const r = exportWallet ? await exportWallet(p, w.id, a, controller.signal) : await privateWalletAction(snap, p, w.id, a, controller.signal);
      if (controller.signal.aborted || document.visibilityState === 'hidden') return;
      if (a === 'reveal' && r) { setSecret(r); clearTimeout(timer.current); timer.current = setTimeout(hide, REVEAL_MS); setNote(''); }
      else setNote(a === 'copy' ? x('Chave copiada. Limpe a área de transferência e não cole em outros apps.', 'Key copied. Clear your clipboard and do not paste it into other apps.', 'Clave copiada. Limpia el portapapeles y no la pegues en otras apps.') : x('Download iniciado; o aplicativo não confirma que você salvou o arquivo.', 'Download started; the app does not confirm that you saved the file.', 'Descarga iniciada; la aplicación no confirma que hayas guardado el archivo.'));
      setAction(null); setAck(false);
    } catch { setErr(true); } finally { setBusy(false); }
  };
  return <div className="grid gap-3 rounded-xl border border-[#E7B98A] bg-[#FFFAF2] p-3" data-testid={`panel-private-${w.purpose}`}>
    <p className="flex items-center gap-2 text-sm font-bold"><ShieldAlert className="h-4 w-4 text-[#B4421A]" aria-hidden="true" />{x('Chave privada', 'Private key', 'Clave privada')}</p>
    <p className="text-xs text-[#5B6B85]">{x('Revelar a chave e exportar backups exige senha e confirmação. Revele a chave antes de copiar.', 'Revealing the key and exporting backups require your password and confirmation. Reveal the key before copying.', 'Revelar la clave y exportar copias requiere contraseña y confirmación. Revela la clave antes de copiar.')}</p>
    <WalletKeyRow id={`private-${w.purpose}`} label={x('Chave privada', 'Private key', 'Clave privada')} value={secret} revealOnValue onRequestReveal={() => open('reveal')} onHide={hide} valueTestId={`text-secret-${w.purpose}`} />
    {note && <p role="status" className="text-sm font-semibold text-[#0E7C6B]">{note}</p>}
    {!action && <div className="grid gap-2 sm:grid-cols-2">
      {(['encrypted-backup', 'private-download'] as const).map(a => <button key={a} type="button" disabled={busy} data-testid={`button-${a}-${w.purpose}`} className={a === 'encrypted-backup' ? btn : btn2} onClick={() => open(a)}>
        <Download className="h-4 w-4" aria-hidden="true" />{labels[a]}</button>)}
    </div>}
    {action && <form className="grid gap-3" onSubmit={e => void go(e)} data-testid={`form-confirm-${w.purpose}`}>
      <p className="text-sm font-bold">{labels[action]}</p>
      <div className="grid gap-2 rounded-lg bg-[#FDE9DD] p-3 text-xs leading-relaxed text-[#5C2410]">
        <p>{x('Quem tem a chave privada controla a carteira. Nunca a compartilhe. A BETTEX e o suporte nunca pedem sua chave privada ou sua senha. Cuidado com falso suporte, mensagens suspeitas, acesso remoto, capturas de tela e compartilhamento de tela. Guarde seu próprio backup e seus segredos: a senha não pode ser redefinida.', 'Whoever has the private key controls the wallet. Never share it. BETTEX and support never ask for your private key or password. Beware of fake support, suspicious messages, remote access, screenshots and screen sharing. Keep your own backup and secrets: the password cannot be reset.', 'Quien tiene la clave privada controla la cartera. Nunca la compartas. BETTEX y el soporte nunca piden tu clave privada ni tu contraseña. Cuidado con falso soporte, mensajes sospechosos, acceso remoto, capturas de pantalla y pantalla compartida. Guarda tu propia copia y tus secretos: la contraseña no se puede restablecer.')}</p>
        {action === 'copy' && <p>{x('Outros aplicativos podem ler a área de transferência.', 'Other apps can read the clipboard.', 'Otras aplicaciones pueden leer el portapapeles.')}</p>}
        {action === 'private-download' && <p>{x('Arquivo sem criptografia é perigoso: qualquer pessoa com ele controla a carteira. Prefira o backup JSON criptografado.', 'An unencrypted file is dangerous: anyone holding it controls the wallet. Prefer the encrypted JSON backup.', 'Un archivo sin cifrar es peligroso: quien lo tenga controla la cartera. Prefiere la copia JSON cifrada.')}</p>}
        {action === 'encrypted-backup' && <p>{x('O backup é um keystore JSON criptografado com sua senha. Ele permite acessar os ativos externamente, mas não restaura a conta do aplicativo nem garante posições em contratos específicos.', 'The backup is a JSON keystore encrypted with your password. It lets you reach the assets externally, but does not restore the app account nor guarantee contract-specific positions.', 'La copia es un keystore JSON cifrado con tu contraseña. Permite acceder a los activos externamente, pero no restaura la cuenta de la app ni garantiza posiciones en contratos específicos.')}</p>}
      </div>
      <Field label={x('Senha atual', 'Current password', 'Contraseña actual')}><input data-testid="input-action-password" className={inp} type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} /></Field>
      <label className="flex items-start gap-3 text-sm"><input data-testid="check-responsibility" type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#0E7C6B]" checked={ack} onChange={e => setAck(e.target.checked)} />
        <span>{x('Entendo os riscos e sou responsável pelo uso, pela guarda e por não compartilhar minhas chaves, senhas e backups.', 'I understand the risks and am responsible for using, preserving and not sharing my keys, passwords and backups.', 'Entiendo los riesgos y soy responsable del uso, la conservación y de no compartir mis claves, contraseñas y copias de seguridad.')}</span></label>
      {err && <p role="alert" className="text-sm font-semibold text-[#B4421A]">{x('Não foi possível concluir. Confira a senha e tente de novo.', 'Could not complete. Check your password and try again.', 'No se pudo completar. Revisa la contraseña e intenta de nuevo.')}</p>}
      <div className="flex gap-2">
        <button type="submit" data-testid="button-confirm-action" className={btn} disabled={!pw || !ack || busy}>{busy ? x('Aguarde…', 'Please wait…', 'Espera…') : x('Confirmar', 'Confirm', 'Confirmar')}</button>
        <button type="button" className={btn2} onClick={cancel}>{x('Cancelar', 'Cancel', 'Cancelar')}</button>
      </div>
    </form>}
  </div>;
}

export default AccountPanel;
