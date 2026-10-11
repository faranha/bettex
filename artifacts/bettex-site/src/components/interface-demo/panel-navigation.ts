export const PANEL_SECTIONS = ['wallets', 'central', 'participation', 'treasury'] as const;
export type PanelSection = typeof PANEL_SECTIONS[number];

export function panelScrollOffset(headerHeight: number, submenuHeight: number) {
  return headerHeight + submenuHeight + 12;
}

/** Participation is nested within Central: use section starts, not overlapping bounds. */
export function visiblePanelSection(sections: { id: PanelSection; top: number }[], offset: number): PanelSection {
  let active: PanelSection = 'wallets';
  for (const section of sections) {
    if (section.top <= offset + 2) active = section.id;
  }
  return active;
}
