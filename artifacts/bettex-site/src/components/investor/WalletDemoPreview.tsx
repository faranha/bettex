import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, History, Wallet } from 'lucide-react';
import {
  initialWalletDemo,
  requestTransfer,
  depositIntoPersonal,
  withdrawFromWallet,
  transferProfit,
  withdrawProfit,
  type MovementKind,
  type WalletDemoState,
} from './walletDemo';
import { formatMovementAmount, formatTokens, formatUsdc, formatUsdcInReais, movements, reais } from './walletMovements';
import { WalletMovementForm } from './WalletMovementForm';
import './WalletDemoPreview.css';

const dateAndTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
type ActiveMovementKind = 'deposit' | 'withdraw' | 'externalDeposit' | 'externalWithdraw' | 'profitTransfer' | 'profitWithdraw';

export function WalletDemoPreview({ topbarActionsEl, wallet, onWalletChange, storageWarning, onStorageWarning }: {
  topbarActionsEl: HTMLDivElement | null;
  wallet: WalletDemoState;
  onWalletChange: (state: WalletDemoState) => void;
  storageWarning: string | null;
  onStorageWarning: (warning: string | null) => void;
}) {
  const [mode, setMode] = useState<ActiveMovementKind | null>(null);
  const [notice, setNotice] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  function toggleForm(kind: ActiveMovementKind) {
    setMode((current) => current === kind ? null : kind);
    setNotice('');
  }

  function confirmMovement(amountCents: number, address?: string) {
    if (!mode) return;
    const requestedAt = Date.now();
    const updated = mode === 'externalDeposit' ? depositIntoPersonal(wallet, amountCents, requestedAt)
      : mode === 'externalWithdraw' ? withdrawFromWallet(wallet, mode, amountCents, requestedAt)
      : mode === 'profitTransfer' ? transferProfit(wallet, amountCents, requestedAt)
      : mode === 'profitWithdraw' ? withdrawProfit(wallet, amountCents, requestedAt, address ?? '')
      : requestTransfer(wallet, mode, amountCents, requestedAt);
    onWalletChange(updated);
    setNotice(`${movements[mode].title}: ${formatMovementAmount(mode, amountCents)}. Concluído somente nesta simulação; nenhuma transferência real foi feita.`);
    setMode(null);
  }

  function resetDemo() {
    if (!window.confirm('Reiniciar os saldos e apagar as movimentações desta demonstração neste navegador? Os registros antigos em reais continuam guardados separadamente.')) return;
    onWalletChange(initialWalletDemo());
    setMode(null);
    setNotice('Demonstração reiniciada com saldos de exemplo.');
    onStorageWarning(null);
  }

  function sourceAndDestination(kind: MovementKind) {
    switch (kind) {
      case 'purchase': return 'Compra fictícia de uma versão anterior';
      case 'deposit': return 'Carteira pessoal → staking na Carteira BETTEX';
      case 'withdraw': return 'Staking → carteira pessoal';
      case 'distribution': return 'Distribuição do período → Carteira BETTEX';
      case 'profitTransfer': return 'Lucro: Carteira BETTEX → carteira pessoal';
      case 'profitWithdraw': return 'Lucro: carteira pessoal → carteira blockchain na Arbitrum One';
      case 'externalDeposit': return 'Origem fictícia → carteira pessoal';
      case 'externalWithdraw': return 'Carteira pessoal → saída fictícia de BETTEX';
      case 'bettexExternalWithdraw': return 'Carteira BETTEX → saída antiga de BETTEX';
      default: return 'Movimentação antiga em BRL, sem conversão para USDC';
    }
  }

  return (
    <>
      {topbarActionsEl && createPortal(
        <>
          <button type="button" className="investor-preview__topbar-action" aria-expanded={mode === 'externalDeposit'}
            aria-controls="investor-preview-transfer-form" onClick={() => toggleForm('externalDeposit')} data-testid="button-depositar-carteira-pessoal">Adicionar BETTEX</button>
          <button type="button" className="investor-preview__topbar-action investor-preview__topbar-action--secondary"
            aria-expanded={mode === 'externalWithdraw'} aria-controls="investor-preview-transfer-form"
            onClick={() => toggleForm('externalWithdraw')} data-testid="button-sacar-bettex-pessoal">Retirar BETTEX</button>
        </>,
        topbarActionsEl,
      )}
      <div className="investor-preview__wallet-flow" aria-label="Carteira pessoal e Carteira BETTEX">
        <div className="investor-preview__wallet">
          <div className="investor-preview__wallet-label"><Wallet aria-hidden="true" />Sua carteira pessoal</div>
          <div className="investor-preview__wallet-balances">
            <div className="investor-preview__wallet-balance">
              <span>BETTEX · fora do staking</span>
              <strong className="investor-preview__wallet-value" data-testid="text-saldo-carteira-pessoal">{formatTokens(wallet.personalTokensCents)}</strong>
            </div>
            <div className="investor-preview__wallet-balance investor-preview__wallet-balance--reais">
              <span>Lucro em USDC · disponível para saque simulado</span>
              <strong data-testid="status-usdc-pessoal">{formatUsdc(wallet.personalUsdcCents)}</strong>
              <small>≈ {formatUsdcInReais(wallet.personalUsdcCents)} na cotação fixa de exemplo</small>
            </div>
          </div>
          <span className="investor-preview__wallet-caption">USDC é um ativo digital referenciado ao dólar. O valor em R$ é só uma conversão visual, não um saldo em reais.</span>
          <div className="investor-preview__wallet-actions">
            <button type="button" className="investor-preview__wallet-transfer" aria-expanded={mode === 'deposit'}
              aria-controls="investor-preview-transfer-form" onClick={() => toggleForm('deposit')} data-testid="button-transferir-bettex">
              Colocar BETTEX em staking <ArrowRight aria-hidden="true" /></button>
            <button type="button" className="investor-preview__wallet-transfer investor-preview__wallet-action-secondary"
              aria-expanded={mode === 'profitWithdraw'} aria-controls="investor-preview-transfer-form"
              onClick={() => toggleForm('profitWithdraw')} data-testid="button-sacar-lucro-usdc">Sacar lucro em USDC</button>
          </div>
          <span className="investor-preview__wallet-buy-note">Saída em USDC para carteira blockchain, nunca por banco ou em R$. Nenhum ativo real é enviado.</span>
        </div>

        <div className="investor-preview__wallet investor-preview__wallet--bettex">
          <div className="investor-preview__wallet-heading">
            <div className="investor-preview__wallet-label"><Wallet aria-hidden="true" />Carteira BETTEX</div>
            <button type="button" className="investor-preview__wallet-history-button" title="Histórico das carteiras"
              aria-label={showHistory ? 'Ocultar histórico das carteiras' : 'Ver histórico das carteiras'}
              aria-expanded={showHistory} aria-controls="investor-preview-wallet-history"
              onClick={() => setShowHistory((value) => !value)}><History aria-hidden="true" /></button>
          </div>
          <div className="investor-preview__wallet-balances">
            <div className="investor-preview__wallet-balance">
              <span>BETTEX · alocados em staking</span>
              <strong className="investor-preview__wallet-value" data-testid="text-saldo-carteira-bettex">{formatTokens(wallet.allocatedTokensCents)}</strong>
            </div>
            <div className="investor-preview__wallet-balance investor-preview__wallet-balance--reais">
              <span>Distribuição recebida em USDC · disponível</span>
              <strong data-testid="status-usdc-bettex">{formatUsdc(wallet.allocatedUsdcCents)}</strong>
              <small>≈ {formatUsdcInReais(wallet.allocatedUsdcCents)} na cotação fixa de exemplo</small>
            </div>
          </div>
          <span className="investor-preview__wallet-caption">Só os BETTEX depositados entram no cálculo de distribuição. O desempenho da BETTEX nos mercados não é seu saldo.</span>
          <div className="investor-preview__wallet-actions investor-preview__wallet-actions--bettex">
            <button type="button" className="investor-preview__wallet-withdraw" aria-expanded={mode === 'withdraw'}
              aria-controls="investor-preview-transfer-form" onClick={() => toggleForm('withdraw')}
              data-testid="button-sacar-bettex-bettex">Retirar BETTEX</button>
            <button type="button" className="investor-preview__wallet-transfer" aria-expanded={mode === 'profitTransfer'}
              aria-controls="investor-preview-transfer-form" onClick={() => toggleForm('profitTransfer')}
              data-testid="button-transferir-lucro-usdc">Transferir lucro para carteira pessoal <ArrowRight aria-hidden="true" /></button>
          </div>
        </div>
      </div>

      <details className="investor-preview__fee-note">
        <summary>Conversão e custos desta demonstração</summary>
        <p>Para facilitar a leitura, 1 USDC = {reais.format(5)} nesta prévia; não é cotação ao vivo nem conversão disponível. A taxa do projeto para estas movimentações é zero. Custos de rede e de terceiros seriam variáveis e separados em uma operação real.</p>
      </details>

      {mode && <WalletMovementForm key={mode} mode={mode} wallet={wallet} onConfirm={confirmMovement} onClose={() => setMode(null)} />}

      {(wallet.transfers.length > 0 || notice || storageWarning) && (
        <div className="investor-preview__demo-status" aria-live="polite" data-testid="status-movimentacoes-bettex">
          <div className="investor-preview__demo-status-head">
            <strong>Movimentações da demonstração</strong>
            <button type="button" onClick={resetDemo}>Reiniciar exemplo</button>
          </div>
          {notice && <p>{notice}</p>}
          {storageWarning && <p className="investor-preview__transfer-error">{storageWarning}</p>}
          {(wallet.legacyPersonalReaisCents > 0 || wallet.legacyAllocatedReaisCents > 0) && (
            <p>Registros antigos em BRL, somente para consulta: carteira pessoal {reais.format(wallet.legacyPersonalReaisCents / 100)}; Carteira BETTEX {reais.format(wallet.legacyAllocatedReaisCents / 100)}. Não foram convertidos em USDC e não podem ser sacados.</p>
          )}
          <small>Histórico e saldos da prévia ficam salvos apenas neste navegador.</small>
        </div>
      )}

      <div id="investor-preview-wallet-history" className="investor-preview__wallet-history" hidden={!showHistory} role="region" aria-label="Histórico simulado das carteiras">
        <div className="investor-preview__wallet-history-head"><strong>Histórico das carteiras</strong><span>Somente nesta demonstração</span></div>
        {wallet.transfers.length === 0 ? <p>Nenhuma movimentação foi simulada ainda.</p> : wallet.transfers.map((transfer) => (
          <div className="investor-preview__wallet-history-row" key={transfer.id}>
            <span>
              {movements[transfer.kind].title}
              <small>{sourceAndDestination(transfer.kind)} · {dateAndTime.format(transfer.requestedAt)}
                {transfer.periodIndex ? ` · Período ${transfer.periodIndex}` : ''}
                {transfer.destinationAddress ? ` · ${transfer.destinationAddress.slice(0, 6)}…${transfer.destinationAddress.slice(-4)}` : ''}
                {transfer.feeCents ? ` · Taxa antiga: ${formatTokens(transfer.feeCents)}` : ' · Sem taxa do projeto'}
              </small>
            </span>
            <strong>{formatMovementAmount(transfer.kind, transfer.amountCents)}</strong>
          </div>
        ))}
        <p>Valores locais e fictícios. Registros antigos em BRL não são USDC. Nenhuma operação real foi feita.</p>
      </div>
    </>
  );
}