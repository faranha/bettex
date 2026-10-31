import { ExternalLink, UsersRound } from 'lucide-react';
import './MarketOpportunity.css';
import { AudienceOverlap } from './AudienceOverlap';
import { AudienceAgeProfile } from './AudienceAgeProfile';
import { audienceScenario } from './audienceScenario';
import { formatCryptoDailyBillions, marketFlow } from './marketFlow';
import { PitchSlider } from './PitchSlider';
import { useLocale } from '../../lib/i18n';

const FLOW = 'https://www.gov.br/mj/pt-br/assuntos/noticias-1/governo-federal-amplia-fiscalizacao-contra-bets-ilegais';

export function MarketOpportunity() {
  useLocale();
  const cryptoDailyBillions = formatCryptoDailyBillions();
  const metrics = <div className="pb-market__metrics">
      <article className="pb-market__card pb-market__card--total">
        <div className="pb-market__audience-heading"><UsersRound aria-hidden="true" size={32} /><p className="mono pb-market__label">Público potencial · apostas</p></div>
        <p className="display pb-market__value">≈ {audienceScenario.bettingMillions}</p>
        <h3>milhões de apostadores brasileiros</h3>
        <p>Cenário da BETTEX para a escala do público de apostas no Brasil, considerando diferentes tipos de plataformas. É uma estimativa de mercado, não uma contagem oficial.</p>
        <a href={audienceScenario.bettingSourceUrl} target="_blank" rel="noopener noreferrer">Apostas: Fazenda / SIGAP, via Folha · set. 2026<ExternalLink aria-hidden="true" /></a>
      </article>
      <article className="pb-market__card">
        <div className="pb-market__audience-heading"><UsersRound aria-hidden="true" size={32} /><p className="mono pb-market__label">Público potencial · cripto</p></div>
        <p className="display pb-market__value">≈ {audienceScenario.cryptoMillions}</p>
        <h3>milhões têm ou já tiveram cripto</h3>
        <p>17,2% dos brasileiros no público pesquisado dizem ter ou já ter tido dinheiro em criptomoedas. Inclui experiências passadas, não apenas quem possui cripto hoje.</p>
        <a href={audienceScenario.cryptoSourceUrl} target="_blank" rel="noopener noreferrer">Datafolha / Paradigma · publicado em ago. 2026<ExternalLink aria-hidden="true" /></a>
      </article>
      <article className="pb-market__card pb-market__card--money">
        <p className="mono pb-market__label">Movimentação diária · cripto</p>
        <p className="display pb-market__value">R$ {cryptoDailyBillions}</p>
        <h3>bilhão por dia, aproximadamente</h3>
        <p>R$ 283 bilhões em operações no primeiro semestre de 2026. Inclui negociações, stablecoins e operações empresariais.</p>
        <a href={marketFlow.cryptoSourceUrl} target="_blank" rel="noopener noreferrer">Receita Federal / Valor Investe · set. 2026<ExternalLink aria-hidden="true" /></a>
        <div className="pb-market__betting-flow">
          <p><strong>Bets: cerca de R$ 600 milhões por dia.</strong> Referência histórica de depósitos, antes da proibição de setembro de 2026.</p>
          <a href={FLOW} target="_blank" rel="noopener noreferrer">Fazenda / MJSP, 2 out. 2026<ExternalLink aria-hidden="true" /></a>
        </div>
      </article>
    </div>;
  const opportunity = <div className="pb-market__opportunity">
      <h3 className="display">Já existe público. Já existe volume financeiro.</h3>
      <p>A BETTEX pretende alcançar apostadores brasileiros e pessoas com experiência em cripto. O público central estimado é um núcleo de afinidade, não o limite de atuação do produto. Público potencial não é uma base de compradores validada. Movimentação do mercado não é receita da BETTEX. Converter parte desse público em participantes e usuários recorrentes é uma hipótese comercial a validar.</p>
    </div>;
  return <div className="pb-market">
    <PitchSlider id="publico-mercado-slider" tone="light" label={['Público e mercado em blocos', 'Audience and market blocks', 'Público y mercado por bloques']} slides={[
      { label: ['Escala e volume', 'Scale and volume', 'Escala y volumen'], node: metrics },
      { label: ['Interseção de públicos', 'Audience overlap', 'Intersección de públicos'], node: <AudienceOverlap /> },
      { label: ['Perfil por idade', 'Age profile', 'Perfil por edad'], node: <AudienceAgeProfile /> },
      { label: ['Oportunidade', 'Opportunity', 'Oportunidad'], node: opportunity },
    ]} />
  </div>;
}