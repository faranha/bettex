import { ArrowDownRight, ArrowRight, ExternalLink } from 'lucide-react';
import './Redesign.css';

const WORLD_CUP_SOURCE =
  'https://site.cndl.org.br/copa-do-mundo-vai-levar-992-milhoes-de-consumidores-as-compras-apontam-cndlspc-brasil/';

export function Redesign() {
  return (
    <main className="pitch-problem-redesign">
      <section aria-labelledby="redesign-problema-t" className="rp-hero">
        <div className="rp-shell">
          <p className="rp-eyebrow"><span className="rp-eyebrow-mark" /> Emprego e renda ameaçados pela IA</p>

          <div className="rp-opening">
            <div className="rp-stat" aria-label="74 por cento">
              <span>74</span><span className="rp-percent">%</span>
              <span className="rp-stat-caption">de quem pretendia apostar<br />na Copa de 2026</span>
            </div>
            <div className="rp-claim-wrap">
              <p className="rp-kicker">O orçamento de hoje. A renda de amanhã.</p>
              <h1 id="redesign-problema-t" className="rp-claim">
                via nas bets uma forma de quitar dívidas pendentes.
              </h1>
              <p className="rp-summary">
                Esse público pode enfrentar duas pressões: perdas que comprometem o orçamento de hoje e mudanças no
                trabalho que ameaçam a renda de amanhã.
              </p>
            </div>
            <ArrowDownRight className="rp-down" aria-hidden="true" />
          </div>

          <aside className="rp-evidence" aria-label="Contexto da pesquisa">
            <div className="rp-evidence-label">
              <span className="rp-evidence-dot" />
              <span>O que esse número mede</span>
            </div>
            <div className="rp-evidence-copy">
              <p>
                CNDL/SPC Brasil e Offerwise: 600 participantes de 18 anos ou mais nas 27 capitais, com intenção de
                gastos na Copa; coleta de 27/04 a 05/05/2026. O dado reúne 31% de concordância total e 43% parcial.
                Não representa toda a população, retorno de apostas ou demanda da BETTEX.{' '}
                <a href={WORLD_CUP_SOURCE} target="_blank" rel="noopener noreferrer">
                  Ver pesquisa original <ExternalLink aria-hidden="true" />
                </a>
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="rp-household" aria-label="Impacto no orçamento doméstico">
        <div className="rp-shell rp-household-grid">
          <div className="rp-household-lead">
            <span className="rp-index">01 / ORÇAMENTO DE HOJE</span>
            <h2>Sem reservas, a perda pesa nas contas da casa.</h2>
          </div>
          <div className="rp-household-body">
            <p>
              Quem usa dinheiro essencial para tentar obter renda nas apostas arrisca o orçamento do mês.
              Apostar não é investir: o resultado depende de um evento, e a perda pode agravar a falta de reserva.
            </p>
            <p className="rp-caveat">
              Contexto, não prova de causalidade: a BETTEX não promete recuperar perdas de apostas nem garante renda.
            </p>
            <a href="#publico-pitch" className="rp-link">
              Ver dados e fontes do público <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="rp-work" aria-labelledby="redesign-ia-t">
        <div className="rp-work-image" aria-hidden="true">
          <img src="/__mockup/images/pitch-optimus.jpg" alt="" />
        </div>
        <div className="rp-work-overlay" aria-hidden="true" />
        <div className="rp-shell rp-work-content">
          <span className="rp-index rp-index-light">02 / RENDA DE AMANHÃ</span>
          <p className="rp-work-topic">Emprego e renda ameaçados pela IA</p>
          <h2 id="redesign-ia-t">Automação não garante prosperidade para todos.</h2>
          <span className="rp-work-arrow" aria-hidden="true"><ArrowDownRight /></span>
        </div>
      </section>
    </main>
  );
}
