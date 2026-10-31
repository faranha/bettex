/** @jsxImportSource react */
import { t, useLocale } from '@/lib/i18n';

const targets: Record<string, { id: string }> = {
  'Carteira BETTEX': { id: 'title-documentacao-carteira-bettex' },
  'Carteira USDC': { id: 'documentacao-carteira-usdc' },
  'Conta, acesso e exportação': { id: 'documentacao-acesso' },
  'Histórico e conciliação': { id: 'documentacao-historico' },
  'Staking e distribuição': { id: 'documentacao-staking' },
  'Token e regras econômicas': { id: 'documentacao-emissao' },
  'Recompra e queima': { id: 'documentacao-feature-recompra' },
  'Burn Lottery e Double 2X': { id: 'documentacao-jogos' },
};

export function DocumentationFeaturesIntroduction({ economics = false }: { economics?: boolean } = {}) {
  const locale = useLocale();
  const x = (pt: string, en: string, es: string) => locale === 'en' ? en : locale === 'es' ? es : pt;
  const items = [
    ['Carteira BETTEX', x('O token da comunidade, sua titularidade e a participação conforme as regras do protocolo.', 'The community token, its ownership and participation under protocol rules.', 'El token de la comunidad, su titularidad y la participación según las reglas del protocolo.')],
    ['Carteira USDC', x('O saldo financeiro, as entradas e as saídas em cripto.', 'The financial balance, incoming funds and crypto withdrawals.', 'El saldo financiero, las entradas y las salidas en cripto.')],
    ['Conta, acesso e exportação', x('Autenticação, controle de acesso, dados da conta e portabilidade da carteira.', 'Authentication, access control, account data and wallet portability.', 'Autenticación, control de acceso, datos de la cuenta y portabilidad de la cartera.')],
    ['Histórico e conciliação', x('Movimentos, estados, custos e conferência dos registros.', 'Movements, statuses, costs and reconciliation of records.', 'Movimientos, estados, costes y conciliación de registros.')],
    ['Staking e distribuição', x('Participação, elegibilidade por rodada e distribuição de resultados, quando houver.', 'Participation, eligibility per round and distribution of results, when available.', 'Participación, elegibilidad por ronda y distribución de resultados, cuando los haya.')],
    ['Token e regras econômicas', x('Emissão, vesting, direitos e destinação dos resultados.', 'Issuance, vesting, rights and allocation of results.', 'Emisión, vesting, derechos y destino de los resultados.')],
    ['Recompra e queima', x('O mecanismo de recompra de BETTEX e a retirada definitiva de tokens de circulação.', 'The BETTEX buyback mechanism and permanent removal of tokens from circulation.', 'El mecanismo de recompra de BETTEX y la retirada definitiva de tokens de circulación.')],
    ['Burn Lottery e Double 2X', x('Jogos internos opcionais, com regras próprias e separados do agente de iGaming.', 'Optional internal games, with their own rules and separate from the iGaming agent.', 'Juegos internos opcionales, con reglas propias y separados del agente de iGaming.')],
  ];
  const economicTitles = new Set(['Staking e distribuição', 'Token e regras econômicas', 'Recompra e queima']);
  const visibleItems = items.filter(([title]) => economicTitles.has(title) === economics);
  return <div className="whitepaper__prose" data-testid={economics ? 'documentation-tokenomics-introduction' : 'documentation-features-introduction'}>
    <p>{t(economics
      ? 'Tokenomics reúne a economia do token: emissão, distribuição, venda, vesting, utilidade, direitos, staking, resultados, taxas, recompra e queima. Essas regras ficam separadas das funcionalidades do aplicativo.'
      : 'Features reúne as funcionalidades do aplicativo: carteiras, conta, acesso, histórico e jogos internos. As regras econômicas do token ficam na seção Tokenomics.')}</p>
    <ul>{visibleItems.map(([title, description]) => {
      const target = targets[title];
      if (!target) throw new Error(`Unknown feature reference: ${title}`);
      return <li key={title}><a href={`#${target.id}`} data-documentation-intralink=""><strong>{t(title)}</strong></a>:{' '}{description}</li>;
    })}</ul>
    {!economics && <p>{x('No demo atual, essas funcionalidades são apresentadas de forma visual, sem pagamentos, negociações ou movimentação de dinheiro real.',
      'In the current demo, these features are presented visually, without payments, trades or movement of real money.',
      'En el demo actual, estas funcionalidades se presentan de forma visual, sin pagos, negociaciones ni movimientos de dinero real.')}</p>}
  </div>;
}
