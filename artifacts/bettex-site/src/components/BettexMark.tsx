export function BettexMark({ className }: { className?: string }) {
  return <img src={`${import.meta.env.BASE_URL}bettex-mark.svg`} className={className} alt="" aria-hidden="true" />;
}