import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChartCandlestick, Infinity, Info, ScanSearch, UsersRound } from 'lucide-react';
import { formatTokenCount, tokenomics } from '@/lib/tokenomics';
import './investor.css';

const access = [
  {
    number: '01',
    icon: ChartCandlestick,
    title: 'Participar dos lucros',
    description: 'Quando houver lucro nas operações, ele é distribuído diariamente aos titulares dos tokens.',
  },
  {
    number: '02',
    icon: UsersRound,
    title: 'Decidir com a comunidade',
    description: 'Participe das decisões sobre os próximos passos e a evolução do projeto.',
  },
  {
    number: '03',
    icon: ScanSearch,
    title: 'Acompanhar em tempo real',
    description: 'Veja no sistema do investidor a movimentação e o estágio dos agentes BETTEX.',
  },
] as const;

export function InvestorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.08 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="investidor"
      className="bett-investor"
      data-visible={visible}
      aria-labelledby="bett-investor-title"
      data-testid="section-investidores"
    >
      <div className="bett-investor__inner">
        <div className="bett-investor__hero">
          <div className="bett-investor__copy">
            <p className="bett-investor__eyebrow">BETTEX / Para investidores</p>
            <h2 id="bett-investor-title" className="bett-investor__title">
              Seu token.<em>Sua parte na IA.</em>
            </h2>
            <p className="bett-investor__lead">
              Ter tokens BETTEX é <strong>ser dono de uma parte do projeto de IA</strong> que reúne PREDIX, TRADIX, SPORTIX e BETTIX.
              Os lucros efetivamente gerados são distribuídos diariamente aos titulares. Você também tem voz na comunidade e acesso ao sistema para acompanhar os agentes em tempo real.
            </p>
            <div className="bett-investor__perpetual" data-testid="text-token-perpetuo">
              <span className="bett-investor__perpetual-icon" aria-hidden="true"><Infinity size={23} strokeWidth={1.8} /></span>
              <p><strong>Token perpétuo.</strong> Sem data de vencimento. Distribuições dependem dos resultados; rentabilidade não é garantida.</p>
            </div>
          </div>

          <figure className="bett-investor__visual">
            <div className="bett-investor__visual-frame">
              <img
                src={`${import.meta.env.BASE_URL}technology/token-acesso.png`}
                alt="Ilustração do token BETTEX ligado aos agentes de inteligência artificial"
                loading="lazy"
                width="1024"
                height="1024"
                data-testid="img-token-acesso"
              />
              <figcaption className="bett-investor__figure-label">
                 <span>O token conecta você à BETTEX</span>
                <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
              </figcaption>
            </div>
          </figure>
        </div>

        <div className="bett-investor__rule" aria-hidden="true" />

        <div className="bett-investor__content">
          <div>
             <p className="bett-investor__overline">Ser titular / 01—03</p>
             <h3 className="bett-investor__subhead">Participe dos resultados. Tenha voz. Acompanhe tudo.</h3>
            <p className="bett-investor__description">
               Seu token representa participação na IA, nos resultados que ela gerar e nas decisões da comunidade. Acompanhe o projeto por dentro, do progresso dos agentes à movimentação das operações.
            </p>
          </div>
          <ol className="bett-investor__access">
            {access.map(({ number, icon: Icon, title, description }) => (
              <li key={number} data-testid={`item-acesso-${number}`}>
                <span className="bett-investor__access-number">{number}</span>
                <Icon size={25} strokeWidth={1.6} aria-hidden="true" />
                <strong>{title}</strong>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="bett-investor__details" aria-label="Dados do token BETTEX">
          <div className="bett-investor__detail">
            <span className="bett-investor__detail-label">Preço por token</span>
            <strong className="bett-investor__detail-value" data-testid="text-preco-token">R$ {tokenomics.priceBRL}</strong>
            <span className="bett-investor__detail-unit">Valor do token BETTEX</span>
          </div>
          <div className="bett-investor__detail">
            <span className="bett-investor__detail-label">Quantidade total</span>
            <strong className="bett-investor__detail-value" data-testid="text-total-tokens">{tokenomics.totalSupply / 1_000_000} mi</strong>
            <span className="bett-investor__detail-unit">{formatTokenCount(tokenomics.totalSupply)} de unidades</span>
          </div>
          <div className="bett-investor__allocation">
            <p className="bett-investor__allocation-label">Distribuição dos tokens</p>
            <div
              className="bett-investor__allocation-bar"
              role="img"
              aria-label="Distribuição: 50% público, 25% investidores e 25% dono ou criador do sistema"
            >
              <span /><span /><span />
            </div>
            <ul className="bett-investor__allocation-key">
              <li><strong>50%</strong> público · {formatTokenCount(tokenomics.publicPrelaunchAllocation)}</li>
              <li><strong>25%</strong> investidores · {formatTokenCount(tokenomics.investorAllocation)}</li>
              <li><strong>25%</strong> dono / criador · {formatTokenCount(tokenomics.creatorAllocation)}</li>
            </ul>
          </div>
        </div>

        <div className="bett-investor__note">
          <Info size={17} strokeWidth={1.8} aria-hidden="true" />
          <p><span className="bett-investor__note-kicker">Pré-lançamento · </span>A parcela pública de 1 milhão de tokens é destinada à compra conforme disponibilidade. Tokens podem perder valor; a negociação futura em corretoras parceiras dependerá da abertura desse mercado.</p>
        </div>
      </div>
    </section>
  );
}