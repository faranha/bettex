/** @jsxImportSource react */
import { useId } from 'react';
import './earnings-pig.css';

/** Decorative savings mascot; its animation is independent of wallet activity. */
export function EarningsPigArt() {
  const gradient = `${useId()}-pig`;
  return <svg className="earnings-pig" viewBox="0 0 64 72" width="64" height="72" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#72D6AE" /><stop offset="1" stopColor="#0E7C6B" />
      </linearGradient>
    </defs>
    <ellipse cx="32" cy="68" rx="22" ry="3" fill="#0E7C6B" opacity=".16" />
    <g className="earnings-pig__body" stroke="#0A6657" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M10 43c-7 1-8-6-4-8 4-2 7 4 3 6" fill="none" strokeLinecap="round" />
      <path d="M17 55v9h7l2-7m13-1 2 8h7v-12" fill="#0E7C6B" />
      <ellipse cx="31" cy="44" rx="24" ry="18" fill={`url(#${gradient})`} />
      <path d="m39 30 1-12c8 1 12 6 10 13" fill="#72D6AE" />
      <path d="m43 27 1-5 4 5" fill="#C5F2DB" stroke="none" />
      <path d="M17 38c3-5 9-7 14-7" fill="none" stroke="#C5F2DB" strokeWidth="3" strokeLinecap="round" />
      <path d="M25 29h11" stroke="#064E43" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="55" cy="44" rx="7" ry="8" fill="#B9EBD2" />
      <path d="M53 43v3m4-3v3" strokeLinecap="round" />
      <circle cx="45" cy="36" r="2.2" fill="#064E43" stroke="none" />
      <circle className="earnings-pig__cheek" cx="44" cy="45" r="3.5" fill="#B9EBD2" stroke="none" opacity=".65" />
    </g>
    <g className="earnings-pig__coin">
      <circle cx="31" cy="11" r="7" fill="#F2B632" stroke="#C28A14" strokeWidth="1.5" />
      <circle cx="31" cy="11" r="4.5" fill="none" stroke="#FFF0BC" />
      <path d="M31 7v8m2-6c-4-3-6 2-2 2s2 5-2 2" fill="none" stroke="#73531B" strokeWidth="1.2" strokeLinecap="round" />
    </g>
    <g className="earnings-pig__sparkles" fill="#0E7C6B">
      <path d="m10 17 1.5 3.5L15 22l-3.5 1.5L10 27l-1.5-3.5L5 22l3.5-1.5z" />
      <circle cx="54" cy="12" r="1.5" />
    </g>
  </svg>;
}
