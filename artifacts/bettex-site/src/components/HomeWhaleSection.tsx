import { localizedUrl, t, useLocale } from '@/lib/i18n';
import { ArrowUpRight } from 'lucide-react';
import { FreeformWhaleArtwork } from '@/components/FreeformWhaleArtwork';
import './HomeWhaleSection.css';

const H1 = 'Baleias manipulam o mercado. A comunidade tem sua IA.';
const H2 = 'O agente BETTEX usa análise quantitativa distribuída para buscar padrões de manipulação em cripto. É tecnologia da comunidade: quem tem BETTEX é dono da IA, não cliente de uma gestora.';
const NOTE = 'Estratégia em validação. Não há garantia de antecipar movimentos ou obter lucro.';
const ALT = 'Baleia jubarte nadando em mar azul-meia-noite';
const EYEBROW = 'Baleias e mercado';
const MISSION = `${import.meta.env.BASE_URL}pitch`;

export function HomeWhaleSection() {
  const language = useLocale();
  const missionLabel = ({ pt: 'Leia nossa missão', en: 'Read our mission', es: 'Lee nuestra misión' } as const)[language];
  const missionHref = localizedUrl(MISSION, language);
  return (
    <section id="baleias" className="hw-sec" aria-labelledby="hw-title" data-testid="section-home-whale">
      <figure className="hw-art" role="img" aria-label={t(ALT)} data-testid="img-whale-art">
        <FreeformWhaleArtwork />
      </figure>
      <div className="hw-wrap">
        <div className="hw-copy">
          <p className="hw-eyebrow">{t(EYEBROW)}</p>
          <h2 id="hw-title" className="hw-h">{t(H1)}</h2>
          <p className="hw-p">{t(H2)}</p>
          <p className="hw-note" data-testid="text-whale-disclaimer">{t(NOTE)}</p>
          <a href={missionHref} className="hw-docs" data-testid="link-whale-mission">
            <span data-i18n="raw">{missionLabel}</span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
