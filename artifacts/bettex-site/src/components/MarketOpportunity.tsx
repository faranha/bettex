import { ReadingDisclosure, Topics } from './ReadingDisclosure';
import { type ReactNode } from 'react';
import thesis from '@/lib/new-economy-thesis.json';

const sourceLinks = {
  senate: 'https://www12.senado.leg.br/institucional/datasenado/materias/relatorios-de-pesquisa/golpes-digitais-atingem-24-dos-brasileiros-aponta-21a-edicao-da-pesquisa-panorama-politico',
  anbima: 'https://www.anbima.com.br/data/files/BE/05/B0/55/1EABD91008E6DAD9F82BA2A8/Raio-X-do-Investidor-9-edicao.pdf',
  qualitative: 'https://www.anbima.com.br/pt_br/noticias/papel-das-apostas-online-na-vida-financeira-da-populacao-e-tema-de-estudo-inedito-da-anbima.htm',
  ilo: 'https://www.ilo.org/sites/default/files/2025-05/Research%20brief_GenAI%202025%20Update.pdf',
  imf: 'https://www.imf.org/-/media/files/publications/sdn/2024/english/sdnea2024001.pdf',
  cetic: 'https://www.cetic.br/media/analises/tic_domicilios_2025_principais_resultados.pdf',
  news: 'https://www.cnnbrasil.com.br/economia/money/macroeconomia/proibicao-das-bets-interrompeu-movimentacao-diaria-de-r-600-milhoes/',
  law: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/mpv/mpv1394.htm',
};

const observations = [
  { value: '52%', label: 'Renda familiar até 2 salários mínimos', text: 'Entre quem declarou gasto com apostas esportivas nos últimos 30 dias no DataSenado 2024. Não é renda pessoal média.', url: sourceLinks.senate, source: 'DataSenado · coleta em junho de 2024' },
  { value: '39%', label: 'Dinheiro rápido em caso de necessidade', text: 'Motivação relatada por apostadores no Raio X 2026, com dados de 2025. É percepção, não evidência de retorno.', url: sourceLinks.anbima, source: 'ANBIMA / Datafolha · 9ª edição' },
  { value: '20%', label: 'Percepção de investimento', text: 'Apostadores que associaram bets a investir ou juntar dinheiro no mesmo levantamento. Apostas e investimentos não são equivalentes.', url: sourceLinks.anbima, source: 'ANBIMA / Datafolha · 9ª edição' },
];

function Source({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export function MarketOpportunity() {
  return <ReadingDisclosure id="documentacao-oportunidade" headingId="oportunidade-title" testId="documentacao-oportunidade" title={<>Público-alvo e oportunidade de negócio</>}><Topics>
    <div className="whitepaper__prose">
      <p><strong>Foco comercial: Brasil, pessoas adultas e movimentações pequenas.</strong> A hipótese do criador considera valores como US$ 10 e US$ 15 e preferência por saques frequentes. Esses valores não são um ticket médio medido. A pesquisa descreve o público das apostas; não demonstra quantos comprariam BETTEX, quanto aportariam ou quanto aceitariam pagar.</p>
      <p>O problema não é simplesmente “falta de dinheiro para apostar”. Os estudos apontam motivações diferentes, incluindo diversão, complemento de renda e necessidade financeira. A proposta precisa explicar resultados e perdas, direitos do token, custos e liquidez, sem oferecer o investimento como recuperação de perdas ou solução para dívidas. <Source href={sourceLinks.qualitative}>Estudo qualitativo ANBIMA, setembro de 2026</Source>.</p>
      <p>O Raio X 2026 descreve os apostadores de 2025 com idade média de 35 anos, 66% homens e <strong>renda familiar média de R$ 5.402 por mês</strong>. É uma média por família, não salário individual nem orçamento disponível para investir. O grupo é heterogêneo; médias nacionais não descrevem automaticamente a audiência da BETTEX. <Source href={sourceLinks.anbima}>Perfil econômico ANBIMA / Datafolha</Source>.</p>
    </div>

    <div className="whitepaper__status-grid">
      {observations.map((item) => <div key={item.label}>
        <span>{item.source}</span><strong>{item.value} · {item.label}</strong><p>{item.text}</p>
        <Source href={item.url}>Consultar fonte e metodologia</Source>
      </div>)}
    </div>
    <div className="whitepaper__prose">
      <p>Esses percentuais têm bases e períodos diferentes. O DataSenado entrevistou 21.808 pessoas de 16 anos ou mais; o Raio X 2026 entrevistou 5.832, também de 16 anos ou mais, em novembro de 2025. A presença de menores no universo estatístico <strong>não os torna público elegível da BETTEX</strong>. Nenhum percentual deve ser somado ou usado como conversão comercial.</p>
    </div>

    <h3 className="whitepaper__subhead">Necessidades que orientam a proposta</h3>
    <div className="whitepaper__rule-pair">
      <div><span>CLAREZA E CONTROLE</span><strong>Saber o que entra, sai e pode ser perdido</strong><p>Valores bruto e líquido, taxas, saldo disponível, obrigações e limites de saque precisam ser compreensíveis. Transparência não elimina o risco de perda nem transforma o token em saldo bancário.</p></div>
      <div><span>ACESSO COM RESPONSABILIDADE</span><strong>Uma experiência adequada a valores pequenos</strong><p>Interface no idioma da pessoa, estimativa em moeda fiduciária e explicação da liquidação em USDC. Endividamento, urgência de renda ou dependência de apostas não devem ser usados para pressionar uma compra.</p></div>
    </div>

    <h3 className="whitepaper__subhead">O custo pesa mais quando o valor é pequeno</h3>
    <div className="whitepaper__prose">
      <p>Na política atual, cada serviço aplicável custa US$ 2,50, pago em USDC. Nos exemplos de saque abaixo, a tarifa está incluída no valor solicitado. A compra primária tem tarifa adicional ao preço. Valores antes de custos externos de conversão, rede e prestadores; <strong>não são projeções de rendimento</strong>.</p>
    </div>
    <div className="whitepaper__vesting-scroll whitepaper__projection-table" tabIndex={0} role="region" aria-label="Exemplos de custos para movimentações de US$ 10 e US$ 15"><table className="whitepaper__vesting-table">
      <thead><tr><th>Movimentação</th><th>Tarifa</th><th>Resultado do exemplo</th><th>Peso sobre o valor-base</th></tr></thead>
      <tbody>
        <tr><td>Saque de US$ 10</td><td>US$ 2,50</td><td>US$ 7,50 líquidos</td><td>25%</td></tr>
        <tr><td>Saque de US$ 15</td><td>US$ 2,50</td><td>US$ 12,50 líquidos</td><td>16,7%</td></tr>
        <tr><td>Compra de US$ 10 em BETTEX</td><td>US$ 2,50 adicionais</td><td>US$ 12,50 de desembolso</td><td>25% do preço</td></tr>
        <tr><td>Compra de US$ 15 em BETTEX</td><td>US$ 2,50 adicionais</td><td>US$ 17,50 de desembolso</td><td>16,7% do preço</td></tr>
      </tbody>
    </table></div>
    <div className="whitepaper__prose">
      <p>A expectativa de que a pessoa aceite a tarifa e saque assim que tiver US$ 10 precisa ser testada. Uma tarifa fixa pode incentivar acumular saldo ou simplesmente afastar o usuário. Saques de US$ 10 não significam renda diária de US$ 10; só créditos efetivamente apurados podem ser retirados, conforme as regras. Comprar tokens não concede resgate de uma fração da tesouraria.</p>
    </div>

    <h3 id="documentacao-tese-ia" className="whitepaper__subhead">{thesis.heading}</h3>
    <div className="whitepaper__prose">
      <p><strong>Tese central do fundador:</strong> {thesis.vision}</p>
      <p>{thesis.exclusion} {thesis.purpose}</p>
      <p><strong>Robótica e o exemplo da Tesla:</strong> {thesis.teslaExample} <Source href={thesis.teslaSource}>Tesla, Master Plan Part IV, {thesis.teslaSourceDate}</Source>.</p>
      <p>A tese do projeto é ampliar formas de participação econômica numa sociedade mais automatizada. Em 2025, a OIT estimou algum grau de exposição à IA generativa em cerca de um quarto dos empregos globais e destacou que <strong>transformação de tarefas é mais provável que substituição integral</strong>. O FMI também aponta possíveis efeitos sobre produtividade e desigualdade. Exposição não é contagem de empregos eliminados, e os estudos não demonstram o fim de todo trabalho. <Source href={sourceLinks.ilo}>OIT, maio de 2025</Source>; <Source href={sourceLinks.imf}>FMI, janeiro de 2024</Source>.</p>
      <p>Na BETTEX, isso significa uma proposta de acesso a <strong>estratégias geridas por IA</strong> e participação condicionada em lucros elegíveis, com regras de tesouraria. Não significa necessariamente comprar empresas de IA, possuir ações da entidade ou ter propriedade proporcional dos ativos. O token e seus créditos pertencem ao titular conforme as regras, não uma fração resgatável da tesouraria.</p>
      <p>Acesso financeiro também não substitui educação, qualificação e proteção social. A TIC Domicílios 2025 encontrou uso de IA generativa em 32% dos usuários de internet, com diferenças relevantes por escolaridade e classe. Essa desigualdade reforça a necessidade de linguagem acessível; não comprova demanda por BETTEX. <Source href={sourceLinks.cetic}>Cetic.br, resultados de 2025</Source>.</p>
    </div>

    <h3 className="whitepaper__subhead">Mercado grande não é demanda comprovada</h3>
    <div className="whitepaper__prose">
      <p>Em 2 de outubro de 2026, a imprensa reportou declaração de Dario Durigan, atribuída a dados do Banco Central, sobre aproximadamente R$ 600 milhões por dia que deixaram de ser enviados a contas de bets após a medida recente. O número descreve fluxo de pagamentos, <strong>não perdas líquidas, receita da BETTEX ou dinheiro automaticamente disponível para investir</strong>. A metodologia pública da cifra não foi localizada nesta pesquisa. <Source href={sourceLinks.news}>Reportagem e atribuição</Source>.</p>
      <p>A MP nº 1.394/2026, publicada em 25 de setembro, contém proibição de exploração, oferta, intermediação e publicidade de apostas de quota fixa no território nacional e um cronograma de encerramento. A pesquisa não demonstrou autorização para a BETTEX oferecer seu token ao varejo brasileiro nem compatibilidade das estratégias com essa mudança. <strong>O token não deve ser apresentado como forma de contornar restrições de apostas.</strong> Classificação, oferta, execução, contratos e vigência precisam de validação específica. <Source href={sourceLinks.law}>Texto da MP — situação a reconfirmar antes do lançamento</Source>.</p>
      <p>A oportunidade é uma hipótese de negócio: experiência compreensível, participação em resultados de estratégias automatizadas e controles verificáveis. Sua viabilidade depende de autorização aplicável, adequação ao público, desempenho, custos e demanda real. Não projetar receita a partir de uma parcela arbitrária do fluxo nacional de apostas.</p>
      <p><a href={`${import.meta.env.BASE_URL}downloads/bettex-publico-oportunidade.md`} download>Baixar a pesquisa completa, fontes e limitações (Markdown)</a>.</p>
    </div>
  </Topics></ReadingDisclosure>;
}