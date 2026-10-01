import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRightLeft, ChevronRight } from 'lucide-react';
import { presentationAccount as account, formatAccountMoney as money, formatAccountTokens as tokens } from './presentationAccount';
import './TokenWallet.css';

type View = 'sacar' | 'transferir' | 'lucro' | 'pool';

const actions: { id: View; label: string }[] = [
  { id: 'sacar', label: 'Sacar' },
  { id: 'transferir', label: 'Transferir' },
];

const titles: Record<View, string> = {
  sacar: 'Sacar BETTEX',
  transferir: 'Transferir BETTEX',
  lucro: 'Histórico de lucro',
  pool: 'Pool de staking',
};

const profitDays = [
  { date: '01/10/2026', status: 'Crédito consolidado', cents: account.profitCents as number | null },
  { date: '30/09/2026', status: 'Sem distribuição', cents: null },
  { date: '29/09/2026', status: 'Sem distribuição', cents: null },
];

function Detail({ view }: { view: View }) {
  const bal = `${tokens(account.tokens)} BETTEX`;
  switch (view) {
    case 'sacar': return (<>
      <p className="tw-lead">Retire seus tokens BETTEX do app quando quiser.</p>
      <dl className="tw-dl">
        <div><dt>Tokens no app</dt><dd>{bal}</dd></div>
        <div><dt>Tipo de saque</dt><dd>Token BETTEX</dd></div>
        <div><dt>Prazo</dt><dd>A qualquer momento</dd></div>
      </dl>
      <p className="tw-note">Retirada em unidades inteiras de BETTEX.</p>
    </>);
    case 'transferir': return (<>
      <p className="tw-lead">Envie BETTEX para outro titular da plataforma.</p>
      <dl className="tw-dl">
        <div><dt>Saldo para envio</dt><dd>{bal}</dd></div>
        <div><dt>Quem recebe</dt><dd>Outro titular BETTEX</dd></div>
        <div><dt>O que é enviado</dt><dd>Token BETTEX</dd></div>
      </dl>
      <p className="tw-note">Transferências em unidades inteiras de BETTEX.</p>
    </>);
    case 'lucro': return (<>
      <p className="tw-lead">Créditos em reais da sua parte do lucro, na Carteira em reais.</p>
      <div className="tw-total"><span>Lucro creditado</span><b>{money(account.profitCents)}</b></div>
      <ul className="tw-days">
        {profitDays.map((d) => (
          <li key={d.date} data-credit={d.cents !== null}>
            <div><b>{d.date}</b><em>{d.status}</em></div>
             <span>{d.cents !== null ? `+ ${money(d.cents)}` : money(0)}</span>
          </li>
        ))}
      </ul>
      <p className="tw-note">Créditos consolidados na carteira em reais.</p>
    </>);
    case 'pool': return (<>
      <div className="tw-pool">
        <div><small>Tokens participando</small><b>{bal}</b></div>
        <div><small>Status</small><b className="tw-ok">Participando</b></div>
      </div>
      <div className="tw-meter" role="img" aria-label={`${tokens(account.tokens)} de ${tokens(account.tokens)} tokens participam`}><i /></div>
      <p className="tw-meter__t">{tokens(account.tokens)} de {tokens(account.tokens)} tokens do seu saldo participam</p>
      <p className="tw-lead">A participação é automática. Não há etapa para ativar ou depositar.</p>
      <ul className="tw-list">
        <li>Sua parte é proporcional ao saldo elegível e ao tempo mantido no dia.</li>
        <li>Nos dias com lucro líquido realizado, 25% vai para a distribuição global entre todos os titulares.</li>
      </ul>
    </>);
  }
}

export function TokenWallet() {
  const [view, setView] = useState<View | null>(null);
  const back = useRef<HTMLButtonElement | null>(null);
  const btns = useRef<Record<string, HTMLButtonElement | null>>({});
  const last = useRef<View | null>(null);

  useEffect(() => {
    if (view) { last.current = view; back.current?.focus(); }
    else if (last.current) { btns.current[last.current]?.focus(); }
  }, [view]);

  if (view) {
    return (
      <div className="tw" data-testid="token-wallet-detail" onKeyDown={(e) => { if (e.key === 'Escape') setView(null); }}>
        <button ref={back} type="button" className="tw-back" onClick={() => setView(null)} data-testid="button-voltar-token">
          <span aria-hidden="true">←</span> Voltar
        </button>
        <h5 className="tw-title">{titles[view]}</h5>
        <Detail view={view} />
      </div>
    );
  }

  return (
    <div className="tw" data-testid="token-wallet">
      <h5 className="tw-title">Carteira BETTEX</h5>
      <div className="tw-hero">
        <small>Seu saldo</small>
        <strong>{tokens(account.tokens)}<span> BETTEX</span></strong>
        <button ref={(el) => { btns.current.pool = el; }} type="button" className="tw-hero__status" onClick={() => setView('pool')} data-testid="button-token-pool" aria-label={`Pool de staking: ${tokens(account.tokens)} BETTEX participando automaticamente. Ver detalhes.`}>
          <i aria-hidden="true" /><span>Pool de staking · automático</span><ChevronRight aria-hidden="true" />
        </button>
      </div>
      <div className="tw-actions" role="group" aria-label="Opções do saldo de tokens">
        {actions.map((a) => (
          <button key={a.id} ref={(el) => { btns.current[a.id] = el; }} type="button" className="tw-action" onClick={() => setView(a.id)} data-testid={`button-token-${a.id}`} aria-label={`${a.label} tokens BETTEX`}>
            {a.id === 'sacar' ? <ArrowUpRight aria-hidden="true" /> : <ArrowRightLeft aria-hidden="true" />}
            <b>{a.label}</b>
          </button>
        ))}
      </div>
      <button ref={(el) => { btns.current.lucro = el; }} type="button" className="tw-profit-card" onClick={() => setView('lucro')} data-testid="button-token-lucro" aria-label={`Histórico de lucro: ${money(account.profitCents)} creditados em reais. Ver créditos por data.`}>
        <span>Lucro em reais</span>
        <strong>{money(account.profitCents)}</strong>
        <em>01/10/2026 · Histórico</em>
        <ChevronRight aria-hidden="true" />
      </button>
      <div className="tw-foot"><span>Carteira em reais</span><b>{money(account.availableCents)}</b></div>
    </div>
  );
}
