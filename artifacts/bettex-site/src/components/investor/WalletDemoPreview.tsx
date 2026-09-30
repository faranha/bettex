import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, History, Wallet } from 'lucide-react';
import {
  initialWalletDemo,
  loadWalletDemo,
  requestTransfer,
  depositIntoPersonal,
  withdrawFromWallet,
  saveWalletDemo,
  TRANSFER_FEE_CENTS,
  type MovementKind,
} from './walletDemo';
import { formatMovementAmount, formatTokens, movements } from './walletMovements';
import { WalletMovementForm } from './WalletMovementForm';
import './WalletDemoPreview.css';

const dateAndTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
type ActiveMovementKind = 'deposit' | 'withdraw' | 'externalDeposit' | 'externalWithdraw';

export function WalletDemoPreview({ topbarActionsEl }: { topbarActionsEl: HTMLDivElement | null }) {
  const [loaded] = useState(loadWalletDemo);
  const [wallet, setWallet] = useState(loaded.state);
  const [storageWarning, setStorageWarning] = useState(loaded.warning);
  const [mode, setMode] = useState<ActiveMovementKind | null>(null);
  const [notice, setNotice] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      saveWalletDemo(wallet);
    } catch {
      setStorageWarning('O navegador não salvou a demonstração. Os saldos podem reiniciar ao atualizar a página.');
    }
  }, [wallet]);

  function toggleForm(kind: ActiveMovementKind) {
    setMode((current) => current === kind ? null : kind);
    setNotice('');
  }

  function confirmMovement(amountCents: number) {
    if (!mode) return;
    const requestedAt = Date.now();
    const updated = mode === 'externalDeposit'
      ? depositIntoPersonal(wallet, amountCents, requestedAt)
      : mode === 'externalWithdraw'
        ? withdrawFromWallet(wallet, mode, amountCents, requestedAt)
        : requestTransfer(wallet, mode, amountCents, requestedAt);
    setWallet(updated);
    setNotice(`${movements[mode].title}: ${formatMovementAmount(mode, amountCents)} concluído nesta demonstração. ${mode === 'externalDeposit' ? 'Sem taxa no exemplo.' : 'Taxa fictícia de 1 BETTEX nesta prévia; custo real ainda não definido.'} Nenhuma transferência real foi feita.`);
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
      case 'purchase': return 'Compra fictícia em BRL de uma versão anterior';
      case 'deposit': return 'Carteira pessoal → Carteira BETTEX';
      case 'withdraw': return 'Carteira BETTEX → carteira pessoal';
      case 'bettexReaisTransfer': return 'Movimentação fictícia em BRL de uma versão anterior';
      case 'externalDeposit': return 'Origem externa simulada → carteira pessoal';
      case 'externalWithdraw': return 'Carteira pessoal → saída externa simulada';
      case 'bettexExternalWithdraw': return 'Carteira BETTEX → saída externa simulada';
      case 'personalReaisWithdraw': return 'Movimentação fictícia em BRL de uma versão anterior';
      case 'bettexReaisWithdraw': return 'Movimentação fictícia em BRL de uma versão anterior';
    }
  }

  return (
    <>
      {topbarActionsEl && createPortal(
        <>
          <button
            type="button"
            className="investor-preview__topbar-action"
            aria-expanded={mode === 'externalDeposit'}
            aria-controls="investor-preview-transfer-form"
            onClick={() => toggleForm('externalDeposit')}
            data-testid="button-depositar-carteira-pessoal"
          >Depositar BETTEX</button>
          <button
            type="button"
            className="investor-preview__topbar-action investor-preview__topbar-action--secondary"
            aria-expanded={mode === 'externalWithdraw'}
            aria-controls="investor-preview-transfer-form"
            onClick={() => toggleForm('externalWithdraw')}
            data-testid="button-sacar-bettex-pessoal"
          >Retirar BETTEX</button>
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
              <span>USDC · saque planejado</span>
              <strong data-testid="status-usdc-pessoal">Indisponível nesta prévia</strong>
            </div>
          </div>
          <span className="investor-preview__wallet-caption">Não há saldo real em USDC ou reais nesta demonstração. A rede de saques ainda será definida.</span>
          <div className="investor-preview__wallet-actions">
            <button
              type="button"
              className="investor-preview__wallet-transfer"
              aria-expanded={mode === 'deposit'}
              aria-controls="investor-preview-transfer-form"
              onClick={() => toggleForm('deposit')}
              data-testid="button-transferir-bettex"
            >Transferir para Carteira BETTEX <ArrowRight aria-hidden="true" /></button>
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
              <span>Distribuições em USDC · proposta</span>
              <strong data-testid="status-usdc-bettex">Regras em definição</strong>
            </div>
          </div>
          <span className="investor-preview__wallet-caption">A elegibilidade de BETTEX depositados e a distribuição proporcional em USDC dependem das regras de staking e lucro líquido.</span>
          <div className="investor-preview__wallet-actions investor-preview__wallet-actions--bettex">
            <button
              type="button"
              className="investor-preview__wallet-withdraw"
              aria-expanded={mode === 'withdraw'}
              aria-controls="investor-preview-transfer-form"
              onClick={() => toggleForm('withdraw')}
              data-testid="button-sacar-bettex-bettex"
            >Retirar BETTEX</button>
          </div>
        </div>
      </div>

      <details className="investor-preview__fee-note">
        <summary>Taxas desta simulação ≠ taxas reais do projeto</summary>
        <p>A movimentação fictícia de BETTEX entre carteiras ou para fora desta prévia desconta 1 BETTEX de exemplo. O depósito externo simulado não tem taxa. As tarifas reais de depósito, retirada, gas e terceiros ainda não foram aprovadas.</p>
        <p>Não há compra, envio de USDC, saque em reais ou transação em blockchain nesta demonstração.</p>
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
               <small>{sourceAndDestination(transfer.kind)} · {movements[transfer.kind].currency} · {dateAndTime.format(transfer.requestedAt)} · {transfer.status === 'pending' ? `Pendente até ${dateAndTime.format(transfer.readyAt)}` : 'Concluído na simulação'}{transfer.kind === 'externalDeposit' || transfer.kind === 'purchase' ? ' · Sem taxa fictícia' : ` · Taxa fictícia: ${formatTokens(transfer.feeCents ?? TRANSFER_FEE_CENTS)}`}</small>
            </span>
            <strong>{formatMovementAmount(transfer.kind, transfer.amountCents)}</strong>
          </div>
        ))}
         <p>Histórico local e fictício, inclusive registros de versões antigas em BRL. Nenhuma operação real foi feita e BRL não é moeda de saque.</p>
      </div>
    </>
  );
}