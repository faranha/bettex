import { t, useLocale } from '@/lib/i18n';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const ALT = 'Ilustração do personagem da BETTEX consultando as carteiras e a participação no aplicativo pelo celular.';

export function PitchHeroGraph() {
  const locale = useLocale();
  return <figure className="cover__project">
    <img src={`${BASE}/pitch-hero-app-${locale}.webp`} width={1024} height={1024} alt={t(ALT)} loading="eager" decoding="async" fetchPriority="high" data-testid="img-pitch-hero-scene" />
    <figcaption className="mono">
      <span><strong>BETTEX</strong><small>{t('Tecnologia, comunidade e inteligência artificial')}</small></span>
    </figcaption>
  </figure>;
}
