import { BettexMark } from '@/components/BettexMark';
import './InvestorAppPreview.css';

export function InvestorAppPreview() {
  return (
    <section id="visao-investidor" className="investor-preview investor-preview--banner" aria-labelledby="investor-preview-title" data-testid="section-visao-investidor">
      <div className="investor-preview__wrap">
        <div className="ip-banner">
          <span className="ip-banner__logo" aria-hidden="true"><BettexMark /></span>
          <div className="ip-banner__text">
            <p className="investor-preview__eyebrow">Demonstração</p>
            <h2 id="investor-preview-title" className="ip-banner__title"><em>Acesse o demo ao vivo agora mesmo.</em></h2>
          </div>
          <a className="ip-banner__cta" href={`${import.meta.env.BASE_URL}demo`} data-testid="link-demo-ao-vivo">Abrir o demo</a>
        </div>
      </div>
    </section>
  );
}
