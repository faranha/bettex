import { ExternalLink } from 'lucide-react';
import { getFormatLocale, t, useLocale } from '../../lib/i18n';
import snapshot from './macro-risk-data.json';
import './InflationOilRisks.css';

function Src({ href, children }: { href: string; children: string }) {
  return <a className="fu-src" href={href} target="_blank" rel="noopener noreferrer">{children}<ExternalLink aria-hidden="true" /></a>;
}

export function InflationOilRisks() {
  useLocale();
  const loc = getFormatLocale();
  const pct = (v: number, sign = false) => new Intl.NumberFormat(loc, { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: sign ? 'always' : 'auto' }).format(v) + '%';
  const { inflation: i, oil: o, sources: s } = snapshot;
  const date = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${o.date}T00:00:00Z`));
  const usd = new Intl.NumberFormat(loc, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(o.usdPerBarrel);
  const steps = ['Conflito ou corte de oferta', 'Custos de energia, frete e produção', 'Pressão sobre preços ao consumidor', 'Menos poder de compra'];

  return (
    <div id="inflacao-petroleo" className="io" role="region" aria-labelledby="io-t">
      <span className="mono fu-tag">{t('03 / Inflação e petróleo · choque global')}</span>
      <h3 id="io-t" className="display">{t('Inflação, petróleo e guerras: a renda sob pressão')}</h3>
      <p className="io-lead">{t('A criação de empregos desacelera enquanto choques de energia e conflitos internacionais ameaçam o custo de vida. Sem renda acompanhando os preços, o mesmo salário compra menos.')}</p>

      <div className="io-grid">
        <article className="io-card">
          <span className="mono io-label">{t('Observado · IBGE, IPCA-15 de setembro de 2026')}</span>
          <p className="display io-value">{pct(i.monthlySeptember, true)}</p>
          <p>{t('Variação mensal, contra')} {pct(i.monthlyAugust, true)} {t('em agosto. Em 12 meses, a taxa foi de')} {pct(i.trailingSeptember)} {t('contra')} {pct(i.trailingAugust)}. {t('O IPCA-15 é uma prévia da inflação, não o IPCA fechado.')}</p>
          <p className="io-small">{t('A energia elétrica subiu 7,42% em setembro, principalmente pelo fim de um crédito anterior de Itaipu. Isso não mostra o petróleo como causa da aceleração medida.')}</p>
          <Src href={s.inflation}>{t('IBGE, IPCA-15 de setembro de 2026')}</Src>
        </article>

        <article className="io-card io-card--expect">
          <span className="mono io-label">{t('Expectativa · Boletim Focus, 28 set. 2026')}</span>
          <p className="display io-value">{pct(i.forecast2026)}</p>
          <p>{t('Projeção do mercado para o IPCA de 2026, acima dos')} {pct(i.forecastPrevious)} {t('da previsão anterior. É uma expectativa, não um resultado realizado.')}</p>
          <Src href={s.focus}>{t('Radioagência, 28 set. 2026')}</Src>
        </article>

        <article className="io-card io-card--oil">
          <span className="mono io-label" data-i18n="translated">{t('Contexto global · reportado em')} {date}</span>
          <p className="display io-value"><span data-i18n="translated">{usd}</span><small>{t('por barril')}</small></p>
          <p>{t('Preço por barril reportado em 28 de setembro no contexto da guerra com o Irã. A referência não identifica o tipo de petróleo e não é uma cotação em tempo real.')}</p>
          <Src href={s.focus}>{t('Petróleo · Radioagência, 28 set. 2026')}</Src>
          <p className="io-small">{t('Em 4 out. 2026, a Agência Brasil, com a Reuters, informou que o presidente do Parlamento iraniano condicionou a reabertura do Estreito de Ormuz, rota importante de energia.')}</p>
          <Src href={s.hormuz}>{t('Agência Brasil/Reuters, 4 out. 2026')}</Src>
        </article>
      </div>

      <div className="io-chain">
        <span className="mono io-label">{t('Cenário de choque, não previsão')}</span>
        <ol>{steps.map(x => <li key={x}>{t(x)}</li>)}</ol>
        <p>{t('O repasse ao consumidor é condicional: depende do câmbio, da política de preços e do tempo. Não é garantido, e a alta de preços pode ser localizada em vez de generalizada.')}</p>
      </div>
    </div>
  );
}

export default InflationOilRisks;
