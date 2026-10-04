import { ArrowRight, ExternalLink } from 'lucide-react';
import { ChapterHero } from './ChapterHero';
import './ProblemSection.css';
import { CrowdArt, TotalIcon, PartialIcon } from './MetricArt';
import { FinancialFragility } from './FinancialFragility';
import { PitchObservations } from './PitchObservations';
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
  return <section id="problema" aria-labelledby="problema-t" className="slide pb-problem">
    <ChapterHero id="problema" n="03" kicker="Problema" src="pitch-illustrations/pitch-token-participation.webp" title={<>Uma geração com{' '}<span>o futuro em jogo.</span></>} summary="No mundo inteiro, pessoas tratam apostas como investimento enquanto a IA ameaça empregos e renda. Na visão da BETTEX, essa combinação de insegurança econômica e comportamentos nocivos pode levar uma geração à miséria, com vidas e futuros em jogo nos próximos 3 anos se as previsões sobre como a IA vai absorver os postos de trabalho se materializarem." />
    <div className="page-wrap pb-problem__wrap">
      <header className="pb-problem__head">
        <p className="mono pb-problem__topic">1. Perda de dinheiro nas apostas</p>
      </header>

      <div className="pb-problem__intro">
        <p className="pb-problem__lead">A tese da BETTEX é que apostar para obter renda ou quitar dívidas é atribuir ao jogo uma função de investimento. Ao tratar apostas como investimento, brasileiros e pessoas ao redor do mundo se expõem à perda de dinheiro justamente quando buscam melhorar sua situação financeira.</p>
      </div>

      <FinancialFragility />

      <div className="pb-problem__metrics pitch-metrics">
        {metrics.map(([v, group, t], i) => <div key={v} className={`pb-metric pb-metric--${i}`}>
          {i === 0 ? <CrowdArt /> : i === 1 ? <TotalIcon /> : <PartialIcon />}
          <p className="mono pb-metric__group">{group}</p>
          <div className="display pb-metric__value">{v}</div>
          <p className="pb-metric__text">{t}</p>
        </div>)}
      </div>

      <div className="pb-problem__notes">
        <div className="pb-problem__hyp">
          <p>A oportunidade é vender o token BETTEX para quem hoje aposta como se estivesse investindo enquanto depreda o próprio futuro. O token representa um investimento em tecnologia, com estética de aposta e uma experiência familiar a esse público. É um caminho mais saudável para começar a pensar em investir e deixar de tratar o jogo como investimento. É uma forma de resgatar um futuro que se perde a cada dia.</p>
          <a href={`${DOC}#documentacao-oportunidade`} className="tap pb-problem__doc">Conheça a proposta na documentação<ArrowRight aria-hidden="true" /></a>
        </div>
        <PitchObservations>
          <p className="pb-problem__source"><span>Fonte dos gráficos</span>: <a href={CNDL} target="_blank" rel="noopener noreferrer">CNDL/SPC Brasil e Offerwise, pesquisa sobre a Copa de 2026<ExternalLink aria-hidden="true" /></a>. Amostra de 600 participantes de 18 anos ou mais nas 27 capitais, com intenção de gastos para a Copa. Coleta de 27 de abril a 5 de maio de 2026. Os percentuais se referem aos que pretendiam apostar no evento; 74% reúnem 31% de concordância total e 43% parcial. Esse recorte não representa toda a população brasileira, retorno de apostas ou demanda medida pela BETTEX.</p>
        </PitchObservations>
      </div>
      <EmploymentIncomeProblem />
    </div>
  </section>;
}
