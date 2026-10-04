export function PitchArt() {
  return <svg className="pb-metric__art" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
    <rect x="14" y="40" width="212" height="160" rx="4" fill="none" stroke="#F4F1E8" strokeWidth="2" opacity=".5" />
    <line x1="120" y1="40" x2="120" y2="200" stroke="#F4F1E8" strokeWidth="2" opacity=".5" />
    <circle cx="120" cy="120" r="30" fill="none" stroke="#F4F1E8" strokeWidth="2" opacity=".5" />
    <rect x="14" y="85" width="38" height="70" fill="none" stroke="#F4F1E8" strokeWidth="2" opacity=".5" />
    <rect x="188" y="85" width="38" height="70" fill="none" stroke="#F4F1E8" strokeWidth="2" opacity=".5" />
    <g transform="translate(120 120) scale(1.6)">
      <circle r="26" fill="#F4F1E8" stroke="#070B1F" strokeWidth="3" />
      <polygon points="0,-11 10,-3 6,9 -6,9 -10,-3" fill="#070B1F" />
      <path d="M0 -11V-26M10 -3L24 -9M6 9L15 21M-6 9L-15 21M-10 -3L-24 -9" stroke="#070B1F" strokeWidth="3" fill="none" />
    </g>
  </svg>;
}

export function TotalIcon() {
  return <svg className="pb-metric__icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <circle cx="24" cy="24" r="21" fill="none" stroke="#F2B632" strokeWidth="2.5" />
    <path d="M14 25l7 7 13-15" fill="none" stroke="#F2B632" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function PartialIcon() {
  return <svg className="pb-metric__icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <circle cx="24" cy="24" r="21" fill="none" stroke="#F2B632" strokeWidth="2.5" />
    <path d="M24 3a21 21 0 0 0 0 42z" fill="#F2B632" />
    <path d="M24 3v42" stroke="#F2B632" strokeWidth="2.5" />
  </svg>;
}
