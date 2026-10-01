import { MarketMark } from '@/components/hero/MarketMark';
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
      {markets.map((market) => (
        <div className="ip-platform-card" key={market.platformId}>
          <span className="ip-platform-card__market" aria-hidden="true">
            <MarketMark kind={market.kind} className="ip-market-glyph" />
            {market.label}
          </span>
          <img src={`${base}${market.logo}`} alt={`Logo da plataforma ${market.platform}`} />
          <b>{market.platform}</b>
        </div>
      ))}
    </div>
  );
}

export function PhoneScreen({ id }: { id: ScreenId }) {
  switch (id) {
    case 'visao': return (<>
      <Head k="Sua participação" t="Olá, João" />
      <Hero dark label="Saldo disponível em reais" cents={account.availableCents} />
      <div className="ip-tiles"><div><small>Lucro creditado</small><b>{money(account.profitCents)}</b></div><div><small>BETTEX ativados</small><b>{tokens(account.activatedTokens)}</b></div><div><small>Mercados</small><b>4</b></div></div>
      <Row a="Conta de exemplo" b="BRL · Pix" />
      <Row a="Token na Carteira BETTEX" b={`${tokens(account.activatedTokens)} BETTEX`} />
    </>);
    case 'dinheiro': return (<>
      <Head k="Conta de exemplo" t="Conta em reais" />
      <Hero dark label="Saldo disponível" cents={account.availableCents} />
      <div className="ip-pair"><span className="ip-fake">Depositar com Pix</span><span className="ip-fake ip-fake--ghost">Sacar com Pix</span></div>
      <Row a="Depósitos por Pix" b={money(account.depositsCents)} />
      <Row a="Saques por Pix" b={money(account.withdrawalsCents)} />
      <Row a="Lucro creditado" b={money(account.profitCents)} />
      <Row a="Chave Pix" b="cadastrada" />
    </>);
    case 'participacao': return (<>
      <Head k="Participação" t="Token BETTEX" />
      <div className="ip-card ip-card--dark"><small>Total de tokens</small><strong>{tokens(account.tokens)} BETTEX</strong><em>O token não ativa participação automaticamente</em></div>
      <div className="ip-split"><div><small>Na Carteira BETTEX · ativados</small><b>{tokens(account.activatedTokens)}</b></div><div><small>Na carteira pessoal</small><b>{tokens(account.tokens - account.activatedTokens)}</b></div></div>
      <Row a="Ativação" b="Depósito na Carteira BETTEX" />
      <Row a="Elegibilidade" b="Nos dias com tokens ativados" />
      <Row a="Recebimento de créditos" b="Em reais na conta" />
    </>);
    case 'bettex': return (<>
      <Head k="Operação BETTEX" t="Analisa antes de operar" />
      <p className="ip-note">Antes de cada operação, a BETTEX cruza múltiplas análises, compara oportunidades nos mercados e seleciona o investimento mais vantajoso segundo seus critérios e limites de risco.</p>
      <div className="ip-steps">
        <div><i>1</i>Analisa sinais, contexto e dados disponíveis</div>
        <div><i>2</i>Compara oportunidades nos quatro mercados</div>
        <div><i>3</i>Seleciona onde investir e opera dentro dos limites</div>
      </div>
      <small>Plataformas e mercados</small>
      <PlatformList />
    </>);
    case 'resultados': return (<>
      <Head k="Conta de exemplo · BRL" t="Resultados por plataforma" />
      <Hero label="Lucro creditado" cents={account.profitCents} />
      {markets.map((market) => <Row key={market.platformId} a={`${market.platform} · ${market.label}`} b={money(account.platformCreditsCents[market.platformId])} />)}
      <Row a="Total creditado na conta" b={money(account.profitCents)} />
    </>);
    case 'historico': return (<>
      <Head k="Conta de exemplo · BRL" t="Histórico de operações" />
      <small>Movimentações da conta e resultados das operações por plataforma.</small>
      {account.movements.map((movement) => (
        <div className="ip-tx" data-dir={movement.direction} key={movement.label}><i /><div><b>{movement.label}</b><em>{movement.detail}</em></div><span>{movement.direction === 'out' ? '−' : '+'} {money(movement.amountCents)}</span></div>
      ))}
      <Row a="Saldo disponível" b={money(account.availableCents)} />
    </>);
    default: return unknownScreen(id);
  }
}