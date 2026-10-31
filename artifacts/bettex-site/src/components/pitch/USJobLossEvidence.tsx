import { ExternalLink } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { AICutsChart, FinancialLossChart, TechnologyCutsChart } from './EmploymentLossCharts';
import './USJobLossEvidence.css';

const BLS = 'https://www.bls.gov/news.release/empsit.nr0.htm';
const CHALLENGER = 'https://www.challengergray.com/wp-content/uploads/2026/10/Challenger-Report-September-2026.pdf';

export function USJobLossEvidence() {
  const locale = useLocale();
  const format = (value: number) => new Intl.NumberFormat(locale).format(value);
  return <section id="empregos-eua" className="us-losses" aria-labelledby="us-losses-title">
    <h3 id="us-losses-title" className="display us-losses__title">01 / EUA · Perdas de postos e cortes anunciados</h3>
    <p>Há perdas líquidas de empregos em setores específicos e empresas anunciando cortes associados à IA. São evidências do enfraquecimento de oportunidades e da eliminação de funções, não uma medição de desaparecimento de todo o emprego americano.</p>
    <div className="fu-evidence">
      <article>
        <span className="mono fu-tag">Perda líquida observada · maio de 2025 a setembro de 2026</span>
        <p className="display fu-evidence-value">{format(-129000)}</p>
        <h4 className="display">Postos a menos no setor financeiro</h4>
        <FinancialLossChart />
        <p>O BLS registra 129 mil postos a menos desde o pico de maio de 2025. Seguros e atividades relacionadas respondem por 90 mil dessas perdas, já incluídas no total. É redução efetiva do estoque de postos; o relatório não atribui essa queda à IA.</p>
        <a className="fu-src" href={BLS} target="_blank" rel="noopener noreferrer">BLS · relatório de setembro, publicado em 2 out. 2026<ExternalLink aria-hidden="true" /></a>
      </article>
      <article>
        <span className="mono fu-tag">Cortes anunciados · janeiro a setembro de 2026</span>
        <p className="display fu-evidence-value">{format(165925)}</p>
        <h4 className="display">Cortes anunciados em tecnologia</h4>
        <TechnologyCutsChart />
        <p>As empresas de tecnologia anunciaram 165.925 cortes nos EUA, contra 107.878 no mesmo período de 2025: aumento de 54%. São anúncios de desligamentos, não uma contagem de todos os cortes já executados nem uma perda líquida após contratações.</p>
        <a className="fu-src" href={CHALLENGER} target="_blank" rel="noopener noreferrer">Challenger · relatório de setembro, 1 out. 2026<ExternalLink aria-hidden="true" /></a>
      </article>
      <article>
        <span className="mono fu-tag">Motivo declarado · janeiro a setembro de 2026</span>
        <p className="display fu-evidence-value">{format(120136)}</p>
        <h4 className="display">Cortes anunciados com IA citada como motivo</h4>
        <AICutsChart />
        <p>A Challenger contabiliza 120.136 cortes anunciados por empregadores dos EUA que citaram IA como motivo: cerca de 21% dos anúncios do período. É a justificativa informada pelas empresas, não uma comprovação independente de causalidade.</p>
        <a className="fu-src" href={CHALLENGER} target="_blank" rel="noopener noreferrer">Challenger · motivos dos cortes, 1 out. 2026<ExternalLink aria-hidden="true" /></a>
      </article>
    </div>
    <p className="us-losses__limit">Os indicadores não devem ser somados: o financeiro é uma variação líquida, tecnologia é um setor e IA é um motivo que pode incluir cortes desse mesmo setor. No conjunto acompanhado pela Challenger, os anúncios de cortes caíram 39% em relação a janeiro a setembro de 2025; o aumento em tecnologia não é um aumento generalizado.</p>
    <p className="us-losses__limit">Esses dados sustentam a tese de perdas de postos e pressão sobre funções específicas, não uma queda nacional de dezenas de milhões de pessoas empregadas. A previsão de eliminação ampla de empregos continua sendo um cenário, não um resultado já demonstrado. Fontes conferidas em 4 out. 2026.</p>
  </section>;
}