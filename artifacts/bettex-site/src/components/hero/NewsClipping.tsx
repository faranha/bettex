import { BETTING_NEWS_URL } from './bettingNewsSource';
import './NewsClipping.css';

export function NewsClipping({ className = '', showSource = false }: { className?: string; showSource?: boolean }) {
  return (
    <figure className={`news-clip ${className}`} data-testid="news-clipping">
      <span className="news-clip__tape news-clip__tape--a" aria-hidden="true" />
      <span className="news-clip__tape news-clip__tape--b" aria-hidden="true" />
      <div className="news-clip__paper">
        <span className="news-clip__tag">APOSTAS</span>
        <img
          className="news-clip__img"
          src={`${import.meta.env.BASE_URL}noticia-ia-fundo.webp`}
          alt="Recorte de notícia com a manchete: Gigante americana das bets usou IA para encontrar apostadores mais propensos a perder"
          width={720}
          height={367}
          loading="eager"
          decoding="async"
        />
        <figcaption className="news-clip__cap">
          <strong className="news-clip__kicker">UM CASO REPORTADO</strong>
          <span>A IA já trabalha a favor das casas de apostas. Nós escolhemos usá-la do nosso lado, com estratégia e protocolos próprios.</span>
          {showSource && (
            <div className="news-clip__source">
              <span>Fonte: <strong>Terra</strong></span>
              <a href={BETTING_NEWS_URL} target="_blank" rel="noopener noreferrer" aria-label="Ler a reportagem no Terra (abre em nova aba)">Ler reportagem</a>
            </div>
          )}
        </figcaption>
      </div>
    </figure>
  );
}
