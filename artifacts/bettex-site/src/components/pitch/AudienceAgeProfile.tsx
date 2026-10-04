import { ExternalLink } from 'lucide-react';
import './AudienceAgeProfile.css';
import { PitchObservations } from './PitchObservations';

const BETTING_AGE_SOURCE = 'https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas/apresentacoes/defeso-2deg-panorama-semestral-de-apostas-de-quota-fixa-jan-2026.pdf';
const CRYPTO_AGE_SOURCE = 'https://valorinveste.globo.com/mercados/cripto/noticia/2026/08/18/cripto-ja-e-conhecida-por-2-em-cada-3-brasileiros-mas-so-8percent-investem.ghtml';

export function AudienceAgeProfile() {
  return <section className="pb-audience-ages" id="publico-faixa-etaria" aria-labelledby="publico-faixa-etaria-t">
    <h3 className="display" id="publico-faixa-etaria-t">Faixas etárias: apostas e cripto</h3>
    <div className="pb-audience-ages__grid">
      <article className="pb-audience-ages__card">
        <p className="mono pb-audience-ages__label">Apostas · maioria do público</p>
        <p className="display pb-audience-ages__value">25–40 <span>anos</span></p>
        <p>51,3% dos apostadores do mercado regulado estavam nessa faixa em 2025: 22,7% entre 25 e 30 anos e 28,6% entre 31 e 40.</p>
        <a href={BETTING_AGE_SOURCE} target="_blank" rel="noopener noreferrer">Fazenda / SIGAP · dados de 2025, publicado em jan. 2026<ExternalLink aria-hidden="true" /></a>
      </article>
      <article className="pb-audience-ages__card">
        <p className="mono pb-audience-ages__label">Cripto · maior adesão por idade</p>
        <p className="display pb-audience-ages__value">16–24 <span>anos</span></p>
        <p>32% das pessoas nessa faixa têm ou já tiveram criptomoedas.</p>
        <a href={CRYPTO_AGE_SOURCE} target="_blank" rel="noopener noreferrer">Datafolha / Paradigma · Valor Investe, ago. 2026<ExternalLink aria-hidden="true" /></a>
      </article>
    </div>
    <PitchObservations><p>Apostas: composição do público do mercado regulado em 2025. Cripto: adesão dentro da faixa etária em 2026, incluindo posse atual ou passada. São indicadores diferentes, não uma comprovação de perfis etários iguais.</p></PitchObservations>
  </section>;
}