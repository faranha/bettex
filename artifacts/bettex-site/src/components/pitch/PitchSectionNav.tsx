import { SectionAnchorNav } from '@/components/SectionAnchorNav';
import { t, useLocale } from '@/lib/i18n';

const sections = [
  { id: 'visao', label: 'Início' },
  { id: 'publico-pitch', label: 'Público' },
  { id: 'problema', label: 'Problema' },
  { id: 'solucao', label: 'Solução' },
  { id: 'estrategia', label: 'Estratégia' },
  { id: 'tokenomics', label: 'Tokenomics' },
  { id: 'publico', label: 'Comunidade e aquisição' },
  { id: 'pitch-roadmap', label: 'Roadmap' },
] as const;

export function PitchSectionNav({ onNavigate, menuOpen }: { onNavigate: () => void; menuOpen?: boolean }) {
  const locale = useLocale();
  return <SectionAnchorNav sections={sections} label="Pitch" ariaLabel="Seções do Pitch"
    data-testid="pitch-section-nav" offsetProperty="--pitch-sticky-h" onNavigate={onNavigate} menuOpen={menuOpen} styledMobile
    labelFor={section => section.label === 'Público' && locale === 'en' ? t('Público-alvo') : t(section.label)} />;
}
