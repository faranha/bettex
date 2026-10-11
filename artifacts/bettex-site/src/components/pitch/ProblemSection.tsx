import { ArrowRight, ExternalLink } from 'lucide-react';
import { ChapterHero } from './ChapterHero';
import './ProblemSection.css';
import { CrowdArt, TotalIcon, PartialIcon } from './MetricArt';
import { FinancialFragility } from './FinancialFragility';
import { PitchObservations } from './PitchObservations';
import { PitchSlider } from './PitchSlider';
import { EmploymentIncomeProblem } from './EmploymentIncomeProblem';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao`;
const CNDL = 'https://site.cndl.org.br/copa-do-mundo-vai-levar-992-milhoes-de-consumidores-as-compras-apontam-cndlspc-brasil/';

const metrics = [
  ['74%', 'Entre os que pretendiam apostar na Copa de 2026', 'viam nas bets uma forma de quitar dívidas pendentes'],
  ['31%', 'No mesmo grupo pesquisado', 'concordavam totalmente com essa possibilidade'],
  ['43%', 'No mesmo grupo pesquisado', 'concordavam parcialmente com essa possibilidade'],
];

export function ProblemSection() {
  const source = <PitchObservations>
    <p className="pb-problem__source"><span>Fonte dos gráficos</span>: <a href={CNDL} target="_blank" rel="noopener noreferrer">CNDL/SPC Brasil e Offerwise, pesquisa sobre a Copa de 2026<ExternalLink aria-hidden="true" /></a>. Amostra de 600 participantes de 18 anos ou mais nas 27 capitais, com intenção de gastos para a Copa. Coleta de 27 de abril a 5 de maio de 2026. Os percentuais se referem aos que pretendiam apostar no evento; 74% reúnem 31% de concordância total e 43% parcial. Esse recorte não representa toda a população brasileira, retorno de apostas ou demanda medida pela BETTEX.</p>
  </PitchObservations>;
  return <section id="problema" aria-labelledby="problema-t" className="slide pb-problem">
    <ChapterHero id="problema" n="03" kicker="Problema" src="pitch-illustrations/pitch-token-participation.webp" title={<>Uma geração com{' '}<span>o futuro em jogo.</span></>} summary="Apostar para obter renda ou quitar dívidas coloca recursos essenciais em risco. Para quem não tem reservas, a dependência do salário amplia essa vulnerabilidade. A BETTEX propõe outra forma de participação econômica, com risco de perda e sem renda garantida." />
    <div className="page-wrap pb-problem__wrap">
      <header className="pb-problem__head">
        <p className="mono pb-problem__topic">1. Perda de dinheiro nas apostas</p>
      </header>

      <div className="pb-problem__intro">
        <p className="pb-problem__lead">A tese da BETTEX é que buscar renda ou quitar dívidas por meio de apostas atribui ao jogo uma função de investimento. Quando os recursos usados são essenciais, a perda pode comprometer as contas da casa.</p>
      </div>

      <PitchSlider id="problema-slider" tone="light" label={['Fragilidade financeira em blocos', 'Financial fragility blocks', 'Fragilidad financiera por bloques']} slides={[
        { label: ['Renda e reservas', 'Income and savings', 'Ingresos y reservas'], node: <FinancialFragility /> },
        { label: ['Pesquisa CNDL', 'CNDL survey', 'Encuesta CNDL'], node: <><div className="pb-problem__metrics pitch-metrics">
        {metrics.map(([v, group, t], i) => <div key={v} className={`pb-metric pb-metric--${i}`}>
          {i === 0 ? <CrowdArt /> : i === 1 ? <TotalIcon /> : <PartialIcon />}
          <p className="mono pb-metric__group">{group}</p>
          <div className="display pb-metric__value">{v}</div>
          <p className="pb-metric__text">{t}</p>
        </div>)}
      </div>{source}</> },
        { label: ['Oportunidade', 'Opportunity', 'Oportunidad'], node: <div className="pb-problem__notes">
        <div className="pb-problem__hyp">
          <p>A oportunidade proposta é oferecer ao público de apostas uma experiência de investimento compreensível, com participação condicionada nos resultados de estratégias de trading. A linguagem pode ser familiar; os direitos, os custos e os riscos precisam ser explícitos. Essa migração ainda precisa ser validada com usuários e não promete recuperar perdas de apostas.</p>
          <a href={`${DOC}#documentacao-oportunidade`} className="tap pb-problem__doc">Conheça a proposta na documentação<ArrowRight aria-hidden="true" /></a>
        </div>
      </div> },
      ]} />

      <EmploymentIncomeProblem />
    </div>
  </section>;
}
