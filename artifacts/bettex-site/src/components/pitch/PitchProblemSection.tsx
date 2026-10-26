import { ArrowDownRight, ArrowRight, ExternalLink } from 'lucide-react';
import { EmploymentIncomeProblem } from './EmploymentIncomeProblem';
import { useX } from './pitchCopy';
import './PitchProblemSection.css';

const WORLD_CUP_SOURCE =
  'https://site.cndl.org.br/copa-do-mundo-vai-levar-992-milhoes-de-consumidores-as-compras-apontam-cndlspc-brasil/';
const FUTURA_SOURCE = 'https://www.estadao.com.br/economia/veja-graficos-perfil-social-financeiro-aposta-bets/';

export function PitchProblemSection() {
  const x = useX();

  return (
    <section id="problema" className="pitch-problem" aria-labelledby="problema-t">
      <div className="pitch-problem__hero">
        <div className="pitch-problem__backdrop" aria-hidden="true">
          <img src={`${import.meta.env.BASE_URL}pitch-future/household-betting-debt.webp`} alt="" width={1024} height={1024} loading="lazy" />
        </div>
        <div className="pitch-problem__shell">
          <h2 id="problema-t" className="pitch-problem__title">
            {x(
              'Brasileiros endividados perdem tudo em bets',
              'Indebted Brazilians lose everything on betting',
              'Brasileños endeudados lo pierden todo en apuestas',
            )}
          </h2>

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
          <aside
            className="pitch-problem__evidence"
            aria-label={x('Contexto da pesquisa', 'Survey context', 'Contexto de la encuesta')}
          >
            <div className="pitch-problem__evidence-label">
              <span className="pitch-problem__evidence-dot" aria-hidden="true" />
              <span>
                {x(
                  'Fontes e alcance dos dados',
                  'Sources and scope of the data',
                  'Fuentes y alcance de los datos',
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
              <p>
                {x(
                  '64,3%, 65,9% e 65,7%: Futura Inteligência, divulgada pelo Estadão em 14/02/2025. Levantamento com mil pessoas em dezembro de 2024; quase 9% disseram realizar apostas esportivas. Os três percentuais se referem aos apostadores entrevistados e medem condições distintas, não a ocorrência conjunta. Ganhar dinheiro é uma motivação declarada, não renda extra comprovada. A amostra é diferente da pesquisa da Copa.',
                  '64.3%, 65.9% and 65.7%: Futura Inteligência, reported by Estadão on February 14, 2025. The survey interviewed 1,000 people in December 2024; nearly 9% reported sports betting. These three percentages refer to the surveyed bettors and measure separate conditions, not their joint occurrence. Making money is a stated motivation, not proven extra income. This sample differs from the World Cup survey.',
                  '64,3%, 65,9% y 65,7%: Futura Inteligência, publicada por Estadão el 14/02/2025. Encuesta a mil personas en diciembre de 2024; casi el 9% declaró realizar apuestas deportivas. Los tres porcentajes se refieren a los apostadores encuestados y miden condiciones distintas, no su concurrencia. Ganar dinero es una motivación declarada, no ingresos extra comprobados. La muestra es distinta de la encuesta del Mundial.',
                )}{' '}
                <a href={FUTURA_SOURCE} target="_blank" rel="noopener noreferrer">
                  {x('Ver levantamento Futura / Estadão', 'View Futura / Estadão survey', 'Ver encuesta Futura / Estadão')}
                  <ExternalLink aria-hidden="true" />
                </a>
              </p>
            </div>
          </aside>
        </div>
      </div>

      <div id="ambiente-externo" className="pitch-problem__employment">
        <EmploymentIncomeProblem />
      </div>
    </section>
  );
}
