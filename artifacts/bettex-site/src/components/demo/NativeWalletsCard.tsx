/** @jsxImportSource react */
import { useState } from 'react';
import { Copy, FlaskConical, Wallet } from 'lucide-react';
import { Link } from 'wouter';
import type { DemoProfile } from '@workspace/api-client-react';
import { useX } from './ui';
import { demoPath } from './demo-navigation';
import { tokenUnits, usdcUnits } from './personal-native';
import { usePersonalNative } from './use-personal-native';

const card = 'dcard p-4 sm:p-5';
function Addr({ id, value }: { id: string; value: string }) {
  const { x } = useX(); const [ok, setOk] = useState(false);
  return <div className="flex items-start gap-2"><p className="mono min-w-0 flex-1 break-all rounded-lg bg-[#F5F1E8] p-2 text-xs" data-testid={`text-wallet-address-${id}`}>{value}</p>
    <button type="button" data-testid={`button-copy-wallet-${id}`} aria-label={x('Copiar endereço', 'Copy address', 'Copiar dirección')} onClick={() => { void navigator.clipboard.writeText(value).then(() => setOk(true)).catch(() => setOk(false)); }} className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl border border-[#0E7C6B]/40 px-3 text-xs font-bold text-[#0A6657] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]"><Copy className="h-4 w-4" aria-hidden="true" />{ok ? x('Copiado', 'Copied', 'Copiado') : x('Copiar', 'Copy', 'Copiar')}</button></div>;
}
const na = (s: string | null, fallback: string) => s ?? fallback;

export function NativeWalletsCard({ profile }: { profile: DemoProfile }) {
  const { x, loc } = useX(); const p = usePersonalNative(profile); const { snap, j } = p;
  const unavail = x('indisponível', 'unavailable', 'no disponible');
  const head = <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="display flex items-center gap-2 text-lg font-extrabold"><Wallet className="h-5 w-5 text-[#0E7C6B]" aria-hidden="true" />{x('Minhas carteiras', 'My wallets', 'Mis carteras')}</h2>
    <span data-testid="label-source-native" className="rounded-full bg-[#FFF3E3] px-2.5 py-0.5 text-xs font-bold text-[#6B3A10]"><FlaskConical className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />{x('Cadeia de teste · sem valor financeiro', 'Test chain · no financial value', 'Cadena de prueba · sin valor financiero')}</span></div>;
  const manage = <Link href={`${demoPath('account', loc)}?tab=wallets`} data-testid="link-manage-wallets" className="inline-flex min-h-11 items-center rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white hover:bg-[#0A6657]">{x('Gerenciar conta, chaves e operações', 'Manage account, keys and operations', 'Gestionar cuenta, claves y operaciones')}</Link>;
  if (p.state === 'loading') return <section className={card} aria-busy="true" data-testid="native-wallets-loading">{head}<div className="mt-3 h-24 animate-pulse rounded-xl bg-[#F0E9DA]" /></section>;
  if (p.state === 'session-error') return <section className={card} role="alert" data-testid="native-wallets-error">{head}<p className="mt-2 text-sm font-semibold text-[#B4421A]">{x('Não foi possível carregar suas carteiras. Nenhum saldo é inferido.', 'Could not load your wallets. No balance is inferred.', 'No se pudieron cargar tus carteras. No se infiere ningún saldo.')}</p><button type="button" data-testid="button-retry-wallets" onClick={p.retry} className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white">{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></section>;
  if (p.state === 'unavailable') return <section className={card} data-testid="native-wallets-unavailable">{head}<p className="mt-2 text-sm text-[#5B6B85]">{x('Carteiras de teste não estão ativas neste ambiente.', 'Test wallets are not active in this environment.', 'Las carteras de prueba no están activas en este entorno.')}</p></section>;
  if (p.state === 'guest' || !snap) return <section className={card} data-testid="native-wallets-guest">{head}<p className="mt-2 text-sm text-[#5B6B85]">{x('Entre ou crie uma conta BETTEX para ver suas carteiras pessoais. Nenhum endereço é exibido antes disso.', 'Sign in or create a BETTEX account to see your personal wallets. No address is shown before that.', 'Entra o crea una cuenta BETTEX para ver tus carteras personales. No se muestra ninguna dirección antes.')}</p><div className="mt-3">{manage}</div></section>;
  const purpose = (k: string) => k === 'deposits' ? x('Carteira de depósitos (USDC de teste)', 'Deposits wallet (test USDC)', 'Cartera de depósitos (USDC de prueba)') : x('Carteira BETTEX', 'BETTEX wallet', 'Cartera BETTEX');
  const net = (ids: number[]) => ids.map(i => i === 31337 ? 'EVM LOCAL 31337' : `Arbitrum Sepolia ${i}`).join(' · ');
  const bal = (k: string) => !j ? unavail : k === 'deposits' ? `${na(usdcUnits(j.balances.usdc), unavail)} USDC` : `${na(tokenUnits(j.balances.bettex), unavail)} BETTEX`;
  const gas = (k: string) => !j ? unavail : na(tokenUnits(k === 'deposits' ? j.balances.depositGas : j.balances.bettexGas), unavail);
  return <section className={card} data-testid="native-wallets">{head}
    <p className="mt-1 text-xs text-[#5B6B85]">{x('Endereços públicos da sua conta. Saldos abaixo vêm da cadeia local de testes — não são os saldos emulados nem dinheiro real.', 'Public addresses of your account. Balances below come from the local test chain — they are not the emulated balances nor real money.', 'Direcciones públicas de tu cuenta. Los saldos vienen de la cadena local de pruebas: no son los saldos emulados ni dinero real.')}</p>
    {!p.localAssociated && <p role="status" className="mt-2 text-xs text-[#5B6B85]" data-testid="native-local-unlinked">{x('A leitura local depende da associação das duas carteiras. Autorize essa associação em Operações da conta; seus endereços permanecem disponíveis.', 'Local readings require both wallets to be associated. Authorize that association in account Operations; your addresses remain available.', 'La lectura local requiere asociar las dos carteras. Autoriza esa asociación en Operaciones de la cuenta; tus direcciones siguen disponibles.')}</p>}
    {p.journeyLoading && <p role="status" className="mt-2 text-xs text-[#5B6B85]">{x('Lendo saldos da cadeia de teste…', 'Reading test-chain balances…', 'Leyendo saldos de la cadena de prueba…')}</p>}
    {(p.journeyError || p.mismatch) && <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#8A6A2F]" data-testid="native-balances-unavailable">{p.mismatch ? x('Os saldos recebidos não pertencem a esta conta e foram descartados.', 'The received balances do not belong to this account and were discarded.', 'Los saldos recibidos no pertenecen a esta cuenta y se descartaron.') : x('Saldos on-chain indisponíveis (cadeia local não configurada ou fora do ar). Endereços continuam válidos.', 'On-chain balances unavailable (local chain unconfigured or offline). Addresses remain valid.', 'Saldos on-chain no disponibles (cadena local no configurada o fuera de línea). Las direcciones siguen siendo válidas.')}<button type="button" onClick={p.retry} className="min-h-11 rounded-xl border border-[#8A6A2F] px-3">{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div>}
    {p.stale && <p role="status" className="mt-2 text-xs font-semibold text-[#8A6A2F]" data-testid="native-balances-stale">{x('Leitura desatualizada; mostrando o último saldo confirmado, não um saldo atual.', 'Reading is stale; showing the last confirmed balance, not a current balance.', 'Lectura desactualizada; se muestra el último saldo confirmado, no un saldo actual.')}</p>}
    <div className="mt-3 grid gap-3 md:grid-cols-2">{snap.wallets.map(w => <article key={w.id} className="grid gap-2 rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-3" data-testid={`card-native-wallet-${w.purpose}`}>
      <p className="text-sm font-bold">{purpose(w.purpose)}</p>
      <Addr id={w.purpose} value={w.address} />
      <p className="text-xs text-[#5B6B85]">{x('Redes', 'Networks', 'Redes')}: {net(w.chainIds)}</p>
      <p className="display break-all text-lg font-extrabold tabular-nums" data-testid={`text-native-balance-${w.purpose}`}>{bal(w.purpose)}</p>
      <p className="break-all text-xs text-[#5B6B85]">{x('Gás de teste', 'Test gas', 'Gas de prueba')}: <span data-testid={`text-native-gas-${w.purpose}`}>{gas(w.purpose)}</span></p>
    </article>)}</div>
    {j && <p className="mt-2 text-xs text-[#5B6B85]">{x('Bloco', 'Block', 'Bloque')} {j.blockNumber} · {x('Rede', 'Network', 'Red')} {j.chainId} · {new Date(j.updatedAt).toLocaleString(loc === 'pt' ? 'pt-BR' : loc === 'en' ? 'en-US' : 'es-ES', { timeZone: 'America/Sao_Paulo' })} · {x('horário de Brasília', 'Brasília time', 'hora de Brasilia')}</p>}
    <div className="mt-3 flex flex-wrap gap-2">{manage}</div>
  </section>;
}
