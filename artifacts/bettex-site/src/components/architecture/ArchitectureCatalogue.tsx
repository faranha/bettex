import { DocumentationCryptoScope } from '../DocumentationCryptoScope';
import { DocImage, DocTerms } from '../DocImage';
import { ResponsiveTableCarousel } from '../ResponsiveTableCarousel';
import { t } from '@/lib/i18n';
const connectors = [
  { name: 'Starknet', kind: 'Rede e contratos', access: 'JSON-RPC / Cairo', status: 'Candidata; planejamento e captação de grants', function: 'Contas nativas, token, transferências e contratos. Exige implementação Cairo, ativos compatíveis e contratos validados; não há implantação BETTEX confirmada.', url: 'https://docs.starknet.io/' },
  { name: 'Arbitrum One', kind: 'Rede e contratos', access: 'JSON-RPC / EVM', status: 'Candidata; consulta pública verificada', function: 'Carteiras, token, transferências e contratos. Consulta RPC não define a escolha da rede; execução BETTEX exige contratos validados.', url: 'https://docs.arbitrum.io/' },
  { name: 'Allora', kind: 'Inferência', access: 'API / SDK', status: 'Candidata; exemplo testnet documentado', function: 'Inferência agregada, tópico e timestamp. API requer chave; não envia ordens nem controla carteiras.', url: 'https://docs.allora.network/get-started/quickstart-consume' },
  { name: 'Robinhood', kind: 'Dados e negociação cripto', access: 'Crypto Trading API', status: 'Candidata; acesso autorizado necessário', function: 'Conta elegível nos Estados Unidos, credenciais e assinatura. API cripto não estabelece negociação de ações.', url: 'https://docs.robinhood.com/crypto/trading' },
  { name: 'Safe / OpenZeppelin', kind: 'Custódia e permissões', access: 'Contratos / SDK', status: 'Recursos documentados; validação por implantação', function: 'Quórum, módulos, acesso e espera. Safe é referência EVM; Starknet exige contas e contratos Cairo compatíveis. Política BETTEX exige testar todos os caminhos de execução.', url: 'https://docs.safe.global/advanced/smart-account-concepts' },
  { name: 'On-ramp externo', kind: 'Conversão e recebimento', access: 'API do provedor', status: 'Seleção e autorização por território', function: 'Converte moeda fiduciária em USDC. KYC, cotação e custos ficam no provedor; crédito exige USDC confirmado.', url: 'https://developers.circle.com/' },
  { name: 'Esportes e iGaming', kind: 'Odds, ofertas e eventual execução', access: 'API autorizada do operador', status: 'Candidatos por provedor', function: 'Regras de promoção, elegibilidade e permissão de automação verificadas por canal; não presumir acesso de trading.', url: 'https://www.betfair.com/exchange/plus/' },
  { name: 'MCP', kind: 'Protocolo de ferramentas', access: 'Ferramentas do servidor', status: 'Capacidade verificada por ferramenta', function: 'Leitura, análise e execução são permissões diferentes. Um MCP de documentação não é trading.', url: 'https://modelcontextprotocol.io/docs/getting-started/intro' },
];

export type CatalogueGroup = 'map' | 'integrations' | 'demonstrations' | 'allora';
/** Groups: map = documentacao-mapa-arquitetura + schematic-orchestration; integrations = documentacao-catalogo-integracoes (table; connectorNames filters rows by name);
 *  demonstrations = documentacao-demonstracoes + documentacao-consultas-publicas; allora = documentacao-allora-fluxo (+ schematic-allora, Allora/Robinhood prose). */
export function ArchitectureCatalogue({ groups, connectorNames, integrationId = 'documentacao-catalogo-integracoes', compact = false, mapIntroduction = false }: { groups?: CatalogueGroup[]; connectorNames?: string[]; integrationId?: string; compact?: boolean; mapIntroduction?: boolean } = {}) {
  const on = (g: CatalogueGroup) => !groups || groups.includes(g);
  const rows = connectorNames ? connectors.filter(x => connectorNames.includes(x.name)) : connectors;
  return <>
    {on('map') && <div id={mapIntroduction ? 'documentacao-mapa-arquitetura' : undefined} data-documentation-opening={mapIntroduction ? '' : undefined}>
    <h3 className="whitepaper__subhead" id={mapIntroduction ? undefined : 'documentacao-mapa-arquitetura'} hidden={mapIntroduction}>Mapa orquestrado do sistema</h3>
    <div className="whitepaper__prose"><p>Fontes de dados e inferências alimentam a IA BETTEX, que coordena análises com os agentes especializados nos dois sentidos. Tesouraria informa capital e liquidez; risco independente valida cada proposta; somente conectores autorizados executam. Respostas e conciliação retornam à orquestradora, à tesouraria e ao histórico.</p></div>
    <DocImage wide src="technology/rede-inteligencia.png" alt="Rede de módulos conectados cujos fios convergem em um único fluxo luminoso." caption="Dados e inferências de várias fontes alimentam a análise da BETTEX." />
    <div className="whitepaper__prose" id="schematic-orchestration"><p>Governança ↔ políticas e versões · Starknet ou Arbitrum One: carteiras e contratos, conforme a rede escolhida</p></div>
    </div>}
    {on('integrations') && <section id={compact ? integrationId : undefined}>
    <h3 className="whitepaper__subhead" id={compact ? undefined : integrationId} hidden={compact} data-documentation-opening={compact ? '' : undefined}>Catálogo de integrações</h3>
    <div className="whitepaper__prose"><p>Capacidade descrita pelo provedor, consulta demonstrada e integração operacional são estados distintos. Este catálogo identifica o acesso efetivamente verificado; dados públicos não comprovam permissão de negociar.</p></div>
    <ResponsiveTableCarousel count={rows.length} label="Dados, inferência, execução e infraestrutura"><table className="whitepaper__vesting-table whitepaper__business-table">
      <caption>Dados, inferência, execução e infraestrutura</caption>
      <thead><tr><th scope="col">Plataforma</th><th scope="col">Categoria / acesso</th><th scope="col">Estado e função</th></tr></thead>
      <tbody>{rows.map(c => <tr key={c.name}><th scope="row"><a href={c.url} target="_blank" rel="noopener noreferrer">{c.name}</a></th><td data-label={t('Categoria / acesso')}>{c.kind}<br />{c.access}</td><td data-label={t('Estado e função')}><strong>{c.status}</strong><p>{c.function}</p></td></tr>)}</tbody>
    </table></ResponsiveTableCarousel>
    </section>}
    {on('demonstrations') && <>
    <h3 className="whitepaper__subhead" id="documentacao-demonstracoes">Demonstrações e pré-requisitos</h3>
    <div className="whitepaper__prose"><DocumentationCryptoScope part="publicQuery" /></div>
    <details className="whitepaper__technical" id="documentacao-consultas-publicas"><summary>Reproduzir as consultas sem movimentar recursos</summary><div className="whitepaper__technical-body"><pre data-i18n="skip"><code data-i18n="skip">{'POST https://arb1.arbitrum.io/rpc\n{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}'}</code></pre><DocumentationCryptoScope part="publicQuery" /></div></details>
    </>}
    {on('allora') && <>
    <h4 className="whitepaper__subhead" id="documentacao-allora-fluxo">Allora: da inferência à análise</h4>
    <DocTerms id="schematic-allora" label="Inferência não é ordem" items={[
      ['API Allora', 'tópico, inferência normalizada e timestamp'],
      ['Análise BETTEX ↔ agente de ações e cripto', 'Insumo de análise.'],
      ['Risco independente', 'validação ou rejeição'],
      ['Conector autorizado', 'eventual execução → conciliação'],
    ]} note="Allora não controla carteira, não envia pagamentos e não executa ordens." />
    <div className="whitepaper__prose"><p>O quickstart oficial usa tópico 69 em testnet, consultado por API com chave e resposta assinada. A demonstração BETTEX desse percurso é simulada: validar origem, horário e normalização, cruzar preços e liquidez, rejeitar sinal vencido e executar somente após risco independente. Sem credencial autorizada, não se afirma consulta Allora realizada.</p><DocumentationCryptoScope part="connector" /></div>
    </>}
  </>;
}