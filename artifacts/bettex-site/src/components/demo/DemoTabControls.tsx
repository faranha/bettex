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
  return <div className="relative flex items-center gap-2 whitespace-nowrap">
      <span className="sr-only text-[11px] text-[#D6DEEB] lg:not-sr-only" data-testid="demo-tab-scope" title={x('Demo independente nesta aba', 'Independent demo in this tab', 'Demo independiente en esta pestaña')}>{x('Só nesta aba', 'This tab only', 'Solo esta pestaña')}</span>
      <button type="button" data-testid="reset-demo-session" title={x('Reiniciar demo', 'Restart demo', 'Reiniciar demo')} disabled={resetting || mutating > 0} onClick={() => void reset()} className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg border border-white/25 px-2 text-xs font-bold text-[#F5F1E8] transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#83ECC2] disabled:opacity-50"><RotateCcw size={16} className="shrink-0" aria-hidden="true" /><span className="sr-only sm:not-sr-only">{resetting ? x('Reiniciando…', 'Restarting…', 'Reiniciando…') : x('Reiniciar demo', 'Restart demo', 'Reiniciar demo')}</span></button>
      {failed && <p role="alert" className="absolute right-0 top-full z-10 w-56 whitespace-normal rounded-lg bg-[#1B2A41] p-2 text-xs text-[#FFD38B]">{x('Não foi possível reiniciar. Seu teste atual foi mantido.', 'Could not restart. Your current test was preserved.', 'No se pudo reiniciar. Se conservó la prueba actual.')}</p>}
  </div>;
}
