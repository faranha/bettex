export function CrowdArt() {
  return <svg className="pb-metric__art" viewBox="0 0 240 240" aria-hidden="true" focusable="false" data-testid="audience-crowd-icon">
    <defs>
      <g id="pitch-crowd-person" stroke="#F4F1E8" strokeWidth="2.5" strokeLinecap="round" fill="#070B1F">
        <circle r="16" />
        <path d="M-28 72V46a28 28 0 0 1 56 0v26M-13 72V48M13 72V48" />
      </g>
    </defs>
    <use href="#pitch-crowd-person" transform="translate(45 82)" opacity=".55" />
    <use href="#pitch-crowd-person" transform="translate(195 82)" opacity=".55" />
    <use href="#pitch-crowd-person" transform="translate(85 58)" opacity=".8" />
    <use href="#pitch-crowd-person" transform="translate(155 58)" opacity=".8" />
    <use href="#pitch-crowd-person" transform="translate(120 112) scale(1.2)" />
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
