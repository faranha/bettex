/** @jsxImportSource react */
import { Plus, ArrowUpFromLine, ArrowLeftRight, Send, type LucideIcon } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { Asset, Kind } from './fin';

const icons: Record<Kind, LucideIcon> = {
  onramp: Plus,
  receive: Plus,
  withdraw: ArrowUpFromLine,
  send: Send,
  swap: ArrowLeftRight,
};

export function WalletAction({ kind, asset, label, id, onOpen }: {
  kind: Kind;
  asset: Asset;
  label: string;
  id: string;
  onOpen: (kind: Kind, asset: Asset) => void;
}) {
  const Icon = icons[kind];
  return <Tooltip delayDuration={150}>
    <TooltipTrigger asChild>
      <button type="button" data-testid={`button-${id}`} data-asset={asset}
        aria-label={label} onClick={() => onOpen(kind, asset)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0E7C6B]/30 bg-[#E9EEE5] text-[#0A6657] transition-colors hover:border-[#0E7C6B] hover:bg-[#DDEBE4] active:bg-[#D3E4D9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]">
        <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" collisionPadding={12} className="max-w-[calc(100vw-24px)] border-0 bg-[#1B2A41] text-center text-[#FFFCF6]">
      {label}
    </TooltipContent>
  </Tooltip>;
}