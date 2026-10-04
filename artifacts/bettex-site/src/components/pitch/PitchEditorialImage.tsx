import type { ReactNode } from 'react';
import { t, useLocale } from '@/lib/i18n';
import './PitchEditorialImage.css';

const BASE = import.meta.env.BASE_URL;

export type PitchImageName = 'pitch-economy-separation' | 'pitch-token-participation' | 'pitch-brazil-community' | 'pitch-product-development';

const alts: Record<PitchImageName, string> = {
  'pitch-economy-separation': 'Duas bandejas de trabalho financeiro separadas sobre uma mesa creme, em azul e dourado, representando tesouraria e empresa distintas',
  'pitch-token-participation': 'Disco de token em azul e dourado sobre fundo azul-marinho, ilustração conceitual de participação',
  'pitch-brazil-community': 'Pequeno grupo de pessoas conversando sobre tecnologia em um café brasileiro, cena ilustrativa',
  'pitch-product-development': 'Notebook, caderno de protótipo, placa de circuito e infraestrutura, ilustração do desenvolvimento do produto',
};

export function PitchEditorialImage({ name, dark = false, className = '' }: { name: PitchImageName; dark?: boolean; className?: string }) {
  useLocale();
  return <figure className={`pei ${dark ? 'pei--dark' : ''} ${className}`} data-testid={`img-${name}`}>
    <img src={`${BASE}pitch-illustrations/${name}.webp`} alt={t(alts[name])} width={1024} height={1024} loading="lazy" decoding="async" />
    <figcaption>{t('Imagem conceitual')}</figcaption>
  </figure>;
}

export function PitchEditorialSplit({ image, dark = false, side = 'left', children }: { image: ReactNode; dark?: boolean; side?: 'left' | 'right'; children: ReactNode }) {
  return <div className={`pes pes--${side} ${dark ? 'pes--dark' : ''}`}>
    <div className="pes__media">{image}</div>
    <div className="pes__main">{children}</div>
  </div>;
}
