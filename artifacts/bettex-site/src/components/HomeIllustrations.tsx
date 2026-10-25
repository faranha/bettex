export function OrderFlowIllustration() {
  return (
    <svg className="hi-order" viewBox="0 0 168 84" width={168} height={84} role="img" aria-label="Ilustração conceitual: análise do mercado leva a uma ordem">
      <g fill="none" stroke="#5F86FF" strokeWidth="1.6" strokeLinecap="round">
        <path d="M14 20 L40 42 L14 64" opacity=".6" />
        <path d="M14 42 H40" opacity=".6" />
      </g>
      <g fill="#13204F" stroke="#5F86FF" strokeWidth="1.6">
        <circle cx="12" cy="20" r="5" /><circle cx="12" cy="42" r="5" /><circle cx="12" cy="64" r="5" />
      </g>
      <circle cx="62" cy="42" r="19" fill="#0D1530" stroke="#F2B632" strokeWidth="2" />
      <path d="M76 56 L88 68" stroke="#F2B632" strokeWidth="4" strokeLinecap="round" />
      <g fill="#5F86FF"><rect x="54" y="38" width="3" height="10" rx="1" /><rect x="60" y="30" width="3" height="18" rx="1" opacity=".6" /><rect x="66" y="34" width="3" height="14" rx="1" /></g>
      <path d="M92 42 H108" stroke="#F2B632" strokeWidth="2" strokeDasharray="3 4" className="hi-dash" />
      <path d="M106 36 L114 42 L106 48" fill="none" stroke="#F2B632" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M120 12 H160 V62 L154 58 L148 62 L142 58 L136 62 L130 58 L124 62 L120 58 Z" fill="#F4F1E8" />
      <g stroke="#13204F" strokeWidth="2" strokeLinecap="round"><path d="M127 24 H153" /><path d="M127 33 H146" opacity=".5" /></g>
      <path d="M128 49 L136 41 L142 46 L152 36" fill="none" stroke="#F2B632" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FocusExpansionIllustration() {
  return (
    <svg className="hi-focus" viewBox="0 0 320 260" role="img" aria-label="Um agente de IA focado em um mercado cripto" width={320} height={260}>
      <defs>
        <radialGradient id="hi-focus-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#2B59FF" stopOpacity=".5" /><stop offset="1" stopColor="#2B59FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="96" cy="130" r="120" fill="url(#hi-focus-glow)" />
      <g fill="none" stroke="#5F86FF" strokeWidth="1.5" opacity=".35"><circle cx="96" cy="130" r="62" /><circle cx="96" cy="130" r="92" strokeDasharray="2 6" /></g>
      <path d="M140 130 H218" stroke="#F2B632" strokeWidth="3" strokeLinecap="round" />
      <g fill="none" stroke="#5F86FF" strokeWidth="2" strokeDasharray="4 7" strokeLinecap="round" opacity=".45">
        <path d="M218 130 C240 100 252 70 276 50" /><path d="M218 130 C244 130 258 130 290 130" /><path d="M218 130 C240 160 252 190 276 210" />
      </g>
      <g fill="#0D1530" stroke="#5F86FF" strokeWidth="2" opacity=".5" strokeDasharray="3 4">
        <circle cx="280" cy="46" r="11" /><circle cx="296" cy="130" r="11" /><circle cx="280" cy="214" r="11" />
      </g>
      <circle cx="218" cy="130" r="14" fill="#F2B632" /><path d="M212 130 L216.5 134.5 L225 125" fill="none" stroke="#070B1F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="96" cy="130" r="44" fill="#13204F" stroke="#F2B632" strokeWidth="4" />
      <circle cx="96" cy="130" r="34" fill="none" stroke="#5F86FF" strokeWidth="1.5" />
      <text x="96" y="144" textAnchor="middle" fontSize="40" fontWeight="800" fill="#F2B632" fontFamily="var(--app-font-serif)" aria-hidden="true">B</text>
    </svg>
  );
}
