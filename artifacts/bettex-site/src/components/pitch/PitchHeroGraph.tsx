import { t, useLocale } from '@/lib/i18n';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const ALT = 'Uma pessoa erguendo a mão e sendo resgatada por um androide que representa o agente de IA da BETTEX.';

export function PitchHeroGraph() {
  useLocale();
  return <figure className="cover__project cover__project--scene">
    <img src={`${BASE}/pitch-hero-ai-rescue.webp`} srcSet={`${BASE}/pitch-hero-ai-rescue-640.webp 640w, ${BASE}/pitch-hero-ai-rescue-960.webp 960w, ${BASE}/pitch-hero-ai-rescue.webp 1280w`} sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1200px) 40vw, 460px" width={1280} height={1120} alt={t(ALT)} loading="eager" decoding="async" fetchPriority="high" data-testid="img-pitch-hero-scene" />
  </figure>;
}
