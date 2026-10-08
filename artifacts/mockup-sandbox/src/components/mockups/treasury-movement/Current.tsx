import { TreasuryStatementSummary } from './_shared/CurrentSummary';
import { statement } from './_shared/context';
import './_group.css';

export function Current() {
  return <div className="movement-preview flex min-h-screen items-center p-5"><div className="w-full rounded-2xl border border-[#E4DCCB] bg-[#FFFCF6] p-4"><TreasuryStatementSummary data={statement} compact /></div></div>;
}
