/** @jsxImportSource react */
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  getDemoDouble2x, useGetDemoDouble2x, usePlayDemoDouble2x, getGetDemoDouble2xQueryKey, getGetDemoDashboardQueryKey,
  getGetDemoHistoryQueryKey, getGetDemoTreasuryWalletsQueryKey, getGetDemoTreasuryStatementQueryKey, getGetDemoTreasuryActivityQueryKey,
  type Double2xPlay,
} from '@workspace/api-client-react';
import { useX, } from './ui';
import { Money } from './fin';
import { readDouble2xWithDeadline } from './double2x-query';

type Color = 'red' | 'black';
const TX = 'https://sepolia.arbiscan.io/tx/';
const short = (h: string) => `${h.slice(0, 8)}...${h.slice(-6)}`;

function useCountdown(iso: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!iso) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [iso]);
  if (!iso) return null;
  const s = Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 1000));
  if (s <= 0) return null;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export function Double2xDialog({ open, onOpenChange, balanceUsdc = 0 }: { open: boolean; onOpenChange: (o: boolean) => void; balanceUsdc?: number }) {
  const { x, loc } = useX();
  const qc = useQueryClient();
  const q = useGetDemoDouble2x({ query: {
    queryKey: getGetDemoDouble2xQueryKey(), enabled: open, retry: false,
    queryFn: ({ signal }) => readDouble2xWithDeadline(s => getDemoDouble2x({ signal: s }), signal),
    refetchInterval: open ? 3000 : false,
  } });
  const play = usePlayDemoDouble2x();
  const [color, setColor] = useState<Color | null>(null);
  const [ack, setAck] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const attempt = useRef<{ id: string; color: Color; stake: number } | null>(null);
  const d = q.data;
  const cd = useCountdown(d?.nextPlayAt);
  const prevPending = useRef(false);

  const refreshWallet = () => {
    for (const k of [getGetDemoDashboardQueryKey(), getGetDemoHistoryQueryKey(), getGetDemoTreasuryWalletsQueryKey(), getGetDemoTreasuryStatementQueryKey(), getGetDemoTreasuryActivityQueryKey()]) void qc.invalidateQueries({ queryKey: k });
  };
  useEffect(() => { if (prevPending.current && d && !d.pending) refreshWallet(); prevPending.current = !!d?.pending; /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [d?.pending]);

  const reasons: Record<string, string> = {
    deploying: x('O contrato de teste ainda está sendo preparado. Tente novamente em instantes.', 'The test contract is still being prepared. Try again shortly.', 'El contrato de prueba aún se está preparando. Inténtalo de nuevo en unos instantes.'),
    test_gas_unavailable: x('O gás de teste patrocinado está indisponível agora.', 'Sponsored test gas is unavailable right now.', 'El gas de prueba patrocinado no está disponible ahora.'),
    treasury_unavailable: x('A tesouraria de teste não pode cobrir a jogada agora.', 'The test treasury cannot cover a play right now.', 'La tesorería de prueba no puede cubrir la jugada ahora.'),
    testnet_unavailable: x('A rede de teste Arbitrum Sepolia está indisponível.', 'The Arbitrum Sepolia test network is unavailable.', 'La red de prueba Arbitrum Sepolia no está disponible.'),
    native_account_unavailable: x('Este jogo usa os rendimentos simulados do ALFA. Não movimenta saldos das carteiras nativas.', 'This game uses simulated ALFA earnings. Native wallet balances are not moved.', 'Este juego usa ganancias simuladas de ALFA. No mueve saldos de carteras nativas.'),
  };
  const generic = x('Não foi possível concluir agora. Se você tentar de novo, a mesma jogada será reaproveitada, sem duplicar.', 'Could not complete right now. If you retry, the same play is reused, without duplicating.', 'No se pudo completar ahora. Si reintentas, se reutiliza la misma jugada, sin duplicar.');
  const errText = (e: unknown) => {
    const o = e as { status?: number; data?: { error?: string; code?: string; reason?: string } } | null;
    const c = (o?.data?.reason ?? o?.data?.code ?? o?.data?.error ?? '').replace(/^double2x_/, '');
    if (reasons[c]) return reasons[c];
    if (c === 'balance_changed') return x('Seu saldo mudou. Confira o novo valor e confirme novamente.', 'Your balance changed. Review the new amount and confirm again.', 'Tu saldo cambió. Revisa el nuevo importe y confirma de nuevo.');
    if (/cooldown|daily_limit/i.test(c)) return x('Aguarde o fim do intervalo de 24 horas.', 'Wait for the 24-hour cooldown to end.', 'Espera a que termine el intervalo de 24 horas.');
    if (o?.status === 429) return x('Muitas solicitações. Aguarde alguns instantes antes de tentar novamente.', 'Too many requests. Wait a moment before retrying.', 'Demasiadas solicitudes. Espera un momento antes de reintentar.');
    if (/balance|insufficient|no_earnings/i.test(c)) return x('Sem saldo recebido disponível.', 'No received balance available.', 'Sin saldo recibido disponible.');
    return generic;
  };

  const locked = !!attempt.current;
  const chosen = attempt.current?.color ?? color;
  const stake = d?.balanceUsdc ?? balanceUsdc;
  const blocked = !d || q.isError || !d.canPlay || d.pending || play.isPending || stake <= 0;
  const submit = () => {
    if (!chosen || !ack || blocked) return;
    if (!attempt.current) attempt.current = { id: crypto.randomUUID(), color: chosen, stake };
    setErr(null);
    play.mutate({ data: { requestId: attempt.current.id, color: attempt.current.color, confirmed: true, expectedStakeUsdc: attempt.current.stake } }, {
      onSuccess: snapshot => {
        qc.setQueryData(getGetDemoDouble2xQueryKey(), snapshot);
        attempt.current = null; setAck(false); setColor(null); void q.refetch(); refreshWallet();
      },
      onError: (e) => {
        const st = (e as { status?: number }).status;
        if (st && st >= 400 && st < 500 && st !== 408 && st !== 429) { attempt.current = null; setAck(false); }
        setErr(errText(e)); void q.refetch();
      },
    });
  };

  const stLabel = (p: Double2xPlay) => p.status === 'won' ? x('Ganhou', 'Won', 'Ganó') : p.status === 'lost' ? x('Perdeu', 'Lost', 'Perdió') : p.status === 'refunded' ? x('Devolvida', 'Refunded', 'Devuelta') : x('Pendente na rede', 'Pending on chain', 'Pendiente en la red');
  const cl = (c?: string) => c === 'red' ? x('Vermelho', 'Red', 'Rojo') : c === 'black' ? x('Preto', 'Black', 'Negro') : '-';
  const dot = (c?: string) => <span className={`inline-block h-3 w-3 rounded-full border border-[#1B2A41]/30 ${c === 'red' ? 'bg-[#C63D3D]' : c === 'black' ? 'bg-[#1B2A41]' : 'bg-transparent'}`} aria-hidden="true" />;
  const fmt = (s: string) => new Date(s).toLocaleString(loc === 'pt' ? 'pt-BR' : loc === 'es' ? 'es-ES' : 'en-US');

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] w-[calc(100vw_-_1.5rem)] max-w-lg overflow-y-auto rounded-2xl bg-[#FFFCF6] p-4 text-[#1B2A41] shadow-xl" data-testid="double2x-dialog">
      <DialogTitle className="display text-base font-extrabold">{x('Double 2X', 'Double 2X', 'Double 2X')}</DialogTitle>
      <DialogDescription className="text-xs text-[#3F4F68]">{x('Cara ou coroa de cores, 50/50, em teste. Arbitrum Sepolia com tUSDC isolado em escrow que espelha rendimentos simulados do ALFA. Não é protocolo nativo nem USDC real.', 'Colour coin-flip, 50/50, in test mode. Arbitrum Sepolia with isolated tUSDC escrow mirroring simulated ALFA earnings. Not the native protocol and not real USDC.', 'Cara o cruz de colores, 50/50, en prueba. Arbitrum Sepolia con tUSDC aislado en escrow que replica ganancias simuladas de ALFA. No es protocolo nativo ni USDC real.')}</DialogDescription>
      <ul className="grid gap-1 text-[11px] text-[#3F4F68]">
        <li>{x('RTP de 100%: 50% de chance, sem taxa de jogo. A tesouraria paga os ganhos e recebe as perdas.', '100% RTP: 50% chance, no game fee. The treasury pays wins and receives losses.', 'RTP del 100%: 50% de probabilidad, sin comisión de juego. La tesorería paga las ganancias y recibe las pérdidas.')}</li>
        <li>{x('A plataforma patrocina o gás de teste em ETH. Uma jogada a cada 24 horas.', 'The platform sponsors test ETH gas. One play per rolling 24 hours.', 'La plataforma patrocina el gas de prueba en ETH. Una jugada cada 24 horas.')}</li>
        <li>{x('O resultado só aparece após a liquidação na rede; nada é exibido antes disso.', 'The result appears only after on-chain settlement; nothing is shown before.', 'El resultado aparece solo tras la liquidación en la red; nada se muestra antes.')}</li>
      </ul>

      {!d && !q.isError && <p role="status" className="text-xs text-[#3F4F68]" data-testid="double2x-loading">{x('Verificando a disponibilidade do jogo na rede...', 'Checking game availability on the network...', 'Comprobando la disponibilidad del juego en la red...')}</p>}
      {q.isError && <div role="alert" className="rounded-lg bg-[#FBE9E7] p-3 text-xs font-semibold text-[#8A2A1C]">{x('Não foi possível carregar o estado do jogo. Tente novamente.', 'Could not load the game status. Try again.', 'No se pudo cargar el estado del juego. Inténtalo de nuevo.')} <button type="button" className="underline" onClick={() => void q.refetch()} data-testid="button-double2x-retry">{x('Tentar de novo', 'Try again', 'Reintentar')}</button></div>}

      <section className="grid gap-3 rounded-xl border border-[#0E7C6B]/30 bg-[#F4FAF6] p-3" aria-label={x('Jogar', 'Play', 'Jugar')}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-[#0A6657]">{x('Aposta: todo o saldo recebido', 'Stake: entire received balance', 'Apuesta: todo el saldo recibido')}</span>
          <span data-testid="double2x-stake"><Money v={stake} a="USDC" /></span>
        </div>
        <div className="text-xs font-semibold">{x('Pagamento bruto possível', 'Possible gross payout', 'Pago bruto posible')}: <span data-testid="double2x-payout"><Money v={stake * 2} a="USDC" /></span></div>
        {d?.pending && <p role="status" className="rounded-lg bg-[#FBF6EA] p-2 text-xs font-semibold text-[#8A5A12]" data-testid="double2x-pending">{x('Jogada pendente na rede. Aguardando liquidação; o saldo fica reservado.', 'Play pending on chain. Awaiting settlement; the balance stays reserved.', 'Jugada pendiente en la red. Esperando liquidación; el saldo queda reservado.')}</p>}
        {d && !d.pending && d.reason !== 'ready' && <p role="status" className="rounded-lg bg-[#FBF6EA] p-2 text-xs font-semibold text-[#8A5A12]" data-testid="double2x-reason">{reasons[d.reason]}</p>}
        {cd && <p role="timer" className="text-xs font-semibold text-[#3F4F68]" data-testid="double2x-cooldown">{x('Próxima jogada em', 'Next play in', 'Próxima jugada en')} <span className="mono">{cd}</span></p>}
        <fieldset disabled={locked || !!d?.pending} className="grid grid-cols-2 gap-2">
          <legend className="mb-1 text-xs font-bold">{x('Escolha uma cor', 'Choose a colour', 'Elige un color')}</legend>
          {(['red', 'black'] as Color[]).map(c => <label key={c} className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 text-sm font-extrabold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#0E7C6B] ${chosen === c ? 'border-[#0E7C6B] bg-white' : 'border-[#1B2A41]/15 bg-white/60'}`}>
            <input type="radio" name="d2x-color" className="sr-only" checked={chosen === c} onChange={() => setColor(c)} data-testid={`radio-double2x-${c}`} />{dot(c)}{cl(c)}</label>)}
        </fieldset>
        <label className="flex items-start gap-2 text-xs font-semibold">
          <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#0E7C6B]" checked={ack} onChange={e => setAck(e.target.checked)} data-testid="checkbox-double2x-confirm" />
          <span>{x('Confirmo que jogo TODO o saldo recebido disponível e que posso perdê-lo por completo.', 'I confirm I am playing my ENTIRE available received balance and may lose all of it.', 'Confirmo que juego TODO el saldo recibido disponible y que puedo perderlo por completo.')}</span>
        </label>
        {err && <p role="alert" className="text-xs font-semibold text-[#8A2A1C]" data-testid="double2x-error">{err}</p>}
        <button type="button" onClick={submit} disabled={blocked || !chosen || !ack} data-testid="button-double2x-play"
          className="min-h-11 rounded-full bg-[#0E7C6B] px-4 text-sm font-extrabold text-white transition-colors hover:bg-[#0A6657] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E7C6B]">
          {play.isPending ? x('Enviando...', 'Sending...', 'Enviando...') : locked ? x('Reenviar a mesma jogada', 'Resend the same play', 'Reenviar la misma jugada') : x('Jogar tudo', 'Play all', 'Jugar todo')}
        </button>
      </section>

      <section aria-label={x('Histórico do Double 2X', 'Double 2X history', 'Historial de Double 2X')} data-testid="double2x-history">
        <h4 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#0A6657]">{x('Histórico', 'History', 'Historial')}</h4>
        {d && d.plays.length === 0 && <p className="rounded-lg border border-dashed border-[#1B2A41]/25 p-3 text-xs text-[#3F4F68]">{x('Nenhuma jogada ainda.', 'No plays yet.', 'Aún no hay jugadas.')}</p>}
        {!d && !q.isLoading && <p className="text-xs text-[#3F4F68]">{x('Histórico indisponível agora.', 'History unavailable right now.', 'Historial no disponible ahora.')}</p>}
        <ul className="grid gap-2">
          {d?.plays.map(p => <li key={p.id} className="grid gap-1 rounded-lg border border-[#1B2A41]/15 bg-white p-2 text-xs" data-testid={`double2x-play-${p.id}`}>
            <div className="flex flex-wrap items-center justify-between gap-1"><b>{stLabel(p)}</b><time dateTime={p.requestedAt} className="text-[#3F4F68]">{fmt(p.requestedAt)}</time></div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1">{x('Escolha', 'Chosen', 'Elegido')}: {dot(p.color)}{cl(p.color)}</span>
              <span className="inline-flex items-center gap-1">{x('Resultado', 'Result', 'Resultado')}: {dot(p.result)}{cl(p.result)}</span>
            </div>
            <div className="flex flex-wrap gap-x-3">
              <span>{x('Aposta', 'Stake', 'Apuesta')}: <Money v={p.stakeUsdc} a="USDC" /></span>
              <span>{x('Pagamento', 'Payout', 'Pago')}: <Money v={p.payoutUsdc} a="USDC" /></span>
            </div>
            <div className="flex flex-wrap gap-x-3">
              {p.requestHash && <a className="mono underline" href={TX + p.requestHash} target="_blank" rel="noopener noreferrer">{x('Pedido', 'Request', 'Pedido')} {short(p.requestHash)}</a>}
              {p.settlementHash && <a className="mono underline" href={TX + p.settlementHash} target="_blank" rel="noopener noreferrer">{x('Liquidação', 'Settlement', 'Liquidación')} {short(p.settlementHash)}</a>}
            </div>
          </li>)}
        </ul>
      </section>
    </DialogContent>
  </Dialog>;
}
