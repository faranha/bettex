import { ArrowRight, ExternalLink } from 'lucide-react';
import './FutureSections.css';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const DOC = `${BASE}/documentacao#documentacao-como-funciona`;
const PHOTO = `${import.meta.env.BASE_URL}pitch-future/elon-musk.jpg`;

function Src({ href, children }: { href: string; children: string }) {
  return <a className="fu-src" href={href} target="_blank" rel="noopener noreferrer">{children}<ExternalLink aria-hidden="true" /></a>;
}

export function FutureSections() {
  return <>
    <section id="agora" aria-labelledby="agora-t" className="slide fu fu--one">
      <div className="page-wrap">
        <div className="mono fu-kicker"><span>02 / 10</span><span className="fu-rule" aria-hidden="true" />Por que agora</div>
        <div className="fu-hero">
          <div>
            <h2 id="agora-t" className="display fu-title">A era da <span>prosperidade</span></h2>
            <p className="fu-sub">Elon Musk imagina um futuro em que IA e robôs produzem em abundância e o trabalho deixa de ser obrigatório.</p>
            <blockquote className="fu-quote">
              <p className="display">“Provavelmente nenhum de nós terá um emprego.”</p>
              <footer>Elon Musk, VivaTech 2024 · <Src href="https://www.cnn.com/2024/05/23/tech/elon-musk-ai-your-job">CNN, 23 mai. 2024</Src></footer>
            </blockquote>
            <p className="fu-frame">Na visão de Musk, IA e robôs forneceriam os bens e serviços necessários, sustentados por uma alta renda universal. Uma era de prosperidade em que trabalhar seria uma escolha, não uma condição de sobrevivência.</p>
          </div>
          <figure className="fu-photo">
            <img src={PHOTO} alt="Retrato de Elon Musk em 2018" width={1337} height={1771} loading="lazy" />
            <figcaption>Foto: The Royal Society (2018) · <a href="https://commons.wikimedia.org/wiki/File:Elon_Musk_Royal_Society_(crop2).jpg" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a><br />Enquadramento e tratamento visual.</figcaption>
          </figure>
        </div>
        <div className="fu-pair">
          <article className="fu-card fu-card--tesla">
            <span className="mono fu-tag">Tesla · Optimus</span>
            <h3 className="display">Tesla e os humanoides</h3>
            <p>O Master Plan Part IV, publicado em setembro de 2025, apresenta o Optimus, robô humanoide da Tesla, como parte da automação física e da abundância sustentável. A IA deixa a tela e passa a executar tarefas no mundo real. O plano oficial fala em redefinir trabalho, mobilidade e energia.</p>
            <Src href="https://www.tesla.com/master-plan-part-4">Tesla, Master Plan Part IV</Src>
          </article>
          <article className="fu-card fu-card--space">
            <span className="mono fu-tag">SpaceX · Nasdaq: SPCX</span>
            <h3 className="display">SpaceX e o capital do futuro</h3>
            <p>A SpaceX estreou na Nasdaq em 12 de junho de 2026, sob o ticker SPCX. Seu IPO conecta foguetes, Starlink e IA a uma visão de infraestrutura espacial, incluindo data centers orbitais. São planos de expansão sujeitos a riscos tecnológicos.</p>
            <div className="fu-srcs"><Src href="https://www.nasdaq.com/newsroom/spacex-ipo-rocket-company-launches-historic-ipo">Nasdaq, IPO</Src><Src href="https://www.sec.gov/Archives/edgar/data/1181412/000162828026036936/spaceexplorationtechnologi.htm">SEC, prospecto</Src></div>
          </article>
        </div>
        <p className="fu-note mono">Essas referências não indicam parceria, endosso ou participação da BETTEX em Tesla ou SpaceX.</p>
      </div>
    </section>

    <section id="resgatar-futuro" aria-labelledby="resgatar-futuro-t" className="slide fu fu--two">
      <div className="page-wrap">
        <div className="mono fu-kicker"><span>02 / 10</span><span className="fu-rule" aria-hidden="true" />O futuro das pessoas</div>
        <h2 id="resgatar-futuro-t" className="display fu-title fu-title--two">Resgatar o futuro <span>das pessoas</span></h2>
        <p className="fu-sub">O risco não é apenas perder um emprego. É ficar sem renda e sem participação na riqueza que as máquinas produzem.</p>
        <div className="fu-forecasts">
          <article className="fu-big fu-big--blue">
            <span className="mono fu-tag">EUA: cenário de Dario Amodei</span>
            <p className="fu-num display">50%</p>
            <p>dos empregos de entrada de colarinho branco poderiam desaparecer. Em maio de 2025, Dario Amodei, CEO da Anthropic, alertou à Axios para um cenário de 10% a 20% de desemprego nos EUA em um a cinco anos. Tecnologia, finanças, direito e consultoria estão entre as áreas citadas.</p>
            <Src href="https://www.axios.com/2025/05/28/ai-jobs-white-collar-unemployment-anthropic">Axios, mai. 2025</Src>
          </article>
          <article className="fu-big fu-big--paper">
            <span className="mono fu-tag">América Latina: Guatemala e El Salvador</span>
            <p className="fu-num display">75%</p>
            <p>dos trabalhadores em ocupações com alto risco de substituição por robôs na Guatemala e em El Salvador. O relatório do BID de 2021 apresenta essas estimativas de Micco e Soler (2020) e aponta 65% na Argentina.</p>
            <p className="fu-warn">Potencial de automação por ocupação, não previsão de 75% de desemprego. O próprio relatório ressalta que custos, adoção e metodologias podem reduzir o impacto.</p>
            <Src href="https://publications.iadb.org/publications/english/document/The-Future-of-Work-in-Latin-America-and-the-Caribbean-What-is-the-Impact-of-Automation-on-Employment-and-Wages.pdf">BID, futuro do trabalho, 2021</Src>
          </article>
        </div>
        <div className="fu-regional">
          <p>Para a IA generativa, a OIT e o Banco Mundial estimaram em 2024 que 26% a 38% dos empregos na América Latina e no Caribe estão expostos, com 2% a 5% em risco de automação total. Cerca de 17 milhões de empregos poderiam ficar sem os ganhos de produtividade por falta de acesso digital. São tecnologias e metodologias diferentes das estimativas de robótica do BID.</p>
          <Src href="https://www.ilo.org/pt-pt/resource/news/press-release-ai-latin-america">OIT e Banco Mundial, 2024</Src>
        </div>
        <div className="fu-position">
          <p className="display fu-pos-lead">Resgatar o futuro é ampliar o acesso à participação econômica, para que a tecnologia não produza prosperidade apenas para quem já controla o capital.</p>
          <div className="fu-pos-body">
            <p>A BETTEX organiza uma comunidade de investimento com IA e reúne capital em uma tesouraria que opera em mercados de risco. Quando há lucro e as condições de distribuição são atendidas, o participante recebe sua parcela conforme as regras do projeto.</p>
            <p className="fu-risk mono">Não é salário, seguro contra desemprego ou renda garantida. Há risco de perda de capital.</p>
            <a className="fu-doc" href={DOC} target="_blank" rel="noopener noreferrer">Como a BETTEX amplia a participação <ArrowRight aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </section>
  </>;
}

export default FutureSections;
