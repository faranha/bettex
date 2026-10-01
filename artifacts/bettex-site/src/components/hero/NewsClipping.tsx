import './NewsClipping.css';

export function NewsClipping({ className = '' }: { className?: string }) {
  return (
    <figure className={`news-clip ${className}`} data-testid="news-clipping">
      <span className="news-clip__tape news-clip__tape--a" aria-hidden="true" />
      <span className="news-clip__tape news-clip__tape--b" aria-hidden="true" />
      <div className="news-clip__paper">
        <span className="news-clip__tag">ECONOMIA</span>
        <img
          className="news-clip__img"
          src={`${import.meta.env.BASE_URL}noticia-ia-recorte.webp`}
          alt="Recorte de notícia com a manchete: Gigante americana das bets usou IA para encontrar apostadores mais propensos a perder"
          width={720}
          height={438}
          loading="eager"
          decoding="async"
        />
        <figcaption className="news-clip__cap">
          <strong className="news-clip__kicker">UM CASO REPORTADO</strong>
          <span>Novamente, a IA é usada contra nós. Nossa resposta é seguir nossos próprios protocolos.</span>
        </figcaption>
      </div>
    </figure>
  );
}
