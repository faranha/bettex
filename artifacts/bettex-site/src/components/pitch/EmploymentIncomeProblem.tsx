import { ArrowRight, ExternalLink } from 'lucide-react';
import { t } from '../../lib/i18n';

export function EmploymentIncomeProblem() {
  return <section id="problema-emprego-renda" className="pb-problem__automation" aria-labelledby="problema-ia-t">
    <div className="pb-problem__robot-background" aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}pitch-future/tesla-optimus.jpg`} alt="" width={1024} height={1024} />
    </div>
    <p className="mono pb-problem__topic">2. Emprego e renda ameaçados pela IA</p>
    <h3 id="problema-ia-t" className="display">É mentira, a era da prosperidade é uma mentira.</h3>
    <p>Elon Musk descreve um futuro em que a IA e os robôs fazem o trabalho de todos, tornando o emprego opcional. Ao mesmo tempo, promete uma era de abundância sustentada por uma renda universal alta. A BETTEX não acredita que essa renda vá chegar para sustentar quem perder o emprego: substituir trabalhadores por máquinas não cria, por si só, um direito à riqueza que essas máquinas produzem.</p>
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

    <div className="pb-problem__explanation">
      <section aria-labelledby="problema-substituicao-t">
        <h4 id="problema-substituicao-t" className="display">IA para o trabalho intelectual. Robôs para o trabalho físico.</h4>
        <p>A visão de Musk não se limita a automatizar uma tarefa ou uma profissão: é um futuro em que máquinas podem fornecer todos os bens e serviços. A IA avança sobre atividades de escritório, atendimento e programação; robôs humanoides, como o Optimus da Tesla, levam essa ambição ao trabalho físico. Se essa substituição alcançar diferentes setores ao mesmo tempo, mudar de profissão pode não ser suficiente para preservar a renda.</p>
      </section>
      <section aria-labelledby="problema-concentracao-t">
        <h4 id="problema-concentracao-t" className="display">A renda universal alta não vem junto com o robô.</h4>
        <p>Musk apresenta a renda universal alta como parte desse futuro, mas a promessa não é um mecanismo de distribuição. Quem vai pagar, quem terá direito e quando o dinheiro chegará? Uma empresa pode substituir pessoas, reduzir custos e aumentar o lucro sem transferir esses ganhos aos trabalhadores dispensados. Na tese da BETTEX, a prosperidade fica com quem controla a tecnologia, enquanto quem perde o salário não recebe a renda prometida.</p>
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

    <p className="pb-problem__automation-conclusion">Para a BETTEX, o problema é substituir o emprego de todos por máquinas e vender a promessa de que todos viverão melhor depois. Nossa tese é que essa renda universal alta não vai se materializar para quem precisa dela, e que esperar por essa promessa pode custar o futuro de milhões de pessoas. Participar da tecnologia precisa ser uma possibilidade agora, não uma esperança para depois da perda do salário.</p>
    <a className="tap pb-problem__evidence-link" href="#cenario-exclusao">Emprego, automação e economia real<ArrowRight aria-hidden="true" /></a>
  </section>;
}