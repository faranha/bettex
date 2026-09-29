import { ArrowUpRight } from 'lucide-react';
import './TechnologySection.css';

const agents = [
  { name: 'PREDIX', market: 'Previsões', status: 'Em operação', active: true },
  { name: 'TRADIX', market: 'Cripto', status: 'Em operação', active: true },
  { name: 'SPORTIX', market: 'Esportes', status: 'Em desenvolvimento', active: false },
  { name: 'BETTIX', market: 'Jogos', status: 'Em desenvolvimento', active: false },
] as const;

export function TechnologySection() {
  return (
    <section id="tecnologia" className="technology-section" aria-labelledby="technology-title">
      <div className="technology-section__wrap">
        <header className="technology-section__intro">
          <div>
            <p className="technology-section__eyebrow"><span aria-hidden="true">01 /</span> A tecnologia BETTEX</p>
            <h2 id="technology-title" className="technology-section__title" data-testid="text-technology-title">
              Quatro agentes.<br /><em>Um sistema.</em>
            </h2>
          </div>
          <p className="technology-section__intro-note">
            A BETTEX é a tecnologia que reúne agentes para mercados de risco. O BETTEX Core é a arquitetura proposta para coordená-los em um só sistema.
          </p>
        </header>

        <div className="technology-section__diagram" role="group" aria-label="Esquema da BETTEX: o token representa participação no projeto inteiro; o BETTEX Core propõe coordenar quatro agentes especializados.">
          <div className="technology-section__diagram-header">
            <span>VISÃO DO SISTEMA</span>
            <span>ARQUITETURA PROPOSTA <span aria-hidden="true">↗</span></span>
          </div>

          <div className="technology-section__token-area">
            <div className="technology-section__token" data-testid="diagram-technology-token">
              <span className="technology-section__token-kicker">PARTICIPAÇÃO NO TODO</span>
              <div className="technology-section__coin" aria-hidden="true">
                <span className="technology-section__coin-mark">B<span>·</span></span>
              </div>
              <strong>Token BETTEX</strong>
              <span className="technology-section__token-sub">Sua parte no sistema inteiro,<br />não em um agente isolado.</span>
            </div>
          </div>

          <div className="technology-section__divider">
            <span>PARTICIPAÇÃO NO PROJETO</span>
            <span>TECNOLOGIA DE ORQUESTRAÇÃO</span>
          </div>

          <div className="technology-section__core" data-testid="diagram-technology-core">
            <div className="technology-section__core-symbol" aria-hidden="true"><span /><span /><span /><span /></div>
            <div className="technology-section__core-copy">
              <span className="technology-section__core-kicker">CAMADA CENTRAL · PROPOSTA</span>
              <h3>BETTEX <em>Core</em></h3>
              <p>Previsto para coordenar risco, execução e registro por agente.</p>
            </div>
            <span className="technology-section__core-index" aria-hidden="true">BC / 04</span>
          </div>

          <div className="technology-section__network" aria-hidden="true"><span /></div>

          <div className="technology-section__agents" aria-label="Quatro agentes especializados da BETTEX">
            {agents.map((agent, index) => (
              <article
                key={agent.name}
                className={`technology-section__agent${agent.active ? ' technology-section__agent--active' : ''}`}
                data-testid={`card-technology-${agent.name.toLowerCase()}`}
              >
                <div className="technology-section__agent-top">
                  <span className="technology-section__agent-number">0{index + 1}</span>
                  <span className="technology-section__agent-glyph" aria-hidden="true">{agent.active ? '●' : '○'}</span>
                </div>
                <div>
                  <h4>{agent.name}</h4>
                  <p className="technology-section__agent-market">{agent.market}</p>
                </div>
                <span className="technology-section__agent-status">{agent.status}</span>
              </article>
            ))}
          </div>
          <div className="technology-section__diagram-footer">
            <span><i aria-hidden="true" /> Dois agentes operam hoje</span>
            <span><i aria-hidden="true" /> Dois estão em desenvolvimento</span>
          </div>
        </div>

        <div className="technology-section__after">
          <p className="technology-section__clarity">
            <strong>Ter o token BETTEX é ter uma parte do sistema, não só de um agente.</strong> O token representa essa participação; não executa operações. O Core é a arquitetura proposta para coordenar os agentes — seus controles e integrações ainda dependem de implementação e validação. Mercados têm risco e lucros não são garantidos.
          </p>
          <div className="technology-section__allora">
            <span className="technology-section__allora-label">INTELIGÊNCIA EXTERNA / ALLORA</span>
            <p>A Allora é uma rede descentralizada de inteligência que apoia PREDIX e TRADIX. É um serviço externo, não o BETTEX Core.</p>
            <a href="https://docs.allora.network/home/overview" target="_blank" rel="noopener noreferrer" data-testid="link-allora-documentation">
              Documentação da Allora <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}