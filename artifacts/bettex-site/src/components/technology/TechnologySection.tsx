import { ArrowUpRight } from 'lucide-react';
import './TechnologySection.css';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export function TechnologySection() {
  return (
    <section id="tecnologia" className="technology-section" aria-labelledby="technology-title">
      <div className="technology-section__top">
        <div className="technology-section__wrap">
          <div className="technology-section__intro">
            <div>
              <p className="technology-section__eyebrow">Por trás dos agentes</p>
              <h2 id="technology-title" className="technology-section__title" data-testid="text-technology-title">
                A inteligência não vem de <em>uma voz só.</em>
              </h2>
            </div>
            <p className="technology-section__intro-note">
              A Allora apoia PREDIX e TRADIX, que já operam. Eles fazem parte da mesma BETTEX que reúne SPORTIX e BETTIX.
            </p>
          </div>

          <div className="technology-section__visual">
            <img
              className="technology-section__image"
              src={asset('technology/rede-inteligencia.png')}
              alt="Ilustração da rede de inteligência artificial, com diferentes pontos conectados."
              loading="lazy"
              decoding="async"
              data-testid="img-technology-network"
            />
            <div className="technology-section__visual-top" aria-hidden="true">
              <span className="technology-section__label"><span className="technology-section__label-dot" /> A rede Allora</span>
              <span className="technology-section__visual-index">INTELIGÊNCIA EM REDE / 01</span>
            </div>
            <div className="technology-section__visual-bottom">
              <p className="technology-section__visual-caption">Diferentes modelos. <span>Uma visão combinada.</span></p>
               <span className="technology-section__visual-index" aria-hidden="true">SERVIÇO ALLORA NA BETTEX</span>
            </div>
          </div>
        </div>
      </div>

      <div className="technology-section__explain">
        <div className="technology-section__wrap">
          <div className="technology-section__explain-grid">
            <div>
              <span className="technology-section__small-label">01 / Entenda a tecnologia</span>
              <h3 className="technology-section__explain-title">O que é<br />a Allora?</h3>
              <p className="technology-section__explain-lead">
                É uma rede descentralizada de inteligência artificial e aprendizado de máquina. Em vez de depender de um único modelo, ela reúne previsões de diferentes participantes e combina essas contribuições.
              </p>
              <a
                className="technology-section__source"
                href="https://docs.allora.network/home/overview"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-allora-documentation"
              >
                Conhecer a documentação da Allora <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="technology-section__steps" aria-label="Como entender a rede Allora">
              <div className="technology-section__step">
                <span className="technology-section__step-number">01</span>
                <div>
                  <h4>Vários modelos contribuem</h4>
                  <p>Participantes da rede produzem previsões com seus próprios modelos de inteligência artificial.</p>
                </div>
              </div>
              <div className="technology-section__step">
                <span className="technology-section__step-number">02</span>
                <div>
                  <h4>A rede combina as previsões</h4>
                  <p>A Allora reúne e avalia essas contribuições para oferecer uma informação combinada a quem usa o serviço.</p>
                </div>
              </div>
              <div className="technology-section__step">
                <span className="technology-section__step-number">03</span>
                <div>
                  <h4>BETTEX usa o serviço</h4>
                  <p>PREDIX e TRADIX usam a Allora nos mercados em que cada um opera. Isso não significa resultado garantido.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="technology-section__application">
            <div className="technology-section__application-head">
              <div>
                <span className="technology-section__small-label">02 / Na BETTEX</span>
                <h3 className="technology-section__application-title">Mesma rede.<br />Mercados diferentes.</h3>
              </div>
              <p>PREDIX e TRADIX já operam com o serviço da Allora, cada um em seu mercado. Os quatro agentes integram a BETTEX.</p>
            </div>
            <div className="technology-section__agents">
              <article className="technology-section__agent" data-testid="card-technology-predix">
                <div className="technology-section__agent-copy">
                  <span className="technology-section__agent-status">EM OPERAÇÃO</span>
                  <h4 className="technology-section__agent-name">PREDIX</h4>
                  <p className="technology-section__agent-market">Polymarket</p>
                  <p className="technology-section__agent-detail">O agente da BETTEX para mercados de previsão usa o serviço Allora.</p>
                </div>
                <div className="technology-section__agent-art">
                  <img src={asset('agents/predix.webp')} alt="Ilustração do agente PREDIX" loading="lazy" decoding="async" />
                </div>
              </article>
              <article className="technology-section__agent technology-section__agent--tradix" data-testid="card-technology-tradix">
                <div className="technology-section__agent-copy">
                  <span className="technology-section__agent-status">EM OPERAÇÃO</span>
                  <h4 className="technology-section__agent-name">TRADIX</h4>
                  <p className="technology-section__agent-market">Robinhood</p>
                  <p className="technology-section__agent-detail">O agente da BETTEX que opera na Robinhood também usa o serviço Allora.</p>
                </div>
                <div className="technology-section__agent-art">
                  <img src={asset('agents/tradix.webp')} alt="Ilustração do agente TRADIX" loading="lazy" decoding="async" />
                </div>
              </article>
            </div>
            <p className="technology-section__footnote">SPORTIX e BETTIX continuam em desenvolvimento. Tecnologia não elimina os riscos de mercado.</p>
          </div>
        </div>
      </div>
    </section>
  );
}