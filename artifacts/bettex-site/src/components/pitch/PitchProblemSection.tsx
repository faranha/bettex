import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { EmploymentIncomeProblem } from './EmploymentIncomeProblem';
import { useX } from './pitchCopy';
import './PitchProblemSection.css';

export function PitchProblemSection() {
  const x = useX();

  return (
    <section id="problema" className="pitch-problem" aria-labelledby="problema-t">
      <div className="pitch-problem__hero">
        <div className="pitch-problem__shell">
          <h2 id="problema-t" className="pitch-problem__title">
            {x(
              'Brasileiros endividados perdem tudo em bets',
              'Indebted Brazilians lose everything on betting',
              'Brasileños endeudados lo pierden todo en apuestas',
            )}
          </h2>

          <div className="pitch-problem__opening">
            <div className="pitch-problem__stat-column">
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
            <div className="pitch-problem__football-scene" aria-hidden="true">
              <img className="pitch-problem__character" src={`${import.meta.env.BASE_URL}pitch-future/household-character-cutout.svg`} alt="" width={80} height={80} loading="lazy" />
              <img className="pitch-problem__football" src={`${import.meta.env.BASE_URL}pitch-future/football.svg`} alt="" width={100} height={100} loading="lazy" />
            </div>
            </div>

            <div className="pitch-problem__claim-wrap">
              <p className="pitch-problem__claim">
                <span className="sr-only">74% </span>
                {x(
                  'de quem pretendia apostar na Copa de 2026 via nas bets uma forma de quitar dívidas pendentes.',
                  'of those who planned to bet on the 2026 World Cup saw betting as a way to pay off outstanding debts.',
                  'de quienes pensaban apostar en la Copa Mundial de 2026 veían las apuestas como una forma de saldar deudas pendientes.',
                )}
              </p>
              <div className="pitch-problem__household-body">
              <p><strong>
                {x(
                  'Sem reservas, a perda pesa nas contas da casa.',
                  'Without savings, losses strain household bills.',
                  'Sin ahorros, las pérdidas afectan las cuentas del hogar.',
                )}
              </strong></p>
              <p>
                {x(
                  'Quem usa dinheiro essencial para tentar obter renda nas apostas arrisca o orçamento do mês. Apostar não é investir: o resultado depende de um evento, e a perda pode agravar a falta de reserva.',
                  'Using essential money to seek income from betting puts the monthly budget at risk. Betting is not investing: the outcome depends on an event, and a loss can worsen the lack of savings.',
                  'Quien usa dinero esencial para intentar obtener ingresos de las apuestas arriesga el presupuesto del mes. Apostar no es invertir: el resultado depende de un evento, y una pérdida puede agravar la falta de ahorros.',
                )}
              </p>
              <a href="#publico-pitch" className="pitch-problem__link">
                {x('Ver dados e fontes do público', 'See audience data and sources', 'Ver datos y fuentes del público')}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              </div>
            </div>
            <ArrowDownRight className="pitch-problem__down" aria-hidden="true" />
          </div>

          <div className="pitch-problem__debt-metrics">
            <article>
              <strong>{x('64,3%', '64.3%', '64,3%')}</strong>
              <p>{x('usavam salários ou rendimentos regulares para apostar.', 'used wages or regular income to place bets.', 'usaban salarios o ingresos regulares para apostar.')}</p>
            </article>
            <article>
              <strong>{x('65,9%', '65.9%', '65,9%')}</strong>
              <p>{x('tinham ganhar dinheiro como principal razão para apostar.', 'named making money as their main reason for betting.', 'tenían ganar dinero como principal motivo para apostar.')}</p>
            </article>
            <article>
              <strong>{x('65,7%', '65.7%', '65,7%')}</strong>
              <p>{x('diziam não ter dinheiro guardado.', 'said they had no money saved.', 'decían no tener dinero ahorrado.')}</p>
            </article>
          </div>
          <p className="pitch-problem__image-note">{x('Imagem ilustrativa gerada por IA; não retrata um participante das pesquisas.', 'AI-generated illustrative image; it does not depict a survey participant.', 'Imagen ilustrativa generada por IA; no representa a un participante de las encuestas.')}</p>
        </div>
      </div>

      <div id="ambiente-externo" className="pitch-problem__employment">
        <EmploymentIncomeProblem />
      </div>
    </section>
  );
}
