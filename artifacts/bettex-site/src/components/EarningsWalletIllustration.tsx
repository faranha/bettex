import { Wallet } from 'lucide-react';

export function EarningsWalletIllustration() {
  return (
    <div className="ew" role="group" aria-label="Ilustração conceitual: seu BETTEX permanece com você e o lucro diário chega em USDC à carteira">
      <div className="ew-node ew-node--token">
        <svg viewBox="0 0 96 96" width={96} height={96} aria-hidden="true">
          <circle cx="48" cy="48" r="44" fill="#13204F" stroke="#F2B632" strokeWidth="4" />
          <circle cx="48" cy="48" r="34" fill="none" stroke="#5F86FF" strokeWidth="1.5" />
          <text x="48" y="62" textAnchor="middle" fontSize="42" fontWeight="800" fill="#F2B632" fontFamily="var(--app-font-serif)">B</text>
        </svg>
        <strong>BETTEX</strong>
        <span>Seu saldo fica com você</span>
      </div>
      <div className="ew-flow" aria-hidden="true">
        <svg viewBox="0 0 120 120" width={120} height={120} className="ew-clock">
          <circle cx="60" cy="60" r="52" fill="#0D1530" stroke="#5F86FF" strokeWidth="2" strokeDasharray="3 7" className="hi-dash" />
          <path d="M60 8 A52 52 0 1 1 59.9 8" fill="none" stroke="#F2B632" strokeWidth="4" strokeLinecap="round" opacity=".9" />
        </svg>
        <b className="ew-clock__h">24h</b>
        <span className="ew-line" />
      </div>
      <div className="ew-node ew-node--wallet">
        <span className="ew-wallet"><Wallet size={44} strokeWidth={1.8} aria-hidden="true" /></span>
        <strong>Carteira USDC</strong>
        <span>Lucro diário em USDC</span>
      </div>
    </div>
  );
}
