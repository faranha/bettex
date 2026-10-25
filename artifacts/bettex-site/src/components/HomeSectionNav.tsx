import { SectionAnchorNav } from './SectionAnchorNav';

const sections = [
  { id: 'inicio', label: 'Início da página' },
  { id: 'mercados', label: 'Ganhos diários' },
  { id: 'participacao', label: 'Token BETTEX' },
  { id: 'roadmap', label: 'Roadmap' },
] as const;

export function HomeSectionNav({ onNavigate, menuOpen }: { onNavigate: () => void; menuOpen?: boolean }) {
  return <div className="hidden xl:block">
    <SectionAnchorNav sections={sections} label="Página inicial" ariaLabel="Seções da página inicial"
      data-testid="home-section-nav" offsetProperty="--home-sticky-h" onNavigate={onNavigate} menuOpen={menuOpen} styledMobile />
  </div>;
}