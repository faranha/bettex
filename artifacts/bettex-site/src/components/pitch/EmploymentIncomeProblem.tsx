import { ArrowRight, ExternalLink } from 'lucide-react';
import { PitchObservations } from './PitchObservations';
import { t } from '../../lib/i18n';

export function EmploymentIncomeProblem() {
  return <section id="problema-emprego-renda" className="pb-problem__automation" aria-labelledby="problema-ia-t">
    <p className="mono pb-problem__topic">2. Emprego e renda ameaçados pela IA</p>
    <figure className="pb-problem__opening-video">
      <div className="pb-problem__video-frame">
        <iframe
          src="https://www.youtube-nocookie.com/embed/HHS8OVYT9cI?rel=0"
          title={t('Elon Musk e a promessa de abundância')}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <figcaption><a href="https://www.youtube.com/watch?v=HHS8OVYT9cI" target="_blank" rel="noopener noreferrer">{t('USA TODAY · Elon Musk e a promessa de abundância')}<ExternalLink aria-hidden="true" /></a></figcaption>
    </figure>
    <h3 id="problema-ia-t" className="display">É mentira, a era da prosperidade é uma mentira.</h3>
    <p>Na visão da BETTEX, a promessa de prosperidade com IA e robôs ignora uma pergunta central: de que vive quem perde o trabalho antes de conseguir participar da riqueza produzida pelas máquinas? Nossa tese é que a substituição acelerada de funções pode retirar salário e poder de compra de milhões de pessoas, enquanto os ganhos se concentram em quem controla a tecnologia.</p>

    <div className="pb-problem__explanation">
      <section aria-labelledby="problema-substituicao-t">
        <h4 id="problema-substituicao-t" className="display">A ameaça não é apenas mudar de profissão.</h4>
        <p>Quando uma tarefa remunerada passa a ser executada por software ou por um robô, o trabalhador pode perder a função que sustentava sua renda. A IA amplia essa pressão sobre atividades de escritório, atendimento e programação; os humanoides levam a possibilidade de substituição ao trabalho físico. O problema se agrava se novas oportunidades não surgirem na velocidade necessária para absorver quem ficou de fora.</p>
      </section>
      <section aria-labelledby="problema-concentracao-t">
        <h4 id="problema-concentracao-t" className="display">Mais produtividade não significa renda para todos.</h4>
        <p>Uma empresa pode produzir mais com menos pessoas. Isso pode beneficiar seus proprietários e quem controla os sistemas, sem gerar uma renda equivalente para os trabalhadores substituídos. Para a BETTEX, existe uma diferença decisiva entre uma economia que produz mais riqueza e uma população que consegue acessar essa riqueza. Ter acesso a uma ferramenta de IA não é o mesmo que participar dos ganhos de quem a possui.</p>
      </section>
      <section aria-labelledby="problema-orcamento-t">
        <h4 id="problema-orcamento-t" className="display">O salário desaparece. As contas continuam.</h4>
        <p>Quem depende da renda do mês e não tem dinheiro guardado tem pouco tempo para se adaptar. Aluguel, alimentação, dívidas e despesas da família continuam chegando, mesmo depois de uma demissão. Requalificação exige tempo e recursos; aceitar outro trabalho depende de haver demanda por ele. Se várias funções forem substituídas ao mesmo tempo, procurar emprego em outra área pode deixar de resolver o problema.</p>
      </section>
      <section aria-labelledby="problema-riscos-juntos-t">
        <h4 id="problema-riscos-juntos-t" className="display">Apostas e perda de renda podem atingir a mesma pessoa.</h4>
        <p>Os dois problemas se conectam quando alguém usa o salário para apostar, perde recursos que poderiam sustentar a casa e depois enfrenta a redução ou o desaparecimento da renda do trabalho. A fragilidade não está apenas na aposta ou na automação isoladamente: está na combinação de perdas financeiras, falta de reservas e menos oportunidades de recuperar a renda.</p>
      </section>
    </div>

    <p className="pb-problem__automation-conclusion">É essa combinação que a BETTEX quer enfrentar: pessoas buscando melhorar de vida pelas apostas, enquanto a economia automatizada pode retirar o trabalho que paga suas contas. A tese é que esperar pela prosperidade prometida não basta para quem precisa de renda agora.</p>
    <a className="tap pb-problem__evidence-link" href="#cenario-exclusao">Emprego, automação e economia real<ArrowRight aria-hidden="true" /></a>
    <PitchObservations dark>
      <p>Essa é a tese da BETTEX, não uma previsão de desemprego inevitável. O horizonte de três anos depende da materialização das previsões sobre a substituição de postos de trabalho pela IA. Participar da BETTEX também envolve risco de perda e não garante renda nem proteção contra desemprego.</p>
    </PitchObservations>
  </section>;
}