import { technologyPlatforms } from '@/lib/platforms';
import { markets, type ScreenId } from './presentationData';
import { presentationAccount as account, formatAccountMoney as money, formatAccountTokens as tokens } from './presentationAccount';

const base = import.meta.env.BASE_URL;
const Row = ({ a, b }: { a: string; b: string }) => <div className="ip-row"><span>{a}</span><b>{b}</b></div>;
const Hero = ({ label, cents, dark }: { label: string; cents: number; dark?: boolean }) => (
  <div className={`ip-card${dark ? ' ip-card--dark' : ''}`}><small>{label}</small><strong>{money(cents)}</strong></div>
);
const Head = ({ k, t }: { k: string; t: string }) => <><small>{k}</small><h5>{t}</h5></>;
const unknownScreen = (id: ScreenId): never => { throw new Error(`Tela conceitual desconhecida: ${id}`); };

function PlatformList() {
  return (
    <div className="ip-platform-grid">
      {technologyPlatforms.map((platform) => (
        <div className="ip-platform-card" key={platform.id}>
          <img src={`${base}platforms/${platform.logo}`} alt={`Logo da plataforma ${platform.name}`} />
          <b>{platform.name}</b>
        </div>
      ))}
    </div>
  );
}

export function PhoneScreen({ id }: { id: ScreenId }) {
  switch (id) {
    case 'visao': return (<>
      <Head k="Sua participação" t="Olá, João" />
      <Hero dark label="Carteira em reais · saldo disponível" cents={account.availableCents} />
      <div className="ip-tiles"><div><small>Lucros recebidos</small><b>{money(account.profitCents)}</b></div><div><small>Carteira BETTEX</small><b>{tokens(account.tokens)}</b></div><div><small>Mercados</small><b>4</b></div></div>
    </>);
    case 'dinheiro': return (<>
      <Head k="Carteira em reais" t="Conta em reais" />
      <Hero dark label="Saldo disponível" cents={account.availableCents} />
      <Row a="Depósitos por Pix" b={money(account.depositsCents)} />
      <Row a="Compra concluída de BETTEX" b={`− ${money(account.purchaseCents)}`} />
      <Row a="Saques por Pix" b={money(account.withdrawalsCents)} />
      <Row a="Lucros recebidos" b={money(account.profitCents)} />
    </>);
    case 'participacao': return (<>
      <Head k="Carteiras BETTEX e em reais" t="Saldo de tokens" />
      <div className="ip-card ip-card--dark"><small>Carteira BETTEX</small><strong>{tokens(account.tokens)} BETTEX</strong><em>Seu saldo participa automaticamente nos dias com lucro líquido realizado pelo projeto</em></div>
      <Row a="Carteira em reais disponível" b={money(account.availableCents)} />
      <Row a="Sua parte do lucro" b="Proporcional ao saldo e ao tempo mantido no dia" />
      <Row a="Créditos em reais" b="Na Carteira em reais" />
    </>);
    case 'bettex': return (<>
      <Head k="Operação BETTEX" t="Analisa antes de operar" />
      <p className="ip-note">A BETTEX analisa sinais e compara as oportunidades antes de cada operação.</p>
      <div className="ip-steps">
        <div><i>1</i>Analisa sinais, contexto e dados disponíveis</div>
        <div><i>2</i>Compara oportunidades nos quatro mercados</div>
        <div><i>3</i>Seleciona onde operar e respeita os limites de risco definidos</div>
      </div>
      <small>Plataformas onde podemos operar</small>
      <PlatformList />
    </>);
    case 'resultados': return (<>
      <Head k="Distribuição diária" t="Lucros recebidos em reais" />
      <Hero label="Sua parte do lucro" cents={account.profitCents} />
      <p className="ip-note">Nos dias com lucro líquido realizado pelo projeto, após custos e perdas anteriores, 25% desse lucro vai para a distribuição global. A parte de cada pessoa é proporcional ao saldo BETTEX e ao tempo mantido no dia. R$ 128,40 é sua parte neste exemplo, não um retorno fixo de 25%.</p>
      <small>Exemplo por plataforma, não são créditos separados</small>
      {markets.map((market) => <Row key={market.platformId} a={market.platform} b={money(account.platformAttributionCents[market.platformId])} />)}
      <Row a="Crédito consolidado do dia" b={money(account.profitCents)} />
    </>);
    case 'historico': return (<>
      <Head k="Carteiras em reais e BETTEX" t="Histórico de operações" />
      <small>Movimentações das carteiras e crédito diário consolidado.</small>
      {account.movements.map((movement) => (
        <div className="ip-tx" data-dir={movement.direction} key={movement.label}><i /><div><b>{movement.label}</b><em>{movement.detail}</em></div><span>{movement.direction === 'out' ? '−' : '+'} {money(movement.amountCents)}</span></div>
      ))}
      <Row a="Saldo disponível" b={money(account.availableCents)} />
    </>);
    default: return unknownScreen(id);
  }
}