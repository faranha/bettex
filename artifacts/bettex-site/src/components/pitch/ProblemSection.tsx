import { ArrowRight, ExternalLink } from 'lucide-react';
import './ProblemSection.css';
import { PitchArt, TotalIcon, PartialIcon } from './MetricArt';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;
const CNDL = 'https://site.cndl.org.br/copa-do-mundo-vai-levar-992-milhoes-de-consumidores-as-compras-apontam-cndlspc-brasil/';

const metrics = [
  ['74%', 'Entre os que pretendiam apostar na Copa de 2026', 'viam nas bets uma forma de quitar dívidas pendentes'],
  ['31%', 'No mesmo grupo pesquisado', 'concordavam totalmente com essa possibilidade'],
  ['43%', 'No mesmo grupo pesquisado', 'concordavam parcialmente com essa possibilidade'],
];

export function ProblemSection() {
  return <section id="problema" aria-labelledby="problema-t" className="slide pb-problem">
    <div className="page-wrap pb-problem__wrap">
      <header className="pb-problem__head">
        <div className="mono pb-problem__kicker"><span>01 / 10</span><span className="pb-problem__rule" aria-hidden="true" />Problema e oportunidade</div>
        <h2 id="problema-t" className="display pb-problem__title">Apostar <span>não é investir.</span></h2>
        <p className="pb-problem__summary">Para quem aposta buscando renda, o jogo não é apenas entretenimento. É uma expectativa de retorno financeiro.</p>
        <p className="mono pb-problem__eligibility">Participação na BETTEX: somente pessoas de 18 anos ou mais.</p>
      </header>

      <div className="pb-problem__intro">
        <p className="pb-problem__lead">A tese da BETTEX é que apostar para obter renda ou quitar dívidas é atribuir ao jogo uma função de investimento. O projeto propõe redirecionar essa busca por retorno financeiro para estratégias de investimento geridas por IA.</p>
        <p>A pesquisa CNDL/SPC Brasil, com a Offerwise, ouviu consumidores de 18 anos ou mais nas 27 capitais que pretendiam gastar com a Copa de 2026. Os percentuais abaixo se referem aos que pretendiam apostar nesse evento.</p>
      </div>

      <div className="pb-problem__metrics pitch-metrics">
        {metrics.map(([v, group, t], i) => <div key={v} className={`pb-metric pb-metric--${i}`}>
          {i === 0 ? <PitchArt /> : i === 1 ? <TotalIcon /> : <PartialIcon />}
          <p className="mono pb-metric__group">{group}</p>
          <div className="display pb-metric__value">{v}</div>
          <p className="pb-metric__text">{t}</p>
        </div>)}
      </div>

      <div className="pb-problem__notes">
        <p className="pb-problem__source">Fonte: <a href={CNDL} target="_blank" rel="noopener noreferrer">CNDL/SPC Brasil e Offerwise, pesquisa sobre a Copa de 2026<ExternalLink aria-hidden="true" /></a>. Amostra de 600 participantes com intenção de gastos para a Copa, coleta de 27 de abril a 5 de maio de 2026. Os 74% reúnem 31% de concordância total e 43% parcial. Esse recorte não representa toda a população brasileira, retorno de apostas ou demanda medida pela BETTEX.</p>
        <div className="pb-problem__hyp">
          <p>A oportunidade é uma hipótese: uma experiência financeira compreensível, com custos e riscos à vista. O projeto não mira pessoas em dificuldade e não promete recuperar perdas de apostas.</p>
          <a href={`${DOC}#documentacao-oportunidade`} target="_blank" rel="noopener noreferrer" className="tap pb-problem__doc">Conheça a proposta na documentação<ArrowRight aria-hidden="true" /></a>
        </div>
      </div>
    </div>
  </section>;
}
