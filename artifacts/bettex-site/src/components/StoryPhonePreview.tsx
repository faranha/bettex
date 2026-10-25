export function StoryPhonePreview() {
  return (
    <figure className="hs-phone-fig">
      <div className="hs-phone" role="img" aria-label="Prévia ilustrativa do aplicativo BETTEX, com token BETTEX, saldo em reais e resultados. Sem valores.">
        <span className="hs-phone__brand">BETTEX</span>
        <span className="hs-phone__token" aria-hidden="true">B</span>
        <span className="hs-phone__row"><b>Saldo em reais</b><i className="hs-phone__bar" /></span>
        <span className="hs-phone__row"><b>Resultados</b><i className="hs-phone__bar hs-phone__bar--s" /></span>
      </div>
      <figcaption>Prévia ilustrativa</figcaption>
    </figure>
  );
}
