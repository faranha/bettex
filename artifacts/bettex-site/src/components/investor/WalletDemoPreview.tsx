import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, History, Wallet } from 'lucide-react';
import {
  initialWalletDemo,
  loadWalletDemo,
  requestTransfer,
  depositIntoPersonal,
  buyTokens,
  withdrawFromWallet,
  saveWalletDemo,
  TRANSFER_FEE_CENTS,
  type MovementKind,
} from './walletDemo';
import { formatMovementAmount, formatTokens, movements, reais } from './walletMovements';
import { WalletMovementForm } from './WalletMovementForm';
import './WalletDemoPreview.css';

const dateAndTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export function WalletDemoPreview({ topbarActionsEl }: { topbarActionsEl: HTMLDivElement | null }) {
  const [loaded] = useState(loadWalletDemo);
  const [wallet, setWallet] = useState(loaded.state);
  const [storageWarning, setStorageWarning] = useState(loaded.warning);
  const [mode, setMode] = useState<MovementKind | null>(null);
  const [notice, setNotice] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      saveWalletDemo(wallet);
    } catch {
      setStorageWarning('O navegador não salvou a demonstração. Os saldos podem reiniciar ao atualizar a página.');
    }
  }, [wallet]);

  function toggleForm(kind: MovementKind) {
    setMode((current) => current === kind ? null : kind);
    setNotice('');
  }

  function confirmMovement(amountCents: number) {
    if (!mode) return;
    const requestedAt = Date.now();
    const updated = mode === 'externalDeposit'
      ? depositIntoPersonal(wallet, amountCents, requestedAt)
      : mode === 'purchase'
        ? buyTokens(wallet, amountCents, requestedAt)
      : mode === 'deposit' || mode === 'withdraw'
        ? requestTransfer(wallet, mode, amountCents, requestedAt)
        : withdrawFromWallet(wallet, mode, amountCents, requestedAt);
    setWallet(updated);
    setNotice(mode === 'purchase'
      ? `Compra simulada: ${formatTokens(amountCents)} creditados na carteira pessoal; ${reais.format((updated.transfers[0].costCents ?? 0) / 100)} descontados apenas do saldo fictício em reais. Nenhum pagamento real foi feito.`
      : `${movements[mode].title}: ${formatMovementAmount(mode, amountCents)} concluído imediatamente. ${mode === 'externalDeposit' ? 'Depósito sem taxa; nenhum depósito real foi feito.' : 'Taxa de 1 BETTEX debitada da carteira de origem. Nenhum pagamento ou transferência real foi feito.'}`);
    setMode(null);
  }

  function resetDemo() {
    if (!window.confirm('Reiniciar os saldos e apagar as movimentações desta demonstração neste navegador?')) return;
    setWallet(initialWalletDemo());
    setMode(null);
    setNotice('Demonstração reiniciada com saldos de exemplo.');
    setStorageWarning(null);
  }

  function sourceAndDestination(kind: MovementKind) {
    switch (kind) {
      case 'purchase': return 'Saldo fictício em R$ da carteira pessoal → BETTEX na carteira pessoal';
      case 'deposit': return 'Carteira pessoal → Carteira BETTEX';
      case 'withdraw': return 'Carteira BETTEX → carteira pessoal';
      case 'externalDeposit': return 'Origem externa simulada → carteira pessoal';
      case 'externalWithdraw': return 'Carteira pessoal → saída externa simulada';
      case 'bettexExternalWithdraw': return 'Carteira BETTEX → saída externa simulada';
      case 'personalReaisWithdraw': return 'Carteira pessoal → saque em reais simulado';
      case 'bettexReaisWithdraw': return 'Carteira BETTEX → saque em reais simulado';
    }
  }

  return (
    <>
      {topbarActionsEl && createPortal(
        <>
          <button
            type="button"
            className="investor-preview__topbar-action"
            aria-expanded={mode === 'purchase'}
            aria-controls="investor-preview-transfer-form"
            onClick={() => toggleForm('purchase')}
            data-testid="button-comprar-bettex"
          >Comprar BETTEX <ArrowRight aria-hidden="true" /></button>
          <button
            type="button"
            className="investor-preview__topbar-action investor-preview__topbar-action--secondary"
            aria-expanded={mode === 'externalDeposit'}
            aria-controls="investor-preview-transfer-form"
            onClick={() => toggleForm('externalDeposit')}
            data-testid="button-depositar-carteira-pessoal"
          >Depositar BETTEX</button>
        </>,
        topbarActionsEl,
      )}
      <div className="investor-preview__wallet-flow" aria-label="Carteira pessoal e Carteira BETTEX">
        <div className="investor-preview__wallet">
          <div className="investor-preview__wallet-label"><Wallet aria-hidden="true" />Sua carteira pessoal</div>
          <div className="investor-preview__wallet-balances">
            <div className="investor-preview__wallet-balance">
              <span>Saldo em BETTEX · disponível</span>
              <strong className="investor-preview__wallet-value" data-testid="text-saldo-carteira-pessoal">{formatTokens(wallet.personalTokensCents)}</strong>
            </div>
            <div className="investor-preview__wallet-balance investor-preview__wallet-balance--reais">
              <span>Saldo em reais (R$) · exemplo</span>
              <strong data-testid="text-saldo-reais-pessoal">{reais.format(wallet.personalReaisCents / 100)}</strong>
            </div>
          </div>
          <span className="investor-preview__wallet-caption">Os saldos em R$ e BETTEX são separados.</span>
          <div className="investor-preview__wallet-actions">
            <button
              type="button"
              className="investor-preview__wallet-transfer"
              aria-expanded={mode === 'deposit'}
              aria-controls="investor-preview-transfer-form"
              onClick={() => toggleForm('deposit')}
              data-testid="button-transferir-bettex"
            >Transferir para Carteira BETTEX <ArrowRight aria-hidden="true" /></button>
            <button
              type="button"
              className="investor-preview__wallet-withdraw investor-preview__wallet-action-secondary"
              aria-expanded={mode === 'externalWithdraw'}
              aria-controls="investor-preview-transfer-form"
              onClick={() => toggleForm('externalWithdraw')}
              data-testid="button-sacar-bettex-pessoal"
            >Sacar BETTEX</button>
            <button
              type="button"
              className="investor-preview__wallet-withdraw investor-preview__wallet-action-secondary"
              aria-expanded={mode === 'personalReaisWithdraw'}
              aria-controls="investor-preview-transfer-form"
              onClick={() => toggleForm('personalReaisWithdraw')}
              data-testid="button-sacar-reais-pessoal"
            >Sacar reais</button>
          </div>
          <span className="investor-preview__wallet-buy-note">Movimentações apenas simuladas; nenhum ativo real é movimentado.</span>
        </div>

        <div className="investor-preview__wallet investor-preview__wallet--bettex">
          <div className="investor-preview__wallet-heading">
            <div className="investor-preview__wallet-label"><Wallet aria-hidden="true" />Carteira BETTEX</div>
            <button
              type="button"
              className="investor-preview__wallet-history-button"
              title="Histórico das carteiras"
              aria-label={showHistory ? 'Ocultar histórico das carteiras' : 'Ver histórico das carteiras'}
              aria-expanded={showHistory}
              aria-controls="investor-preview-wallet-history"
              onClick={() => setShowHistory((value) => !value)}
            ><History aria-hidden="true" /></button>
          </div>
          <div className="investor-preview__wallet-balances">
            <div className="investor-preview__wallet-balance">
              <span>Saldo alocado em BETTEX · disponível</span>
              <strong className="investor-preview__wallet-value" data-testid="text-saldo-carteira-bettex">{formatTokens(wallet.allocatedTokensCents)}</strong>
            </div>
            <div className="investor-preview__wallet-balance investor-preview__wallet-balance--reais">
              <span>Saldo em reais (R$) · exemplo</span>
              <strong data-testid="text-saldo-reais-bettex">{reais.format(wallet.allocatedReaisCents / 100)}</strong>
            </div>
          </div>
          <span className="investor-preview__wallet-caption">BETTEX alocados participam do cálculo proporcional.</span>
          <div className="investor-preview__wallet-actions investor-preview__wallet-actions--bettex">
            <button
              type="button"
              className="investor-preview__wallet-transfer"
              aria-expanded={mode === 'withdraw'}
              aria-controls="investor-preview-transfer-form"
              onClick={() => toggleForm('withdraw')}
              data-testid="button-transferir-para-pessoal"
            >Transferir para carteira pessoal <ArrowRight aria-hidden="true" /></button>
            <button
              type="button"
              className="investor-preview__wallet-withdraw"
              aria-expanded={mode === 'bettexExternalWithdraw'}
              aria-controls="investor-preview-transfer-form"
              onClick={() => toggleForm('bettexExternalWithdraw')}
              data-testid="button-sacar-bettex-bettex"
            >Sacar BETTEX</button>
            <button
              type="button"
              className="investor-preview__wallet-withdraw"
              aria-expanded={mode === 'bettexReaisWithdraw'}
              aria-controls="investor-preview-transfer-form"
              onClick={() => toggleForm('bettexReaisWithdraw')}
              data-testid="button-sacar-reais-bettex"
            >Sacar reais</button>
          </div>
        </div>
      </div>

      <details className="investor-preview__fee-note">
        <summary>Taxa por transferência ou saque: 1 BETTEX</summary>
        <p>A taxa é debitada do saldo BETTEX da carteira de origem em transferências entre carteiras, saques externos de BETTEX e saques em reais. Em transferências e saques de BETTEX, ela é cobrada além do valor enviado.</p>
        <p>A compra com reais fictícios da carteira pessoal e o depósito externo simulado são imediatos e não têm taxa. Não há transferências nem pagamentos reais.</p>
      </details>

      {mode && (
        <WalletMovementForm
          key={mode}
          mode={mode}
          wallet={wallet}
          onConfirm={confirmMovement}
          onClose={() => setMode(null)}
        />
      )}

      {(wallet.transfers.length > 0 || notice || storageWarning) && (
        <div className="investor-preview__demo-status" aria-live="polite" data-testid="status-movimentacoes-bettex">
          <div className="investor-preview__demo-status-head">
            <strong>Movimentações da demonstração</strong>
            {wallet.transfers.length > 0 && <button type="button" onClick={resetDemo}>Reiniciar exemplo</button>}
          </div>
          {notice && <p>{notice}</p>}
          {storageWarning && <p className="investor-preview__transfer-error">{storageWarning}</p>}
          <small>Histórico e saldos ficam salvos apenas neste navegador.</small>
        </div>
      )}

      <div id="investor-preview-wallet-history" className="investor-preview__wallet-history" hidden={!showHistory} role="region" aria-label="Histórico simulado das carteiras">
        <div className="investor-preview__wallet-history-head"><strong>Histórico das carteiras</strong><span>Somente nesta demonstração</span></div>
        {wallet.transfers.length === 0 ? (
          <p>Nenhuma movimentação foi simulada ainda. Os saldos iniciais são exemplos.</p>
        ) : wallet.transfers.map((transfer) => (
          <div className="investor-preview__wallet-history-row" key={transfer.id}>
            <span>
              {movements[transfer.kind].title}
              <small>{sourceAndDestination(transfer.kind)} · {movements[transfer.kind].currency} · {dateAndTime.format(transfer.requestedAt)} · {transfer.status === 'pending' ? `Pendente até ${dateAndTime.format(transfer.readyAt)}` : 'Concluído'}{transfer.kind === 'externalDeposit' || transfer.kind === 'purchase' ? ' · Sem taxa' : ` · Taxa: ${formatTokens(transfer.feeCents ?? TRANSFER_FEE_CENTS)}`}{transfer.kind === 'purchase' && transfer.costCents !== undefined ? ` · Valor fictício: ${reais.format(transfer.costCents / 100)}` : ''}</small>
            </span>
            <strong>{formatMovementAmount(transfer.kind, transfer.amountCents)}</strong>
          </div>
        ))}
        <p>Histórico local e fictício. Nenhuma operação real foi feita.</p>
      </div>
    </>
  );
}