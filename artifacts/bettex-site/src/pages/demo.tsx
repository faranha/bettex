/** @jsxImportSource react */
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@clerk/react';
import { AccountSheet } from '@/components/account/AccountSheet';
import { RefreshCw, Send } from 'lucide-react';
import { useGetDemoDashboard, getGetDemoDashboardQueryKey } from '@workspace/api-client-react';
import { useX } from '@/components/demo/ui';
import { Rates, MovementSheet, useClock, type Kind, type Asset } from '@/components/demo/fin';
import { H, TreasuryBlock, Rounds } from '@/components/demo/Views';
import { CycleLive, useCycleHistory, type CycleMode } from '@/components/demo/CycleLive';
import { Console } from '@/components/demo/Console';
import { AgentFlow } from '@/components/demo/AgentFlow';
import { HistoryPanel } from '@/components/history/HistoryPanel';
import { WalletPage } from '@/components/demo/WalletPage';
import { demoView, demoPath, demoLabel, type DemoView } from '@/components/demo/demo-navigation';
import { AlphaTradingPanel, AlphaTradingCapitalPanel } from '@/components/alpha-trading/AlphaTradingPanel';
import { AgentOperationsDashboard } from '@/components/agent-operations/AgentOperationsDashboard';
import { PolicyAdminPanel } from '@/components/alpha-trading/PolicyAdminPanel';
import { SimulationPanel } from '@/components/simulation/SimulationPanel';
import '@/components/demo/demo.css';
import { PublicDemoPage } from '@/components/demo/PublicDemoPage';
import { TELEGRAM_COMMUNITY_URL } from '@/lib/community';

export function DemoPage() {
  // A read-only presentation preview; normal development routes stay operational.
  const publicPreview = import.meta.env.DEV && typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('preview') === 'public';
  return import.meta.env.PROD || publicPreview ? <PublicDemoPage /> : <DevelopmentDemoPage />;
}
function DevelopmentDemoPage() {
  const { x, loc } = useX();
  const [path] = useLocation();
  if ((demoView(path) ?? 'home') === 'central') return <AlphaTradingPanel />;
  if (demoView(path) === 'simulation') return <SimulationPage />;
  return typeof window === 'undefined' ? <main className="demo-root min-h-96 p-6"><h1 className="sr-only">{demoLabel(demoView(path) ?? 'home', loc)}</h1><p>{x('Carregando seu painel…', 'Loading your dashboard…', 'Cargando tu panel…')}</p></main> : <ClientDemoPage />;
}
function SimulationPage() {
  const { x, loc } = useX();
  const tabs: DemoView[] = ['home', 'central', 'wallet', 'treasury', 'simulation', 'account'];
  return <main className="demo-root min-h-[calc(100dvh-var(--site-header-h))] pb-10"><div className="bg-[#1B2A41] py-1 text-center text-[11px] font-semibold tracking-wide text-[#F5F1E8]">{x('simulação · sem dinheiro real', 'simulation · no real money', 'simulación · sin dinero real')}</div>
    <nav aria-label={x('Áreas do app', 'App areas', 'Áreas de la app')} className="mx-auto grid max-w-5xl grid-cols-2 gap-1 px-3 sm:flex sm:flex-wrap">{tabs.map(k => <Link key={k} href={demoPath(k, loc)} data-testid={`nav-${k}`} aria-current={k === 'simulation' ? 'page' : undefined} className={`inline-flex min-h-11 min-w-0 items-center justify-center border-b-2 px-2 text-center text-sm font-bold sm:justify-start sm:px-3 ${k === 'simulation' ? 'border-[#0E7C6B] text-[#0A6657]' : 'border-transparent text-[#5B6B85]'}`}>{demoLabel(k, loc)}</Link>)}</nav>
    <SimulationPanel /></main>;
}
function ClientDemoPage() {
  const { x, loc } = useX();
  const [path, navigate] = useLocation();
  const tab = demoView(path) ?? 'home';
  const { isLoaded } = useAuth();
  const q = useGetDemoDashboard({ query: { queryKey: getGetDemoDashboardQueryKey(), enabled: isLoaded, refetchInterval: 4000, refetchIntervalInBackground: false, retry: 1 } });
  const d = q.data;
  const now = useClock(d);
  const pts = useCycleHistory(d); const [cmode, setCmode] = useState<CycleMode>('capital');
  const [mv, setMv] = useState<{ kind: Kind; asset: Asset } | null>(null); const [lastMv, setLastMv] = useState<{ kind: Kind; asset: Asset } | null>(null); const open = (kind: Kind, asset: Asset) => { const v = { kind, asset }; setLastMv(v); setMv(v); };
  const banner = <div className="bg-[#1B2A41] py-1 text-center text-[11px] font-semibold tracking-wide text-[#F5F1E8]" data-testid="banner-demo">{x('versão demonstrativa', 'demo version', 'versión demostrativa')}</div>;
  if (tab === 'simulation') return <SimulationPage />;
  if (!d) return <main className="demo-root min-h-[calc(100dvh-var(--site-header-h))]"><h1 className="sr-only">{x('Meu painel', 'My dashboard', 'Mi panel')}</h1>{banner}<div className="mx-auto max-w-5xl p-4 sm:p-6">{q.isError ? <div role="alert" className="dcard grid justify-items-start gap-3 p-6"><p className="font-bold">{x('Não conseguimos carregar seus dados.', 'We could not load your data.', 'No pudimos cargar tus datos.')}</p><button type="button" data-testid="button-retry" onClick={() => void q.refetch()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0E7C6B] px-4 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" aria-hidden="true" />{x('Tentar de novo', 'Try again', 'Intentar de nuevo')}</button></div> : <div className="grid gap-3" aria-busy="true" aria-label={x('Carregando', 'Loading', 'Cargando')}>{[0, 1, 2].map(i => <div key={i} className="dcard h-28 animate-pulse" />)}</div>}</div></main>;
  const h = new Date().getHours();
  const greet = h < 12 ? x('Bom dia', 'Good morning', 'Buenos días') : h < 18 ? x('Boa tarde', 'Good afternoon', 'Buenas tardes') : x('Boa noite', 'Good evening', 'Buenas noches');
  const b = d.balances;
  const tabs: [DemoView, string][] = [['home', x('Meu painel', 'My dashboard', 'Mi panel')], ['central', x('Central da IA', 'AI Center', 'Central de IA')], ['wallet', x('Saldo e histórico', 'Balance and history', 'Saldo e historial')], ['simulation', x('Simulação', 'Simulation', 'Simulación')], ['treasury', x('Tesouraria', 'Treasury', 'Tesorería')], ['account', x('Minha conta', 'My account', 'Mi cuenta')]];
  const tabBtn = (on: boolean) => `min-h-11 shrink-0 border-b-2 px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] sm:px-4 ${on ? 'border-[#0E7C6B] text-[#0A6657]' : 'border-transparent text-[#5B6B85] hover:text-[#1B2A41]'}`;
  const sec = 'dcard p-4 sm:p-5';
  return <Rates.Provider value={{ r: b.brlPerUsdc, bu: b.bettexUsdc }}><main className="demo-root min-h-[calc(100dvh-var(--site-header-h))] pb-10">
    <div className="sticky top-[var(--site-header-h)] z-30 border-b border-[#E4DCCB] bg-[#FBF8F0]/95 backdrop-blur">{banner}
      <nav aria-label={x('Áreas do app', 'App areas', 'Áreas de la app')} className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3">
        <div className="grid min-w-0 flex-1 grid-cols-2 sm:flex">{tabs.map(([k, l]) => <Link key={k} href={demoPath(k, loc)} data-testid={`nav-${k}`} aria-current={tab === k ? 'page' : undefined} onClick={() => window.scrollTo({ top: 0 })} className={`${tabBtn(tab === k)} inline-flex items-center`}>{l}</Link>)}</div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <a href={TELEGRAM_COMMUNITY_URL} target="_blank" rel="noopener noreferrer" aria-label={x('Comunidade no Telegram', 'Community on Telegram', 'Comunidad en Telegram')} title={x('Comunidade no Telegram', 'Community on Telegram', 'Comunidad en Telegram')} data-testid="link-app-community" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2 text-sm font-bold text-[#0A6657] hover:bg-[#E9EEE5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E7C6B] sm:px-3"><Send className="h-5 w-5" aria-hidden="true" /><span className="hidden sm:inline">{x('Comunidade', 'Community', 'Comunidad')}</span></a>
        </div>
      </nav></div>
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-3 pt-5 sm:px-5">
      {tab === 'home' && <>
        <div><p className="text-sm text-[#5B6B85]">{greet},</p><h1 className="display break-words text-3xl font-extrabold tracking-tight" data-testid="text-greeting-name">{d.profile.name}</h1><p className="mt-1 break-all text-xs text-[#5B6B85]">{d.profile.email} · {d.profile.accountId}</p></div>
        <section><H sub={x('Dados emulados da demonstração.', 'Emulated demo data.', 'Datos emulados de la demostración.')}>{x('Central ao vivo e próximo ciclo', 'Live Center and next cycle', 'Central en vivo y próximo ciclo')}</H><CycleLive d={d} now={now} pts={pts} mode={cmode} setMode={setCmode} onOpen={() => { navigate(demoPath('central', loc)); window.scrollTo({ top: 0 }); }} /></section><AgentOperationsDashboard compact /></>}
      {tab === 'central' && <>
        <h1 className="display text-2xl font-extrabold">{x('Central da IA', 'AI Center', 'Central de IA')}</h1>
        <AgentFlow />
        <Console d={d} /></>}
      {tab === 'treasury' && <div className="grid gap-4" data-testid="page-treasury">
        <div><h1 className="display text-2xl font-extrabold">{x('Tesouraria', 'Treasury', 'Tesorería')}</h1><p className="mt-1 text-sm text-[#5B6B85]">{x('Ativos, reserva e resultados do projeto.', 'Project assets, reserves and results.', 'Activos, reserva y resultados del proyecto.')}</p></div>
        <TreasuryBlock d={d} />
        <AlphaTradingCapitalPanel />
        <PolicyAdminPanel />
        <section className={sec}><H>{x('Rodadas', 'Rounds', 'Rondas')}</H><Rounds d={d} /></section>
        {d.profile.canViewTreasuryHistory && <div className={sec}><HistoryPanel mode="demo" accountKey={d.profile.accountId} initialView="treasury" treasuryAccess /></div>}
      </div>}
      {tab === 'wallet' && <WalletPage d={d} onWallet={open} />}
      {tab === 'account' && <AccountSheet d={d} />}
    </div>
    <MovementSheet kind={mv?.kind ?? null} initialAsset={(mv ?? lastMv)?.asset} d={d} onClose={() => setMv(null)} />
  </main></Rates.Provider>;
}
export default DemoPage;
