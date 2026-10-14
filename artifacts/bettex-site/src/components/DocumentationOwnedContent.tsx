import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { AgentIntelligence } from './AgentIntelligence';
import { InvestmentAgents } from './InvestmentAgents';
import { ArchitectureCatalogue } from './architecture/ArchitectureCatalogue';
import { BuybackPolicy } from './BuybackPolicy';
import { DocumentationGames } from './DocumentationGames';
import { DocumentationChapterIntroduction } from './DocumentationChapterIntroduction';
import { DocumentationVision, DocumentationConceptsHeading } from './DocumentationVision';
import { DocumentationFutureMarket, DocumentationFutureReferencesHeading } from './DocumentationFutureMarket';
import { t } from '@/lib/i18n';

export type BaselineFactory = (id: string) => ReactNode[];
type Props = { id: string; main: BaselineFactory; legacy: BaselineFactory };
const range = (start: number, end: number) => Array.from({ length: end - start }, (_, i) => start + i);

/** Preserve the original elements rather than copying or paraphrasing their rules. */
export function DocumentationOwnedContent({ id, main, legacy }: Props) {
  const take = (factory: BaselineFactory, key: string, indices: number[]) => indices.map(i => {
    const node = factory(key)[i];
    if (node === undefined) throw new Error(`Documentation baseline block missing: ${key}/${i}`);
    return isValidElement(node) ? cloneElement(node, { key: `${key}:${i}` }) : node;
  });
  const m = (key: string, indices: number[]) => take(main, key, indices);
  const l = (key: string, indices: number[]) => take(legacy, key, indices);
  const nested = (key: string, index: number, indices: number[]) => {
    const parent = legacy(key)[index] as ReactElement<{ children: ReactNode }>;
    if (!isValidElement(parent)) throw new Error('Documentation baseline container missing');
    const children = Children.toArray(parent.props.children);
    return cloneElement(parent, { key: `${key}:${index}:${indices.join('-')}` }, indices.map(i => children[i]));
  };
  const reference = (anchor: string, title: string, body: ReactNode) =>
    <details className="whitepaper__reference" id={anchor} data-documentation-reference>
      <summary>{t('Referência técnica')}: {t(title)}</summary>
      <div className="whitepaper__reference-body">{body}</div>
    </details>;
  const baseline = <h3 className="whitepaper__subhead">{t('Baseline e regras iniciais')}</h3>;
  const intro = (text: string) => <div className="whitepaper__lead"><p>{t(text)}</p></div>;
  switch (id) {
    case 'documentacao-como-funciona':
      return <>
        <DocumentationVision />
        <div className="whitepaper__aside-callout" id="documentation-poc-scope" data-testid="documentation-poc-scope">
          <span>{t('DOCUMENTAÇÃO DO DEMO / POC')}</span>
          <p>{t('Esta documentação acompanha o demo e a prova de conceito da BETTEX. Registra a arquitetura e suas regras iniciais como ponto de partida; não certifica operação financeira nem uma versão ALFA já entregue.')}</p>
          <p>{t('O próximo passo é documentar a versão ALFA, depois de consultar a comunidade e testar a receptividade do demo. O retorno dessa etapa orientará a definição da próxima versão.')}</p>
        </div>
        <DocumentationConceptsHeading />
        <DocumentationChapterIntroduction chapterId={id} />
        {m(id, range(0, 10))}
      </>;
    case 'documentacao-agentes':
      return <>
        <DocumentationChapterIntroduction chapterId={id} />
        {m(id, range(0, 5))}
        <div id="documentacao-inteligencia"><AgentIntelligence owners={['context', 'bettex', 'relations', 'learning']} /></div>
        {baseline}
        <div id="documentacao-agentes-detalhe"><InvestmentAgents only={['orquestradora']} embedded /></div>
        <ArchitectureCatalogue groups={['map']} />
        {reference('documentacao-referencia-agentes', 'Orquestração, decisões e conectores', <>
          <div id="documentacao-arquitetura">{l('documentacao-arquitetura', [1, 2, 7, 8])}</div>
          {nested('documentacao-arquitetura', 9, [0])}
          {l('documentacao-arquitetura', [15, 16])}
          {l('documentacao-implantacao', [0])}
          {nested('documentacao-implantacao', 2, [2])}
          {nested('documentacao-controles', 9, [1, 2, 5, 6, 7])}
          {l('documentacao-controles', [11])}
        </>)}
      </>;
    case 'documentacao-subagente-risco':
      return <>
        <AgentIntelligence owners={['risk']} />
        {baseline}<InvestmentAgents only={['risco']} intro={false} cycle={false} embedded />
        {reference('documentacao-controles', 'Risco, limites e autorização', <>
          {l('documentacao-controles', range(2, 9))}
          {l('documentacao-controles', [10])}
          {nested('documentacao-controles', 9, [4])}
          {nested('documentacao-implantacao', 2, [3])}
          {nested('documentacao-implantacao', 3, [0])}
        </>)}
      </>;
    case 'documentacao-subagente-tesouraria':
      return <>
        <AgentIntelligence owners={['treasury']} />
        {baseline}<InvestmentAgents only={['tesouraria', 'recompra-queima']} intro={false} cycle={false} embedded />
        {intro('A inteligência da tesouraria analisa recursos e propõe alocações. A recompra e a queima são mecanismos separados: a análise não autoriza alterar a destinação fixa dos resultados nem executar fora dos controles.')}
        {m('documentacao-emissao', [10, 11])}
        {reference('documentacao-baseline-tesouraria', 'Reservas e fundos em trânsito', <>
          {l('documentacao-controles', [0, 1])}
          {l('documentacao-implantacao', [1])}
          {nested('documentacao-implantacao', 2, [1])}
          {nested('documentacao-controles', 9, [0, 3])}
          {nested('documentacao-implantacao', 3, [1])}
        </>)}
      </>;
    case 'documentacao-subagente-governanca':
      return <>
        <AgentIntelligence owners={['governance']} />
        {baseline}<InvestmentAgents only={['governanca']} intro={false} cycle={false} embedded />
        {m('documentacao-riscos', [1, 2])}
        {m('documentacao-riscos', [7, 8])}
        {reference('documentacao-governanca-detalhe', 'Governança, mandatos e administração', <>
          {l('documentacao-governanca-detalhe', [0])}
          {nested('documentacao-implantacao', 2, [0])}
          <div id="documentacao-adequacao-legal">{l('documentacao-adequacao-legal', [0])}</div>
        </>)}
      </>;
    case 'documentacao-subagente-cripto':
      return <>
        <AgentIntelligence owners={['crypto']} />
        {baseline}<InvestmentAgents only={['acoes-cripto']} intro={false} cycle={false} embedded />
        <div className="whitepaper__prose"><p>
          <a href="#documentacao-especialista-btc">BTC</a>{' · '}
          <a href="#documentacao-especialista-eth">ETH</a>{' · '}
          <a href="#documentacao-especialista-sol">SOL</a>
        </p></div>
        {reference('documentacao-baseline-cripto', 'Fontes, inferências e conectores de Cripto', <>
          {l('documentacao-arquitetura', range(10, 15))}
          <ArchitectureCatalogue groups={['allora', 'integrations']} connectorNames={['Allora', 'Robinhood']} integrationId="documentacao-conexoes-cripto" />
        </>)}
      </>;
    case 'documentacao-especialista-btc':
    case 'documentacao-especialista-eth':
    case 'documentacao-especialista-sol':
      return <>
        {intro('Esta especialização pertence ao subagente Cripto e delimita o ativo acompanhado. Não é um setor independente, não cria uma nova tesouraria e não recebe autorização financeira própria por aparecer no grafo.')}
        {baseline}
        <div className="whitepaper__prose">
          <p>{t('O ponto de partida utiliza as capacidades e fontes de Cripto, sob os controles de Risco e os recursos autorizados pela Tesouraria. Esta POC não define uma estratégia adicional nem parâmetros exclusivos para esta especialização.')}</p>
          <p><a href="#documentacao-subagente-cripto">{t('Capacidades e fontes de Cripto')}</a>{' · '}
            <a href="#documentacao-subagente-risco">{t('Baseline de Risco')}</a>{' · '}
            <a href="#documentacao-subagente-tesouraria">{t('Baseline de Tesouraria')}</a></p>
        </div>
      </>;
    case 'documentacao-subagente-esportes':
      return <>
        <DocumentationFutureMarket part="sports" />
        <AgentIntelligence owners={['sports']} /><DocumentationFutureReferencesHeading />
        {reference('documentacao-baseline-esportes', 'Conectores de Esportes e iGaming', <>
          <InvestmentAgents only={['esportes']} intro={false} cycle={false} embedded />
          <ArchitectureCatalogue groups={['integrations']} connectorNames={['Esportes e iGaming']} integrationId="documentacao-conexoes-esportes" />
        </>)}
      </>;
    case 'documentacao-subagente-previsoes':
      return <>
        <DocumentationFutureMarket part="predictions" />
        <AgentIntelligence owners={['predictions']} /><DocumentationFutureReferencesHeading />
        {reference('documentacao-baseline-previsoes', 'Orquestração, decisões e conectores', <>
        <InvestmentAgents only={['previsoes']} intro={false} cycle={false} embedded />
        {nested('documentacao-arquitetura', 9, [1])}
        <ArchitectureCatalogue groups={['integrations']} connectorNames={['Polymarket']} integrationId="documentacao-conexoes-previsoes" />
        </>)}
      </>;
    case 'documentacao-subagente-igaming':
      return <>
        <DocumentationFutureMarket part="igaming" />
        <AgentIntelligence owners={['igaming']} /><DocumentationFutureReferencesHeading />
        {reference('documentacao-baseline-igaming', 'Conectores de Esportes e iGaming', <>
        <InvestmentAgents only={['cassinos']} intro={false} cycle={false} embedded />
        <ArchitectureCatalogue groups={['integrations']} connectorNames={['Esportes e iGaming']} integrationId="documentacao-conexoes-igaming" />
        <div className="whitepaper__prose"><p>{t('Os jogos internos Burn Lottery e Double 2X são features determinísticas, não operações deste subagente.')}
          {' '}<a href="#documentacao-jogos">{t('Consultar as regras dos jogos internos')}</a></p>
          <p><a href="#documentacao-conexoes-esportes">{t('Conectores de Esportes e iGaming')}</a></p></div>
        </>)}
      </>;
    case 'documentacao-features':
      return <>
        {intro('Features executam regras definidas: apresentam saldos, verificam condições e registram efeitos autorizados. Não são agentes de inteligência artificial. A análise dos agentes e o funcionamento das carteiras, staking e jogos são responsabilidades diferentes.')}
        {m('documentacao-staking', [14])}
      </>;
    case 'documentacao-carteira-bettex':
      return <>{l('documentacao-acesso', [4, 5, 6, 7, 8])}{l('documentacao-rede', [11, 12, 13, 14])}</>;
    case 'documentacao-carteira-usdc':
      return <>{l('documentacao-rede', [8, 9, 10, 15])}</>;
    case 'documentacao-acesso':
      return <>{l(id, [0, 1, 2, 3, 9, 10])}</>;
    case 'documentacao-historico':
      return <>
        {intro('O histórico apresenta movimentos e estados registrados. Consultar ou exportar esses dados não inicia operações dos agentes nem muda saldos. Os registros permitem conferir origem, destino, custos e confirmação sem tratar um movimento pendente como dinheiro disponível.')}
        {l('documentacao-arquitetura', [5, 6])}
        {l('documentacao-implantacao', [4])}
        {nested('documentacao-arquitetura', 9, [2])}
      </>;
    case 'documentacao-staking':
      return <>
        <DocumentationChapterIntroduction chapterId={id} />
        {m(id, range(0, 14))}{m(id, [15, 16, 17])}
        {reference('documentacao-referencia-participacao', 'Apuração, liquidação e correções', <div id="documentacao-staking-detalhe">{l('documentacao-staking-detalhe', range(0, 5))}</div>)}
      </>;
    case 'documentacao-emissao':
      return <>
        <DocumentationChapterIntroduction chapterId={id} />
        {m(id, range(0, 10))}{m(id, [12, 13, 14, 17, 18])}
        {reference('documentacao-referencia-tokenomics', 'Emissão, venda e direitos', <>
          <div id="documentacao-emissao-detalhe">{l('documentacao-emissao-detalhe', range(0, 10))}</div>
          {l('documentacao-servicos', [0])}
        </>)}
      </>;
    case 'documentacao-feature-recompra':
      return <>{m('documentacao-emissao', [15, 16])}<BuybackPolicy /></>;
    case 'documentacao-jogos':
      return <DocumentationGames />;
    case 'documentacao-riscos':
      return <>
        <DocumentationChapterIntroduction chapterId={id} />
        {m(id, [0, 3, 4, 5, 6])}
        {reference('documentacao-referencia-riscos', 'Infraestrutura comum e segurança', <>
          <div id="documentacao-rede">{l('documentacao-rede', range(0, 8))}</div>
          {l('documentacao-arquitetura', [3, 4])}
          <ArchitectureCatalogue groups={['demonstrations', 'integrations']} connectorNames={['Starknet', 'Arbitrum One', 'Safe / OpenZeppelin', 'On-ramp externo', 'MCP']} />
          <div id="documentacao-implantacao"><a href="#documentacao-referencia-agentes">{t('Requisitos operacionais e de segurança')}</a></div>
          <div id="documentacao-riscos-detalhe">{l('documentacao-riscos-detalhe', range(0, 7))}</div>
        </>)}
      </>;
    case 'documentacao-roadmap':
      return <><DocumentationChapterIntroduction chapterId={id} />{m(id, range(0, 3))}</>;
    default:
      return <Fragment />;
  }
}
