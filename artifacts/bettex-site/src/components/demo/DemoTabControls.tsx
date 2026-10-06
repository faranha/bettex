/** @jsxImportSource react */
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { useGetDemoDashboard } from '@workspace/api-client-react';
import { useX } from './ui';
import { isDemoSession } from './demo-session';
import { restartDemoTabSession } from '@/lib/demo-tab-session';

export function DemoTabControls() {
  const { x } = useX();
  const client = useQueryClient();
  const dashboard = useGetDemoDashboard({ query: { retry: 1 } });
  const mutating = useIsMutating();
  const [resetting, setResetting] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!dashboard.data || !isDemoSession(dashboard.data.profile)) return null;
  const reset = async () => {
    if (!window.confirm(x('Reiniciar esta demonstração? O progresso desta aba será descartado e uma conta demo limpa será criada. Outras abas e contas reais não serão alteradas.', 'Restart this demo? This tab’s progress will be discarded and a clean demo account will be created. Other tabs and real accounts will not change.', '¿Reiniciar esta demostración? Se descartará el progreso de esta pestaña y se creará una cuenta demo limpia. Las otras pestañas y cuentas reales no cambiarán.'))) return;
    setResetting(true); setFailed(false);
    try {
      await client.cancelQueries();
      await restartDemoTabSession();
      client.clear();
      window.location.reload();
    } catch { setFailed(true); setResetting(false); }
  };
  return <div className="demo-root border-b border-[#E4DCCB] bg-[#FBF8F0]">
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-2">
      <span className="text-xs text-[#5B6B85]" data-testid="demo-tab-scope">{x('Demo independente nesta aba', 'Independent demo in this tab', 'Demo independiente en esta pestaña')}</span>
      <button type="button" data-testid="reset-demo-session" disabled={resetting || mutating > 0} onClick={() => void reset()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#C7D0DD] px-3 text-sm font-bold text-[#13204F] disabled:opacity-50"><RotateCcw size={16} aria-hidden="true" />{resetting ? x('Reiniciando…', 'Restarting…', 'Reiniciando…') : x('Reiniciar demo', 'Restart demo', 'Reiniciar demo')}</button>
      {failed && <p role="alert" className="w-full text-sm text-[#8E2A1D]">{x('Não foi possível reiniciar. Seu teste atual foi mantido.', 'Could not restart. Your current test was preserved.', 'No se pudo reiniciar. Se conservó la prueba actual.')}</p>}
    </div>
  </div>;
}
