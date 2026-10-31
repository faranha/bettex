import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { parseTokens, parseUsdc, type MovementKind, type WalletDemoState } from './walletDemo';
import { formatMovementAmount, movements } from './walletMovements';

export function WalletMovementForm({ mode, wallet, onConfirm, onClose }: {
  mode: MovementKind;
  wallet: WalletDemoState;
  onConfirm: (amountCents: number, address?: string) => void;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const definition = movements[mode];
  const isUsdc = definition.currency === 'USDC';
  const amount = isUsdc ? parseUsdc(quantity) : parseTokens(quantity);
  const available = isUsdc
    ? definition.source === 'personal' ? wallet.personalUsdcCents : wallet.allocatedUsdcCents
    : definition.source === 'personal' ? wallet.personalTokensCents : wallet.allocatedTokensCents;

  useEffect(() => {
    const rect = formRef.current?.getBoundingClientRect();
    if (rect && (rect.bottom > window.innerHeight || rect.top < 75)) {
      formRef.current?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount === null) {
      setError(isUsdc ? 'Digite um valor positivo em USDC com até duas casas decimais, como 12,50.' : 'Digite uma quantidade inteira e positiva de BETTEX.');
      return;
    }
    try {
      onConfirm(amount, mode === 'profitWithdraw' ? address.trim() : undefined);
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
      <label htmlFor="investor-preview-quantity">{isUsdc ? 'Valor em USDC' : 'Quantidade de BETTEX'}</label>
      <div className="investor-preview__transfer-controls">
        <input
          id="investor-preview-quantity"
          type="text"
          inputMode={isUsdc ? 'decimal' : 'numeric'}
          autoComplete="off"
          placeholder={isUsdc ? 'Ex.: 12,50' : 'Ex.: 100'}
          value={quantity}
          onChange={(event) => { setQuantity(event.target.value); setError(''); }}
          aria-invalid={Boolean(error)}
          aria-describedby={`${error ? 'investor-preview-transfer-error ' : ''}investor-preview-transfer-available`}
        />
        <button type="submit">{definition.confirm}</button>
      </div>
      {mode === 'profitWithdraw' && (
        <div className="investor-preview__address-field">
          <label htmlFor="investor-preview-address">Endereço da carteira na Arbitrum One</label>
          <input id="investor-preview-address" type="text" autoComplete="off" spellCheck={false}
            placeholder="0x..." value={address} onChange={(event) => { setAddress(event.target.value); setError(''); }}
            aria-invalid={Boolean(error)} />
          <small>Use um endereço 0x de 42 caracteres. Só a saída fictícia será registrada neste navegador.</small>
        </div>
      )}
      <small id="investor-preview-transfer-available">
        {mode === 'externalDeposit'
          ? 'Adição de BETTEX fictícios, sem taxa.'
          : `Disponível na origem: ${formatMovementAmount(mode, available)}. Taxa do projeto: zero. Custos de rede e terceiros em uma transação real seriam variáveis e separados.`}
      </small>
      {error && <p id="investor-preview-transfer-error" className="investor-preview__transfer-error" role="alert">{error}</p>}
      <p className="investor-preview__transfer-disclaimer">Simulação local. Nenhum BETTEX ou USDC é enviado de verdade; não há saque em moeda fiduciária ou para conta bancária.</p>
    </form>
  );
}