import { ArrowRight } from 'lucide-react';
import './_group.css';

const WORLD_CUP_SOURCE =
  'https://site.cndl.org.br/copa-do-mundo-vai-levar-992-milhoes-de-consumidores-as-compras-apontam-cndlspc-brasil/';

export function Current() {
  return (
    <div className="pitch-problem-current">
      <section id="problema" aria-labelledby="problema-t" className="slide slide--flow">
        <div className="page-wrap slide__body slide__body--flow">
          <h1 id="problema-t" className="hero-title">
            <span className="pitch-world-cup-stat">74%</span>
            <span className="pitch-world-cup-claim">
              de quem pretendia apostar na Copa de 2026 via nas bets uma forma de quitar dívidas pendentes.
            </span>
          </h1>
          <p className="pitch-problem-summary">
            Esse público pode enfrentar duas pressões: perdas que comprometem o orçamento de hoje e mudanças no
            trabalho que ameaçam a renda de amanhã.
            <span className="pitch-world-cup-source">
              CNDL/SPC Brasil e Offerwise: 600 participantes de 18 anos ou mais nas 27 capitais, com intenção de
              gastos na Copa; coleta de 27/04 a 05/05/2026. O dado reúne 31% de concordância total e 43% parcial.
              Não representa toda a população, retorno de apostas ou demanda da BETTEX.{' '}
              <a href={WORLD_CUP_SOURCE} target="_blank" rel="noopener noreferrer">
                Ver pesquisa original
              </a>
            </span>
          </p>

          <div className="pitch-problem-context">
            <div className="pn pn__context">
              <div>
                <h3 id="pn-context-t" className="display pn__h">
                  Sem reservas, a perda pesa nas contas da casa.
                </h3>
              </div>
              <div className="pn__prose">
                <p>
                  Quem usa dinheiro essencial para tentar obter renda nas apostas arrisca o orçamento do mês.
                  Apostar não é investir: o resultado depende de um evento, e a perda pode agravar a falta de reserva.
                </p>
                <p className="pn__fine">
                  Contexto, não prova de causalidade: a BETTEX não promete recuperar perdas de apostas nem garante renda.
                </p>
                <a href="#publico-pitch" className="pn__link">
                  Ver dados e fontes do público <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          <section
            id="problema-emprego-renda"
            className="pb-problem__automation"
            aria-labelledby="problema-ia-t"
          >
            <div className="pb-problem__robot-background" aria-hidden="true">
              <img src="/__mockup/images/pitch-optimus.jpg" alt="" />
            </div>
            <p className="mono pb-problem__topic">Emprego e renda ameaçados pela IA</p>
            <h3 id="problema-ia-t" className="display">
              Automação não garante prosperidade para todos.
            </h3>
          </section>
        </div>
      </section>
    </div>
  );
}
