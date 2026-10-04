import { SectionAnchorNav } from '@/components/SectionAnchorNav';
import { t, useLocale } from '@/lib/i18n';

const sections = [
  { id: 'visao', label: 'Início do Pitch' },
  { id: 'publico-pitch', label: 'Público' },
  { id: 'problema', label: 'Problema' },
  { id: 'agora', label: 'Ambiente externo' },
  { id: 'solucao', label: 'Solução' },
  { id: 'fundador', label: 'Fundador' },
  { id: 'tokenomics', label: 'Tokenomics' },
  { id: 'publico', label: 'Go to market' },
  { id: 'recursos', label: 'Recursos e riscos' },
] as const;

export function PitchSectionNav({ onNavigate, menuOpen }: { onNavigate: () => void; menuOpen?: boolean }) {
  const locale = useLocale();
  return <SectionAnchorNav sections={sections} label="Pitch" ariaLabel="Seções do Pitch"
    data-testid="pitch-section-nav" offsetProperty="--pitch-sticky-h" onNavigate={onNavigate} menuOpen={menuOpen}
    labelFor={section => section === sections[1] && locale === 'en' ? t('Público-alvo') : t(section.label)} />;
}