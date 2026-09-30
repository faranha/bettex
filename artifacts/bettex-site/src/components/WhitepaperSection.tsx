import { useEffect, useState } from 'react';
import { tokenomics, formatTokenCount } from '@/lib/tokenomics';
import './WhitepaperSection.css';

const chapters = [
  { id: 'documentacao-como-funciona', number: '01', title: 'Como funciona', subtitle: 'O desenho, sem confundir intenção com operação.' },
  { id: 'documentacao-emissao', number: '02', title: 'Emissão e vendas', subtitle: 'Quando os tokens podem ser emitidos e por quanto.' },
  { id: 'documentacao-tesouraria', number: '03', title: 'Tesouraria e agentes', subtitle: 'O destino dos recursos e o espaço de cada agente.' },
  { id: 'documentacao-controles', number: '04', title: 'Controles de risco', subtitle: 'Limites que vêm antes de qualquer operação.' },
  { id: 'documentacao-staking', number: '05', title: 'Staking e distribuição', subtitle: 'Elegibilidade não é promessa de rendimento.' },
  { id: 'documentacao-contas', number: '06', title: 'Contas e saques', subtitle: 'O que é contabilizado, exibido e transferido.' },
  { id: 'documentacao-riscos', number: '07', title: 'Riscos', subtitle: 'O que pode dar errado, inclusive antes do lançamento.' },
] as const;

function chapterFromHash() {
  if (typeof window === 'undefined') return 0;
  const index = chapters.findIndex(chapter => `#${chapter.id}` === window.location.hash);
  return index < 0 ? 0 : index;
}

const agents = [
  { name: 'PREDIX', area: 'Mercados de previsão', reference: 'Polymarket', detail: 'Avalia cenários e preços de eventos futuros.' },
  { name: 'TRADEX', area: 'Ações e criptoativos', reference: 'Robinhood', detail: 'Estuda oportunidades em mercados financeiros.' },
  { name: 'SPORTIX', area: 'Mercados esportivos', reference: 'Kalshi', detail: 'Analisa eventos relacionados ao esporte.' },
  { name: 'BETTIX', area: 'Jogos de cassino', reference: 'Duel', detail: 'Estuda decisões em jogos, se legalmente permitidas.' },
] as const;

function ChapterContent({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <>
        <div className="whitepaper__lead"><span>EM UMA FRASE</span><p>A BETTEX reúne quatro agentes de inteligência artificial, um token e uma tesouraria comum sob regras de alocação, risco e distribuição.</p></div>
        <div className="whitepaper__prose">
          <p>Um <strong>agente de IA</strong> é um sistema que analisa informações e pode sugerir ações dentro de uma função específica. Aqui, PREDIX, TRADEX, SPORTIX e BETTIX representam quatro áreas de análise. As sugestões não substituem autorizações, verificações de risco ou decisões humanas de governança.</p>
          <p><strong>BETTEX</strong> é o token previsto para o projeto: uma unidade digital registrada em uma rede blockchain. O modelo liga a participação em resultados ao depósito voluntário desses tokens em <strong>staking</strong>, explicado no capítulo 05. Comprar ou guardar o token, por si só, não dá direito a um pagamento.</p>
          <p>Estas páginas descrevem <strong>regras da BETTEX</strong>. Os números e fluxos mostrados na prévia do aplicativo são <strong>simulações de demonstração</strong>, sem dinheiro, tokens ou transações reais. Operações fora desta prévia exigem infraestrutura, permissões das plataformas e revisão jurídica.</p>
        </div>
        <div className="whitepaper__aside-callout"><span>COMO LER</span><p>Uma regra documentada não significa que o sistema já foi lançado, auditado ou autorizado a operar. Nenhuma compra, depósito ou saque é realizado nesta documentação.</p></div>
      </>;
    case 1:
      return <>
        <div className="whitepaper__supply">
          <div className="whitepaper__supply-top"><span>TETO MÁXIMO NO GENESIS</span><strong data-testid="text-documentacao-max-supply">{formatTokenCount(tokenomics.maxSupply)}</strong><small>BETTEX · Genesis é o marco inicial do calendário de emissão.</small></div>
          <div className="whitepaper__supply-bar" role="img" aria-label="50% vendas públicas, 25% investidores, 25% empresa"><span /><span /><span /></div>
          <div className="whitepaper__supply-key"><span><i />Público · 500 milhões</span><span><i />Investidores · 250 milhões</span><span><i />Empresa · 250 milhões</span></div>
        </div>
        <div className="whitepaper__prose"><p>O teto é <strong>1 bilhão de BETTEX</strong>, não uma afirmação de que todo esse volume já exista. <strong>Mint</strong> é a criação efetiva de tokens na rede. As parcelas pública e de investidores só são emitidas depois de cada venda confirmada.</p></div>
        <div className="whitepaper__timeline">
          <div><span>DIAS 0–30</span><h4>Pré-venda pública</h4><p><strong>50 milhões</strong> a <strong>R$ 0,08</strong> por BETTEX, contados desde o Genesis.</p></div>
          <div><span>DIAS 31–60</span><h4>Lançamento público</h4><p><strong>50 milhões</strong> a <strong>R$ 0,10</strong> por BETTEX.</p></div>
          <div><span>DO DIA 61</span><h4>Vendas mensais</h4><p>Os <strong>400 milhões</strong> restantes da parcela pública têm janela de <strong>40 meses</strong>, até <strong>10 milhões por mês</strong>, a <strong>R$ 0,10</strong> cada. Tokens não vendidos no mês não são emitidos; o saldo não utilizado expira ao fim da janela.</p></div>
        </div>
        <div className="whitepaper__rule-pair">
          <div><span>INVESTIDORES / 25%</span><p><strong>250 milhões</strong> disponíveis para venda a <strong>R$ 0,10</strong> por token ao longo de <strong>24 meses desde o Genesis</strong>. Somente vendas confirmadas geram emissão; o saldo não vendido expira ao final do prazo.</p></div>
          <div><span>EMPRESA / 25%</span><p><strong>250 milhões</strong> são emitidos no Genesis para a empresa e podem ser movimentados livremente. Só participam de distribuições se depositados em staking, sob exatamente as mesmas regras dos demais participantes.</p></div>
        </div>
      </>;
    case 2:
      return <>
        <div className="whitepaper__lead whitepaper__lead--dark"><span>DESTINAÇÃO INTEGRAL</span><p><strong>100%</strong> do dinheiro recebido nas vendas primárias públicas e a investidores vai para a tesouraria de investimentos, não para despesas operacionais da empresa.</p></div>
        <div className="whitepaper__prose"><p>A tesouraria separa <strong>50%</strong> em USDC líquido como reserva defensiva e <strong>50%</strong> como parcela investível. USDC é um ativo digital concebido para acompanhar o valor do dólar americano, mas que também tem riscos próprios.</p><p>Da <strong>metade investível</strong>, cada agente recebe uma reserva de exatamente <strong>25%</strong> — equivalente a 12,5% da tesouraria total. Se um agente não utilizar sua parte, o valor permanece reservado para ele e não pode ser repassado a outro agente.</p><p>Despesas da empresa não saem dos recebimentos das vendas primárias. A empresa pode receber distribuições pelos próprios tokens que colocar em staking, nas mesmas condições dos demais; sem lucro elegível, não recebe essa distribuição.</p></div>
        <div className="whitepaper__agents" aria-label="Divisão da parcela investível entre agentes">
          {agents.map((agent, i) => <article key={agent.name} className="whitepaper__agent"><div className="whitepaper__agent-top"><span>0{i + 1} / 04</span><strong>25%</strong></div><h4>{agent.name}</h4><span className="whitepaper__agent-area">{agent.area}</span><p>{agent.detail}</p><small>REFERÊNCIA CONCEITUAL · {agent.reference}</small></article>)}
        </div>
        <div className="whitepaper__aside-callout"><span>LIMITES REAIS</span><p>As plataformas citadas são referências conceituais, não integrações ativas ou endossos. Qualquer acesso exigirá autorização da plataforma, conformidade com as regras locais e infraestrutura própria. Uma ferramenta de consulta não autoriza uma operação.</p></div>
      </>;
    case 3:
      return <>
        <div className="whitepaper__prose"><p>Todos os percentuais abaixo são medidos contra a <strong>metade investível da tesouraria</strong>, não contra o saldo total. Antes de uma operação, um controle independente dos agentes deve verificar a proposta. <strong>Ordens pendentes contam</strong> nos limites de compromisso e exposição; uma ordem que ultrapasse qualquer limite é rejeitada.</p></div>
        <div className="whitepaper__limits">
          <div><span>01 / NOVOS COMPROMISSOS POR DIA</span><strong>2% <em>global</em> / 0,5% <em>por agente</em></strong><p>Teto de recursos assumidos em novas operações por dia UTC.</p></div>
          <div><span>02 / OPERAÇÃO INDIVIDUAL</span><strong>0,05%</strong><p>Máximo comprometido em uma única operação.</p></div>
          <div><span>03 / EXPOSIÇÃO EM ABERTO</span><strong>10% <em>global</em> / 2,5% <em>por agente</em></strong><p>Limite para o total ainda sujeito a resultado.</p></div>
          <div><span>04 / EXPOSIÇÃO CORRELACIONADA</span><strong>0,5%</strong><p>Máximo conjunto em posições afetadas pelo mesmo evento ou risco.</p></div>
          <div><span>05 / PERDA REALIZADA DIÁRIA</span><strong>0,5% <em>global</em> / 0,125% <em>por agente</em></strong><p>Ao atingir o limite, novas operações naquele escopo param até o próximo dia UTC.</p></div>
        </div>
        <div className="whitepaper__aside-callout"><span>FREIO ADICIONAL</span><p>Não há alavancagem — operar com dinheiro emprestado para ampliar posições. Uma pausa de emergência pode interromper novas operações independentemente dos demais limites. Limites reduzem exposição; não impedem perdas.</p></div>
      </>;
    case 4:
      return <>
        <div className="whitepaper__prose"><p><strong>Staking</strong> é o depósito de BETTEX para se tornar elegível a uma possível distribuição. O mínimo é <strong>1 BETTEX inteiro</strong>. A elegibilidade começa quando o depósito é confirmado e termina no momento do pedido de retirada. Não há período de bloqueio: tokens disponíveis podem ser retirados imediatamente, sujeitos apenas à confirmação da rede.</p><p>Ter BETTEX na carteira sem depositá-los não gera elegibilidade. O saldo elegível de cada pessoa é acompanhado <strong>dia a dia, ao longo do mês-calendário em UTC</strong>; a participação mensal é proporcional a esse saldo ponderado pelo tempo, comparado ao de todos os participantes. Tokens da empresa seguem a mesma conta, sem preferência.</p></div>
        <div className="whitepaper__formula"><span>BASE DA PARTICIPAÇÃO MENSAL</span><p>Saldo elegível diário, ponderado pelo tempo <b>÷</b> soma dos saldos elegíveis de todos os participantes no mês</p></div>
        <div className="whitepaper__steps">
          <div><span>01</span><p>No fim de cada mês UTC, apuram-se em <strong>USD</strong> os resultados <strong>realizados</strong> em USDC, descontando custos e perdas acumuladas de meses anteriores. Ganhos ainda não concretizados não entram.</p></div>
          <div><span>02</span><p>Somente se o resultado líquido continuar positivo depois de compensar perdas anteriores, <strong>50%</strong> é distribuído proporcionalmente aos elegíveis; os outros <strong>50%</strong> permanecem na tesouraria.</p></div>
          <div><span>03</span><p>A determinação ocorre no <strong>quinto dia útil do mês seguinte</strong>. Se não houver saldo elegível no mês, não há pagamento. Resultado zero ou negativo também não gera distribuição.</p></div>
        </div>
        <div className="whitepaper__aside-callout"><span>SEM PROMESSA</span><p>Não há taxa de retorno fixa, pagamento automático todo mês nem proteção do capital. Os resultados dependem de operações efetivamente realizadas e podem ser negativos.</p></div>
      </>;
    case 5:
      return <>
        <div className="whitepaper__currency-grid">
          <div><span>01 / CONTABILIDADE</span><strong>USD</strong><p>Unidade usada para apurar riscos, custos e resultados.</p></div>
          <div><span>02 / EXIBIÇÃO</span><strong>BRL</strong><p>Conversão em reais apenas indicativa. Não cria saldo ou direito de saque em reais.</p></div>
          <div><span>03 / DISTRIBUIÇÃO</span><strong>USDC</strong><p>Ativo digital concebido para acompanhar o dólar; envio exclusivamente pela rede Arbitrum One.</p></div>
        </div>
        <div className="whitepaper__prose"><p>Depositar e retirar <strong>BETTEX</strong> do staking são movimentos do token. Receber uma distribuição, quando houver, é um fluxo separado em <strong>USDC pela Arbitrum One</strong>, uma rede blockchain. É preciso usar endereço compatível; envio para a rede ou carteira errada pode causar perda irreversível. <strong>Não existe saque bancário</strong> nem saldo sacável em BRL.</p><p>A taxa própria do projeto é <strong>zero</strong> para depósito e retirada no staking, transferência de lucro e saque de USDC. Custos de rede e de terceiros são separados, variáveis e devem ser mostrados para confirmação antes da transação. Zero taxa do projeto não significa transação gratuita.</p></div>
        <div className="whitepaper__aside-callout"><span>NESTA PÁGINA</span><p>Não há transação ao vivo. Qualquer carteira, saldo, lucro ou movimento mostrado em uma demonstração é uma simulação de interface, não uma conta ativa nem comprovante de propriedade. Transações futuras dependem de infraestrutura, autorizações externas e confirmação na rede.</p></div>
      </>;
    default:
      return <>
        <div className="whitepaper__prose"><p>Os limites, a reserva defensiva e a divisão de resultados organizam o desenho do projeto, mas <strong>não eliminam risco nem garantem retorno</strong>. É possível perder parte ou a totalidade do valor empregado.</p></div>
        <div className="whitepaper__risk-list">
          <div><span>01 / MERCADO E MODELO</span><p>Agentes de IA podem errar, usar dados incompletos ou atrasados e executar mal uma decisão. Mercados de previsão, ações, criptoativos, esportes e jogos podem gerar perdas consecutivas ou liquidez insuficiente.</p></div>
          <div><span>02 / TOKEN E MOEDA DIGITAL</span><p>BETTEX pode perder valor e pode não haver comprador quando se quiser vender. USDC pode perder sua referência ao dólar; emissores, reservas e intermediários também apresentam riscos.</p></div>
          <div><span>03 / TECNOLOGIA E CUSTÓDIA</span><p>Contratos, carteiras, chaves, redes, APIs e plataformas podem falhar, sofrer ataques ou ficar indisponíveis. Transações em blockchain geralmente não podem ser revertidas.</p></div>
          <div><span>04 / LEI E AUTORIZAÇÕES</span><p>A possibilidade de atuar em cada mercado depende da jurisdição, das regras das plataformas e de revisão jurídica. Uma referência conceitual não equivale a integração, licença ou aprovação regulatória.</p></div>
          <div><span>05 / EXECUÇÃO DO PROJETO</span><p>O desenho pode não chegar à operação. Mesmo com regras publicadas, a implementação, as permissões e os controles precisam ser desenvolvidos e testados. Simulações não demonstram desempenho futuro.</p></div>
        </div>
        <div className="whitepaper__lead whitepaper__lead--dark whitepaper__closing"><span>ANTES DE TOMAR UMA DECISÃO</span><p>Não há rendimento prometido, capital protegido, oferta ativa ou transação nesta documentação. Leia os riscos e diferencie sempre uma regra descrita de um serviço efetivamente disponível.</p></div>
      </>;
  }
}

export function WhitepaperSection() {
  const [active, setActive] = useState(chapterFromHash);

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash;
      if (hash !== '#documentacao' && !chapters.some(chapter => `#${chapter.id}` === hash)) return;
      setActive(chapterFromHash());
    };
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash !== '#documentacao' && hash !== `#${chapters[active].id}`) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash === '#documentacao' ? 'documentacao' : chapters[active].id)
        ?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const chapter = chapters[active];
  return <section className="whitepaper" id="documentacao" aria-labelledby="documentacao-title">
    <div className="whitepaper__topline"><span>BETTEX / ARQUIVO TÉCNICO</span><span>REGRAS DA BETTEX · PRÉVIA DO APP SIMULADA</span></div>
    <div className="whitepaper__hero page-wrap">
      <div><p className="whitepaper__eyebrow"><span aria-hidden="true" /> GUIA DE LEITURA / 07 CAPÍTULOS</p><h2 id="documentacao-title">Documentação<br /><em>técnica.</em></h2><p className="whitepaper__hero-lede">O projeto por dentro. Regras claras, números conferíveis e os riscos que importam.</p></div>
      <div className="whitepaper__hero-note"><span>NOTA AO LEITOR / 001</span><p>Este documento descreve o desenho da BETTEX em linguagem direta. Não anuncia o início das operações, não oferece tokens e não garante resultados.</p></div>
    </div>
    <div className="whitepaper__body page-wrap">
      <aside className="whitepaper__aside" aria-label="Navegação dos capítulos">
        <div id="documentacao-indice" className="whitepaper__aside-inner"><div className="whitepaper__aside-label"><span>ÍNDICE</span><span>01 — 07</span></div>
          <nav aria-label="Capítulos da documentação">
            {chapters.map((item, index) => <a key={item.id} href={`#${item.id}`} onClick={() => setActive(index)} aria-current={index === active ? 'page' : undefined} className={`whitepaper__toc-link${index === active ? ' is-active' : ''}`} data-testid={`link-${item.id}`}><span className="whitepaper__toc-number">{item.number}</span><span>{item.title}</span><span className="whitepaper__toc-arrow" aria-hidden="true">↗</span></a>)}
          </nav>
          <p className="whitepaper__aside-foot">Selecione um capítulo. O endereço de cada um pode ser compartilhado diretamente.</p>
        </div>
      </aside>
      <div className="whitepaper__content">
        <div className="whitepaper__chapter-meta"><span>BETTEX / DOCUMENTAÇÃO TÉCNICA</span><button type="button" onClick={() => document.getElementById('documentacao-indice')?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>Ver índice ↑</button><span>{chapter.number} / 07</span></div>
        <article className="whitepaper__chapter" aria-labelledby={chapter.id} key={chapter.id}>
          <header className="whitepaper__chapter-head"><span className="whitepaper__chapter-number">CAPÍTULO {chapter.number} <i /> LEITURA TÉCNICA</span><h3 id={chapter.id}>{chapter.title}<span className="whitepaper__title-period">.</span></h3><p>{chapter.subtitle}</p></header>
          <ChapterContent index={active} />
        </article>
        <nav className="whitepaper__chapter-pagination" aria-label="Navegação entre capítulos">
          {active > 0 ? <a href={`#${chapters[active - 1].id}`} onClick={() => setActive(active - 1)} data-testid="link-capitulo-anterior"><span>← ANTERIOR</span><strong>{chapters[active - 1].title}</strong></a> : <span className="whitepaper__pagination-spacer" />}
          {active < chapters.length - 1 ? <a href={`#${chapters[active + 1].id}`} onClick={() => setActive(active + 1)} data-testid="link-proximo-capitulo"><span>PRÓXIMO →</span><strong>{chapters[active + 1].title}</strong></a> : <a href="#documentacao" onClick={() => setActive(0)} data-testid="link-voltar-documentacao"><span>VOLTAR AO INÍCIO ↑</span><strong>Como funciona</strong></a>}
        </nav>
      </div>
    </div>
  </section>;
}

export default WhitepaperSection;