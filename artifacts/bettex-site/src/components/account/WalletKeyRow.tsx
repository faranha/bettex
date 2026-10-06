/** @jsxImportSource react */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, Download, Eye, EyeOff } from 'lucide-react';
import { useX } from '@/components/demo/ui';
import { downloadFile } from './wallet-vault';

export function WalletKeyRow({ id, label, value, loadValue, onRequestReveal, revealOnValue = false, onHide, filename, valueTestId }: {
  id: string; label: string; value?: string | null; loadValue?: () => Promise<string>;
  onRequestReveal?: () => void; revealOnValue?: boolean; onHide?: () => void;
  filename?: string; valueTestId?: string;
}) {
  const { x } = useX();
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const generation = useRef(0);
  const mounted = useRef(false);
  const hide = useCallback(() => {
    generation.current++;
    setVisible(false); setKey(null); setBusy(false); setMessage('');
    onHide?.();
  }, [onHide]);
  useEffect(() => {
    mounted.current = true;
    const visibility = () => { if (document.visibilityState === 'hidden') hide(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', hide);
    window.addEventListener('bettex-wallet-lock', hide);
    return () => {
      mounted.current = false; generation.current++;
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', hide);
      window.removeEventListener('bettex-wallet-lock', hide);
    };
  }, [hide]);
  useEffect(() => {
    if (revealOnValue && value) { setKey(value); setVisible(true); }
    else hide();
  }, [value, revealOnValue, hide]);
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(hide, 60_000);
    return () => window.clearTimeout(timer);
  }, [visible, hide]);

  const reveal = async () => {
    if (visible) { hide(); return; }
    if (busy) return;
    setMessage('');
    if (!value && !loadValue) { onRequestReveal?.(); return; }
    const attempt = ++generation.current;
    setBusy(true);
    try {
      const result = value || await loadValue!();
      if (!mounted.current || attempt !== generation.current || document.visibilityState === 'hidden') return;
      if (!result) throw new Error('key_unavailable');
      setKey(result); setVisible(true);
    } catch {
      if (mounted.current && attempt === generation.current) setMessage(x('Não foi possível abrir a chave.', 'Could not open the key.', 'No se pudo abrir la clave.'));
    } finally {
      if (mounted.current && attempt === generation.current) setBusy(false);
    }
  };
  const copy = async () => {
    if (!visible || !key) return;
    const attempt = generation.current;
    try {
      await navigator.clipboard.writeText(key);
      if (mounted.current && attempt === generation.current) setMessage(x('Chave copiada. Não compartilhe.', 'Key copied. Do not share it.', 'Clave copiada. No la compartas.'));
    } catch {
      if (mounted.current && attempt === generation.current) setMessage(x('Não foi possível copiar.', 'Could not copy.', 'No se pudo copiar.'));
    }
  };
  const eyeLabel = visible ? x('Ocultar', 'Hide', 'Ocultar') : x('Mostrar', 'Show', 'Mostrar');
  const button = 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#E4DCCB] bg-white text-[#0A6657] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]';
  return <div className="grid min-w-0 gap-1" data-testid={`key-row-${id}`}>
    <p className="text-xs font-bold text-[#5B6B85]">{label}</p>
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-lg bg-white p-2">
      <span className="mono min-w-0 break-all self-center text-xs" data-testid={valueTestId ?? `key-value-${id}`}>{visible && key ? key : '••••••••••••••••••••••••'}</span>
      <div className="flex gap-1">
        <button type="button" className={button} disabled={busy} onClick={() => void reveal()} aria-label={`${eyeLabel} ${label}`} aria-pressed={visible} data-testid={`button-eye-${id}`}>
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button type="button" className={button} disabled={!visible || !key} onClick={() => void copy()} aria-label={`${x('Copiar', 'Copy', 'Copiar')} ${label}`} data-testid={`button-copy-${id}`}><Copy className="h-4 w-4" aria-hidden="true" /></button>
      </div>
    </div>
    {visible && key && filename && <button type="button" className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#0A6657]" onClick={() => downloadFile(key, filename)}>
      <Download className="h-4 w-4" aria-hidden="true" />{x('Baixar arquivo público', 'Download public file', 'Descargar archivo público')}
    </button>}
    {message && <p className="text-xs text-[#5B6B85]" role="status">{message}</p>}
  </div>;
}
