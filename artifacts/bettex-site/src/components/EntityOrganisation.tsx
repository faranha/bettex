import { DocFacts } from './DocFacts';
import { BusinessPlan } from './BusinessPlan';
import { FounderProfile } from './FounderProfile';

export function EntityOrganisation() {
  return <>
    <h3 className="whitepaper__subhead" id="documentacao-empresa">Protocolo DeFi e participação</h3>
    <div className="whitepaper__lead"><span>PROJETO DESCENTRALIZADO · FULL STACK AI</span><p>A BETTEX é um projeto DeFi e DEX, sem empresa física ou entidade a constituir. O fundador e o time conduzem a administração inicial. O objetivo é substituir suas funções por agentes de IA até tornar o agente BETTEX operacionalmente independente e autônomo. Essa autonomia é uma direção futura, não uma capacidade já entregue.</p></div>
    <DocFacts title="Identidade do protocolo" facts={[
      { label: 'ESTRUTURA', value: 'Descentralizada', text: 'DeFi e DEX, sem constituição de empresa.' },
      { label: 'ADMINISTRAÇÃO', value: 'Fundador e time', text: 'Administração inicial e evolução para agentes de IA autônomos.' },
      { label: 'PARTICIPAÇÃO', value: 'BETTEX', text: 'Token e direitos do programa, não ações ou voto societário.' },
    ]} />
    <div className="whitepaper__prose"><p>O fundador e o time iniciam o desenvolvimento e a administração. Agentes de IA substituirão gradualmente essas funções, com mandatos e controles verificáveis. A direção DeFi não elimina riscos nem responsabilidades aplicáveis.</p><p>BETTEX identifica o projeto e seu agente de IA. Não há constituição de entidade prevista. Os titulares têm tokens e direitos de participação nos resultados, não propriedade resgatável da tesouraria. A custódia e os controles estão em <a href="#documentacao-governanca">Governança</a>.</p></div>
    <h3 className="whitepaper__subhead" id="documentacao-missao">Missão, visão e valores</h3>
    <div className="whitepaper__status-grid">
      <div><span>MISSÃO</span><strong>Participação econômica</strong><p>Ampliar alternativas de participação econômica para pessoas comuns durante a transição provocada pela IA, robótica e automação.</p></div>
      <div><span>VISÃO</span><strong>Acesso à nova economia</strong><p>Os ganhos da automação não ficam restritos a quem já detém capital e tecnologia. A participação reúne diferentes mercados, análise automatizada e regras compreensíveis.</p></div>
      <div><span>VALORES</span><strong>Transparência e responsabilidade</strong><p>Compreensão, regras, controle de risco, prestação de contas e histórico verificável orientam a operação.</p></div>
    </div>
    <h3 className="whitepaper__subhead" id="documentacao-publico">Público e oportunidade</h3>
    <div className="whitepaper__prose"><p>A tese do fundador conecta o deslocamento do trabalho pela automação com brasileiros que tratam apostas como investimento e procuram renda e patrimônio nesses ambientes. A BETTEX organiza uma alternativa de participação econômica com análise de mercados, controles e distribuição de resultados elegíveis.</p><p>Uma possível era de abundância é uma tese, não um fato comprovado. A transição depende de política, instituições e acesso: “a natureza não dá saltos”. A missão considera o caminho entre o presente e essa transformação. O público de entrada é brasileiro; a estrutura do projeto é internacional e as movimentações financeiras usam USDC.</p><p><a href={`${import.meta.env.BASE_URL}pitch#pitch-thesis`}>Tese e oportunidade no Pitch</a> · <a href={`${import.meta.env.BASE_URL}pitch`}>Apresentação do projeto</a></p></div>
    <h3 className="whitepaper__subhead" id="documentacao-fundador">Fundador e administrador</h3>
    <FounderProfile doc />
    <div className="whitepaper__prose"><p><a href={`${import.meta.env.BASE_URL}pitch#pitch-founder`}>Experiência e atuação no Pitch</a></p></div>
    <BusinessPlan />
    <div className="whitepaper__prose"><p><a href={`${import.meta.env.BASE_URL}downloads/bettex-entidade-unica.pdf`} download>Resumo do protocolo e regras (PDF)</a> · <a href={`${import.meta.env.BASE_URL}downloads/bettex-entidade-unica.docx`} download>Versão editável (DOCX)</a></p></div>
  </>;
}