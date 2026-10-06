/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy } from 'lucide-react';
import { useGetTestAccountSession, type DemoDashboard } from '@workspace/api-client-react';
import { accountDeviceWallets } from '../account/device-wallet-store';
import { snapshotMatchesProfile } from './personal-native';
import { useX } from './ui';
import type { Asset } from './fin';

export function DepositAddress({ d, asset }: { d: DemoDashboard; asset: Asset }) {
  const { x } = useX();
  const native = d.profile.provider === 'native';
  const session = useGetTestAccountSession({ query: { enabled: native, retry: false, queryKey: ['test-account-session'] } });
  const [address, setAddress] = useState('');
  const [qr, setQr] = useState('');
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    let active = true;
    setAddress(''); setQr(''); setError(false); setCopied(false); setCopyError(false);
    const load = async () => {
      const wallets = native
        ? snapshotMatchesProfile(session.data, d.profile) ? session.data!.wallets : null
        : await accountDeviceWallets(d.profile.accountId);
      if (!wallets) { if (session.isLoading) return; throw new Error('wallet_unavailable'); }
      const wallet = wallets.find(w => w.purpose === (asset === 'USDC' ? 'deposits' : 'bettex'));
      if (!wallet || !wallet.chainIds.includes(421614)) throw new Error('wallet_unavailable');
      if (active) setAddress(wallet.address);
      const image = await QRCode.toDataURL(wallet.address, { width: 192, margin: 4, errorCorrectionLevel: 'M' });
      if (active) setQr(image);
    };
    void load().catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [d.profile.accountId, d.profile.provider, asset, native, session.data, session.isLoading]);
  return <section className="grid gap-3 rounded-xl border border-[#E4DCCB] bg-white p-3" data-testid="deposit-address">
    <p className="text-sm font-bold">{x('Endereço para depósito', 'Deposit address', 'Dirección de depósito')}</p>
    <p className="text-xs text-[#5B6B85]">{`${asset} · Arbitrum Sepolia · 421614`}</p>
    {qr && <img src={qr} alt={x('QR code do endereço da carteira', 'Wallet address QR code', 'Código QR de la dirección de cartera')} width={192} height={192} className="mx-auto max-w-full" data-testid="deposit-qr" />}
    {address && <>
      <p className="mono break-all text-xs" data-testid="deposit-wallet-address">{address}</p>
      <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0E7C6B] px-3 text-sm font-bold text-[#0A6657]" data-testid="copy-deposit-address" onClick={() => {
        void navigator.clipboard.writeText(address).then(() => { setCopied(true); setCopyError(false); }).catch(() => setCopyError(true));
      }}><Copy className="h-4 w-4" aria-hidden="true" />{copied ? x('Copiado', 'Copied', 'Copiado') : x('Copiar endereço', 'Copy address', 'Copiar dirección')}</button>
    </>}
    {copyError && <p role="alert" className="text-xs text-[#B4421A]">{x('Não foi possível copiar. Selecione o endereço acima.', 'Could not copy. Select the address above.', 'No se pudo copiar. Selecciona la dirección de arriba.')}</p>}
    {!address && <p role={error ? 'alert' : 'status'} className="text-xs">{error ? x('Não foi possível carregar a carteira. Reabra para tentar novamente.', 'Could not load the wallet. Reopen to try again.', 'No se pudo cargar la cartera. Vuelve a abrir para intentarlo.') : x('Carregando endereço…', 'Loading address…', 'Cargando dirección…')}</p>}
    <p className="text-xs text-[#5B6B85]">{x('Envie apenas tokens da Arbitrum Sepolia, nunca fundos da Arbitrum One ou Ethereum mainnet. O crédito automático por depósito ainda não está conectado.', 'Send only Arbitrum Sepolia tokens, never funds from Arbitrum One or Ethereum mainnet. Automatic deposit crediting is not connected yet.', 'Envía solo tokens de Arbitrum Sepolia, nunca fondos de Arbitrum One o Ethereum mainnet. El abono automático por depósito aún no está conectado.')}</p>
  </section>;
}
