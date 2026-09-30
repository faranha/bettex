import { DISTRIBUTABLE_CENTS, DISTRIBUTION_NET_RESULT_CENTS, illustrativeParticipation, MAX_DISTRIBUTION_PERIODS, type WalletDemoState } from './walletDemo';
import { formatTokens, formatUsdc, formatUsdcInReais, tokens } from './walletMovements';

export function DistributionSummary({ wallet, onSimulate, notice }: {
  wallet: WalletDemoState;
  onSimulate: () => void;
  notice: string;
}) {
  const participation = illustrativeParticipation(wallet);
  const distributions = wallet.transfers.filter((entry) => entry.kind === 'distribution');
  const last = distributions[0]?.amountCents ?? 0;
  const assigned = wallet.totalUsdcDistributedCents;
  const withdrawn = wallet.totalUsdcWithdrawnCents;
  const available = wallet.personalUsdcCents + wallet.allocatedUsdcCents;
  const eligible = participation.personalActiveTokens >= 1;

  return (
    <section className="investor-preview__distribution" aria-labelledby="investor-distribution-title" data-testid="panel-sua-distribuicao">
      <div className="investor-preview__distribution-head">
        <div>
          <p className="investor-preview__micro">Seu saldo, não o gráfico dos agentes</p>
          <h4 id="investor-distribution-title">Sua distribuição</h4>
          <p>O desempenho do projeto não é pago automaticamente a você. Só BETTEX em staking participam do fechamento mensal.</p>
        </div>
        <span className="investor-preview__distribution-status" data-eligible={eligible} data-testid="status-elegibilidade-staking">
          {eligible ? 'Elegível agora' : 'Sem BETTEX elegíveis'}
        </span>
      </div>
      <div className="investor-preview__distribution-grid">
        <div><span>BETTEX alocados em staking</span><strong data-testid="text-staking-usuario">{formatTokens(wallet.allocatedTokensCents)}</strong></div>
        <div><span>Participação no total elegível</span><strong>{eligible ? participation.percentage.toLocaleString('pt-BR', { maximumFractionDigits: 3 }) : '0'}%</strong><small>Você: {tokens.format(participation.personalActiveTokens)} ÷ total: {tokens.format(participation.totalActiveTokens)} BETTEX</small></div>
        <div><span>Referência para um mês inteiro futuro</span><strong data-testid="text-proxima-distribuicao">{formatUsdc(participation.nextDistributionCents)}</strong><small>≈ {formatUsdcInReais(participation.nextDistributionCents)} · se o saldo atual permanecer constante; ainda não atribuído</small></div>
        <div className="investor-preview__distribution-highlight"><span>Atribuído no último fechamento</span><strong data-testid="text-ultima-distribuicao">{formatUsdc(last)}</strong><small>≈ {formatUsdcInReais(last)} · já incluído nos saldos</small></div>
      </div>
      <div className="investor-preview__distribution-reconcile">
        <span>Atribuído no histórico: <strong>{formatUsdc(assigned)}</strong></span>
        <span>Disponível nas duas carteiras: <strong>{formatUsdc(available)}</strong></span>
        <span>Já retirado na simulação: <strong>{formatUsdc(withdrawn)}</strong></span>
      </div>
      <div className="investor-preview__distribution-foot">
        <p>Exemplo de apuração: resultado líquido realizado de {formatUsdc(DISTRIBUTION_NET_RESULT_CENTS)}; metade ({formatUsdc(DISTRIBUTABLE_CENTS)}) é dividida pelo tempo em que cada pessoa manteve BETTEX elegíveis durante o mês UTC. Sem tokens elegíveis em todo o mês, o <strong>crédito do período é zero</strong>, mesmo com lucro dos agentes. Retirar BETTEX encerra a elegibilidade futura, mas preserva a participação dos dias anteriores. Os filtros do gráfico não alteram estes valores.</p>
        <button type="button" onClick={onSimulate} disabled={wallet.distributionPeriods >= MAX_DISTRIBUTION_PERIODS}
          data-testid="button-simular-fechamento">Simular próximo fechamento mensal</button>
      </div>
      <small>Períodos simulados: {wallet.distributionPeriods}/{MAX_DISTRIBUTION_PERIODS}. O valor de referência supõe um mês futuro completo com o saldo atual; o fechamento usa o tempo de elegibilidade registrado ao longo do mês ilustrativo, por isso pode ser diferente. Sem lucro líquido realizado após perdas anteriores, a distribuição é zero. O cenário positivo fixo desta prévia não é uma previsão.</small>
      {notice && <p className="investor-preview__distribution-notice" role="status">{notice}</p>}
    </section>
  );
}