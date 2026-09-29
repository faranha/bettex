import { type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, WalletCards } from 'lucide-react';
import './TechnologySection.css';

export function TechnologySection({ children }: { children: ReactNode }) {
  return (
    <section id="agentes" className="technology-section scroll-mt-[72px]" aria-labelledby="technology-title">
      <div className="technology-section__wrap">
        <header className="technology-section__intro">
          <div>
            <p className="technology-section__eyebrow">A inteligência por trás do seu token</p>
            <h2 id="technology-title" className="technology-section__title" data-testid="text-technology-title">
              Uma BETTEX.<br /><em>Quatro especialidades.</em>
            </h2>
          </div>
          <p className="technology-section__intro-note">Conheça os quatro agentes e a tecnologia que conecta todas as frentes de atuação da BETTEX.</p>
        </header>

        <div className="technology-section__hierarchy" aria-label="Token BETTEX movido para a Carteira BETTEX; BETTEX Core coordena quatro agentes e o lucro, quando houver, é creditado na conta BETTEX">
          <div className="technology-section__deposit-flow">
            <div className="technology-section__token" data-testid="diagram-technology-token">
              <span className="technology-section__coin" aria-hidden="true">B<span>·</span></span>
              <span className="technology-section__token-copy"><strong>Seus tokens BETTEX</strong><small>Mova para sua Carteira BETTEX</small></span>
            </div>
            <p className="technology-section__deposit-label">Token entra na carteira</p>
            <div className="technology-section__deposit-path" aria-hidden="true">
              <span className="technology-section__moving-coin">B</span>
              <ArrowDown size={20} strokeWidth={2.4} />
            </div>
          </div>
          <div className="technology-section__wallet" data-testid="diagram-technology-wallet">
            <span className="technology-section__wallet-slot" aria-hidden="true" />
            <div className="technology-section__wallet-copy">
              <span className="technology-section__wallet-kicker">Destino dos tokens · participação ativa</span>
              <h3>Carteira <em>BETTEX</em></h3>
              <p>Mova seus tokens para sua Carteira BETTEX para ativar sua participação. Eles ficam na carteira, não no BETTEX Core.</p>
            </div>
            <div className="technology-section__wallet-art" aria-hidden="true">
              <WalletCards size={126} strokeWidth={1.25} />
              <span className="technology-section__wallet-coin">B</span>
            </div>
          </div>
          <div id="tecnologia" className="technology-section__core-bridge scroll-mt-[88px]" data-testid="diagram-technology-core">
            <img src={`${import.meta.env.BASE_URL}agents/bettex-hunter-portrait.webp`} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <div>
              <span>Inteligência que opera, não recebe tokens</span>
              <h3>BETTEX Core</h3>
              <p>Enquanto os tokens ficam na carteira, o Core coordena risco, execução e resultados dos quatro agentes.</p>
            </div>
          </div>
          <div className="technology-section__branch" aria-hidden="true" />
          <span className="technology-section__agents-label">Quatro agentes especializados</span>
          <div className="technology-section__agents" aria-label="Quatro agentes da BETTEX">{children}</div>
          <div className="technology-section__result-path" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <div className="technology-section__result" data-testid="diagram-technology-result">
            <span className="technology-section__result-arrow" aria-hidden="true"><ArrowDown size={18} /></span>
            <span className="technology-section__result-icon" aria-hidden="true"><WalletCards size={32} strokeWidth={1.7} /></span>
            <div className="technology-section__result-copy">
              <span className="technology-section__result-kicker">Dos quatro agentes para a sua conta</span>
              <h3>Lucro creditado na sua conta BETTEX.</h3>
              <p>Nos dias em que houver lucro, sua parte é creditada na conta dentro da plataforma, se seus tokens estiverem ativados. Sem lucro, não há distribuição.</p>
            </div>
          </div>
        </div>

        <div className="technology-section__after">
          <p className="technology-section__clarity"><strong>Um token, participação no sistema inteiro.</strong> O token representa a participação na BETTEX; não executa operações. Mercados de risco podem gerar perdas e lucros não são garantidos.</p>
          <div className="technology-section__allora">
            <span className="technology-section__allora-label">REDE EXTERNA / ALLORA</span>
            <p>A Allora é uma rede descentralizada de inteligência externa que apoia PREDIX e TRADEX. Não é o BETTEX Core.</p>
            <a href="https://docs.allora.network/home/overview" target="_blank" rel="noopener noreferrer" data-testid="link-allora-documentation">
              Documentação da Allora <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}