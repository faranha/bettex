/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import type { DemoDashboard, PersonalTestWallet } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { DemoWalletsCard } from '@/components/demo/DemoWalletsCard';
import type { Asset, Kind } from '@/components/demo/fin';
import { PrivatePanel } from './account-ui/AccountPanel';
import { exportPersonalWallet } from './wallet-vault';
import { accountDeviceWallets, revealDeviceWallet } from './device-wallet-store';
import { localWalletOwner, readLocalWalletVault, type LocalWalletVault } from './local-wallet-store';
import { WalletKeyRow } from './WalletKeyRow';

export function ProtectedDemoWallets({ d, onWallet }: {
  d: DemoDashboard; onWallet: (kind: Kind, asset: Asset) => void;
}) {
  const { x } = useX();
  const [wallets, setWallets] = useState<PersonalTestWallet[]>([]);
  const [legacy, setLegacy] = useState<LocalWalletVault>();
  const [selected, setSelected] = useState<PersonalTestWallet>();
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      const owner = await localWalletOwner(d.profile.accountId);
      const previous = await readLocalWalletVault(owner);
      const list = await accountDeviceWallets(d.profile.accountId);
      if (active) { setWallets(list); setLegacy(previous); }
    })().catch(() => { if (active) setError(true); });
    return () => { active = false; window.dispatchEvent(new Event('bettex-wallet-lock')); };
  }, [d.profile.accountId]);
  useEffect(() => {
    const lock = () => { setSelected(undefined); };
    const visibility = () => { if (document.visibilityState === 'hidden') lock(); };
    const timeout = selected ? window.setTimeout(lock, 60000) : undefined;
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', lock);
    window.addEventListener('bettex-wallet-lock', lock);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', lock);
      window.removeEventListener('bettex-wallet-lock', lock);
    };
  }, [selected]);
  const addresses = Object.fromEntries(wallets.map(w => [w.purpose === 'deposits' ? 'USDC' : 'BETTEX', w.address]));
  return <div className="grid gap-4 sm:pb-4">
    <DemoWalletsCard d={d} onWallet={onWallet} addresses={addresses} onExport={wallets.length === 2 ? (asset: Asset) => {
      setError(false);
      const wallet = wallets.find(w => w.purpose === (asset === 'USDC' ? 'deposits' : 'bettex'));
      setSelected(current => current?.id === wallet?.id ? undefined : wallet);
    } : undefined} />
    {error && <p role="alert" className="text-sm text-[#B4421A]">{x('Não foi possível abrir a carteira. Nenhuma chave foi substituída.', 'Could not open the wallet. No keys were replaced.', 'No se pudo abrir la cartera. No se reemplazó ninguna clave.')}</p>}
    {selected && <WalletExport key={selected.id} wallet={selected} accountId={d.profile.accountId} legacy={legacy} onClose={() => window.dispatchEvent(new Event('bettex-wallet-lock'))} />}
  </div>;
}

function WalletExport({ wallet, accountId, legacy, onClose }: {
  wallet: PersonalTestWallet; accountId: string; legacy?: LocalWalletVault;
  onClose: () => void;
}) {
  const { x } = useX();
  return <section className="dcard grid gap-3 p-4" data-testid="wallet-key-export">
    <h3 className="font-bold">{x('Exportar carteira', 'Export wallet', 'Exportar cartera')} · {wallet.purpose === 'deposits' ? 'USDC' : 'BETTEX'}</h3>
    <p className="text-xs text-[#5B6B85]">{x('Rede: Arbitrum Sepolia · 421614', 'Network: Arbitrum Sepolia · 421614', 'Red: Arbitrum Sepolia · 421614')}</p>
    <p className="text-xs text-[#B4421A]">{x('A chave privada dá acesso total à carteira. Nunca compartilhe com o suporte ou outras pessoas.', 'The private key gives full access to your wallet. Never share it with support or anyone else.', 'La clave privada da acceso total a tu cartera. Nunca la compartas con soporte ni otras personas.')}</p>
    <dl className="grid gap-2 text-xs">
      <dt className="font-bold">{x('Endereço', 'Address', 'Dirección')}</dt><dd className="mono break-all">{wallet.address}</dd>
    </dl>
    <WalletKeyRow id="export-public" label={x('Chave pública', 'Public key', 'Clave pública')} value={wallet.publicKey} />
    {!legacy && <WalletKeyRow id="export-private" label={x('Chave privada', 'Private key', 'Clave privada')} loadValue={() => revealDeviceWallet(accountId, wallet.id)} valueTestId="exported-private-key" />}
    {legacy && <PrivatePanel w={wallet} exportWallet={(pw, id, action, signal) => exportPersonalWallet(legacy.vault, legacy.wallets, pw, id, action, signal)} />}
    <button type="button" className="min-h-11 rounded-xl border border-[#0E7C6B] px-3 text-sm font-bold text-[#0A6657]" onClick={onClose}>{x('Ocultar chaves', 'Hide keys', 'Ocultar claves')}</button>
  </section>;
}
