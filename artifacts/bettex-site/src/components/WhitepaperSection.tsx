import { tokenomics, formatTokenCount } from '@/lib/tokenomics';
import './WhitepaperSection.css';

type Status = 'definido' | 'proposta' | 'aberto';

const statusLabels: Record<Status, string> = {
  definido: 'Regra definida',
  proposta: 'Em discussão',
  aberto: 'A definir',
};

const chapters = [
  { id: 'whitepaper-escopo', number: '01', title: 'Escopo e leitura' },
  { id: 'whitepaper-emissao', number: '02', title: 'Emissão e vendas' },
  { id: 'whitepaper-tesouraria', number: '03', title: 'Tesouraria e agentes' },
  { id: 'whitepaper-risco', number: '04', title: 'Controle de risco' },
  { id: 'whitepaper-staking', number: '05', title: 'Staking e distribuição' },
  { id: 'whitepaper-fluxos', number: '06', title: 'Contas e saques' },
  { id: 'whitepaper-riscos', number: '07', title: 'Riscos materiais' },
  { id: 'whitepaper-pendencias', number: '08', title: 'Decisões em aberto' },
] as const;

function StatusBadge({ status }: { status: Status }) {
  return <span className={`whitepaper__status whitepaper__status--${status}`}>{statusLabels[status]}</span>;
}

function ChapterHead({ number, title, id, status, description }: { number: string; title: string; id: string; status?: Status; description?: string }) {
  return <div className="whitepaper__chapter-head">
    <div className="whitepaper__chapter-line"><span className="whitepaper__chapter-number">CAPÍTULO / {number}</span>{status && <StatusBadge status={status} />}</div>
    <h3 id={id} className="whitepaper__chapter-title">{title}</h3>
    {description && <p className="whitepaper__chapter-intro">{description}</p>}
  </div>;
}

const agents = [
  { name: 'PREDIX', area: 'Mercados de previsão', platform: 'Polymarket', detail: 'Pesquisa cenários e operações em mercados de previsão.' },
  { name: 'TRADEX', area: 'Ações e cripto', platform: 'Robinhood · conceito', detail: 'Estuda estratégias para ativos tradicionais e criptoativos.' },
  { name: 'SPORTIX', area: 'Mercados esportivos', platform: 'Kalshi', detail: 'Analisa eventos esportivos e seus mercados associados.' },
  { name: 'BETTIX', area: 'Jogos de cassino', platform: 'Duel · conceito', detail: 'Estuda decisões em jogos de cassino, sujeitos a regras locais.' },
] as const;

const openDecisions = [
  { topic: 'Oferta inicial', detail: 'Divisão dos 100 milhões entre pré-venda e lançamento; preço e calendário da pré-venda.' },
  { topic: 'Vendas posteriores', detail: 'Datas, preços e cadência efetiva dos 400 milhões destinados às vendas públicas mensais; preço da venda a investidores.' },
  { topic: 'Tokens da empresa', detail: 'Momento do mint e regras específicas de elegibilidade a distribuições; a carteira da empresa é livremente movimentável.' },
  { topic: 'Política de investimento', detail: 'Aprovação ou rejeição da proposta defensiva de 50% e limites numéricos do controle de risco.' },
  { topic: 'Staking e resultados', detail: 'Lockup, cooldown, snapshots, periodicidade de pagamento e tratamento de perdas acumuladas anteriores.' },
  { topic: 'Operação e infraestrutura', detail: 'Redes aceitas, integrações permitidas, critérios de custódia e estrutura legal da operação.' },
  { topic: 'Custos do projeto', detail: 'Taxas próprias de depósito e saque; custos de rede, bridge e terceiros serão variáveis e separados.' },
] as const;

export function WhitepaperSection() {
  return <section className="whitepaper" id="whitepaper" aria-labelledby="whitepaper-title">
    <div className="whitepaper__topline"><span>BETTEX / DOCUMENTO DE TRABALHO</span><span>LEITURA PÚBLICA · VERSÃO PROPOSTA</span></div>

    <div className="whitepaper__hero page-wrap">
      <div className="whitepaper__hero-main">
        <p className="whitepaper__kicker"><span className="whitepaper__kicker-mark" aria-hidden="true" /> NOTA TÉCNICA / 001</p>
        <h2 id="whitepaper-title">Whitepaper<span className="whitepaper__hero-period">.</span></h2>
        <p className="whitepaper__hero-lede">Uma proposta para examinar, não uma promessa para aceitar.</p>
      </div>
      <div className="whitepaper__hero-note">
        <span className="whitepaper__micro">Antes de começar</span>
        <p>A BETTEX ainda não está em operação. Este documento separa regras de desenho, hipóteses e decisões pendentes. Ele não constitui uma oferta, um convite à compra ou uma garantia de resultados.</p>
      </div>
    </div>

    <div className="whitepaper__legend page-wrap" aria-label="Legenda dos estados deste documento">
      <span className="whitepaper__legend-heading">COMO LER ESTE TEXTO</span>
      <div><StatusBadge status="definido" /><span>Regra estabelecida no desenho atual; não significa produto em funcionamento.</span></div>
      <div><StatusBadge status="proposta" /><span>Hipótese ainda sujeita a validação e revisão.</span></div>
      <div><StatusBadge status="aberto" /><span>Parâmetro ou decisão não estabelecido.</span></div>
    </div>

    <div className="whitepaper__body page-wrap">
      <aside className="whitepaper__aside" aria-label="Índice do whitepaper">
        <div className="whitepaper__aside-inner">
          <p className="whitepaper__aside-label">NESTE DOCUMENTO <span>01—08</span></p>
          <nav aria-label="Capítulos do whitepaper">
            {chapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`} className="whitepaper__toc-link" data-testid={`link-${chapter.id}`}><span>{chapter.number}</span>{chapter.title}<span className="whitepaper__toc-arrow" aria-hidden="true">↗</span></a>)}
          </nav>
          <p className="whitepaper__aside-foot">Todas as quantidades representam o desenho planejado, não tokens disponíveis, emitidos ou vendidos.</p>
        </div>
      </aside>

      <div className="whitepaper__content">
        <section className="whitepaper__chapter" aria-labelledby="whitepaper-escopo">
          <ChapterHead number="01" id="whitepaper-escopo" title="O que este documento é" status="definido" description="Uma descrição verificável da arquitetura pretendida — inclusive do que ainda não foi resolvido." />
          <div className="whitepaper__prose">
            <p>A BETTEX propõe reunir quatro agentes de IA em uma estratégia de mercados de risco, com regras comuns de tesouraria e distribuição. O projeto é cripto-nativo no desenho do token e do eventual saque, mas a política de tesouraria é <strong>centralizada por enquanto</strong>. Não há aqui execução autônoma irrestrita nem infraestrutura on-chain em produção.</p>
            <p>“Definido” neste texto identifica uma regra do modelo proposto pela equipe, não uma operação auditada ou lançada. Implementação, permissões de plataformas, conformidade legal e parâmetros operacionais precisam ser verificados antes de qualquer atividade real.</p>
          </div>
          <div className="whitepaper__margin-note"><span>PRINCÍPIO DE LEITURA</span><p>Se um número aparece como exemplo, ele não deve ser interpretado como meta, rendimento esperado ou limite aprovado.</p></div>
        </section>

        <section className="whitepaper__chapter" aria-labelledby="whitepaper-emissao">
          <ChapterHead number="02" id="whitepaper-emissao" title="Emissão não é circulação" status="definido" description="Um teto máximo e três destinações planejadas. Alocação não equivale a mint, venda ou liquidez." />
          <div className="whitepaper__supply">
            <div className="whitepaper__supply-total"><span className="whitepaper__micro">TETO MÁXIMO · GENESIS</span><strong data-testid="text-whitepaper-max-supply">{formatTokenCount(tokenomics.maxSupply)}</strong><span>BETTEX · limite absoluto de emissão</span></div>
            <div className="whitepaper__supply-bar" role="img" aria-label="Distribuição planejada: 50% venda pública, 25% investidores, 25% empresa"><span className="whitepaper__supply-public" /><span className="whitepaper__supply-investor" /><span className="whitepaper__supply-company" /></div>
            <div className="whitepaper__allocation-grid">
              <div><span className="whitepaper__allocation-key whitepaper__allocation-key--public" /> <span>Venda pública</span><strong>{formatTokenCount(tokenomics.publicSaleAllocation)}</strong><small>50% do teto</small></div>
              <div><span className="whitepaper__allocation-key whitepaper__allocation-key--investor" /> <span>Investidores</span><strong>{formatTokenCount(tokenomics.investorAllocation)}</strong><small>25% do teto</small></div>
              <div><span className="whitepaper__allocation-key whitepaper__allocation-key--company" /> <span>Empresa</span><strong>{formatTokenCount(tokenomics.companyAllocation)}</strong><small>25% do teto</small></div>
            </div>
          </div>
          <div className="whitepaper__prose">
            <p>O Genesis estabelece o teto de <strong>{formatTokenCount(tokenomics.maxSupply)} BETTEX</strong>. Os tokens destinados às vendas pública e a investidores só são emitidos <strong>após a confirmação de cada venda</strong>; a alocação prevista não deve ser lida como saldo já cunhado.</p>
          </div>
          <div className="whitepaper__rule-list">
            <div><span className="whitepaper__rule-index">02.1</span><div><h4>Primeira tranche pública <StatusBadge status="aberto" /></h4><p><strong>{formatTokenCount(tokenomics.firstPublicTranche)} BETTEX</strong> somam pré-venda e lançamento. A divisão exata entre as duas etapas e o preço da pré-venda ainda serão definidos. O preço previsto para o lançamento é <strong>R$ {tokenomics.launchPriceBRL.toFixed(2).replace('.', ',')}</strong> por token; não é o preço da pré-venda.</p></div></div>
            <div><span className="whitepaper__rule-index">02.2</span><div><h4>Vendas públicas posteriores <StatusBadge status="aberto" /></h4><p>Os <strong>{formatTokenCount(tokenomics.monthlyPublicAllocation)} BETTEX</strong> restantes da parcela pública são destinados a vendas mensais conforme a demanda permitir. Datas, quantidades efetivas de cada mês e preços ainda não estão determinados.</p></div></div>
            <div><span className="whitepaper__rule-index">02.3</span><div><h4>Venda a investidores <StatusBadge status="aberto" /></h4><p><strong>{formatTokenCount(tokenomics.investorAllocation)} BETTEX</strong> estão previstos para venda a investidores ao longo de até <strong>{tokenomics.investorSaleMonths} meses a partir do Gênesis</strong>. Preço e cronograma efetivo permanecem em aberto. O prazo não é compromisso de venda integral.</p></div></div>
            <div><span className="whitepaper__rule-index">02.4</span><div><h4>Parcela da empresa <StatusBadge status="definido" /></h4><p><strong>{formatTokenCount(tokenomics.companyAllocation)} BETTEX</strong> são destinados a uma carteira da empresa que poderá movimentá-los livremente. <strong>A definir:</strong> o momento do mint e as regras de elegibilidade desses tokens para distribuições. Não se deve supor que 25% da emissão máxima corresponderão sempre a 25% dos tokens elegíveis em circulação.</p></div></div>
          </div>
        </section>

        <section className="whitepaper__chapter" aria-labelledby="whitepaper-tesouraria">
          <ChapterHead number="03" id="whitepaper-tesouraria" title="De onde vem o capital; para onde pode ir" status="definido" description="A origem de recursos e a alocação entre agentes precisam continuar legíveis mesmo quando não houver operação." />
          <div className="whitepaper__statement"><span className="whitepaper__micro">REGRA DE DESTINAÇÃO</span><p><strong>100%</strong> dos recursos obtidos nas vendas primárias públicas e a investidores vão para a tesouraria de investimentos. <em>Não são usados para pagar salários.</em></p></div>
          <div className="whitepaper__prose">
            <p>Despesas operacionais da empresa devem ser financiadas por distribuições elegíveis provenientes dos tokens da empresa, conforme as regras a definir. Isso não garante receita à empresa: sem lucro líquido realizado elegível, ou sem distribuição permitida, essa fonte pode não existir.</p>
            <p>Do capital efetivamente designado como <strong>parcela investível</strong>, cada agente tem sempre <strong>exatamente 25%</strong> reservado. Se um agente não usar sua parte, ela fica líquida e reservada a ele; <strong>não pode ser emprestada ou realocada aos outros agentes</strong>. A composição total da tesouraria antes da parcela investível ainda depende de política aprovada.</p>
          </div>
          <div className="whitepaper__agents" aria-label="Quatro agentes e seus respectivos mandatos">
            {agents.map((agent, index) => <article key={agent.name} className="whitepaper__agent">
              <div className="whitepaper__agent-top"><span>0{index + 1} / 04</span><strong>25%</strong></div>
              <h4>{agent.name}</h4><p className="whitepaper__agent-area">{agent.area}</p><p>{agent.detail}</p>
              <span className="whitepaper__agent-platform">REFERÊNCIA · {agent.platform}</span>
            </article>)}
          </div>
          <p className="whitepaper__caption">Os ambientes citados são referências de conceito, não integrações ativas ou endossos. Qualquer atuação depende de permissões das plataformas, legislação aplicável e disponibilidade de APIs.</p>
           <div className="whitepaper__prose whitepaper__technical-note">
             <p>O desenho técnico contempla agentes com acesso a ferramentas do tipo MCP e um agente que interage com o navegador, sempre subordinados ao mesmo controle de risco. <strong>MCP não significa permissão para negociar</strong>; uma ferramenta de consulta não é uma API de ordens. Automação do navegador, especialmente em ambientes que restringem bots, só poderá movimentar recursos se houver autorização da plataforma.</p>
             <p>Robinhood Chain, a corretora Robinhood, Arbitrum One e a rede usada pela Polymarket são ambientes distintos. A escolha da rede BETTEX e das rotas de custódia/transferência entre plataformas continua em aberto.</p>
           </div>
          <div className="whitepaper__proposal"><StatusBadge status="proposta" /><div><h4>Parcela defensiva de 50%</h4><p>Manter metade da tesouraria em uma alocação defensiva é uma <strong>hipótese para discussão</strong>, não uma política aprovada. Caso venha a ser adotada, o percentual investível e sua composição serão formalizados; a regra de 25% por agente se aplica sempre à parcela investível, não necessariamente à tesouraria inteira.</p></div></div>
        </section>

        <section className="whitepaper__chapter" aria-labelledby="whitepaper-risco">
          <ChapterHead number="04" id="whitepaper-risco" title="A estratégia não aprova a si mesma" status="definido" description="Antes de qualquer ordem, um controle de risco independente precisa poder dizer não." />
          <div className="whitepaper__prose"><p>O controle de risco deve avaliar cada ordem proposta independentemente da confiança do agente. Uma ordem que viola qualquer limite é rejeitada; uma pausa de emergência bloqueia novas operações. O valor comprometido por ordens pendentes também consome o limite diário; perdas no dia não devem liberar o limite para novas tentativas de recuperação. Os limites numéricos ainda não foram estabelecidos e devem preceder a operação real.</p></div>
          <div className="whitepaper__gate" aria-label="Camadas propostas para o controle de risco">
            <div><span>01</span><p>Gasto diário global e por agente</p></div>
            <div><span>02</span><p>Valor máximo por ordem</p></div>
            <div><span>03</span><p>Exposição total em aberto</p></div>
            <div><span>04</span><p>Exposição correlacionada</p></div>
            <div><span>05</span><p>Controles de perdas</p></div>
            <div><span>06</span><p>Quantidade de ordens pendentes</p></div>
            <div className="whitepaper__gate-stop"><span>07</span><p>Pausa de emergência</p></div>
          </div>
          <div className="whitepaper__example"><span className="whitepaper__micro">EXEMPLOS ≠ PARÂMETROS</span><p>Odds de retorno de <strong>10×</strong> e aposta de <strong>0,01%</strong> são apenas exemplos ilustrativos; não foram aprovados como estratégia ou limite. Odds altas, isoladamente, <strong>não implicam valor esperado positivo</strong>. Probabilidade real, custos, execução e correlação podem transformar um pagamento potencial alto em uma decisão ruim.</p></div>
        </section>

        <section className="whitepaper__chapter" aria-labelledby="whitepaper-staking">
          <ChapterHead number="05" id="whitepaper-staking" title="Staking e distribuição" status="proposta" description="A posse do token não deve ser confundida com um pagamento automático." />
          <div className="whitepaper__prose">
            <p>O mecanismo de staking proposto consiste em <strong>depositar e ativar BETTEX</strong> para possível elegibilidade às distribuições. Quando uma distribuição for permitida, a participação seria calculada proporcionalmente aos tokens elegíveis de cada participante em relação ao total elegível no período de apuração, observadas as regras finais.</p>
            <p>Distribuições podem ocorrer <strong>somente a partir de lucros líquidos efetivamente realizados e elegíveis</strong>, se o regulamento permitir. Resultado não realizado não é caixa distribuível. Não existe rendimento diário automático, taxa de retorno prometida, proteção do principal ou garantia de distribuição em qualquer período.</p>
          </div>
          <div className="whitepaper__formula"><span className="whitepaper__micro">LÓGICA PROPOSTA · NÃO É SIMULAÇÃO DE RENDIMENTO</span><p>Participação elegível individual <span>÷</span> total de tokens elegíveis <span>×</span> montante distribuível aprovado</p></div>
           <div className="whitepaper__rule-list">
             <div><span className="whitepaper__rule-index">05.1</span><div><h4>Depositar BETTEX <StatusBadge status="aberto" /></h4><p>O participante enviaria tokens de sua carteira para o mecanismo de staking, sujeito à confirmação na rede e à regra de elegibilidade. Contrato, custódia, depósito mínimo, prazo de ativação e eventual bloqueio ainda não estão definidos; o envio não está disponível nesta página.</p></div></div>
             <div><span className="whitepaper__rule-index">05.2</span><div><h4>Retirar BETTEX <StatusBadge status="aberto" /></h4><p>A retirada devolveria os tokens elegíveis à carteira indicada conforme as regras de saída. Prazo de espera, momento em que cessam os direitos de distribuição, taxas e disponibilidade de liquidez ainda precisam ser estabelecidos. Retirar BETTEX não é sacar lucros em USDC.</p></div></div>
             <div><span className="whitepaper__rule-index">05.3</span><div><h4>Receber resultados <StatusBadge status="aberto" /></h4><p>Se houver lucro líquido distribuível e tokens elegíveis, o valor aprovado seria disponibilizado em USDC. O titular escolheria uma carteira e rede compatíveis antes de solicitar o saque; não há pagamento ativo nem calendário aprovado.</p></div></div>
           </div>
          <div className="whitepaper__decision"><StatusBadge status="aberto" /><p>Lockup, prazo de cooldown, método e momento dos snapshots, direitos dos tokens da empresa, frequência dos pagamentos e tratamento de perdas anteriores à apuração ainda precisam de definição. Sem essas regras, não é possível calcular uma distribuição individual confiável.</p></div>
        </section>

        <section className="whitepaper__chapter" aria-labelledby="whitepaper-fluxos">
          <ChapterHead number="06" id="whitepaper-fluxos" title="Uma unidade de conta, outra de saída" status="definido" description="As moedas exibidas e o ativo eventual de saque têm funções diferentes." />
          <div className="whitepaper__currency-grid">
            <div><span className="whitepaper__micro">CONTABILIDADE</span><strong>USD</strong><p>Resultados e riscos são apurados em dólar americano.</p></div>
            <div><span className="whitepaper__micro">EXIBIÇÃO INDICATIVA</span><strong>BRL</strong><p>Valores em reais são apenas referência visual, com cotação e horário informados quando disponíveis.</p></div>
            <div><span className="whitepaper__micro">SAQUE EVENTUAL</span><strong>USDC</strong><p>Para carteira blockchain, sujeito a elegibilidade e infraestrutura futura. Não há saque em BRL ou para conta bancária.</p></div>
          </div>
          <div className="whitepaper__prose">
            <p>Não há transferências on-chain reais neste estágio. Redes suportadas ainda serão escolhidas. Depósito e retirada de BETTEX no staking são movimentos do token; o saque de resultados seria feito em USDC. Uma referência de preço em reais não cria saldo em reais nem opção de saque em reais.</p>
            <p>Qualquer tarifa de “1 BETTEX” exibida em uma demonstração é <strong>apenas parte da interface demonstrativa</strong> e não representa uma taxa real aprovada.</p>
          </div>
          <div className="whitepaper__rule-list whitepaper__cost-list" aria-label="Custos previstos e estado de definição">
            <div><span className="whitepaper__rule-index">06.1</span><div><h4>Depósito de BETTEX no staking <StatusBadge status="aberto" /></h4><p>Tarifa própria do projeto: <strong>a definir</strong>. Eventual gas da rede e custos de custódia: variáveis e apresentados antes de um futuro envio.</p></div></div>
            <div><span className="whitepaper__rule-index">06.2</span><div><h4>Retirada de BETTEX do staking <StatusBadge status="aberto" /></h4><p>Tarifa própria do projeto: <strong>a definir</strong>. Eventual gas e período de saída: a confirmar de acordo com a rede e o mecanismo escolhidos.</p></div></div>
            <div><span className="whitepaper__rule-index">06.3</span><div><h4>Saque de resultados em USDC <StatusBadge status="aberto" /></h4><p>Tarifa própria do projeto: <strong>a definir</strong>. Gas, bridge e custos de terceiros são separados e variáveis; rede, valor líquido e endereço deverão ser confirmados antes de qualquer transação futura.</p></div></div>
          </div>
        </section>

        <section className="whitepaper__chapter" aria-labelledby="whitepaper-riscos">
          <ChapterHead number="07" id="whitepaper-riscos" title="Riscos que não cabem em uma nota de rodapé" status="definido" description="A perda pode vir da estratégia, da infraestrutura, do mercado do token ou das regras aplicáveis." />
          <div className="whitepaper__risks">
            <div><span>01 / MERCADOS</span><p>Previsões, ações, criptoativos, esportes e jogos podem produzir perdas, inclusive perdas relevantes ou consecutivas. Modelos de IA erram, dados chegam atrasados e execução pode falhar.</p></div>
            <div><span>02 / ATIVOS</span><p>O token pode perder valor ou não ter liquidez. Criptoativos e stablecoins, inclusive USDC, têm riscos de mercado, contraparte e desancoragem.</p></div>
            <div><span>03 / INFRAESTRUTURA</span><p>Plataformas, APIs, carteiras, custódia, bridges, redes e contratos podem falhar, restringir acesso ou sofrer incidentes. Nenhuma integração mencionada está garantida.</p></div>
            <div><span>04 / DIREITO E ACESSO</span><p>Tokens vinculados a lucro exigem revisão jurídica específica. A operação de mercados de previsão, apostas esportivas e cassino pode ser limitada ou proibida conforme a jurisdição e a plataforma.</p></div>
          </div>
          <p className="whitepaper__risk-close">Não há APY anunciado, proteção do capital investido ou direito automático a lucro. A existência deste documento não demonstra autorização regulatória, viabilidade econômica ou lançamento.</p>
        </section>

        <section className="whitepaper__chapter whitepaper__chapter--last" aria-labelledby="whitepaper-pendencias">
          <ChapterHead number="08" id="whitepaper-pendencias" title="O que ainda precisa de resposta" status="aberto" description="Uma lista de decisões pendentes é mais útil do que uma certeza artificial." />
          <div className="whitepaper__open-list">
            {openDecisions.map((item, index) => <div key={item.topic}><span>{String(index + 1).padStart(2, '0')}</span><div><h4>{item.topic}</h4><p>{item.detail}</p></div></div>)}
          </div>
          <div className="whitepaper__closing">
            <span className="whitepaper__micro">FIM DA NOTA / INÍCIO DA ANÁLISE</span>
            <p>Este é um desenho para ser questionado. Antes de qualquer lançamento, as decisões abertas precisam virar regras publicadas, testáveis e juridicamente revisadas.</p>
            <a href="#whitepaper" data-testid="link-whitepaper-topo">Voltar ao início do documento <span aria-hidden="true">↑</span></a>
          </div>
        </section>
      </div>
    </div>
  </section>;
}

export default WhitepaperSection;