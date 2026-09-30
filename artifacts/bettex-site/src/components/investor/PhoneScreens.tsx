import { AgentMark, type AgentKind } from '@/components/hero/AgentMark';
import { agentInfo, agentOrder, type ScreenId } from './presentationData';
import { presentationAccount as account, formatAccountMoney as money, formatAccountTokens as tokens } from './presentationAccount';

const base = import.meta.env.BASE_URL;
const Row = ({ a, b }: { a: string; b: string }) => <div className="ip-row"><span>{a}</span><b>{b}</b></div>;
const Hero = ({ label, cents, dark }: { label: string; cents: number; dark?: boolean }) => (
  <div className={`ip-card${dark ? ' ip-card--dark' : ''}`}><small>{label}</small><strong>{money(cents)}</strong></div>
);
const Head = ({ k, t }: { k: string; t: string }) => <><small>{k}</small><h5>{t}</h5></>;

function AgentList() {
  return <>{agentOrder.map((k) => { const a = agentInfo[k]; return (
    <div className="ip-agent" key={k}>
      <span data-kind={k}><AgentMark kind={k} /></span>
      <div><b>{a.name}</b><em>{a.area}</em></div>
      <img src={`${base}${a.logo}`} alt={`Marca da ${a.platform}`} className="ip-agent__logo" />
    </div>); })}</>;
}

function AgentDetail({ kind }: { kind: AgentKind }) {
  const a = agentInfo[kind];
  return (
    <>
      <div className="ip-hero-img" data-kind={kind}><img src={`${base}${a.img}`} alt={`Ilustração do agente ${a.name}`} /></div>
      <Head k={a.area} t={a.name} />
      <p className="ip-note">{a.does}</p>
      <div className="ip-platform"><small>Plataforma</small><span><img src={`${base}${a.logo}`} alt={`Marca da ${a.platform}`} /><b>{a.platform}</b></span>
        {a.allora && <span className="ip-platform__allora"><b>Allora</b><em>inteligência de apoio</em></span>}</div>
      <div className="ip-steps">{a.how.map((h, i) => <div key={h}><i>{i + 1}</i>{h}</div>)}</div>
      <Row a="Sua parte no período" b={money(account.agentCreditsCents[kind])} />
    </>
  );
}

export function PhoneScreen({ id }: { id: ScreenId }) {
  switch (id) {
    case 'visao': return (<>
      <Head k="Sua participação" t="Olá, João" />
      <Hero dark label="Lucro creditado em reais" cents={account.profitCents} />
      <div className="ip-tiles"><div><small>Agentes</small><b>4</b></div><div><small>Mercados</small><b>4</b></div><div><small>Tipos de token</small><b>1</b></div></div>
      <div className="ip-mini">{agentOrder.map((k) => <span key={k} data-kind={k}><AgentMark kind={k} /></span>)}</div>
      <Row a="Saldo disponível" b={money(account.availableCents)} />
      <Row a="BETTEX na Carteira BETTEX" b={tokens(account.activatedTokens)} />
    </>);
    case 'dinheiro': return (<>
      <Head k="Conta em reais" t="Seu dinheiro" />
      <Hero dark label="Disponível" cents={account.availableCents} />
      <div className="ip-pair"><span className="ip-fake">Depositar com Pix</span><span className="ip-fake ip-fake--ghost">Sacar com Pix</span></div>
      <Row a="Lucro creditado" b={money(account.profitCents)} />
      <Row a="Depósitos por Pix" b={money(account.depositsCents)} />
      <Row a="Saques por Pix" b={money(account.withdrawalsCents)} />
      <Row a="Chave Pix" b="cadastrada" />
    </>);
    case 'participacao': return (<>
      <Head k="Participação" t="Seu token BETTEX" />
      <div className="ip-card ip-card--dark"><small>Seus tokens</small><strong>{tokens(account.tokens)} BETTEX</strong><em>um token, quatro mercados</em></div>
      <div className="ip-split"><div><small>Na Carteira BETTEX</small><b>{tokens(account.activatedTokens)}</b></div><div><small>Fora da carteira</small><b>{tokens(account.tokens - account.activatedTokens)}</b></div></div>
      <Row a="Participação ativada" b={`${tokens(account.activatedTokens)} BETTEX`} />
      <Row a="Distribuição" b="Nos dias de lucro" />
      <Row a="Recebimento" b="Em reais na conta" />
      <p className="ip-note">Deposite BETTEX na Carteira BETTEX para ativar sua participação. O sistema processa a movimentação dos tokens.</p>
    </>);
    case 'agentes': return (<><Head k="Agentes" t="Quem trabalha por você" /><AgentList /></>);
    case 'predix': case 'tradex': case 'sportix': case 'bettix': return <AgentDetail kind={id} />;
    case 'resultados': return (<>
      <Head k="Resultados" t="Resumo do período" />
      <Hero label="Lucro creditado no período" cents={account.profitCents} />
      <small>Sua parte por agente</small>
      {agentOrder.map((kind) => <Row key={kind} a={agentInfo[kind].name} b={money(account.agentCreditsCents[kind])} />)}
      <Row a="Crédito total na conta" b={money(account.profitCents)} />
    </>);
    case 'historico': return (<>
      <Head k="Histórico" t="Movimentos" />
      {account.movements.map((movement) => (
        <div className="ip-tx" data-dir={movement.direction} key={movement.label}><i /><div><b>{movement.label}</b><em>{movement.detail}</em></div><span>{movement.direction === 'out' ? '−' : '+'} {money(movement.amountCents)}</span></div>
      ))}
      <Row a="Saldo disponível" b={money(account.availableCents)} />
    </>);
  }
}
