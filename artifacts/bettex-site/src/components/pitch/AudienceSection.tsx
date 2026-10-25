import { ChapterHero } from './ChapterHero';
import './ProblemSection.css';
import { MarketOpportunity } from './MarketOpportunity';
import { t, useLocale } from '@/lib/i18n';

export function AudienceSection() {
  const locale = useLocale();
  return <section id="publico-pitch" aria-labelledby="publico-pitch-t" className="slide pb-problem">
    <ChapterHero id="publico-pitch" n="02" kicker={locale === 'en' ? t('Público-alvo') : t('Público')} src="pitch-illustrations/pitch-brazil-community.webp" title={<>O público brasileiro.<br /><span>A escala e o volume financeiro.</span></>} summary="A BETTEX busca alcançar os públicos brasileiros de apostas e cripto. A proposta é um produto de investimento que fale a língua dessas pessoas, com experiência familiar, custos claros e risco de perda explícito." />
    <div className="page-wrap pb-problem__wrap">
      <MarketOpportunity />
    </div>
  </section>;
}