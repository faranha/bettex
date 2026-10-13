import { DocImage, DocTerms } from '../DocImage';
import { ResponsiveTableCarousel } from '../ResponsiveTableCarousel';
import { t } from '@/lib/i18n';
const connectors = [
  { name: 'Starknet', kind: 'Rede e contratos', access: 'JSON-RPC / Cairo', status: 'Candidata; planejamento e captação de grants', function: 'Contas nativas, token, transferências e contratos. Exige implementação Cairo, ativos compatíveis e contratos validados; não há implantação BETTEX confirmada.', url: 'https://docs.starknet.io/' },
  { name: 'Arbitrum One', kind: 'Rede e contratos', access: 'JSON-RPC / EVM', status: 'Candidata; consulta pública verificada', function: 'Carteiras, token, transferências e contratos. Consulta RPC não define a escolha da rede; execução BETTEX exige contratos validados.', url: 'https://docs.arbitrum.io/' },
  { name: 'Polymarket', kind: 'Dados e negociação', access: 'Gamma / CLOB API', status: 'Dados públicos verificados; ordens condicionadas', function: 'Gamma descobre mercados. CLOB recebe ordens assinadas com conta, permissões e território elegíveis.', url: 'https://docs.polymarket.com/market-data/overview' },
  { name: 'Allora', kind: 'Inferência', access: 'API / SDK', status: 'Candidata; exemplo testnet documentado', function: 'Inferência agregada, tópico e timestamp. API requer chave; não envia ordens nem controla carteiras.', url: 'https://docs.allora.network/get-started/quickstart-consume' },
  { name: 'Robinhood', kind: 'Dados e negociação cripto', access: 'Crypto Trading API', status: 'Candidata; acesso autorizado necessário', function: 'Conta elegível nos Estados Unidos, credenciais e assinatura. API cripto não estabelece negociação de ações.', url: 'https://docs.robinhood.com/crypto/trading' },
  { name: 'Safe / OpenZeppelin', kind: 'Custódia e permissões', access: 'Contratos / SDK', status: 'Recursos documentados; validação por implantação', function: 'Quórum, módulos, acesso e espera. Safe é referência EVM; Starknet exige contas e contratos Cairo compatíveis. Política BETTEX exige testar todos os caminhos de execução.', url: 'https://docs.safe.global/advanced/smart-account-concepts' },
  { name: 'On-ramp externo', kind: 'Conversão e recebimento', access: 'API do provedor', status: 'Seleção e autorização por território', function: 'Converte moeda fiduciária em USDC. KYC, cotação e custos ficam no provedor; crédito exige USDC confirmado.', url: 'https://developers.circle.com/' },
  { name: 'Esportes e iGaming', kind: 'Odds, ofertas e eventual execução', access: 'API autorizada do operador', status: 'Candidatos por provedor', function: 'Regras de promoção, elegibilidade e permissão de automação verificadas por canal; não presumir acesso de trading.', url: 'https://www.betfair.com/exchange/plus/' },
  { name: 'MCP', kind: 'Protocolo de ferramentas', access: 'Ferramentas do servidor', status: 'Capacidade verificada por ferramenta', function: 'Leitura, análise e execução são permissões diferentes. Um MCP de documentação não é trading.', url: 'https://modelcontextprotocol.io/docs/getting-started/intro' },
];

export function ArchitectureCatalogue() {
  return <>
    <h3 className="whitepaper__subhead" id="documentacao-mapa-arquitetura">Mapa orquestrado do sistema</h3>
    <div className="whitepaper__prose"><p>Fontes de dados e inferências alimentam a IA BETTEX, que coordena análises com os agentes especializados nos dois sentidos. Tesouraria informa capital e liquidez; risco independente valida cada proposta; somente conectores autorizados executam. Respostas e conciliação retornam à orquestradora, à tesouraria e ao histórico.</p></div>
    <DocImage wide src="technology/rede-inteligencia.png" alt="Rede de módulos conectados cujos fios convergem em um único fluxo luminoso." caption="Dados e inferências de várias fontes alimentam a análise da BETTEX." />
    <div className="whitepaper__prose" id="schematic-orchestration"><p>Governança ↔ políticas e versões · Starknet ou Arbitrum One: carteiras e contratos, conforme a rede escolhida</p></div>
    <h3 className="whitepaper__subhead" id="documentacao-catalogo-integracoes">Catálogo de integrações</h3>
    <div className="whitepaper__prose"><p>Capacidade descrita pelo provedor, consulta demonstrada e integração operacional são estados distintos. Este catálogo identifica o acesso efetivamente verificado; dados públicos não comprovam permissão de negociar.</p></div>
    <ResponsiveTableCarousel count={connectors.length} label="Dados, inferência, execução e infraestrutura"><table className="whitepaper__vesting-table whitepaper__business-table">
      <caption>Dados, inferência, execução e infraestrutura</caption>
      <thead><tr><th scope="col">Plataforma</th><th scope="col">Categoria / acesso</th><th scope="col">Estado e função</th></tr></thead>
      <tbody>{connectors.map(c => <tr key={c.name}><th scope="row"><a href={c.url} target="_blank" rel="noopener noreferrer">{c.name}</a></th><td data-label={t('Categoria / acesso')}>{c.kind}<br />{c.access}</td><td data-label={t('Estado e função')}><strong>{c.status}</strong><p>{c.function}</p></td></tr>)}</tbody>
    </table></ResponsiveTableCarousel>
    <h3 className="whitepaper__subhead" id="documentacao-demonstracoes">Demonstrações e pré-requisitos</h3>
    <div className="whitepaper__prose"><p>Consultas públicas em 03/10/2026: JSON-RPC eth_chainId no endpoint público da Arbitrum retornou 0xa4b1, correspondente à rede 42161. A consulta Gamma /markets?limit=1&amp;active=true&amp;closed=false retornou o mercado 559651, ativo, não encerrado, com identificadores CLOB. Isso comprova leitura e identificação, não compra, liquidação ou implantação do token.</p></div>
    <div className="whitepaper__prose"><p><a href="#documentacao-rede">Ver as alternativas Starknet e Arbitrum, ativos e carteiras</a>.</p></div>
    <details className="whitepaper__technical" id="documentacao-consultas-publicas"><summary>Reproduzir as consultas sem movimentar recursos</summary><div className="whitepaper__technical-body"><pre data-i18n="skip"><code>{'POST https://arb1.arbitrum.io/rpc\n{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}\n\nGET https://gamma-api.polymarket.com/markets?limit=1&active=true&closed=false'}</code></pre><p>Conferir rede, status, timestamp, regras de resolução e identificadores antes de análise. Dados atuais podem diferir do registro consultado. Não há método de envio de transação nessas consultas.</p></div></details>
    <h4 className="whitepaper__subhead" id="documentacao-allora-fluxo">Allora: da inferência à análise</h4>
    <DocTerms id="schematic-allora" label="Inferência não é ordem" items={[
      ['API Allora', 'tópico, inferência normalizada e timestamp'],
      ['Análise BETTEX ↔ agente de ações e cripto', 'Insumo de análise.'],
      ['Risco independente', 'validação ou rejeição'],
      ['Conector autorizado', 'eventual execução → conciliação'],
    ]} note="Allora não controla carteira, não envia pagamentos e não executa ordens." />
    <div className="whitepaper__prose"><p>O quickstart oficial usa tópico 69 em testnet, consultado por API com chave e resposta assinada. A demonstração BETTEX desse percurso é simulada: validar origem, horário e normalização, cruzar preços e liquidez, rejeitar sinal vencido e executar somente após risco independente. Sem credencial autorizada, não se afirma consulta Allora realizada.</p><p>Robinhood documenta preços, posições, ordens e cancelamentos de cripto, com assinatura e conta elegível. O exemplo é simulado sem essas permissões: proposta de ordem → risco → chamada autorizada → estado → conciliação. Não é transação Arbitrum nem acesso a ações. Esportes e iGaming exigem canal e regras específicos; suas demonstrações de agentes são simulações parametrizadas.</p></div>
  </>;
}