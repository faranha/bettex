/** @jsxImportSource react */
import { BettexMark } from '../BettexMark';
import type { Asset } from './fin';

export function TokenIcon({ asset }: { asset: Asset }) {
  if (asset === 'BETTEX') return <span className="tk-icon tk-icon-bettex" aria-hidden="true"><BettexMark className="h-full w-full object-contain" /></span>;
  return <span className="tk-icon" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}app/usdc.svg`} alt="" className="h-full w-full" /></span>;
}
