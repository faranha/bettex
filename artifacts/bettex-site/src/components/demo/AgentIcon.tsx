/** @jsxImportSource react */
import { Bot, Coins, LineChart, Trophy, Gift, Landmark, ShieldCheck, Flame, Scale, type LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  orchestrator: Bot,
  crypto: Coins,
  predictions: LineChart,
  sports: Trophy,
  bonus: Gift,
  treasury: Landmark,
  risk: ShieldCheck,
  buyback: Flame,
  governance: Scale,
};

export function AgentIcon({ id, className }: { id: string; className?: string }) {
  const Icon = ICONS[id] ?? Bot;
  return <Icon className={className ?? 'h-4 w-4'} strokeWidth={1.9} aria-hidden="true" focusable="false" />;
}
