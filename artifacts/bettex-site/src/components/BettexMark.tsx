export function BettexMark({ className, slate = false }: { className?: string; slate?: boolean }) {
  return <img src={slate ? `${import.meta.env.BASE_URL}bettex-mark-slate.svg` : `${import.meta.env.BASE_URL}bettex-mark-gamblefi.svg`} className={className} alt="" aria-hidden="true" />;
}