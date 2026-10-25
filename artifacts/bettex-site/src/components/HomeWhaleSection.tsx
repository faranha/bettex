import { t, useLocale } from '@/lib/i18n';
import { ArrowUpRight } from 'lucide-react';
import { FreeformWhaleArtwork } from '@/components/FreeformWhaleArtwork';
import './HomeWhaleSection.css';

const H1 = 'Baleias manipulam o mercado. Nós sabemos quando entrar.';
const H2 = 'Nós descobrimos o padrão das baleias por meio de análise quantitativa distribuída, e a nossa IA administra os investimentos.';
const NOTE = 'Estratégia em validação. Não há garantia de antecipar movimentos ou obter lucro.';
const ALT = 'Baleia jubarte nadando em mar azul-meia-noite';
const EYEBROW = 'Baleias e mercado';
const DOC = `${import.meta.env.BASE_URL}documentacao`;

export function HomeWhaleSection() {
  useLocale();
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
          <a href={DOC} className="hw-docs" data-testid="link-whale-documentation">
            <span>{t('Ler a documentação técnica')}</span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
