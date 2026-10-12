import { SectionAnchorNav } from './SectionAnchorNav';

const sections = [
  { id: 'inicio', label: 'Início da página' },
  { id: 'historia', label: 'Por que BETTEX' },
  { id: 'participacao', label: 'Token BETTEX' },
  { id: 'tecnologia', label: 'Como opera' },
  { id: 'mercados', label: 'Mercados' },
  { id: 'roadmap', label: 'Roadmap' },
] as const;

export function HomeSectionNav({ onNavigate, menuOpen }: { onNavigate: () => void; menuOpen?: boolean }) {
  return <SectionAnchorNav sections={sections} label="Página inicial" ariaLabel="Seções da página inicial"
    data-testid="home-section-nav" offsetProperty="--home-sticky-h" onNavigate={onNavigate} menuOpen={menuOpen} styledMobile />;
}