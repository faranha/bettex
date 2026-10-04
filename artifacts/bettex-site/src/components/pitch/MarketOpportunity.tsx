import { ExternalLink } from 'lucide-react';
import './MarketOpportunity.css';
import { AudienceOverlap } from './AudienceOverlap';
import { audienceScenario } from './audienceScenario';

const PEOPLE = 'https://oglobo.globo.com/economia/noticia/2026/09/25/bets-tem-receita-de-r-20-bi-em-2026-e-9-milhoes-de-apostadores-por-mes-veja-retrato-do-setor.ghtml';
const FLOW = 'https://www.gov.br/mj/pt-br/assuntos/noticias-1/governo-federal-amplia-fiscalizacao-contra-bets-ilegais';
const DEPOSITS = 'https://www.cnnbrasil.com.br/economia/media-de-depositos-em-bets-no-brasil-era-de-r-582-milhoes-por-dia/';

export function MarketOpportunity() {
  return <div className="pb-market">
    <div className="pb-market__metrics">
      <article className="pb-market__card pb-market__card--total">
        <p className="mono pb-market__label">Cenário de público · BETTEX</p>
        <p className="display pb-market__value">Até 40</p>
        <h3>milhões de apostadores brasileiros</h3>
        <p>Cenário da BETTEX para a escala do público de apostas no Brasil, considerando diferentes tipos de plataformas. É uma estimativa de mercado, não uma contagem oficial.</p>
      </article>
      <article className="pb-market__card">
        <p className="mono pb-market__label">Experiência com cripto · pesquisa</p>
        <p className="display pb-market__value">≈ {audienceScenario.cryptoMillions}</p>
        <h3>milhões têm ou já tiveram cripto</h3>
        <p>17,2% dos brasileiros no público pesquisado dizem ter ou já ter tido dinheiro em criptomoedas. Inclui experiências passadas, não apenas quem possui cripto hoje.</p>
        <a href={audienceScenario.cryptoSourceUrl} target="_blank" rel="noopener noreferrer">Datafolha / Paradigma · publicado em ago. 2026<ExternalLink aria-hidden="true" /></a>
      </article>
      <article className="pb-market__card pb-market__card--money">
        <p className="mono pb-market__label">Fluxo diário histórico</p>
        <p className="display pb-market__value">R$ 600</p>
        <h3>milhões por dia, aproximadamente</h3>
        <p>Movimentação diária enviada às casas de apostas antes da proibição de setembro de 2026, segundo a Fazenda. É volume de depósitos, não lucro das bets.</p>
        <a href={FLOW} target="_blank" rel="noopener noreferrer">Fazenda / MJSP, 2 out. 2026<ExternalLink aria-hidden="true" /></a>
      </article>
    </div>
    <AudienceOverlap />
    <div className="pb-market__opportunity">
      <h3 className="display">Já existe público. Já existe volume financeiro.</h3>
      <p>A oportunidade da BETTEX é oferecer ao apostador brasileiro um produto de investimento que fale a sua língua: experiência familiar, linguagem acessível e estratégias geridas por IA. O objetivo é redirecionar a busca por retorno financeiro das apostas para a participação em resultados de investimentos em mercados de risco.</p>
      <p>Esse volume não é receita nem captação da BETTEX. A migração depende da escolha dos usuários, da execução do produto e das condições legais; não há promessa de retorno ou recuperação de perdas.</p>
    </div>
    <div className="pb-market__sources">
      <p>Base de apostas: até 40 milhões é o cenário de escala da BETTEX, não uma estatística oficial nem um teto comprovado para o Brasil. Os dados publicados da Fazenda contextualizam esse mercado, mas não verificam esse total.</p>
      <p>Base de cripto: 2ª Pesquisa Nacional das Criptomoedas, Datafolha e Paradigma. Coleta presencial de 11 a 14 de maio de 2026, com 2.004 entrevistados em 137 municípios, público de 16 anos ou mais. Margem de erro de 2 pontos percentuais e confiança de 95%. A matéria do Valor, de 18 de agosto de 2026, reporta 17,2%, equivalentes a cerca de 29 milhões de pessoas.</p>
      <p>O cruzamento usa a taxa nacional de experiência com cripto como aproximação para o grupo de apostadores, supondo independência entre os comportamentos. As bases têm períodos e recortes etários diferentes; não existe medição conjunta nas fontes consultadas. A estimativa não identifica usuários ativos, elegíveis ou interessados na BETTEX. A participação no produto é restrita a pessoas de 18 anos ou mais.</p>
      <p>Escala financeira: a CNN, com dados da Fazenda via LAI, registra R$ 318 bilhões em depósitos de janeiro de 2025 a junho de 2026, média de R$ 582 milhões por dia. A Fazenda informou cerca de R$ 600 milhões por dia antes da MP nº 1.394/2026, publicada em 25 de setembro. São referências históricas, não o fluxo atual.</p>
      <div className="pb-market__links">
        <a href={DEPOSITS} target="_blank" rel="noopener noreferrer">Depósitos, período e média diária · CNN Brasil<ExternalLink aria-hidden="true" /></a>
        <a href={PEOPLE} target="_blank" rel="noopener noreferrer">Mercado de apostas · Fazenda / O Globo<ExternalLink aria-hidden="true" /></a>
        <a href={audienceScenario.cryptoSourceUrl} target="_blank" rel="noopener noreferrer">Pesquisa de cripto e metodologia · Valor Econômico<ExternalLink aria-hidden="true" /></a>
      </div>
    </div>
  </div>;
}