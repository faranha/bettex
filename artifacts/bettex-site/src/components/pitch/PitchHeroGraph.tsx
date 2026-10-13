import { t, useLocale } from '@/lib/i18n';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const ALT = 'Ilustração do personagem da BETTEX consultando as carteiras e a participação no aplicativo pelo celular.';

export function PitchHeroGraph() {
  const locale = useLocale();
  return <figure className="cover__project cover__project--scene">
    <img src={`${BASE}/pitch-hero-app-cutout-${locale}.webp`} width={344} height={947} alt={t(ALT)} loading="eager" decoding="async" fetchPriority="high" data-testid="img-pitch-hero-scene" />
  </figure>;
}
