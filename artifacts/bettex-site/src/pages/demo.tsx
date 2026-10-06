/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { AccountSheet } from '@/components/account/AccountSheet';
import { ProfileAvatar } from '@/components/account/ProfileIdentityEditor';
import { RefreshCw, UserRound } from 'lucide-react';
import { useGetDemoDashboard, getGetDemoDashboardQueryKey } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { Rates, MovementSheet, useClock, type Kind, type Asset } from '@/components/demo/fin';
import { H } from '@/components/demo/Views';
import { TreasuryOverview } from '@/components/demo/TreasuryOverview';
import { CycleLive, useCycleHistory, type CycleMode } from '@/components/demo/CycleLive';
import { Console } from '@/components/demo/Console';
import { AgentFlow } from '@/components/demo/AgentFlow';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { PersonalOverview } from '@/components/demo/PersonalOverview';
import { demoView, demoPath, demoLabel, isRemovedSimulationPath } from '@/components/demo/demo-navigation';
import { AlphaTradingPanel, AlphaTradingCapitalPanel } from '@/components/alpha-trading/AlphaTradingPanel';
import { AgentOperationsDashboard } from '@/components/agent-operations/AgentOperationsDashboard';
import { PolicyAdminPanel } from '@/components/alpha-trading/PolicyAdminPanel';
import '@/components/demo/demo.css';
import { PublicDemoPage } from '@/components/demo/PublicDemoPage';
import { isDemoSession } from '@/components/demo/demo-session';
import { DemoTabControls } from '@/components/demo/DemoTabControls';
import { DemoEnvironmentBanner } from '@/components/demo/DemoEnvironmentBanner';
import { TradingOverview } from '@/components/alpha-trading/TradingOverview';
import { StakingCorridor } from '@/components/demo/StakingCorridor';

export function DemoPage() {
  // A read-only presentation preview; normal development routes stay operational.
  const publicPreview = import.meta.env.DEV && typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('preview') === 'public';
  return publicPreview ? <PublicDemoPage /> : <DevelopmentDemoPage />;
}
function DevelopmentDemoPage() {
  const { x, loc } = useX();
  const [path] = useLocation();
  if ((demoView(path) ?? 'home') === 'central') return <><DemoEnvironmentBanner actions={<DemoTabControls />} /><AlphaTradingPanel /></>;
  return typeof window === 'undefined' ? <main className="demo-root min-h-96 p-6"><h1 className="sr-only">{demoLabel(demoView(path) ?? 'home', loc)}</h1><p>{x('Carregando seu painel…', 'Loading your dashboard…', 'Cargando tu panel…')}</p></main> : <ClientDemoPage />;
}
function ClientDemoPage() {
  const { x, loc } = useX();
  const [path, navigate] = useLocation();
  const tab = demoView(path) ?? 'home';
  useEffect(() => {
    if (isRemovedSimulationPath(path)) navigate(`${demoPath('home', loc)}${window.location.search}`, { replace: true });
    else if (tab === 'wallet') navigate(`${demoPath('wallet', loc)}${window.location.search}`, { replace: true });
  }, [path, tab, loc, navigate]);
  const q = useGetDemoDashboard({ query: { queryKey: getGetDemoDashboardQueryKey(), refetchInterval: 4000, refetchIntervalInBackground: false, retry: 1 } });
  const d = q.data;
  const now = useClock(d);
  const pts = useCycleHistory(d); const [cmode, setCmode] = useState<CycleMode>('capital');
  const [mv, setMv] = useState<{ kind: Kind; asset: Asset } | null>(null); const [lastMv, setLastMv] = useState<{ kind: Kind; asset: Asset } | null>(null); const open = (kind: Kind, asset: Asset) => { const v = { kind, asset }; setLastMv(v); setMv(v); };
  const banner = <DemoEnvironmentBanner actions={<DemoTabControls />} />;
  if (!d) return <main className="demo-root min-h-[calc(100dvh-var(--site-header-h))]"><h1 className="sr-only">{x('Meu painel', 'My dashboard', 'Mi panel')}</h1>{banner}<div className="mx-auto max-w-5xl p-4 sm:p-6">{q.isError ? <div role="alert" className="dcard grid justify-items-start gap-3 p-6"><p className="font-bold">{x('Não conseguimos carregar seus dados.', 'We could not load your data.', 'No pudimos cargar tus datos.')}</p><button type="button" data-testid="button-retry" onClick={() => void q.refetch()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" aria-hidden="true" />{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div> : <div className="grid gap-3" aria-busy="true" aria-label={x('Carregando', 'Loading', 'Cargando')}>{[0, 1, 2].map(i => <div key={i} className="dcard h-28 animate-pulse" />)}</div>}</div></main>;
  const h = new Date().getHours();
  const greet = h < 12 ? x('Bom dia', 'Good morning', 'Buenos días') : h < 18 ? x('Boa tarde', 'Good afternoon', 'Buenas tardes') : x('Boa noite', 'Good evening', 'Buenas noches');
  const b = d.balances;
  const sec = 'dcard p-4 sm:p-5';
  return <Rates.Provider value={{ r: b.brlPerUsdc, bu: b.bettexUsdc }}><main className="demo-root min-h-[calc(100dvh-var(--site-header-h))] pb-10">
    {banner}
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-3 pt-5 sm:px-5">
      {tab === 'home' && <>
        <div className="flex items-center gap-3"><ProfileAvatar path={d.profile.avatarPath} size={56} /><div className="min-w-0"><p className="text-sm text-[#5B6B85]">{greet},</p>
          <div className="flex flex-wrap items-center gap-2"><h1 className="display min-w-0 break-words text-3xl font-extrabold tracking-tight" data-testid="text-greeting-name">{d.profile.nickname?.trim() || d.profile.name}</h1>
            <Link href={`${demoPath('account', loc)}?tab=profile`} data-testid="link-account-full" aria-label={x('Abrir detalhes do meu perfil', 'Open my profile details', 'Abrir detalles de mi perfil')} title={x('Perfil', 'Profile', 'Perfil')} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0E7C6B]/30 text-[#0A6657] hover:bg-[#E9EEE5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B]"><UserRound className="h-5 w-5" aria-hidden="true" /></Link>
          </div></div></div>
        <PersonalOverview d={d} onWallet={open} />
        <section><H>{x('Minha participação e próximo ciclo', 'My participation and next cycle', 'Mi participación y próximo ciclo')}</H><CycleLive d={d} now={now} pts={pts} mode={cmode} setMode={setCmode} onOpen={() => { navigate(demoPath('central', loc)); window.scrollTo({ top: 0 }); }} /></section>
        <StakingCorridor d={d} />
        <TradingOverview />
        <AgentOperationsDashboard compact /></>}
      {tab === 'central' && <>
        <h1 className="display text-2xl font-extrabold">{x('Central da IA', 'AI Center', 'Central de IA')}</h1>
        <AgentFlow />
        <Console d={d} /></>}
      {tab === 'treasury' && <div className="grid gap-4" data-testid="page-treasury">
        <div><h1 className="display text-2xl font-extrabold">{x('Tesouraria', 'Treasury', 'Tesorería')}</h1><p className="mt-1 text-sm text-[#5B6B85]">{x('Ativos, reserva e resultados do projeto.', 'Project assets, reserves and results.', 'Activos, reserva y resultados del proyecto.')}</p></div>
        <TreasuryOverview d={d} />
        <AlphaTradingCapitalPanel />
        {isDemoSession(d.profile) ? <section className={sec} data-testid="demo-policy-scope"><h2 className="display text-lg font-extrabold">{x('Políticas da Tesouraria', 'Treasury policies', 'Políticas de Tesorería')}</h2><p className="mt-2 text-sm text-[#5B6B85]">{x('Consulte os resultados e a reserva da Tesouraria. Alterações administrativas exigem acesso autorizado.', 'View Treasury results and reserves. Administrative changes require authorized access.', 'Consulta los resultados y la reserva de Tesorería. Los cambios administrativos requieren acceso autorizado.')}</p></section> : <PolicyAdminPanel />}
        {d.profile.canViewTreasuryHistory && <div className={sec}><HistoryPanel mode="demo" accountKey={d.profile.accountId} initialView="treasury" treasuryAccess /></div>}
      </div>}
      {tab === 'account' && <AccountSheet d={d} onWallet={open} />}
    </div>
    <MovementSheet kind={mv?.kind ?? null} initialAsset={(mv ?? lastMv)?.asset} d={d} onClose={() => setMv(null)} />
  </main></Rates.Provider>;
}
export default DemoPage;
