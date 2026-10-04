import { ExternalLink, UsersRound } from 'lucide-react';
import './MarketOpportunity.css';
import { AudienceOverlap } from './AudienceOverlap';
import { audienceScenario } from './audienceScenario';
import { formatCryptoDailyBillions, marketFlow } from './marketFlow';
import { useLocale } from '../../lib/i18n';

const FLOW = 'https://www.gov.br/mj/pt-br/assuntos/noticias-1/governo-federal-amplia-fiscalizacao-contra-bets-ilegais';

export function MarketOpportunity() {
  useLocale();
  const cryptoDailyBillions = formatCryptoDailyBillions();
  return <div className="pb-market">
    <div className="pb-market__metrics">
      <article className="pb-market__card pb-market__card--total">
        <div className="pb-market__audience-heading"><UsersRound aria-hidden="true" size={32} /><p className="mono pb-market__label">Público potencial · apostas</p></div>
        <p className="display pb-market__value">Até 40</p>
        <h3>milhões de apostadores brasileiros</h3>
        <p>Cenário da BETTEX para a escala do público de apostas no Brasil, considerando diferentes tipos de plataformas. É uma estimativa de mercado, não uma contagem oficial.</p>
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
    </div>
    <AudienceOverlap />
    <div className="pb-market__opportunity">
      <h3 className="display">Já existe público. Já existe volume financeiro.</h3>
      <p>A BETTEX pretende alcançar apostadores brasileiros e pessoas com experiência em cripto. O público central estimado é um núcleo de afinidade, não o limite de atuação do produto.</p>
    </div>
  </div>;
}