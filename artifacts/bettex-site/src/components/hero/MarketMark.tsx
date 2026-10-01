export type MarketKind = 'predictions' | 'trading' | 'sports' | 'casino';

export function MarketMark({ kind, className }: { kind: MarketKind; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {kind === 'predictions' && (
        <>
          <path d="M19 32h9m0 0 12-14M28 32h12M28 32l12 14" />
          <circle cx="16" cy="32" r="3" />
          <circle cx="43" cy="15" r="3" />
          <circle cx="43" cy="32" r="3" />
          <circle cx="43" cy="49" r="3" />
        </>
      )}
      {kind === 'trading' && (
        <>
          <path d="M17 44V24m15 18V20m15 13V13" />
          <rect x="13" y="30" width="8" height="9" rx="1" />
          <rect x="28" y="25" width="8" height="11" rx="1" />
          <rect x="43" y="18" width="8" height="10" rx="1" />
        </>
      )}
      {kind === 'sports' && (
        <>
          <circle cx="32" cy="32" r="17" />
          <path d="m27 29 5-4 5 4-2 7h-6l-2-7Zm-9 1 9-1m10 0 9 1M29 36l-4 10m10-10 4 10" />
        </>
      )}
      {kind === 'casino' && (
        <>
          <path d="M32 15c-5 8-15 14-15 23 0 6 4 10 10 10 3 0 5-2 5-5 0 3 2 5 5 5 6 0 10-4 10-10 0-9-10-15-15-23Z" />
          <path d="M32 44v9m-8 0h16" />
        </>
      )}
    </svg>
  );
}