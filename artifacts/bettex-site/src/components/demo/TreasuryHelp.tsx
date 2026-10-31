/** @jsxImportSource react */
import { WalletHelp } from './WalletHelp';

/** Treasury terms use the same touch/keyboard help as personal wallets. */
export function TreasuryTerm({ children, tip }: { children: string; tip: string }) {
  return <WalletHelp id={`treasury-${children}`} label={children}><p>{tip}</p></WalletHelp>;
}
