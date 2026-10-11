import type { ReactNode } from 'react';
import { t, useLocale } from '@/lib/i18n';
import './PitchEditorialImage.css';

const BASE = import.meta.env.BASE_URL;

export type PitchImageName = 'pitch-economy-separation' | 'pitch-token-participation' | 'pitch-brazil-community' | 'pitch-product-development';

const alts: Record<PitchImageName, string> = {
  'pitch-economy-separation': 'Duas bandejas de trabalho financeiro separadas sobre uma mesa creme, em azul e dourado, representando tesouraria e caixa operacional distintos',
  'pitch-token-participation': 'Protótipo do token BTEX físico em metal azul e dourado, com símbolo da marca e inscrição BTEX em relevo',
  'pitch-brazil-community': 'Pequeno grupo de pessoas conversando sobre tecnologia em um café brasileiro, cena ilustrativa',
  'pitch-product-development': 'Desenvolvedor trabalhando com código em um notebook, representando a construção do produto e da tecnologia',
};

export function PitchEditorialImage({ name, dark = false, className = '' }: { name: PitchImageName; dark?: boolean; className?: string }) {
  useLocale();
  const isToken = name === 'pitch-token-participation';
  const isProduct = name === 'pitch-product-development';
  const imagePath = isToken ? 'pitch-illustrations/pitch-btex-physical-token.webp'
    : isProduct ? 'pitch-illustrations/pitch-software-development.webp' : `pitch-illustrations/${name}.webp`;
  return <figure className={`pei ${dark ? 'pei--dark' : ''} ${isProduct ? 'pei--photo' : ''} ${className}`} data-testid={`img-${name}`}>
    <img src={`${BASE}${imagePath}`} alt={t(alts[name])} width={isProduct ? 1400 : 1024} height={isProduct ? 2100 : 1024} loading="lazy" decoding="async" />
    {isToken && <figcaption>{t('Protótipo do token BTEX físico')}</figcaption>}
  </figure>;
}

export function PitchEditorialSplit({ image, dark = false, side = 'left', children }: { image: ReactNode; dark?: boolean; side?: 'left' | 'right'; children: ReactNode }) {
  return <div className={`pes pes--${side} ${dark ? 'pes--dark' : ''}`}>
    <div className="pes__media">{image}</div>
    <div className="pes__main">{children}</div>
  </div>;
}
