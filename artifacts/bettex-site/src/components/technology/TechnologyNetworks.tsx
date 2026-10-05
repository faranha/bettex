import './TechnologyNetworks.css';

export function TechnologyNetworks() {
  return (
    <section id="redes-tecnologias" className="technology-networks" aria-label="Redes e tecnologias" data-testid="technology-networks">
      <div className="technology-networks__wrap">
      <p className="technology-networks__label">Technology references</p>
      <ul className="technology-networks__list">
        <li>
          <div className="technology-networks__logo technology-networks__logo--arbitrum">
            <img src={`${import.meta.env.BASE_URL}technologies/arbitrum.webp`} alt="Arbitrum" width={612} height={156} loading="lazy" decoding="async" />
          </div>
        </li>
        <li>
          <div className="technology-networks__logo technology-networks__logo--ethereum">
            <img src={`${import.meta.env.BASE_URL}technologies/ethereum.webp`} alt="Ethereum" width={222} height={60} loading="lazy" decoding="async" />
          </div>
        </li>
        <li>
          <div className="technology-networks__logo technology-networks__logo--allora">
            <img src={`${import.meta.env.BASE_URL}technologies/allora.webp`} alt="Allora" width={523} height={167} loading="lazy" decoding="async" />
          </div>
        </li>
        <li>
          <div className="technology-networks__logo technology-networks__logo--robinhood">
            <img src={`${import.meta.env.BASE_URL}technologies/robinhood.webp`} alt="Robinhood" width={572} height={112} loading="lazy" decoding="async" />
          </div>
        </li>
      </ul>
      </div>
    </section>
  );
}