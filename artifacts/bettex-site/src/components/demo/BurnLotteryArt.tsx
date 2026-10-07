/** @jsxImportSource react */
import { useId } from 'react';
import './burn-lottery.css';

/** Layered flame with a ticket-stub coin at its core. Decorative only. */
export function BurnLotteryFlame({ lit }: { lit: boolean }) {
  const id = useId();
  const outer = `${id}-outer`;
  const inner = `${id}-inner`;
  return <svg className="bl-flame" data-lit={lit} viewBox="0 0 64 72" width="64" height="72" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={outer} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#F2B632" /><stop offset=".55" stopColor="#FF7A1A" /><stop offset="1" stopColor="#E8325A" /></linearGradient>
      <linearGradient id={inner} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FFF0BC" /><stop offset="1" stopColor="#F2B632" /></linearGradient>
    </defs>
    <ellipse cx="32" cy="67" rx="20" ry="3.5" fill="#2B59FF" opacity=".55" />
    <g className="bl-flame__body">
      <path d="M32 3C35 16 51 24 51 44c0 13-8.500 22-19 22S13 57 13 44c0-8 4-13 8-17 1 5 3 7 6 8-2-12 1-25 5-32z" fill={`url(#${outer})`} />
      <path className="bl-flame__inner" d="M32 30c2 8 10 12 10 22 0 8-4.500 13-10 13s-10-5-10-13c0-5 3-8 5-10 .5 3 2 4 3.500 4.500C30 41 30 35 32 30z" fill={`url(#${inner})`} />
    </g>
    <g className="bl-flame__coin">
      <circle cx="32" cy="52" r="7" fill="#070B1F" />
      <circle cx="32" cy="52" r="5" fill="none" stroke="#F2B632" strokeWidth="1.500" strokeDasharray="2 1.800" />
      <circle cx="32" cy="52" r="1.600" fill="#F2B632" />
    </g>
    <g className="bl-flame__sparks" fill="#F2B632">
      <circle cx="12" cy="20" r="1.600" /><circle cx="53" cy="14" r="1.300" /><circle cx="56" cy="34" r="1" />
    </g>
  </svg>;
}
