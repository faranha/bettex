import { ExternalLink } from 'lucide-react';
import { getFormatLocale, t, useLocale } from '../../lib/i18n';
import './FinancialFragility.css';

const evidence = [
  {
    value: 0.643, digits: 1, flag: 'flags/br.svg',
    label: 'Brasil · salário nas apostas',
    description: 'Apostadores entrevistados que usam salários ou rendimentos regulares para apostar.',
    source: 'Futura Inteligência / Estadão · fev. 2025',
    url: 'https://www.estadao.com.br/economia/veja-graficos-perfil-social-financeiro-aposta-bets/',
  },
  {
    value: 0.657, digits: 1, flag: 'flags/br.svg',
    label: 'Brasil · sem dinheiro guardado',
    description: 'Apostadores entrevistados que dizem não ter dinheiro guardado.',
    source: 'Futura Inteligência / Estadão · fev. 2025',
    url: 'https://www.estadao.com.br/economia/veja-graficos-perfil-social-financeiro-aposta-bets/',
  },
  {
    value: 0.665, digits: 1, flag: 'flags/us.svg',
    label: 'EUA · de salário em salário',
    description: 'Consumidores americanos que relatam viver de salário em salário, com ou sem dificuldades para pagar contas.',
    source: 'PYMNTS Intelligence · relatório de 2026',
    url: 'https://www.pymnts.com/study_posts/the-american-paycheck-2026-annual-edition-an-annual-portrait-of-how-americans-earn-spend-save-and-sustain-themselves',
  },
  {
    value: 0.45, digits: 0, flag: 'flags/us.svg',
    label: 'EUA · reserva insuficiente',
    description: 'Adultos americanos sem uma reserva específica para cobrir três meses de despesas.',
    source: 'Federal Reserve · SHED, maio de 2026',
    url: 'https://www.federalreserve.gov/publications/2026-economic-well-being-of-us-households-in-2025-savings-investments.htm',
  },
] as const;

export function FinancialFragility() {
  useLocale();
  const percent = (value: number, digits: number) => `${new Intl.NumberFormat(getFormatLocale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value * 100)}%`;
  return <section className="pb-fragility" id="problema-renda-do-mes" aria-labelledby="problema-renda-do-mes-t">
    <h3 className="display" id="problema-renda-do-mes-t">Renda do mês nas apostas e falta de reservas</h3>
    <p className="pb-fragility__intro">No levantamento da Futura Inteligência, a maioria dos apostadores usa salários ou rendimentos regulares para apostar; a maioria também diz não ter dinheiro guardado. Sem reservas, perder o trabalho pode significar perder a renda que sustenta a casa, enquanto as contas continuam chegando.</p>
    <div className="pb-fragility__grid">
      {evidence.map(item => <article className="pb-fragility__card" key={item.label}>
        <p className="mono pb-fragility__label">
          <img className="pb-fragility__flag" src={`${import.meta.env.BASE_URL}${item.flag}`} width={24} height={16} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <span>{t(item.label)}</span>
        </p>
        <p className="display pb-fragility__value">{percent(item.value, item.digits)}</p>
        <p className="pb-fragility__description">{t(item.description)}</p>
        <a href={item.url} target="_blank" rel="noopener noreferrer">{t(item.source)}<ExternalLink aria-hidden="true" /></a>
      </article>)}
    </div>
    <p className="pb-fragility__conclusion">Na visão da BETTEX, o risco se agrava quando a mesma pessoa aposta recursos essenciais, não consegue formar reservas e depende de um trabalho que pode ser afetado pela automação.</p>
  </section>;
}