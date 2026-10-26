/** @jsxImportSource react */
import { useLocale } from '@/lib/i18n';

const copy = {
  continuity: [
    'A compra futura deve registrar débito de USDC e crédito de BETTEX juntos, uma única vez após a liquidação; distribuições também não podem ser duplicadas. A continuidade exige registros imutáveis, ajustes identificados, backups testados e conciliação de transferências, saldos, custos, resultados, tesouraria e saques. Falhas deixam a operação pendente ou bloqueada, nunca presumidamente confirmada. Custódia, permissões e integrações exigem validação técnica e jurídica.',
    'A future purchase must record the USDC debit and BETTEX credit together, once after settlement; distributions must not be duplicated either. Continuity requires immutable records, identified adjustments, tested backups and reconciliation of transfers, balances, costs, results, treasury and withdrawals. Failures leave operations pending or blocked, never presumed confirmed. Custody, permissions and integrations require technical and legal validation.',
    'Una compra futura debe registrar el débito de USDC y el crédito de BETTEX juntos, una sola vez tras la liquidación; las distribuciones tampoco pueden duplicarse. La continuidad exige registros inmutables, ajustes identificados, copias de seguridad probadas y conciliación de transferencias, saldos, costes, resultados, tesorería y retiros. Los fallos dejan la operación pendiente o bloqueada, nunca presuntamente confirmada. Custodia, permisos e integraciones requieren validación técnica y jurídica.',
  ],
  validation: [
    'Contas, custódia, rede e contratos, controles da tesouraria, custos, emissão, conectores, arredondamento e resposta a incidentes exigem validação técnica e jurídica antes da operação financeira. O demo é exclusivamente visual. A liquidação prevista é em USDC; a BETTEX não oferece pagamento em moeda fiduciária.',
    'Accounts, custody, network and contracts, treasury controls, costs, issuance, connectors, rounding and incident response require technical and legal validation before financial operations. The demo is visual only. Planned settlement is in USDC; BETTEX does not offer fiat payouts.',
    'Cuentas, custodia, red y contratos, controles de tesorería, costes, emisión, conectores, redondeo y respuesta a incidentes requieren validación técnica y jurídica antes de la operación financiera. El demo es exclusivamente visual. La liquidación prevista es en USDC; BETTEX no ofrece pagos en moneda fiduciaria.',
  ],
  currency: [
    'Moeda local usada para estimativas de valor e, quando disponível e elegível, conversão de entrada por um provedor externo. Uma estimativa não converte o saldo USDC nem muda o ativo do saque. A BETTEX não oferece pagamento em moeda fiduciária.',
    'Local currency used for value estimates and, where available and eligible, conversion into crypto through an external provider. An estimate neither converts the USDC balance nor changes the withdrawal asset. BETTEX does not offer fiat payouts.',
    'Moneda local usada para estimaciones de valor y, cuando esté disponible y sea elegible, conversión de entrada mediante un proveedor externo. Una estimación no convierte el saldo USDC ni cambia el activo del retiro. BETTEX no ofrece pagos en moneda fiduciaria.',
  ],
  publicQuery: [
    'A consulta pública JSON-RPC eth_chainId da Arbitrum documentada em 03/10/2026 retornou 0xa4b1, correspondente à rede 42161. Essa leitura identifica a rede; não comprova implantação de contratos BETTEX, compra ou liquidação.',
    'The public Arbitrum JSON-RPC eth_chainId query documented on October 3, 2026 returned 0xa4b1, corresponding to network 42161. This read identifies the network; it does not prove BETTEX contract deployment, purchase or settlement.',
    'La consulta pública JSON-RPC eth_chainId de Arbitrum documentada el 03/10/2026 devolvió 0xa4b1, correspondiente a la red 42161. Esta lectura identifica la red; no demuestra despliegue de contratos BETTEX, compra ni liquidación.',
  ],
  expansion: [
    'A evolução das integrações se concentra no trading cripto: dados de mercado, inferências e canais de execução elegíveis. Novas fontes e especializações por moeda dependem de avaliação técnica, de risco e jurídica; não são integrações já entregues.',
    'Integration development focuses on crypto trading: market data, inferences and eligible execution channels. New sources and coin specializations require technical, risk and legal evaluation; they are not already delivered integrations.',
    'La evolución de las integraciones se centra en el trading cripto: datos de mercado, inferencias y canales de ejecución elegibles. Las nuevas fuentes y especializaciones por moneda requieren evaluación técnica, de riesgo y jurídica; no son integraciones ya entregadas.',
  ],
  strategy: [
    'O subagente Cripto investiga indícios de manipulação e comportamento de mercado para selecionar moedas e avaliar entradas e saídas. Não há uma lista fixa de ativos nem uma técnica única de aprendizado definida como solução final.',
    'The Crypto subagent investigates manipulation indicators and market behavior to select coins and evaluate entries and exits. There is no fixed asset list or single learning technique defined as the final solution.',
    'El subagente Cripto investiga indicios de manipulación y comportamiento de mercado para seleccionar monedas y evaluar entradas y salidas. No existe una lista fija de activos ni una única técnica de aprendizaje definida como solución final.',
  ],
  execution: [
    'BETTEX é o token de participação. O capital de trading é separado dos tokens dos participantes. Qualquer execução financeira futura exige canais autorizados, controles de risco, reservas e conciliação; o demo não executa ordens reais.',
    'BETTEX is the participation token. Trading capital is separate from participants’ tokens. Any future financial execution requires authorized channels, risk controls, reserves and reconciliation; the demo executes no real orders.',
    'BETTEX es el token de participación. El capital de trading está separado de los tokens de los participantes. Cualquier ejecución financiera futura requiere canales autorizados, controles de riesgo, reservas y conciliación; el demo no ejecuta órdenes reales.',
  ],
  risk: [
    'Sem alavancagem. Uma pausa de emergência auditada pode impedir novas operações; cancelamentos de ordens pendentes também exigem validação. Limites reduzem exposição, mas não evitam perdas nem dispensam autorização da plataforma e adequação jurídica.',
    'No leverage. An audited emergency pause may prevent new operations; cancellation of pending orders also requires validation. Limits reduce exposure but do not prevent losses or replace platform authorization and legal compliance.',
    'Sin apalancamiento. Una pausa de emergencia auditada puede impedir nuevas operaciones; la cancelación de órdenes pendientes también requiere validación. Los límites reducen la exposición, pero no evitan pérdidas ni sustituyen la autorización de la plataforma y la adecuación jurídica.',
  ],
  marketRisk: [
    'Criptoativos podem sofrer manipulação, oscilações extremas, baixa liquidez e falhas de negociação ou custódia. Uma análise da IA não garante vantagem, execução, preservação do capital nem lucro.',
    'Cryptoassets may face manipulation, extreme price movements, low liquidity and trading or custody failures. AI analysis guarantees neither an edge nor execution, capital preservation or profit.',
    'Los criptoactivos pueden sufrir manipulación, oscilaciones extremas, baja liquidez y fallos de negociación o custodia. Un análisis de IA no garantiza ventaja, ejecución, preservación del capital ni beneficios.',
  ],
  connector: [
    'A Robinhood documenta consultas e ordens de cripto para contas elegíveis e autorizadas. O fluxo descrito é uma referência de desenvolvimento, não uma integração ativa: proposta, risco, envio autorizado, estado e conciliação. As ordens da plataforma são distintas das transações na rede blockchain escolhida.',
    'Robinhood documents crypto queries and orders for eligible, authorized accounts. The described flow is a development reference, not an active integration: proposal, risk, authorized submission, status and reconciliation. Platform orders are distinct from transactions on the chosen blockchain.',
    'Robinhood documenta consultas y órdenes de cripto para cuentas elegibles y autorizadas. El flujo descrito es una referencia de desarrollo, no una integración activa: propuesta, riesgo, envío autorizado, estado y conciliación. Las órdenes de la plataforma son distintas de las transacciones en la blockchain elegida.',
  ],
  allocation: [
    'A IA analisa oportunidades exclusivamente em cripto, considerando padrões de manipulação, liquidez, custos e exposição. A alocação entre ativos depende da análise e da autorização de risco, preservando reservas. O desenho representa o modelo em desenvolvimento, não uma operação financeira disponível no demo.',
    'AI analyzes opportunities exclusively in crypto, considering manipulation patterns, liquidity, costs and exposure. Allocation across assets depends on analysis and risk authorization while preserving reserves. This diagram represents the model under development, not financial operations available in the demo.',
    'La IA analiza oportunidades exclusivamente en cripto, considerando patrones de manipulación, liquidez, costes y exposición. La asignación entre activos depende del análisis y de la autorización de riesgo, preservando reservas. El esquema representa el modelo en desarrollo, no operaciones financieras disponibles en el demo.',
  ],
  collection: [
    'Os subagentes coletam dados de oportunidades em cripto: preços, liquidez, custos e sinais de IA, com origem e horário dos dados.',
    'Subagents collect crypto opportunity data: prices, liquidity, costs and AI signals, recording the source and timestamp.',
    'Los subagentes recopilan datos de oportunidades en cripto: precios, liquidez, costes y señales de IA, registrando su origen y hora.',
  ],
  legal: [
    'O lançamento e a operação de trading cripto dependem de adequação jurídica em cada território e de autorização dos provedores utilizados. Uma referência técnica não autoriza oferta pública, custódia ou execução financeira.',
    'Crypto trading launch and operations depend on legal compliance in each territory and authorization from the providers used. A technical reference does not authorize a public offering, custody or financial execution.',
    'El lanzamiento y la operación de trading cripto dependen de la adecuación jurídica en cada territorio y de la autorización de los proveedores utilizados. Una referencia técnica no autoriza una oferta pública, custodia ni ejecución financiera.',
  ],
} as const;

export function DocumentationCryptoScope({ part, inline = false, className }: {
  part: keyof typeof copy; inline?: boolean; className?: string;
}) {
  const locale = useLocale();
  const text = copy[part][locale === 'en' ? 1 : locale === 'es' ? 2 : 0];
  const Tag = inline ? 'span' : 'p';
  return <Tag data-i18n="translated" className={className}>{text}</Tag>;
}
