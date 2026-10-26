import { ArrowDownRight, ArrowRight, ExternalLink } from 'lucide-react';
import { EmploymentIncomeProblem } from './EmploymentIncomeProblem';
import { useX } from './pitchCopy';
import './PitchProblemSection.css';

const WORLD_CUP_SOURCE =
  'https://site.cndl.org.br/copa-do-mundo-vai-levar-992-milhoes-de-consumidores-as-compras-apontam-cndlspc-brasil/';

export function PitchProblemSection() {
  const x = useX();

  return (
    <section id="problema" className="pitch-problem" aria-labelledby="problema-t">
      <div className="pitch-problem__hero">
        <div className="pitch-problem__shell">
          <p className="pitch-problem__eyebrow">
            <span className="pitch-problem__eyebrow-mark" aria-hidden="true" />
            {x(
              'Emprego e renda ameaçados pela IA',
              'Jobs and income threatened by AI',
              'Empleo e ingresos amenazados por la IA',
            )}
          </p>

          <div className="pitch-problem__opening">
            <div className="pitch-problem__stat" aria-hidden="true">
              <span>74</span>
              <span className="pitch-problem__percent">%</span>
              <span className="pitch-problem__stat-caption">
                {x(
                  'de quem pretendia apostar na Copa de 2026',
                  'of people who planned to bet on the 2026 World Cup',
                  'de quienes pensaban apostar en la Copa Mundial de 2026',
                )}
              </span>
            </div>

            <div className="pitch-problem__claim-wrap">
              <p className="pitch-problem__kicker">
                {x(
                  'O orçamento de hoje. A renda de amanhã.',
                  'Today’s budget. Tomorrow’s income.',
                  'El presupuesto de hoy. Los ingresos de mañana.',
                )}
              </p>
              <h1 id="problema-t" className="pitch-problem__claim">
                <span className="sr-only">74% </span>
                {x(
                  'de quem pretendia apostar na Copa de 2026 via nas bets uma forma de quitar dívidas pendentes.',
                  'of those who planned to bet on the 2026 World Cup saw betting as a way to pay off outstanding debts.',
                  'de quienes pensaban apostar en la Copa Mundial de 2026 veían las apuestas como una forma de saldar deudas pendientes.',
                )}
              </h1>
              <p className="pitch-problem__summary">
                {x(
                  'Esse público pode enfrentar duas pressões: perdas que comprometem o orçamento de hoje e mudanças no trabalho que ameaçam a renda de amanhã.',
                  'This audience can face two pressures: losses that jeopardize today’s budget and changes in work that threaten tomorrow’s income.',
                  'Este público puede enfrentar dos presiones: pérdidas que comprometen el presupuesto de hoy y cambios en el trabajo que amenazan los ingresos de mañana.',
                )}
              </p>
            </div>
            <ArrowDownRight className="pitch-problem__down" aria-hidden="true" />
          </div>

          <aside
            className="pitch-problem__evidence"
            aria-label={x('Contexto da pesquisa', 'Survey context', 'Contexto de la encuesta')}
          >
            <div className="pitch-problem__evidence-label">
              <span className="pitch-problem__evidence-dot" aria-hidden="true" />
              <span>
                {x(
                  'O que esse número mede',
                  'What this number measures',
                  'Qué mide esta cifra',
                )}
              </span>
            </div>
            <div className="pitch-problem__evidence-copy">
              <p>
                {x(
                  'CNDL/SPC Brasil e Offerwise: 600 participantes de 18 anos ou mais nas 27 capitais, com intenção de gastos na Copa; coleta de 27/04 a 05/05/2026. O dado reúne 31% de concordância total e 43% parcial. Não representa toda a população, retorno de apostas ou demanda da BETTEX.',
                  'CNDL/SPC Brasil and Offerwise: 600 participants aged 18+ in the 27 capitals who intended to spend on the World Cup; fieldwork ran from Apr 27 to May 5, 2026. The result combines 31% strong and 43% partial agreement. It does not represent the full population, betting returns, or demand for BETTEX.',
                  'CNDL/SPC Brasil y Offerwise: 600 participantes de 18 años o más en las 27 capitales, con intención de gastar en el Mundial; la encuesta se realizó del 27 de abril al 5 de mayo de 2026. El dato reúne un 31% de acuerdo total y un 43% parcial. No representa a toda la población, los retornos de las apuestas ni la demanda de BETTEX.',
                )}{' '}
                <a href={WORLD_CUP_SOURCE} target="_blank" rel="noopener noreferrer">
                  {x('Ver pesquisa original', 'View original survey', 'Ver investigación original')}
                  <ExternalLink aria-hidden="true" />
                </a>
              </p>
            </div>
          </aside>
        </div>
      </div>

      <section
        className="pitch-problem__household"
        aria-label={x(
          'Impacto no orçamento doméstico',
          'Impact on the household budget',
          'Impacto en el presupuesto del hogar',
        )}
      >
        <div className="pitch-problem__shell pitch-problem__household-grid">
          <div className="pitch-problem__household-lead">
            <span className="pitch-problem__index">
              {x('01 / ORÇAMENTO DE HOJE', '01 / TODAY’S BUDGET', '01 / PRESUPUESTO DE HOY')}
            </span>
            <h2>
              {x(
                'Sem reservas, a perda pesa nas contas da casa.',
                'Without savings, losses strain household bills.',
                'Sin ahorros, las pérdidas afectan las cuentas del hogar.',
              )}
            </h2>
          </div>
          <div className="pitch-problem__household-body">
            <p>
              {x(
                'Quem usa dinheiro essencial para tentar obter renda nas apostas arrisca o orçamento do mês. Apostar não é investir: o resultado depende de um evento, e a perda pode agravar a falta de reserva.',
                'Using essential money to seek income from betting puts the monthly budget at risk. Betting is not investing: the outcome depends on an event, and a loss can worsen the lack of savings.',
                'Quien usa dinero esencial para intentar obtener ingresos de las apuestas arriesga el presupuesto del mes. Apostar no es invertir: el resultado depende de un evento, y una pérdida puede agravar la falta de ahorros.',
              )}
            </p>
            <p className="pitch-problem__caveat">
              {x(
                'Contexto, não prova de causalidade: a BETTEX não promete recuperar perdas de apostas nem garante renda.',
                'Context, not proof of causality: BETTEX does not promise to recover betting losses or guarantee income.',
                'Contexto, no prueba de causalidad: BETTEX no promete recuperar pérdidas de apuestas ni garantiza ingresos.',
              )}
            </p>
            <a href="#publico-pitch" className="pitch-problem__link">
              {x('Ver dados e fontes do público', 'See audience data and sources', 'Ver datos y fuentes del público')}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <div id="ambiente-externo" className="pitch-problem__employment">
        <EmploymentIncomeProblem />
      </div>
    </section>
  );
}
