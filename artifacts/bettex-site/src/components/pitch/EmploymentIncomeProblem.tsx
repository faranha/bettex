import { ArrowRight, ExternalLink } from 'lucide-react';
import { t } from '../../lib/i18n';

export function EmploymentIncomeProblem() {
  return <section id="problema-emprego-renda" className="pb-problem__automation" aria-labelledby="problema-ia-t">
    <div className="pb-problem__robot-background" aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}pitch-future/tesla-optimus.jpg`} alt="" width={1024} height={1024} />
    </div>
    <p className="mono pb-problem__topic">2. Emprego e renda ameaçados pela IA</p>
    <h3 id="problema-ia-t" className="display">É mentira, a era da prosperidade é uma mentira.</h3>
    <p>Musk promete máquinas fazendo o trabalho de todos e uma renda universal alta. A tese da BETTEX: o emprego pode desaparecer sem que a renda prometida chegue a quem perdeu o salário.</p>
    <figure className="pb-problem__opening-video">
      <div className="pb-problem__video-frame">
        <iframe
          src="https://www.youtube-nocookie.com/embed/HHS8OVYT9cI?rel=0"
          title={t('Elon Musk e a promessa de abundância')}
          loading="eager"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <figcaption><a href="https://www.youtube.com/watch?v=HHS8OVYT9cI" target="_blank" rel="noopener noreferrer">{t('USA TODAY · Elon Musk e a promessa de abundância')}<ExternalLink aria-hidden="true" /></a></figcaption>
    </figure>

    <ol className="pb-problem__points">
      <li>
        <span className="mono pb-problem__point-number" aria-hidden="true">01</span>
        <h4 id="problema-substituicao-t" className="display">2 frentes de substituição</h4>
        <ul>
          <li>IA: escritório, atendimento e programação.</li>
          <li>Robôs: trabalho físico, com humanoides como o Optimus.</li>
        </ul>
      </li>
      <li>
        <span className="mono pb-problem__point-number" aria-hidden="true">02</span>
        <h4 id="problema-concentracao-t" className="display">3 perguntas sobre a renda</h4>
        <ul>
          <li>Quem vai pagar?</li>
          <li>Quem terá direito?</li>
          <li>Quando o dinheiro chega?</li>
        </ul>
        <p>Promessa de abundância não é distribuição de riqueza.</p>
      </li>
      <li>
        <span className="mono pb-problem__point-number" aria-hidden="true">03</span>
        <h4 id="problema-orcamento-t" className="display">O risco para quem vive do salário</h4>
        <ul>
          <li>Apostas podem consumir as reservas.</li>
          <li>A automação pode retirar a renda.</li>
          <li>As contas continuam chegando.</li>
        </ul>
      </li>
    </ol>

    <p className="pb-problem__automation-conclusion">A BETTEX não acredita que a renda universal alta vá sustentar quem perder o emprego. Participar da tecnologia agora, em vez de esperar pela prosperidade prometida: essa é a nossa tese.</p>
    <a className="tap pb-problem__evidence-link" href="#cenario-exclusao">Emprego, automação e economia real<ArrowRight aria-hidden="true" /></a>
  </section>;
}