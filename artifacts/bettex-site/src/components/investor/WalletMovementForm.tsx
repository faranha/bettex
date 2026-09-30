import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { parseReais, parseTokens, TRANSFER_FEE_CENTS, type MovementKind, type WalletDemoState } from './walletDemo';
import { formatTokens, formatMovementAmount, movements } from './walletMovements';

export function WalletMovementForm({ mode, wallet, onConfirm, onClose }: {
  mode: MovementKind;
  wallet: WalletDemoState;
  onConfirm: (amountCents: number) => void;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const definition = movements[mode];
  const isReais = definition.currency === 'BRL';
  const isDeposit = mode === 'externalDeposit';
  const amount = isReais ? parseReais(quantity) : parseTokens(quantity);
  const sourceTokens = definition.source === 'personal' ? wallet.personalTokensCents : wallet.allocatedTokensCents;
  const available = isReais
    ? definition.source === 'personal' ? wallet.personalReaisCents : wallet.allocatedReaisCents
    : sourceTokens;

  useEffect(() => {
    const rect = formRef.current?.getBoundingClientRect();
    if (rect && (rect.bottom > window.innerHeight || rect.top < 75)) {
      formRef.current?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount === null) {
      setError(isReais ? 'Digite um valor positivo em reais com até duas casas decimais, como 25,50.' : 'Digite uma quantidade inteira de BETTEX, como 1, 2 ou 3.');
      return;
    }
    try {
      onConfirm(amount);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível simular esta movimentação.');
    }
  }

  return (
    <form ref={formRef} id="investor-preview-transfer-form" className="investor-preview__transfer-form" onSubmit={submit} data-testid="form-movimentacao-bettex">
      <div className="investor-preview__transfer-head">
        <div><strong>{definition.title}</strong><p>{definition.description}</p></div>
        <button type="button" className="investor-preview__transfer-close" aria-label="Fechar movimentação" onClick={onClose}><X aria-hidden="true" /></button>
      </div>
      <label htmlFor="investor-preview-quantity">{isReais ? 'Valor em reais (R$)' : 'Quantidade de BETTEX'}</label>
      <div className="investor-preview__transfer-controls">
        <input
          id="investor-preview-quantity"
          type="text"
          inputMode={isReais ? 'decimal' : 'numeric'}
          autoComplete="off"
          placeholder={isReais ? 'Ex.: 25,50' : 'Ex.: 100'}
          value={quantity}
          onChange={(event) => { setQuantity(event.target.value); setError(''); }}
          aria-invalid={Boolean(error)}
          aria-describedby={`${error ? 'investor-preview-transfer-error ' : ''}investor-preview-transfer-available`}
        />
        <button type="submit">{definition.confirm}</button>
      </div>
      <small id="investor-preview-transfer-available">
        {isDeposit ? 'Somente BETTEX inteiros. Este depósito de exemplo não tem taxa.' : (
          <>
            Disponível na origem: {formatMovementAmount(mode, available)}.
            {isReais
              ? ` Taxa: 1 BETTEX do saldo de tokens desta carteira (${formatTokens(sourceTokens)} disponíveis), sem descontar a taxa em reais.`
              : ` Taxa adicional: 1 BETTEX.${amount === null ? '' : ` Débito total: ${formatTokens(amount + TRANSFER_FEE_CENTS)}.`} Somente tokens inteiros.`}
          </>
        )}
      </small>
      {error && <p id="investor-preview-transfer-error" className="investor-preview__transfer-error" role="alert">{error}</p>}
      <p className="investor-preview__transfer-disclaimer">Simulação neste navegador. Nenhum token ou real é transferido de verdade.</p>
    </form>
  );
}