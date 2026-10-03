export type ChartTooltipTrigger = 'hover' | 'click';

/** Select input behavior before the following click/hover event is dispatched. */
export function chartTooltipTrigger(pointerType: string, previous: ChartTooltipTrigger): ChartTooltipTrigger {
  if (pointerType === 'touch' || pointerType === 'pen') return 'click';
  if (pointerType === 'mouse') return 'hover';
  return previous;
}